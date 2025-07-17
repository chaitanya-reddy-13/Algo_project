from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Min
from .run_code import run_python_code, run_cpp_code
from .models import TestCase, Problem, Submission, Contest
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProblemSerializer,
    SubmissionSerializer,
    ContestSerializer,
)
import re
import os

# ✅ Register API
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ✅ Login API using email & password
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user = authenticate(username=user.username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            })
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# ✅ List all problems
class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.AllowAny]


# ✅ Get specific problem
class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]


# ✅ Submit code and get verdict
class SubmitCodeView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        code = serializer.validated_data["code"]
        problem = serializer.validated_data["problem"]
        language = serializer.validated_data.get("language", "python")
        custom_input = serializer.validated_data.get("custom_input")
        contest_id = self.kwargs.get('contest_id')
        if not contest_id:
            contest_id = self.kwargs.get('id')

        contest = None
        if contest_id:
            try:
                contest = Contest.objects.get(id=contest_id)
            except Contest.DoesNotExist:
                return Response({"error": "Contest not found"}, status=status.HTTP_404_NOT_FOUND)

        run_func = run_cpp_code if language == "cpp" else run_python_code

        # ✅ Custom Run
        if custom_input:
            result = run_func(code, custom_input)
            result["output"] = result["output"].replace("\nHI", "")
            if not result["success"]:
                return Response({"error": result["error"]}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"sample_output": result["output"]}, status=status.HTTP_200_OK)

        # ✅ Submission: Evaluate against all test cases
        verdict, sample_output, expected_output, error_message = self.evaluate_testcases(problem, code, run_func)

        # ✅ Save submission to DB
        submission = serializer.save(
            user=user,
            problem=problem,
            contest=contest, # Save contest if present
            verdict=verdict,
            sample_output=sample_output,
            expected_output=expected_output,
            error_message=error_message,
            language=language
        )
        return Response(self.get_serializer(submission).data, status=status.HTTP_201_CREATED)

    def evaluate_testcases(self, problem, code, run_func):
        test_cases = TestCase.objects.filter(problem=problem)
        all_passed = True
        error_details = {"input": "", "expected_output": "", "actual_output": "", "message": ""}

        for test_case in test_cases:
            result = run_func(code, test_case.input_data)
            result["output"] = result["output"].replace("\nHI", "") # Clean up any lingering HI

            if "Time Limit Exceeded" in result["error"]:
                return "Time Limit Exceeded", "", "", result["error"]
            if not result["success"]:
                return "Runtime Error", result["output"], test_case.expected_output, result["error"]

            actual = re.sub(r'\r\n?', '\n', result["output"]).strip()
            expected = re.sub(r'\r\n?', '\n', test_case.expected_output).strip()

            if actual != expected:
                error_details["input"] = test_case.input_data
                error_details["expected_output"] = test_case.expected_output
                error_details["actual_output"] = result["output"]
                return "Wrong Answer", result["output"], test_case.expected_output, f"Input: {error_details["input"]}\nExpected: {error_details["expected_output"]}\nActual: {error_details["actual_output"]}"

        return "Accepted", "", "", ""


# ✅ List all submissions for current user
class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user).order_by('-created_at')


# ✅ Retrieve specific submission
class SubmissionDetailView(generics.RetrieveAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user)


# 🏆 Leaderboard API
class LeaderboardView(APIView):
    def get(self, request):
        users = (
            User.objects.annotate(
                accepted_count=Count('submission', filter=Q(submission__verdict='Accepted'))
            )
            .order_by('-accepted_count')[:10]
        )
        data = [{"username": u.username, "accepted_count": u.accepted_count} for u in users]
        return Response(data)


class ContestListView(generics.ListAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [permissions.AllowAny]

class ContestDetailView(generics.RetrieveAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        try:
            return super().get_object()
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContestEnterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            contest = Contest.objects.get(id=id)
            serializer = ContestSerializer(contest)
            return Response(serializer.data)
        except Contest.DoesNotExist:
            return Response({"error": "Contest not found"}, status=status.HTTP_404_NOT_FOUND)

class ContestProblemsView(generics.ListAPIView):
    serializer_class = ProblemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        contest_id = self.kwargs['id']
        try:
            contest = Contest.objects.get(id=contest_id)
            return contest.problems.all()
        except Contest.DoesNotExist:
            return Problem.objects.none()




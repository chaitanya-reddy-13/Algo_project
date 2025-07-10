from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .run_code import run_python_code, run_cpp_code
from .models import TestCase, Problem, Submission
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProblemSerializer,
    SubmissionSerializer,
)
import re
import openai
import os


# ✅ Register API
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ✅ Login API (via email)
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
        except User.DoesNotExist:
            user = None

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            })

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# ✅ List all problems
class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.AllowAny]


# ✅ Get a specific problem
class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]


# ✅ Submit code and auto-evaluate verdict
class SubmitCodeView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        code = self.request.data.get("code")
        problem_id = self.request.data.get("problem")
        language = self.request.data.get("language", "python")
        custom_input = self.request.data.get("custom_input", None)

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND)

        test_cases = TestCase.objects.filter(problem=problem)

        all_passed = True
        error_message = ""
        sample_output = ""
        expected_output = ""

        # ✅ Case 1: Run with custom input (RUN)
        if custom_input:
            result = run_cpp_code(code, custom_input) if language == "cpp" else run_python_code(code, custom_input)

            if not result["success"]:
                verdict = "Runtime Error"
                error_message = result["error"]
            else:
                verdict = "Custom Run"
                sample_output = result["output"]

            serializer.save(
                user=user,
                verdict=verdict,
                sample_output=sample_output,
                expected_output="",
                error_message=error_message,
                language=language
            )
            return

        # ✅ Case 2: Run against testcases (SUBMIT)
        for test_case in test_cases:
            result = run_cpp_code(code, test_case.input_data) if language == "cpp" else run_python_code(code, test_case.input_data)

            if not result["success"]:
                all_passed = False
                verdict = "Runtime Error"
                error_message = result["error"]
                sample_output = result["output"]
                expected_output = test_case.expected_output
                break

            actual = re.sub(r'\r\n?', '\n', result["output"]).strip()
            expected = re.sub(r'\r\n?', '\n', test_case.expected_output).strip()

            if actual != expected:
                all_passed = False
                verdict = "Wrong Answer"
                sample_output = result["output"]
                expected_output = test_case.expected_output
                break

        if all_passed:
            verdict = "Accepted"

        serializer.save(
            user=user,
            verdict=verdict,
            sample_output=sample_output,
            expected_output=expected_output,
            error_message=error_message,
            language=language
        )


# ✅ List all submissions for logged-in user
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


# 🏆 Leaderboard
class LeaderboardView(APIView):
    def get(self, request):
        users = (
            User.objects.annotate(
                accepted_count=Count('submission', filter=Q(submission__verdict='Accepted'))
            )
            .order_by('-accepted_count')[:10]
        )

        data = [{"username": user.username, "accepted_count": user.accepted_count} for user in users]
        return Response(data)


# 🤖 AI Hint Generator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ai_hint(request):
    problem_id = request.data.get("problem_id")
    if not problem_id:
        return Response({"error": "Problem ID is required."}, status=400)

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response({"error": "Problem not found."}, status=404)

    openai.api_key = os.getenv("OPENAI_API_KEY")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You're a helpful coding assistant."},
                {"role": "user", "content": f"Give a coding hint for this problem:\n{problem.description}"}
            ],
            temperature=0.5,
            max_tokens=150
        )
        return Response({"hint": response.choices[0].message["content"]})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

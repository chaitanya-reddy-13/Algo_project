import os
import re
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from .run_code import run_python_code, run_cpp_code
from .models import TestCase, Problem, Submission, Contest
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProblemSerializer,
    SubmissionSerializer,
    ContestSerializer,
)

User = get_user_model()

# ✅ Login View
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# ✅ Register API with email verification
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_active = False
        user.save()

        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # ✅ Your deployed frontend domain
        domain = "https://algo-project-tau.vercel.app"
        verification_link = f"{domain}/verify-email/{uidb64}/{token}"

        subject = "Activate Your NexCode Account"
        message = f"""
Hi {user.username},

Thank you for signing up for NexCode!

Please verify your email address by clicking the link below:

{verification_link}

If you did not request this, please ignore this email.

— NexCode Team
"""

        send_mail(
            subject,
            message,
            os.environ.get('EMAIL_HOST_USER'),  # ✅ Pull from .env
            [user.email],
            fail_silently=False
        )

        return Response({"detail": "Verification email sent."}, status=status.HTTP_201_CREATED)

# ✅ Email verification
class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid UID"}, status=status.HTTP_400_BAD_REQUEST)

        token_generator = PasswordResetTokenGenerator()
        if token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"detail": "Email successfully verified."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid or expired verification link."}, status=status.HTTP_400_BAD_REQUEST)

# ✅ Problem list and detail
class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.AllowAny]

class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

# ✅ Code submission
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
        contest_id = self.kwargs.get('contest_id') or self.kwargs.get('id')

        contest = None
        if contest_id:
            try:
                contest = Contest.objects.get(id=contest_id)
            except Contest.DoesNotExist:
                return Response({"error": "Contest not found"}, status=status.HTTP_404_NOT_FOUND)

        run_func = run_cpp_code if language == "cpp" else run_python_code

        if custom_input:
            result = run_func(code, custom_input)
            result["output"] = result["output"].replace("\nHI", "")
            if not result["success"]:
                return Response({"error": result["error"]}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"sample_output": result["output"]}, status=status.HTTP_200_OK)

        verdict, sample_output, expected_output, error_message = self.evaluate_testcases(problem, code, run_func)

        submission = serializer.save(
            user=user,
            problem=problem,
            contest=contest,
            verdict=verdict,
            sample_output=sample_output,
            expected_output=expected_output,
            error_message=error_message,
            language=language
        )
        return Response(self.get_serializer(submission).data, status=status.HTTP_201_CREATED)

    def evaluate_testcases(self, problem, code, run_func):
        test_cases = TestCase.objects.filter(problem=problem)
        for test_case in test_cases:
            result = run_func(code, test_case.input_data)
            result["output"] = result["output"].replace("\nHI", "")
            if "Time Limit Exceeded" in result["error"]:
                return "Time Limit Exceeded", "", "", result["error"]
            if not result["success"]:
                return "Runtime Error", result["output"], test_case.expected_output, result["error"]

            actual = re.sub(r'\r\n?', '\n', result["output"]).strip()
            expected = re.sub(r'\r\n?', '\n', test_case.expected_output).strip()

            if actual != expected:
                return "Wrong Answer", result["output"], test_case.expected_output, (
                    f"Input: {test_case.input_data}\nExpected: {expected}\nActual: {actual}"
                )

        return "Accepted", "", "", ""

# ✅ Submissions
class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user).order_by('-created_at')

class SubmissionDetailView(generics.RetrieveAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user)

# ✅ Leaderboard
class LeaderboardView(APIView):
    def get(self, request):
        users = (
            User.objects.annotate(
                accepted_count=Count('submission', filter=Q(submission__verdict='Accepted'))
            )
            .order_by('-accepted_count')[:10]
        )
        data = [{"username": u.email, "accepted_count": u.accepted_count} for u in users]
        return Response(data)

# ✅ Contests
class ContestListView(generics.ListAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [permissions.AllowAny]

class ContestDetailView(generics.RetrieveAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
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

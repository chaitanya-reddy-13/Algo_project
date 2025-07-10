from django.urls import path
from .views import RegisterView, LoginView, ProblemListView, ProblemDetailView, SubmitCodeView
from .views import SubmissionListView, SubmissionDetailView
from .views import LeaderboardView
from .views import get_ai_hint

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('problems/', ProblemListView.as_view(), name='problem-list'),
    path('problems/<int:id>/', ProblemDetailView.as_view(), name='problem-detail'),
    path('submit/', SubmitCodeView.as_view(), name='submit-code'),
    path('submissions/', SubmissionListView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('ai/hint/', get_ai_hint, name='get-ai-hint'),

]

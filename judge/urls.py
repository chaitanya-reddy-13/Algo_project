from django.urls import path
from .views import RegisterView, LoginView, ProblemListView, ProblemDetailView, SubmitCodeView
from .views import SubmissionListView, SubmissionDetailView
from .views import LeaderboardView
from .views import ContestListView, ContestDetailView, ContestEnterView, ContestProblemsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('problems/', ProblemListView.as_view(), name='problem-list'),
    path('problems/<int:id>/', ProblemDetailView.as_view(), name='problem-detail'),
    path('submit/', SubmitCodeView.as_view(), name='submit-code'),
    path('submissions/', SubmissionListView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('contests/', ContestListView.as_view(), name='contest-list'),
    path('contests/<int:id>/', ContestDetailView.as_view(), name='contest-detail'),
    path('contests/<int:id>/enter/', ContestEnterView.as_view(), name='contest-enter'),
    path('contests/<int:id>/problems/', ContestProblemsView.as_view(), name='contest-problems'),
    
    path('contests/<int:contest_id>/problems/<int:problem_id>/submit/', SubmitCodeView.as_view(), name='contest-submit-code'),

]
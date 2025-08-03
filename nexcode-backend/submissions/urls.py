from django.urls import path
from . import views

urlpatterns = [
    path('submissions/', views.SubmissionListView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/', views.SubmissionDetailView.as_view(), name='submission-detail'),
    path('submissions/create/', views.SubmissionCreateView.as_view(), name='submission-create'),
    path('submissions/leaderboard/', views.leaderboard, name='leaderboard'),
    path('submissions/stats/', views.submission_stats, name='submission-stats'),
    path('submissions/run-test/', views.run_test, name='run-test'),
    path('online-compiler/', views.online_compiler, name='online-compiler'),
] 
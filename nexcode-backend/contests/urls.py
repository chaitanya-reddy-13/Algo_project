from django.urls import path
from . import views

urlpatterns = [
    # Public contest endpoints
    path('contests/', views.ContestListView.as_view(), name='contest-list'),
    path('contests/<int:pk>/', views.ContestDetailView.as_view(), name='contest-detail'),
    path('contests/<int:contest_id>/problems/', views.ContestProblemListView.as_view(), name='contest-problems'),
    path('contests/<int:contest_id>/leaderboard/', views.contest_leaderboard, name='contest-leaderboard'),
    path('contests/<int:contest_id>/register/', views.register_for_contest, name='contest-register'),
    path('contests/<int:contest_id>/participants/', views.ContestParticipantListView.as_view(), name='contest-participants'),
    path('contests/<int:contest_id>/submissions/', views.ContestSubmissionListView.as_view(), name='contest-submissions'),
    path('contests/<int:contest_id>/submissions/create/', views.ContestSubmissionCreateView.as_view(), name='contest-submission-create'),
    path('contests/submissions/', views.UserContestSubmissionListView.as_view(), name='user-contest-submissions'),
    
    # Admin endpoints
    path('admin/contests/', views.AdminContestListView.as_view(), name='admin-contest-list'),
    path('admin/contests/create/', views.ContestCreateView.as_view(), name='admin-contest-create'),
    path('admin/contests/<int:pk>/update/', views.ContestUpdateView.as_view(), name='admin-contest-update'),
    path('admin/contests/<int:pk>/delete/', views.ContestDeleteView.as_view(), name='admin-contest-delete'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/toggle/', views.admin_toggle_user_status, name='admin-user-toggle'),
    path('admin/dashboard/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
] 
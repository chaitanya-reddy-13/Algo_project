from django.urls import path
from . import views

urlpatterns = [
    path('users/register/', views.register, name='user-register'),
    path('users/login/', views.login, name='user-login'),
    path('users/logout/', views.logout, name='user-logout'),
    path('users/profile/', views.profile, name='user-profile'),
    path('users/profile/update/', views.update_profile, name='user-profile-update'),
    path('users/', views.UserListView.as_view(), name='user-list'),
] 
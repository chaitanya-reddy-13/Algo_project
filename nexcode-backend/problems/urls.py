from django.urls import path
from . import views

urlpatterns = [
    path('problems/', views.ProblemListView.as_view(), name='problem-list'),
    path('problems/<int:pk>/', views.ProblemDetailView.as_view(), name='problem-detail'),
    path('problems/create/', views.ProblemCreateView.as_view(), name='problem-create'),
    path('problems/<int:pk>/update/', views.ProblemUpdateView.as_view(), name='problem-update'),
    path('problems/<int:pk>/delete/', views.ProblemDeleteView.as_view(), name='problem-delete'),
    path('problems/stats/', views.problem_stats, name='problem-stats'),
] 
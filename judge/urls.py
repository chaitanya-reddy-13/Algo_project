from django.urls import path
from .views import RegisterView, LoginView, ProblemListView, ProblemDetailView, SubmitCodeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('problems/', ProblemListView.as_view(), name='problem-list'),
    path('problems/<int:id>/', ProblemDetailView.as_view(), name='problem-detail'),
    path('submit/', SubmitCodeView.as_view(), name='submit-code'),
]

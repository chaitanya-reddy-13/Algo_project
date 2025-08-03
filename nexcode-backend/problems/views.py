from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Problem
from .serializers import (
    ProblemSerializer, ProblemCreateSerializer, ProblemListSerializer
)


class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.filter(is_active=True)
    serializer_class = ProblemListSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to view problems list
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['difficulty']  # Removed 'tags' due to JSONField issue
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'submission_count']
    ordering = ['-created_at']


class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.filter(is_active=True)
    serializer_class = ProblemSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to view problem details


class ProblemCreateView(generics.CreateAPIView):
    serializer_class = ProblemCreateSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProblemUpdateView(generics.UpdateAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.IsAdminUser]


class ProblemDeleteView(generics.DestroyAPIView):
    queryset = Problem.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def problem_stats(request):
    """Get statistics for problems"""
    total_problems = Problem.objects.filter(is_active=True).count()
    easy_problems = Problem.objects.filter(is_active=True, difficulty='Easy').count()
    medium_problems = Problem.objects.filter(is_active=True, difficulty='Medium').count()
    hard_problems = Problem.objects.filter(is_active=True, difficulty='Hard').count()
    
    return Response({
        'total_problems': total_problems,
        'easy_problems': easy_problems,
        'medium_problems': medium_problems,
        'hard_problems': hard_problems,
    })

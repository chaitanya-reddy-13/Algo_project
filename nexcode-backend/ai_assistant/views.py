import time
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AIAssistantLog
from .serializers import AIAssistantLogSerializer, AIAssistantQuerySerializer
from .services import AIService
from django.db import models


class AIAssistantLogListView(generics.ListAPIView):
    serializer_class = AIAssistantLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['problem', 'model_used']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return AIAssistantLog.objects.all()
        return AIAssistantLog.objects.filter(user=user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_assistant_chat(request):
    """Handle AI assistant chat requests"""
    serializer = AIAssistantQuerySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    start_time = time.time()
    
    try:
        # Get the AI service
        ai_service = AIService()
        
        # Prepare the query with context
        query = serializer.validated_data['query']
        problem_id = serializer.validated_data.get('problem_id')
        code = serializer.validated_data.get('code', '')
        context = serializer.validated_data.get('context', '')
        
        # Build the prompt with context
        prompt = query
        if problem_id:
            try:
                from problems.models import Problem
                problem = Problem.objects.get(id=problem_id)
                prompt = f"Problem: {problem.title}\n\n{problem.description}\n\nConstraints: {problem.constraints}\n\nUser Query: {query}"
                if code:
                    prompt += f"\n\nUser Code:\n{code}"
            except Problem.DoesNotExist:
                pass
        
        if context:
            prompt = f"Context: {context}\n\n{prompt}"
        
        # Get response from AI service
        response, tokens_used, model_used = ai_service.get_response(prompt)
        
        response_time = time.time() - start_time
        
        # Log the interaction
        log = AIAssistantLog.objects.create(
            user=request.user,
            problem_id=problem_id,
            query=query,
            response=response,
            tokens_used=tokens_used,
            model_used=model_used,
            response_time=response_time
        )
        
        return Response({
            'response': response,
            'log_id': log.id,
            'tokens_used': tokens_used,
            'model_used': model_used,
            'response_time': response_time
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to get AI response',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_assistant_stats(request):
    """Get AI assistant usage statistics"""
    user = request.user
    
    # User's AI usage stats
    user_logs = AIAssistantLog.objects.filter(user=user)
    total_queries = user_logs.count()
    total_tokens = user_logs.aggregate(total=models.Sum('tokens_used'))['total'] or 0
    avg_response_time = user_logs.aggregate(avg=models.Avg('response_time'))['avg'] or 0
    
    # Recent usage (last 7 days)
    from django.utils import timezone
    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    recent_queries = user_logs.filter(created_at__gte=week_ago).count()
    
    # Model usage distribution
    model_stats = user_logs.values('model_used').annotate(count=models.Count('model_used'))
    
    return Response({
        'total_queries': total_queries,
        'total_tokens': total_tokens,
        'avg_response_time': avg_response_time,
        'recent_queries': recent_queries,
        'model_stats': model_stats,
    })

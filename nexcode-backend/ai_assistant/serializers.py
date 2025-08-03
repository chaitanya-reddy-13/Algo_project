from rest_framework import serializers
from .models import AIAssistantLog
from core.serializers import UserSerializer
from problems.serializers import ProblemListSerializer


class AIAssistantLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    problem = ProblemListSerializer(read_only=True)
    
    class Meta:
        model = AIAssistantLog
        fields = [
            'id', 'user', 'problem', 'query', 'response', 'created_at',
            'tokens_used', 'model_used', 'response_time'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'tokens_used', 'model_used', 'response_time']


class AIAssistantQuerySerializer(serializers.Serializer):
    query = serializers.CharField()
    problem_id = serializers.IntegerField(required=False, allow_null=True)
    code = serializers.CharField(required=False, allow_blank=True)
    context = serializers.CharField(required=False, allow_blank=True) 
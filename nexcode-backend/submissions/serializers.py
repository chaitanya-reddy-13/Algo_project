from rest_framework import serializers
from .models import Submission
from problems.serializers import ProblemListSerializer
from core.serializers import UserSerializer


class SubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    problem = ProblemListSerializer(read_only=True)
    execution_time_ms = serializers.ReadOnlyField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'problem', 'user', 'code', 'language', 'verdict',
            'execution_time', 'execution_time_ms', 'memory', 'submitted_at',
            'evaluated_at', 'error_message', 'test_cases_passed', 'total_test_cases'
        ]
        read_only_fields = [
            'id', 'user', 'verdict', 'execution_time', 'memory', 'submitted_at',
            'evaluated_at', 'error_message', 'test_cases_passed', 'total_test_cases'
        ]


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['problem', 'code', 'language']


class LeaderboardEntrySerializer(serializers.Serializer):
    user = UserSerializer()
    problem = ProblemListSerializer()
    total_submissions = serializers.IntegerField()
    accepted_submissions = serializers.IntegerField()
    best_execution_time = serializers.FloatField()
    best_memory_usage = serializers.IntegerField()
    last_submission_date = serializers.DateTimeField()


class UserStatsSerializer(serializers.Serializer):
    user = UserSerializer()
    total_problems_solved = serializers.IntegerField()
    total_submissions = serializers.IntegerField()
    accepted_submissions = serializers.IntegerField()
    acceptance_rate = serializers.FloatField()
    average_execution_time = serializers.FloatField()
    rank = serializers.IntegerField() 
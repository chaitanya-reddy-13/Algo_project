from rest_framework import serializers
from .models import Problem, TestCase
from core.serializers import UserSerializer


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_hidden', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProblemSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    test_cases = TestCaseSerializer(many=True, read_only=True)
    submission_count = serializers.ReadOnlyField()
    accepted_count = serializers.ReadOnlyField()
    acceptance_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'constraints', 'difficulty', 
            'tags', 'starter_code', 'created_by', 'created_at', 'updated_at',
            'is_active', 'test_cases', 'submission_count', 'accepted_count', 
            'acceptance_rate'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ProblemCreateSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, required=False)
    
    class Meta:
        model = Problem
        fields = [
            'title', 'description', 'constraints', 'difficulty', 
            'tags', 'starter_code', 'test_cases'
        ]
    
    def create(self, validated_data):
        test_cases_data = validated_data.pop('test_cases', [])
        problem = Problem.objects.create(**validated_data)
        
        for test_case_data in test_cases_data:
            TestCase.objects.create(problem=problem, **test_case_data)
        
        return problem


class ProblemListSerializer(serializers.ModelSerializer):
    submission_count = serializers.ReadOnlyField()
    accepted_count = serializers.ReadOnlyField()
    acceptance_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'difficulty', 'tags', 'created_at',
            'submission_count', 'accepted_count', 'acceptance_rate'
        ] 
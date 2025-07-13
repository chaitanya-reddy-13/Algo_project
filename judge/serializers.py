from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Submission, Problem, Contest

# ✅ Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


# ✅ User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# ✅ Problem Serializer
class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ['id', 'title', 'description', 'difficulty']


# ✅ Submission Serializer
class SubmissionSerializer(serializers.ModelSerializer):
    custom_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Submission
        fields = [
            'id',
            'problem',
            'code',
            'language',
            'verdict',
            'sample_output',
            'expected_output',
            'error_message',
            'custom_input',
            'created_at',
        ]
        read_only_fields = [
            'id', 'verdict', 'sample_output',
            'expected_output', 'error_message', 'created_at'
        ]
    def create(self, validated_data):
        validated_data.pop('custom_input', None)
        return super().create(validated_data)
class ContestSerializer(serializers.ModelSerializer):
    problems = ProblemSerializer(many=True)

    class Meta:
        model = Contest
        fields = ['id', 'name', 'start_time', 'duration_minutes', 'problems']

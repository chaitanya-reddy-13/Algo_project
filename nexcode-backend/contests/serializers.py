from rest_framework import serializers
from .models import Contest, ContestProblem, ContestParticipant, ContestSubmission
from problems.serializers import ProblemSerializer
from core.serializers import UserSerializer

class ContestSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    participant_count = serializers.ReadOnlyField()
    is_running = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_ended = serializers.ReadOnlyField()
    
    class Meta:
        model = Contest
        fields = '__all__'

class ContestListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    participant_count = serializers.ReadOnlyField()
    is_running = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_ended = serializers.ReadOnlyField()
    is_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'is_active', 
                 'is_public', 'allow_registration', 'max_participants', 'created_by', 
                 'participant_count', 'is_running', 'is_upcoming', 'is_ended', 'created_at', 'is_participant']
    
    def get_is_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False

class ContestProblemSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer(read_only=True)
    
    class Meta:
        model = ContestProblem
        fields = '__all__'

class ContestParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_score = serializers.ReadOnlyField()
    solved_problems = serializers.ReadOnlyField()
    
    class Meta:
        model = ContestParticipant
        fields = '__all__'

class ContestSubmissionSerializer(serializers.ModelSerializer):
    participant = ContestParticipantSerializer(read_only=True)
    problem = ProblemSerializer(read_only=True)
    execution_time_ms = serializers.ReadOnlyField()
    
    class Meta:
        model = ContestSubmission
        fields = '__all__'

class ContestSubmissionCreateSerializer(serializers.ModelSerializer):
    execution_time_ms = serializers.ReadOnlyField()
    
    class Meta:
        model = ContestSubmission
        fields = ['problem', 'code', 'language', 'verdict', 'score', 'test_cases_passed', 'total_test_cases', 'execution_time', 'error_message', 'execution_time_ms']

class ContestLeaderboardEntrySerializer(serializers.Serializer):
    user = UserSerializer()
    contest = ContestSerializer()
    total_score = serializers.IntegerField()
    solved_problems = serializers.IntegerField()
    total_submissions = serializers.IntegerField()
    best_execution_time = serializers.FloatField(allow_null=True)
    rank = serializers.IntegerField() 
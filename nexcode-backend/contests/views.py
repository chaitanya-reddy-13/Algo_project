from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.utils import timezone
from .models import Contest, ContestProblem, ContestParticipant, ContestSubmission
from .serializers import (
    ContestSerializer, ContestListSerializer, ContestProblemSerializer,
    ContestParticipantSerializer, ContestSubmissionSerializer, ContestSubmissionCreateSerializer,
    ContestLeaderboardEntrySerializer
)
from core.models import User
from problems.models import Problem

class ContestListView(generics.ListAPIView):
    serializer_class = ContestListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Contest.objects.filter(is_active=True)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'running':
            queryset = queryset.filter(
                start_time__lte=timezone.now(),
                end_time__gte=timezone.now()
            )
        elif status_filter == 'upcoming':
            queryset = queryset.filter(start_time__gt=timezone.now())
        elif status_filter == 'ended':
            queryset = queryset.filter(end_time__lt=timezone.now())
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ContestDetailView(generics.RetrieveAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [permissions.AllowAny]

class ContestCreateView(generics.CreateAPIView):
    serializer_class = ContestSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ContestUpdateView(generics.UpdateAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [permissions.IsAdminUser]

class ContestDeleteView(generics.DestroyAPIView):
    queryset = Contest.objects.all()
    permission_classes = [permissions.IsAdminUser]

class ContestProblemListView(generics.ListAPIView):
    serializer_class = ContestProblemSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        contest_id = self.kwargs.get('contest_id')
        return ContestProblem.objects.filter(contest_id=contest_id)

class ContestParticipantListView(generics.ListAPIView):
    serializer_class = ContestParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        contest_id = self.kwargs.get('contest_id')
        return ContestParticipant.objects.filter(contest_id=contest_id)

class ContestSubmissionListView(generics.ListAPIView):
    serializer_class = ContestSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        contest_id = self.kwargs.get('contest_id')
        return ContestSubmission.objects.filter(contest_id=contest_id)

class UserContestSubmissionListView(generics.ListAPIView):
    serializer_class = ContestSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        contest_id = self.request.query_params.get('contest')
        
        if contest_id:
            return ContestSubmission.objects.filter(
                participant__user=user,
                contest_id=contest_id
            )
        else:
            return ContestSubmission.objects.filter(participant__user=user)

class ContestSubmissionCreateView(generics.CreateAPIView):
    serializer_class = ContestSubmissionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        contest_id = self.kwargs.get('contest_id')
        contest = get_object_or_404(Contest, id=contest_id)
        
        # Check if user is participant
        participant = get_object_or_404(ContestParticipant, contest=contest, user=self.request.user)
        
        # Create submission
        submission = ContestSubmission.objects.create(
            contest=contest,
            participant=participant,
            problem=serializer.validated_data['problem'],
            code=serializer.validated_data['code'],
            language=serializer.validated_data['language']
        )
        
        # Evaluate contest submission synchronously (runs test cases and calculates score)
        from submissions.tasks import evaluate_contest_submission
        evaluate_contest_submission(submission.id)
        
        # Refresh the submission object to get updated evaluation results
        submission.refresh_from_db()
        
        # Update the serializer instance with the evaluated submission
        serializer.instance = submission

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_for_contest(request, contest_id):
    """Register user for a contest"""
    contest = get_object_or_404(Contest, id=contest_id)
    
    if not contest.allow_registration:
        return Response({'error': 'Registration is not allowed for this contest'}, status=400)
    
    if contest.max_participants and contest.participant_count >= contest.max_participants:
        return Response({'error': 'Contest is full'}, status=400)
    
    if ContestParticipant.objects.filter(contest=contest, user=request.user).exists():
        return Response({'error': 'Already registered for this contest'}, status=400)
    
    participant = ContestParticipant.objects.create(contest=contest, user=request.user)
    serializer = ContestParticipantSerializer(participant)
    return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def contest_leaderboard(request, contest_id):
    """Get contest leaderboard"""
    contest = get_object_or_404(Contest, id=contest_id)
    
    # Get all participants with their scores
    participants = ContestParticipant.objects.filter(contest=contest)
    leaderboard_data = []
    
    for participant in participants:
        submissions = ContestSubmission.objects.filter(participant=participant)
        accepted_submissions = submissions.filter(verdict='Accepted')
        
        # Include all participants, even those with no accepted submissions
        stats = {
            'user': participant.user,
            'contest': contest,
            'total_score': participant.total_score,
            'solved_problems': participant.solved_problems,
            'total_submissions': submissions.count(),
            'best_execution_time': accepted_submissions.aggregate(Avg('execution_time'))['execution_time__avg'] if accepted_submissions.exists() else None,
        }
        leaderboard_data.append(stats)
    
    # Sort by total score (descending), then by solved problems (descending), then by best execution time (ascending), then by total submissions (ascending)
    leaderboard_data.sort(key=lambda x: (
        x['total_score'], 
        x['solved_problems'], 
        -(x['best_execution_time'] or float('inf')),  # None values go to the end
        -x['total_submissions']
    ), reverse=True)
    
    # Add rank (handle ties properly)
    current_rank = 1
    for i, stats in enumerate(leaderboard_data):
        if i > 0:
            prev_stats = leaderboard_data[i-1]
            # If current stats are different from previous, increment rank
            if (stats['total_score'] != prev_stats['total_score'] or 
                stats['solved_problems'] != prev_stats['solved_problems'] or
                stats['best_execution_time'] != prev_stats['best_execution_time']):
                current_rank = i + 1
        stats['rank'] = current_rank
    
    serializer = ContestLeaderboardEntrySerializer(leaderboard_data, many=True)
    return Response(serializer.data)

# Admin views
class AdminContestListView(generics.ListAPIView):
    serializer_class = ContestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Contest.objects.all()

class AdminUserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return User.objects.filter(is_active=True)
    
    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        user_data = []
        
        for user in users:
            # Get user statistics
            total_submissions = user.submissions.count()
            accepted_submissions = user.submissions.filter(verdict='Accepted').count()
            contest_participations = user.contest_participations.count()
            
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'total_submissions': total_submissions,
                'accepted_submissions': accepted_submissions,
                'acceptance_rate': (accepted_submissions / total_submissions * 100) if total_submissions > 0 else 0,
                'contest_participations': contest_participations,
            })
        
        return Response(user_data)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_toggle_user_status(request, user_id):
    """Toggle user active/inactive status"""
    user = get_object_or_404(User, id=user_id)
    user.is_active = not user.is_active
    user.save()
    
    return Response({
        'id': user.id,
        'username': user.username,
        'is_active': user.is_active
    })

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    total_users = User.objects.filter(is_active=True).count()
    total_problems = Problem.objects.filter(is_active=True).count()
    total_contests = Contest.objects.filter(is_active=True).count()
    total_submissions = ContestSubmission.objects.count() + request.user.__class__.objects.aggregate(
        total=Count('submissions'))['total']
    
    # Recent activity
    recent_submissions = ContestSubmission.objects.order_by('-submitted_at')[:10]
    recent_contests = Contest.objects.order_by('-created_at')[:5]
    
    return Response({
        'total_users': total_users,
        'total_problems': total_problems,
        'total_contests': total_contests,
        'total_submissions': total_submissions,
        'recent_submissions': ContestSubmissionSerializer(recent_submissions, many=True).data,
        'recent_contests': ContestListSerializer(recent_contests, many=True).data,
    }) 
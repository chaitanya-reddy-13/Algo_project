from django.db import models
from django.contrib.auth import get_user_model
from problems.models import Problem

User = get_user_model()

class Contest(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_contests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Contest settings
    is_public = models.BooleanField(default=True)
    allow_registration = models.BooleanField(default=True)
    max_participants = models.IntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_running(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_time <= now <= self.end_time
    
    @property
    def is_upcoming(self):
        from django.utils import timezone
        now = timezone.now()
        return now < self.start_time
    
    @property
    def is_ended(self):
        from django.utils import timezone
        now = timezone.now()
        return now > self.end_time
    
    @property
    def participant_count(self):
        return self.participants.count()

class ContestProblem(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='problems')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='contests')
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=100)
    
    class Meta:
        ordering = ['order']
        unique_together = ['contest', 'problem']
    
    def __str__(self):
        return f"{self.contest.title} - {self.problem.title}"

class ContestParticipant(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contest_participations')
    registered_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['contest', 'user']
    
    def __str__(self):
        return f"{self.user.username} in {self.contest.title}"
    
    @property
    def total_score(self):
        return sum(submission.score for submission in self.submissions.filter(verdict='Accepted'))
    
    @property
    def solved_problems(self):
        return self.submissions.filter(verdict='Accepted').values('problem').distinct().count()

class ContestSubmission(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='submissions')
    participant = models.ForeignKey(ContestParticipant, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='contest_submissions')
    code = models.TextField()
    language = models.CharField(max_length=20)
    verdict = models.CharField(max_length=25, choices=[
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Time Limit Exceeded', 'Time Limit Exceeded'),
        ('Compilation Error', 'Compilation Error'),
        ('Runtime Error', 'Runtime Error'),
        ('Memory Limit Exceeded', 'Memory Limit Exceeded'),
    ], default='Pending')
    execution_time = models.FloatField(null=True, blank=True)
    memory = models.IntegerField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    test_cases_passed = models.IntegerField(null=True, blank=True)
    total_test_cases = models.IntegerField(null=True, blank=True)
    score = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.participant.user.username} - {self.problem.title}"
    
    @property
    def is_accepted(self):
        return self.verdict == 'Accepted'
    
    @property
    def execution_time_ms(self):
        return int(self.execution_time * 1000) if self.execution_time else None 
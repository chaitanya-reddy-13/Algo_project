from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    constraints = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    tags = models.JSONField(default=list)
    starter_code = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_problems')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'problems'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def submission_count(self):
        return self.submissions.count()
    
    @property
    def accepted_count(self):
        return self.submissions.filter(verdict='Accepted').count()
    
    @property
    def acceptance_rate(self):
        if self.submission_count == 0:
            return 0
        return (self.accepted_count / self.submission_count) * 100


class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'test_cases'
    
    def __str__(self):
        return f"TestCase for {self.problem.title}"

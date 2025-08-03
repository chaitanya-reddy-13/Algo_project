from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Submission(models.Model):
    VERDICT_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Time Limit Exceeded', 'Time Limit Exceeded'),
        ('Compilation Error', 'Compilation Error'),
        ('Runtime Error', 'Runtime Error'),
        ('Memory Limit Exceeded', 'Memory Limit Exceeded'),
    ]
    
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('cpp', 'C++'),
        ('java', 'Java'),
        ('javascript', 'JavaScript'),
        ('c', 'C'),
        ('go', 'Go'),
        ('rust', 'Rust'),
    ]
    
    problem = models.ForeignKey('problems.Problem', on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField()
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    verdict = models.CharField(max_length=25, choices=VERDICT_CHOICES, default='Pending')
    execution_time = models.FloatField(null=True, blank=True)  # in seconds
    memory = models.IntegerField(null=True, blank=True)  # in MB
    submitted_at = models.DateTimeField(default=timezone.now)
    evaluated_at = models.DateTimeField(null=True, blank=True)
    
    # Additional fields for detailed results
    error_message = models.TextField(blank=True, null=True)
    test_cases_passed = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'submissions'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {self.verdict}"
    
    def save(self, *args, **kwargs):
        if self.verdict != 'Pending' and not self.evaluated_at:
            self.evaluated_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def is_accepted(self):
        return self.verdict == 'Accepted'
    
    @property
    def execution_time_ms(self):
        if self.execution_time:
            return int(self.execution_time * 1000)
        return None

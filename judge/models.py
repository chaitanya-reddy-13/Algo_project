from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    tags = models.CharField(max_length=255, blank=True)
    starter_code = models.TextField(blank=True)

    def __str__(self):
        return self.title


class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='testcases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_sample = models.BooleanField(default=False)

    def __str__(self):
        return f"TestCase for {self.problem.title}"


class Submission(models.Model):
    VERDICT_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Runtime Error', 'Runtime Error'),
        ('Syntax Error', 'Syntax Error'),
        ('Time Limit Exceeded', 'Time Limit Exceeded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    # New fields
    verdict = models.CharField(max_length=30, choices=VERDICT_CHOICES, default='Pending')
    sample_output = models.TextField(blank=True, null=True)
    expected_output = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    language = models.CharField(max_length=10, choices=[("python", "Python"), ("cpp", "C++")], default="python")
    contest = models.ForeignKey('Contest', on_delete=models.SET_NULL, null=True, blank=True)


    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {self.verdict}"
class Contest(models.Model):
    name = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=90)
    problems = models.ManyToManyField(Problem, related_name="contests")

    def __str__(self):
        return self.name

    def end_time(self):
        return self.start_time + timedelta(minutes=self.duration_minutes)

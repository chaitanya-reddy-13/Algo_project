from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AIAssistantLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_assistant_logs')
    problem = models.ForeignKey('problems.Problem', on_delete=models.CASCADE, related_name='ai_assistant_logs', null=True, blank=True)
    query = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    # Additional fields for analytics
    tokens_used = models.IntegerField(default=0)
    model_used = models.CharField(max_length=50, default='gpt-3.5-turbo')
    response_time = models.FloatField(null=True, blank=True)  # in seconds
    
    class Meta:
        db_table = 'ai_assistant_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = [
        ('User', 'User'),
        ('Admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='User')
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Additional fields for user profile
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    class Meta:
        db_table = 'users'
        unique_together = ['email']
    
    def __str__(self):
        return self.username
    
    @property
    def is_admin(self):
        return self.role == 'Admin'

from django.contrib import admin
from .models import AIAssistantLog


@admin.register(AIAssistantLog)
class AIAssistantLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'problem', 'model_used', 'tokens_used', 'response_time', 'created_at']
    list_filter = ['model_used', 'created_at']
    search_fields = ['user__username', 'problem__title', 'query', 'response']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'tokens_used', 'model_used', 'response_time']
    
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'problem')
        }),
        ('Interaction', {
            'fields': ('query', 'response')
        }),
        ('Analytics', {
            'fields': ('tokens_used', 'model_used', 'response_time', 'created_at')
        }),
    )

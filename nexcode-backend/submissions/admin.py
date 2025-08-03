from django.contrib import admin
from .models import Submission


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'problem', 'language', 'verdict', 'execution_time', 'submitted_at']
    list_filter = ['verdict', 'language', 'submitted_at']
    search_fields = ['user__username', 'problem__title', 'code']
    ordering = ['-submitted_at']
    readonly_fields = ['submitted_at', 'evaluated_at']
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('user', 'problem', 'language', 'code')
        }),
        ('Results', {
            'fields': ('verdict', 'execution_time', 'memory', 'error_message', 'test_cases_passed', 'total_test_cases')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'evaluated_at')
        }),
    )

from django.contrib import admin
from .models import Contest, ContestProblem, ContestParticipant, ContestSubmission

@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_time', 'end_time', 'is_active', 'is_public', 'participant_count', 'created_by']
    list_filter = ['is_active', 'is_public', 'allow_registration', 'created_at']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at', 'participant_count']

@admin.register(ContestProblem)
class ContestProblemAdmin(admin.ModelAdmin):
    list_display = ['contest', 'problem', 'order', 'points']
    list_filter = ['contest', 'order']
    search_fields = ['contest__title', 'problem__title']

@admin.register(ContestParticipant)
class ContestParticipantAdmin(admin.ModelAdmin):
    list_display = ['contest', 'user', 'registered_at', 'started_at', 'finished_at', 'total_score', 'solved_problems']
    list_filter = ['contest', 'registered_at']
    search_fields = ['contest__title', 'user__username', 'user__email']
    readonly_fields = ['registered_at', 'total_score', 'solved_problems']

@admin.register(ContestSubmission)
class ContestSubmissionAdmin(admin.ModelAdmin):
    list_display = ['participant', 'problem', 'language', 'verdict', 'score', 'submitted_at', 'execution_time']
    list_filter = ['contest', 'verdict', 'language', 'submitted_at']
    search_fields = ['participant__user__username', 'problem__title']
    readonly_fields = ['submitted_at', 'evaluated_at', 'execution_time_ms'] 
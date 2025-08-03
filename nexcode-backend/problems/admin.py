from django.contrib import admin
from .models import Problem, TestCase


class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'created_by', 'created_at', 'is_active']
    list_filter = ['difficulty', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    inlines = [TestCaseInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'constraints', 'difficulty', 'tags')
        }),
        ('Code', {
            'fields': ('starter_code',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'is_active')
        }),
    )


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ['problem', 'is_hidden', 'created_at']
    list_filter = ['is_hidden', 'created_at']
    search_fields = ['problem__title']
    ordering = ['-created_at']

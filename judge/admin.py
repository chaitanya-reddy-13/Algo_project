from .models import Problem, TestCase, Submission, Contest
from django.contrib import admin  # ✅ Add this line
from .models import Problem, TestCase, Submission, Contest
from django.contrib import admin
from .models import User, ForgetPassword
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1

class ProblemAdmin(admin.ModelAdmin):
    inlines = [TestCaseInline]

admin.site.register(Problem, ProblemAdmin)
admin.site.register(TestCase)
admin.site.register(Submission)
admin.site.register(Contest)

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'is_staff', 'is_verified')
    list_filter = ('is_staff', 'is_superuser', 'is_verified')
    fieldsets = (
        (None, {'fields': ('email', 'password', 'is_verified', 'otp', 'forgot_password_token')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'last_login_time', 'last_logout_time')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_verified', 'is_staff', 'is_superuser')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)

admin.site.register(User, UserAdmin)
admin.site.register(ForgetPassword)
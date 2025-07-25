from .models import Problem, TestCase, Submission, Contest
from django.contrib import admin  # ✅ Add this line
from .models import Problem, TestCase, Submission, Contest
class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1

class ProblemAdmin(admin.ModelAdmin):
    inlines = [TestCaseInline]

admin.site.register(Problem, ProblemAdmin)
admin.site.register(TestCase)
admin.site.register(Submission)
admin.site.register(Contest)

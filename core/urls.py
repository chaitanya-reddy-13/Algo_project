from django.contrib import admin
from django.urls import path, include
from judge.views import get_ai_hint

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('judge.urls')),
    path('api/ai-hint', get_ai_hint, name='ai-hint'),# ✅ Include judge app's URLs
]

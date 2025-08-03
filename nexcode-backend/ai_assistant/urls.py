from django.urls import path
from . import views

urlpatterns = [
    path('ai-assistant/chat/', views.ai_assistant_chat, name='ai-assistant-chat'),
    path('ai-assistant/logs/', views.AIAssistantLogListView.as_view(), name='ai-assistant-logs'),
    path('ai-assistant/stats/', views.ai_assistant_stats, name='ai-assistant-stats'),
] 
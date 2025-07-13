from django.contrib import admin
from django.urls import path, include  # ✅ Add this line
from judge.views import get_ai_hint
from judge.views import ContestListView, ContestDetailView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('judge.urls')),
    path('api/ai-hint/', get_ai_hint, name='ai-hint'),
    path("api/contests/", ContestListView.as_view(), name="contest-list"),
    path("api/contests/<int:id>/", ContestDetailView.as_view(), name="contest-detail"),# ✅ also add trailing slash here
]

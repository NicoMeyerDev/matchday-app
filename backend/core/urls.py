"""
Zentrale URL-Konfiguration für die Backend-API.

Alle MVP-Endpunkte liegen gesammelt unter /api/, damit das Frontend eine saubere Basis-URL verwenden kann.
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from matchreport.views import MatchEventViewSet

event_router = DefaultRouter()
event_router.register('matchreports/events', MatchEventViewSet, basename='matchevent')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(event_router.urls)),
    path('api/auth/', include('auth_app.api.urls')),
    path('api/players/', include('players.urls')),
    path('api/formations/', include('formations.urls')),
    path('api/lineups/', include('lineups.urls')),
    path('api/matchreports/', include('matchreport.urls')),
    path('api/clubs/', include('clubs.urls')),
]

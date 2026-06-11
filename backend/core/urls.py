"""
Zentrale URL-Konfiguration für die Backend-API.

Alle MVP-Endpunkte liegen gesammelt unter /api/, damit das Frontend eine saubere Basis-URL verwenden kann.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth_app.api.urls')),
    path('api/players/', include('players.urls')),
    path('api/formations/', include('formations.urls')),
    path('api/lineups/', include('lineups.urls')),
    path('api/matchreports/', include('matchreport.urls')),
    path('api/clubs/', include('clubs.urls')),
]

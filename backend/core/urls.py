"""Alle MVP-Endpunkte liegen gesammelt unter /api/, damit das Frontend eine
saubere Basis-URL verwenden kann.
Zusätzlich liefert die Catch-all-Route am Ende das gebaute React-Frontend
(frontend/dist/index.html) für alle Pfade aus, die nicht /api/ oder /admin/ sind.
Das wird für das Deployment auf Render benötigt.
"""

from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from matchreport.views import MatchEventViewSet
from django.conf import settings
from django.conf.urls.static import static

event_router = DefaultRouter()
event_router.register("matchreports/events", MatchEventViewSet, basename="matchevent")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(event_router.urls)),
    path("api/auth/", include("auth_app.api.urls")),
    path("api/players/", include("players.urls")),
    path("api/formations/", include("formations.urls")),
    path("api/lineups/", include("lineups.urls")),
    path("api/matchreports/", include("matchreport.urls")),
    path("api/clubs/", include("clubs.urls")),
    path("api/training/", include("training.urls")),
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
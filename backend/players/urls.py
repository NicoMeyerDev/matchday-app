"""URL-Routen für die Spieler-Endpunkte."""

from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet

router = DefaultRouter()
router.register("", PlayerViewSet, basename="player")

urlpatterns = router.urls

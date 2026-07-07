"""URL-Routen für die Formations-Endpunkte."""

from rest_framework.routers import DefaultRouter
from .views import FormationViewSet

router = DefaultRouter()
router.register("", FormationViewSet, basename="formation")

urlpatterns = router.urls

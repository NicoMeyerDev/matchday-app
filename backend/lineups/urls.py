"""URL-Routen für die Aufstellungs-Endpunkte."""
from rest_framework.routers import DefaultRouter
from .views import LineupViewSet

router = DefaultRouter()
router.register('', LineupViewSet, basename='lineup')


urlpatterns = router.urls

"""URL-Routen für die MatchReport-Endpunkte."""
from rest_framework.routers import DefaultRouter
from .views import MatchReportViewSet

router = DefaultRouter()
router.register('', MatchReportViewSet, basename='matchreport')

urlpatterns = router.urls
"""URL-Routen für die Aufstellungs-Endpunkte."""
from rest_framework.routers import DefaultRouter
from .views import TrainingViewSet, TrainingsBlockViewSet

router = DefaultRouter()
router.register('trainings', TrainingViewSet, basename='training')
router.register('training-blocks', TrainingsBlockViewSet, basename='training-block')

urlpatterns = router.urls

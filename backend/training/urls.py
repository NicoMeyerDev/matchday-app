"""URL-Routen für die Aufstellungs-Endpunkte."""

from rest_framework.routers import DefaultRouter
from .views import (
    TrainingViewSet,
    TrainingsBlockViewSet,
    CategoryViewSet,
    UebungViewSet,
)

router = DefaultRouter()
router.register("trainings", TrainingViewSet, basename="training")
router.register("training-blocks", TrainingsBlockViewSet, basename="training-block")
router.register("categories", CategoryViewSet, basename="category")
router.register("uebungen", UebungViewSet, basename="uebung")

urlpatterns = router.urls

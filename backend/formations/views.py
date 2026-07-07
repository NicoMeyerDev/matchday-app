"""API-Views für Formationsdaten."""

from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Formation
from .serializers import FormationSerializer


class FormationViewSet(ReadOnlyModelViewSet):
    """
    Stellt reine Lese-Endpunkte für Formationen bereit.

    Die Formationen sind im MVP vorgegeben, damit Trainer beim Testen nicht
    versehentlich das Spielfeldlayout beschädigen.
    """

    queryset = Formation.objects.prefetch_related("positions").all().order_by("name")
    serializer_class = FormationSerializer

"""Admin-Konfiguration für Formationen."""

from django.contrib import admin
from .models import Formation, FormationPosition


class FormationPositionInline(admin.TabularInline):
    """Erlaubt das direkte Bearbeiten von Positionspunkten innerhalb einer Formation."""

    model = FormationPosition
    extra = 0


@admin.register(Formation)
class FormationAdmin(admin.ModelAdmin):
    """Zeigt Formationen und die zugehörigen Positionspunkte im Admin an."""

    list_display = ["name"]
    inlines = [FormationPositionInline]

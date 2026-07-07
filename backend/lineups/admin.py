"""Admin-Konfiguration für Aufstellungen."""

from django.contrib import admin
from .models import Lineup, LineupSlot, LineupSubstitute


class LineupSlotInline(admin.TabularInline):
    """Erlaubt das Bearbeiten von Feldzuweisungen innerhalb einer Aufstellung."""

    model = LineupSlot
    extra = 0


class LineupSubstituteInline(admin.TabularInline):
    """Erlaubt das Bearbeiten von Ersatzspielern innerhalb einer Aufstellung."""

    model = LineupSubstitute
    extra = 0


@admin.register(Lineup)
class LineupAdmin(admin.ModelAdmin):
    """Zeigt Aufstellungsdaten mit Feldpositionen und Bankspielern im Admin an."""

    list_display = ["title", "opponent", "formation", "updated_at"]
    inlines = [LineupSlotInline, LineupSubstituteInline]

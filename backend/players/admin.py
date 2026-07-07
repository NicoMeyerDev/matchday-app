"""Admin-Konfiguration für Spieler."""

from django.contrib import admin
from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """Zeigt wichtige Spielerfelder im Django-Admin an."""

    list_display = ["name", "shirt_number", "preferred_positions", "is_active"]
    search_fields = ["name", "preferred_positions"]

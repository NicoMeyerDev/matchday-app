from django.apps import AppConfig


class PlayersConfig(AppConfig):
    """Registriert die Spieler-App im Django-Projekt."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'players'

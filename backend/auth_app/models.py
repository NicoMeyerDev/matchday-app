from django.db import models
import uuid


class MyUUIDModel(models.Model):
    """
    Abstract base class that provides a UUID primary key field.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class Clubinvite(MyUUIDModel):
    """
    Model für die Verwaltung von Einladungen zu Clubs.
    Jede Einladung ist mit einem Club und einer E-Mail-Adresse verknüpft und
    enthält einen eindeutigen Token,
    der zur Verifizierung der Einladung verwendet wird.
    """

    club = models.ForeignKey(
        "clubs.Club", on_delete=models.SET_NULL, null=True, related_name="invites"
    )
    email = models.EmailField(max_length=50)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    invited_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["club", "email"], name="unique_invite_per_club_and_email"
            )
        ]

    def __str__(self):
        return self.email

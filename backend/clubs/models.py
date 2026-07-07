from django.db import models


class Club(models.Model):
    """Erstellen eines Clubs. Jeder Club eine Mannschaft und can
    mehrere Trainer haben."""

    owner = models.ForeignKey(
        "auth.User", related_name="clubs", on_delete=models.CASCADE
    )

    members = models.ManyToManyField("auth.User", related_name="trainer_clubs")

    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

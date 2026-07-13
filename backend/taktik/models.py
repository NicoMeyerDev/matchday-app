from django.db import models


class Taktik(models.Model):
    team = models.ForeignKey("clubs.Club", on_delete=models.CASCADE)
    scenario = models.CharField(max_length=100)
    player = models.ForeignKey(
        "players.Player", on_delete=models.SET_NULL, null=True, blank=True
    )
    slot_number = models.IntegerField()
    group = models.CharField(
        max_length=100, choices=[("absichern", "Absichern"), ("strafraum", "Strafraum")]
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["team", "scenario", "slot_number"], name="unique_slot_per_team"
            )
        ]

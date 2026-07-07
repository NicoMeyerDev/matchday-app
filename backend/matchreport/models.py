from django.db import models


class MatchReport(models.Model):
    """Speichert einen Spielbericht für ein Spiel, das mit einer
    bestimmten Aufstellung gespielt wurde."""

    club = models.ForeignKey(
        "clubs.Club", on_delete=models.CASCADE, related_name="match_reports"
    )
    lineup = models.ForeignKey("lineups.Lineup", on_delete=models.CASCADE)
    opponent = models.CharField(max_length=120, blank=True)
    result = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Match Report: {self.lineup.title} vs {self.opponent}"


class MatchEvent(models.Model):
    """Speichert ein Ereignis, das während eines Spiels aufgetreten ist."""

    match_report = models.ForeignKey(
        MatchReport, on_delete=models.CASCADE, related_name="events"
    )
    minute = models.PositiveIntegerField()
    event_type = models.CharField(max_length=50)
    for_us = models.BooleanField(default=True)
    card_type = models.CharField(
        max_length=20,
        blank=True,
        choices=[("yellow", "Gelb"), ("yellow_red", "Gelb-Rot"), ("red", "Rot")],
    )
    player = models.ForeignKey(
        "players.Player", null=True, blank=True, on_delete=models.SET_NULL
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Event: {self.event_type} at {self.minute} min"

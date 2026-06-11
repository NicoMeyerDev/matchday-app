from django.db import models

class MatchReport(models.Model):
    '''Speichert einen Spielbericht für ein Spiel, das mit einer bestimmten Aufstellung gespielt wurde.'''
    club = models.ForeignKey('clubs.Club', on_delete=models.CASCADE, related_name='match_reports')
    lineup = models.ForeignKey('lineups.Lineup', on_delete=models.CASCADE)
    opponent = models.CharField(max_length=120, blank=True)
    result = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Match Report: {self.lineup.title} vs {self.opponent}'

from django.db import models

class Training(models.Model):
    """
    Speichert ein Training das von einem Verein durchgeführt wird.
    """
    club = models.ForeignKey('clubs.Club', related_name='trainings', on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    date = models.DateField()
    time = models.TimeField()
    trainingsart= models.CharField(max_length=10, blank=True, choices=[('klassisch', 'Klassisches Training'), ('frei', 'Freies Training')])
    duration = models.DurationField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.name} ({self.date})"
    
class TrainingsBlock(models.Model):
    """
    Speichert einen Trainingsblock, der zu einem Training gehört.
    """
    training = models.ForeignKey('Training', related_name='blocks', on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    trainingstyp = models.CharField(max_length=20, choices=[('aktivierung', 'Aktivierung/Erwärmung'), ('spielform_1', 'Spielform_1'), ('zwischenblock', 'Zwischenblock'), ('spielform_2', 'Spielform_2')])
    reihenfolge = models.IntegerField(default=0)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"    

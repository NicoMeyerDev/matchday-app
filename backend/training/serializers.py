from rest_framework import serializers
from .models import Training, TrainingsBlock

class TrainingSerializer(serializers.ModelSerializer):
    """
    API-Serializer für Trainingseinheiten.

    Wird vom Frontend genutzt, um Trainingseinheiten aufzulisten, anzulegen, zu ändern und zu löschen.
    """

    class Meta:
        model = Training
        fields = '__all__'
        read_only_fields = ['created_at', 'club']

class TrainingsBlockSerializer(serializers.ModelSerializer):
    """
    API-Serializer für Trainingsblöcke.

    Wird vom Frontend genutzt, um Trainingsblöcke aufzulisten, anzulegen, zu ändern und zu löschen.
    """

    class Meta:
        model = TrainingsBlock
        fields = '__all__'
        read_only_fields = ['created_at', 'training']        
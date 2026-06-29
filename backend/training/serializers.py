from rest_framework import serializers
from .models import Training, TrainingsBlock, Category, Uebung

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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class UebungSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        write_only=True,
        source='categories',
        required=False,
    )

    class Meta:
        model = Uebung
        fields = ['id', 'name', 'description', 'duration', 'player_count', 'categories', 'category_ids', 'created_at']
        read_only_fields = ['created_at']
        

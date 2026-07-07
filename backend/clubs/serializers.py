from rest_framework import serializers
from .models import Club


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ["id", "name", "owner", "members"]
        read_only_fields = ["id", "owner"]
        extra_kwargs = {"members": {"write_only": True, "required": False}}

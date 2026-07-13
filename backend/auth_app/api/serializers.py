from rest_framework import serializers
from django.contrib.auth.models import User
from auth_app.models import Clubinvite


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration, including password confirmation
    and email validation."""

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}, "email": {"required": True}}

    def validate(self, data):
        repeated = self.initial_data.get("confirmed_password")
        if data.get("password") != repeated:
            raise serializers.ValidationError(
                {"repeated_password": "Passwords do not match"}
            )
        return data

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def save(self):
        pw = self.validated_data["password"]

        account = User(
            email=self.validated_data["email"], username=self.validated_data["username"]
        )
        account.set_password(pw)
        account.save()
        return account


class ClubinviteSerializer(serializers.ModelSerializer):
    """Serializer for the Clubinvite model, used for managing club invitations."""

    class Meta:
        model = Clubinvite
        fields = [
            "id",
            "club",
            "email",
            "token",
            "invited_at",
            "is_used",
            "used_at",
            "expires_at",
        ]
        read_only_fields = ["id", "club", "token", "invited_at", "is_used", "used_at"]

from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework import generics, mixins,status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Club
from .serializers import ClubSerializer

class Clubview(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        user = self.request.user
        return (Club.objects.filter(owner=user) | Club.objects.filter(members=user)).distinct()

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        club = serializer.save(owner=self.request.user)
        club.members.add(self.request.user)

class EmailCheckview(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get('email')

        if not email:
            return Response({"error": "Email fehlt"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Nicht gefunden"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "id": user.id,
            "email": user.email,
            "fullname": user.username
        }, status=status.HTTP_200_OK)
    
class InviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, club_id):
        email = request.data.get('email')

        if not email:
            return Response({"error": "Email fehlt"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Nicht gefunden"}, status=status.HTTP_404_NOT_FOUND)

        try:
            club = Club.objects.get(id=club_id)
        except Club.DoesNotExist:
            return Response({"error": "Club nicht gefunden"}, status=status.HTTP_404_NOT_FOUND)

        if request.user != club.owner:
            return Response({"error": "Nur der Besitzer kann Einladungen senden"}, status=status.HTTP_403_FORBIDDEN)

        club.members.add(user)
        return Response({"message": f"{user.username} wurde zum Club hinzugefügt"}, status=status.HTTP_200_OK)

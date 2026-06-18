from django.contrib.auth import authenticate, get_user_model

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.contrib.auth import get_user_model
from .serializers import RegistrationSerializer


class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        data = {}
        if serializer.is_valid():
            saved_account = serializer.save()
            data = {
                'username': saved_account.username,
                'email': saved_account.email,
                'user_id': saved_account.pk
            }
            return Response({"detail": "User created successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

       
class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Handles the login process, generates access and refresh tokens,
    and stores both as HttpOnly cookies in the response.
    """

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except:
            return Response(
                {"detail": "Ungültige Anmeldedaten."},
                status=status.HTTP_400_BAD_REQUEST
            )
        refresh = response.data.get('refresh')
        access = response.data.get('access')
        

       

        response.set_cookie(
            key='access_token',
            value=access,
            httponly=True,
            secure=True,
            samesite='None'
        )

        response.set_cookie(
            key='refresh_token',    
            value=refresh,
            httponly=True,
            secure=True,
            samesite='None'
        )

        User = get_user_model()
        user = User.objects.get(username=request.data.get('username'))
    


        response.data = {"detail": "Login successfully!", "user": {"id": user.id, "username": user.username, "email": user.email   }, "access": access }
        return response
    
    
class CookieRefreshView(TokenRefreshView):
    """
    Refreshes the access token using a refresh token stored in a cookie
    and sets the new access token as an HttpOnly cookie in the response.
    """

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token is None:
            return Response({"detail": "Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)   
        
        serializer =self.get_serializer(data={'refresh': refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except:    
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        access_token = serializer.validated_data.get('access')
        response = Response({"detail": "Token refreshed", "access": access_token})
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=True,
            samesite='None'
        )
        return response
    
class CookieDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    """
    Handles the logout process by deleting the access and refresh token cookies.
    """

    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Log-Out successfully! All Tokens will be deleted. Refresh token is now invalid"})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
        

class CurrentUserView(APIView):
    '''
    Returns the current authenticated user's information.
    '''
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
        return Response(data)        
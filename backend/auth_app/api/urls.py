from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView,TokenRefreshView
from auth_app.api.views import  RegistrationView, CookieTokenObtainPairView, CookieRefreshView, CookieDeleteView, CurrentUserView  

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', CookieTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', CookieRefreshView.as_view(), name='token_refresh'),
    path('current-user/', CurrentUserView.as_view(), name='current_user'),
    path ('logout/', CookieDeleteView.as_view(), name='logout')
]
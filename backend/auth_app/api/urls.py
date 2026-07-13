from django.urls import path
from auth_app.api.views import (
    AcceptClubInviteView,
    RegistrationView,
    CookieTokenObtainPairView,
    CookieRefreshView,
    CookieDeleteView,
    CurrentUserView,
    ClubInviteView,
    AcceptClubInviteView,
)

urlpatterns = [
    path("register/", RegistrationView.as_view(), name="register"),
    path("login/", CookieTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", CookieRefreshView.as_view(), name="token_refresh"),
    path("current-user/", CurrentUserView.as_view(), name="current_user"),
    path("logout/", CookieDeleteView.as_view(), name="logout"),
    path("club-invite/", ClubInviteView.as_view(), name="club_invite"),
    path(
        "accept-invite/<uuid:token>/",
        AcceptClubInviteView.as_view(),
        name="accept_club_invite",
    ),
]

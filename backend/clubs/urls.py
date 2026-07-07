from django.urls import path
from .views import Clubview, EmailCheckview, InviteView

urlpatterns = [
    path("", Clubview.as_view(), name="clubs"),
    path("check-email/", EmailCheckview.as_view(), name="check-email"),
    path("<int:club_id>/invite/", InviteView.as_view(), name="invite"),
]

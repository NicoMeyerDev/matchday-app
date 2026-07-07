from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Custom authentication class to retrieve JWT from cookies instead of headers."""

    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")
        print("COOKIES:", request.COOKIES)
        print("AUTH HEADER:", request.META.get("HTTP_AUTHORIZATION"))
        print("ACCESS TOKEN:", access_token)

        # Versuche zuerst Cookie, dann Header
        if not access_token:
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]

        if not access_token:
            return None
        validated_token = self.get_validated_token(access_token)
        return self.get_user(validated_token), validated_token

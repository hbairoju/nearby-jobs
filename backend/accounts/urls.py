
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),

    path(
        "password-reset/",
        views.request_password_reset,
        name="password-reset"
    ),
    path(
        "password-reset/confirm/",
        views.confirm_password_reset,
        name="password-reset-confirm"
    ),

    path("verification/", views.submit_verification, name="submit-verification"),
    path(
        "verification/status/",
        views.company_verification_status,
        name="company-verification-status"
    ),
]

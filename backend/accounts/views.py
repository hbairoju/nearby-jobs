from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
import os
import resend
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import authentication_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import AccountProfile, CompanyVerificationRequest

from .models import AccountProfile


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    full_name = data.get("name", "").strip()
    company_name = data.get("companyName", "").strip()
    email = data.get("email", "").strip().lower()
    mobile = data.get("mobile", "").strip()
    password = data.get("password", "")
    account_type = data.get("accountType", "")
    education = data.get("education", "").strip()
    website = data.get("website", "").strip()

    if not email or not mobile or not password:
        return Response(
            {"error": "Email, mobile and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if account_type not in ["jobseeker", "company"]:
        return Response(
            {"error": "Invalid account type."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(mobile) != 10 or not mobile.isdigit():
        return Response(
            {"error": "Enter a valid 10-digit mobile number."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {"error": "Password must contain at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if account_type == "jobseeker" and not full_name:
        return Response(
            {"error": "Full name is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if account_type == "company" and not company_name:
        return Response(
            {"error": "Company name is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=email).exists():
        return Response(
            {"error": "An account with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if AccountProfile.objects.filter(mobile=mobile).exists():
        return Response(
            {"error": "This mobile number is already registered."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )

            profile = AccountProfile.objects.create(
                user=user,
                account_type=account_type,
                full_name=full_name,
                company_name=company_name,
                mobile=mobile,
                education=education,
                website=website
            )

            token = Token.objects.create(user=user)

        return Response({
            "message": "Account created successfully.",
            "token": token.key,
            "account_type": profile.account_type,
            "email": user.email
        }, status=status.HTTP_201_CREATED)

    except Exception:
        return Response(
            {"error": "Unable to create account. Please try again."},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    account_type = request.data.get("accountType", "")

    user = authenticate(
        username=email,
        password=password
    )

    if not user:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        profile = user.profile
    except AccountProfile.DoesNotExist:
        return Response(
            {"error": "Account profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if profile.account_type != account_type:
        return Response(
            {"error": "Please select the correct account type."},
            status=status.HTTP_403_FORBIDDEN
        )

    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "message": "Login successful.",
        "token": token.key,
        "account_type": profile.account_type,
        "email": user.email
    })

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_verification(request):

    try:
        profile = request.user.profile
    except AccountProfile.DoesNotExist:
        return Response(
            {"error": "Account profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if profile.account_type != "company":
        return Response(
            {"error": "Only company accounts can request verification."},
            status=status.HTTP_403_FORBIDDEN
        )

    existing = CompanyVerificationRequest.objects.filter(
        user=request.user,
        status__in=["Pending", "Approved"]
    ).first()

    if existing:
        return Response(
            {"error": f"A verification request already exists: {existing.status}."},
            status=status.HTTP_400_BAD_REQUEST
        )

    company_name = request.data.get("companyName", "").strip()
    website = request.data.get("website", "").strip()
    official_email = request.data.get("email", "").strip()
    phone = request.data.get("phone", "").strip()
    address = request.data.get("address", "").strip()
    document = request.FILES.get("document")

    if not all([company_name, official_email, phone, address, document]):
        return Response(
            {"error": "Please provide all required company details and proof."},
            status=status.HTTP_400_BAD_REQUEST
        )

    allowed_types = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ]

    if document.content_type not in allowed_types:
        return Response(
            {"error": "Only PDF, JPG and PNG documents are allowed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if document.size > 5 * 1024 * 1024:
        return Response(
            {"error": "Document must be smaller than 5 MB."},
            status=status.HTTP_400_BAD_REQUEST
        )

    verification = CompanyVerificationRequest.objects.create(
        user=request.user,
        company_name=company_name,
        website=website,
        official_email=official_email,
        phone=phone,
        address=address,
        document=document
    )

    return Response(
        {
            "message": "Company verification request submitted successfully.",
            "status": verification.status
        },
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def company_verification_status(request):

    try:
        profile = request.user.profile
    except AccountProfile.DoesNotExist:
        return Response(
            {"error": "Account profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if profile.account_type != "company":
        return Response(
            {"error": "Only company accounts can access this information."},
            status=status.HTTP_403_FORBIDDEN
        )

    verification = CompanyVerificationRequest.objects.filter(
        user=request.user
    ).order_by("-submitted_at").first()

    return Response({
        "account_type": profile.account_type,
        "company_verified": profile.company_verified,
        "can_post_jobs": profile.company_verified,
        "company_name": profile.company_name,
        "status": verification.status if verification else None,
        "email": verification.official_email if verification else "",
        "website": profile.website,
        "rejection_reason": (
            verification.rejection_reason if verification else ""
        )
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response(
            {"error": "Please enter your email address."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {"error": "Please enter a valid email address."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Always return the same message to avoid revealing registered accounts.
    response_data = {
        "message": "If an account exists with this email, a password reset link will be sent."
    }

    user = User.objects.filter(email__iexact=email, is_active=True).first()

    if not user:
        return Response(response_data)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    frontend_url = os.environ.get(
        "FRONTEND_URL",
        "http://localhost:5173"
    ).rstrip("/")

    reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

    subject = "Reset your Nearby Jobs password"

    message = (
        f"Hello,\n\n"
        f"We received a request to reset your Nearby Jobs password.\n\n"
        f"Open this link to choose a new password:\n{reset_link}\n\n"
        f"This link expires after a limited time. "
        f"If you did not request this, you can ignore this email.\n\n"
        f"Nearby Jobs Team"
    )

    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    email_from = os.environ.get(
        "EMAIL_FROM",
        "Nearby Jobs <onboarding@resend.dev>"
    ).strip()

    try:
        if not api_key:
            raise ValueError("RESEND_API_KEY is not configured.")

        resend.api_key = api_key

        resend.Emails.send({
            "from": email_from,
            "to": [user.email],
            "subject": subject,
            "text": message
        })

    except Exception as error:
        print(f"Password reset email failed: {error}")

    return Response(response_data)


@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    uid = request.data.get("uid", "")
    token = request.data.get("token", "")
    new_password = request.data.get("password", "")

    if not uid or not token or not new_password:
        return Response(
            {"error": "All fields are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"error": "Invalid or expired password reset link."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not default_token_generator.check_token(user, token):
        return Response(
            {"error": "Invalid or expired password reset link."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_password(new_password, user=user)
    except ValidationError as error:
        return Response(
            {"error": error.messages},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save()

    # Invalidate existing API login tokens after password reset.
    Token.objects.filter(user=user).delete()

    return Response({
        "message": "Your password has been reset successfully. Please log in again."
    })

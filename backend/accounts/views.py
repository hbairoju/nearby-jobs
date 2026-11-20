
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

import os
import resend
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    parser_classes,
)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Job, JobApplication


# Check whether a company is verified
def get_verified_company_profile(user):
    try:
        profile = user.profile
    except Exception:
        return None

    if profile.account_type != "company" or not profile.company_verified:
        return None

    return profile


# Common job response data
def job_data(job):
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "job_type": job.job_type,
        "salary": job.salary,
        "description": job.description,
        "requirements": job.requirements,
        "status": job.status,
        "is_verified": job.is_verified,
        "application_url": job.application_url,
    }


# --------------------------------------------------
# PUBLIC JOB API
# --------------------------------------------------

@api_view(["GET"])
def job_list(request):
    jobs = Job.objects.filter(
        is_active=True,
        status="Approved"
    ).order_by("-created_at")

    return Response([job_data(job) for job in jobs])


# --------------------------------------------------
# COMPANY JOB MANAGEMENT API
# --------------------------------------------------

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def company_job_list_create(request):

    profile = get_verified_company_profile(request.user)

    if not profile:
        return Response(
            {"error": "Only verified companies can manage job posts."},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == "GET":
        jobs = Job.objects.filter(
            owner=request.user
        ).order_by("-created_at")

        return Response([job_data(job) for job in jobs])

    data = request.data

    required_fields = ["title", "location", "job_type", "description"]

    for field in required_fields:
        if not data.get(field):
            return Response(
                {"error": f"{field} is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

    valid_job_types = [choice[0] for choice in Job.JOB_TYPES]

    if data.get("job_type") not in valid_job_types:
        return Response(
            {"error": "Invalid job type."},
            status=status.HTTP_400_BAD_REQUEST
        )

    job = Job.objects.create(
        owner=request.user,
        title=data.get("title"),
        company=profile.company_name or "Company",
        location=data.get("location"),
        job_type=data.get("job_type"),
        salary=data.get("salary", ""),
        description=data.get("description"),
        requirements=data.get("requirements", ""),
        application_url=data.get("application_url", ""),
        status="Draft",
        is_active=True,
        is_verified=False,
    )

    return Response(
        {
            "message": "Job draft created successfully.",
            "job": job_data(job)
        },
        status=status.HTTP_201_CREATED
    )


@api_view(["PATCH", "PUT", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def company_job_detail(request, job_id):

    profile = get_verified_company_profile(request.user)

    if not profile:
        return Response(
            {"error": "Only verified companies can manage job posts."},
            status=status.HTTP_403_FORBIDDEN
        )

    job = get_object_or_404(
        Job,
        id=job_id,
        owner=request.user
    )

    if job.status not in ["Draft", "Rejected"]:
        return Response(
            {"error": "Only draft or rejected jobs can be edited or deleted."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if request.method == "DELETE":
        job.delete()
        return Response(
            {"message": "Job deleted successfully."},
            status=status.HTTP_200_OK
        )

    data = request.data

    editable_fields = [
        "title",
        "location",
        "job_type",
        "salary",
        "description",
        "requirements",
        "application_url",
    ]

    for field in editable_fields:
        if field in data:
            setattr(job, field, data[field])

    if job.job_type not in [choice[0] for choice in Job.JOB_TYPES]:
        return Response(
            {"error": "Invalid job type."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not job.title or not job.location or not job.description:
        return Response(
            {"error": "Title, location and description are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    job.status = "Draft"
    job.save()

    return Response(
        {
            "message": "Job updated successfully.",
            "job": job_data(job)
        }
    )


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def company_job_submit(request, job_id):

    profile = get_verified_company_profile(request.user)

    if not profile:
        return Response(
            {"error": "Only verified companies can submit jobs."},
            status=status.HTTP_403_FORBIDDEN
        )

    job = get_object_or_404(
        Job,
        id=job_id,
        owner=request.user
    )

    if job.status not in ["Draft", "Rejected"]:
        return Response(
            {"error": "This job cannot be submitted in its current status."},
            status=status.HTTP_400_BAD_REQUEST
        )

    job.status = "Pending Admin Approval"
    job.is_active = True
    job.save()

    return Response(
        {
            "message": "Job submitted for admin approval.",
            "job": job_data(job)
        }
    )


# --------------------------------------------------
# JOB SEEKER: SUBMIT APPLICATION
# --------------------------------------------------

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def submit_job_application(request, job_id):

    try:
        profile = request.user.profile
    except Exception:
        return Response(
            {"error": "Account profile not found."},
            status=status.HTTP_403_FORBIDDEN
        )

    if profile.account_type != "jobseeker":
        return Response(
            {"error": "Only job seekers can apply for jobs."},
            status=status.HTTP_403_FORBIDDEN
        )

    job = get_object_or_404(
        Job,
        id=job_id,
        status="Approved",
        is_active=True
    )

    if JobApplication.objects.filter(
        job=job,
        applicant=request.user
    ).exists():
        return Response(
            {"error": "You have already applied for this job."},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = request.data

    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip()
    mobile = str(data.get("mobile", "")).strip()
    education = str(data.get("education", "")).strip()
    cover_message = str(data.get("cover_message", "")).strip()
    resume = request.FILES.get("resume")

    if not all([full_name, email, mobile, education, resume]):
        return Response(
            {"error": "All required fields and a resume are needed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(full_name) > 150 or len(education) > 200:
        return Response(
            {"error": "Name or education field is too long."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {"error": "Enter a valid email address."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not (mobile.isdigit() and len(mobile) == 10):
        return Response(
            {"error": "Enter a valid 10-digit mobile number."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not resume.name.lower().endswith(".pdf"):
        return Response(
            {"error": "Only PDF resumes are accepted."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if resume.size > 5 * 1024 * 1024:
        return Response(
            {"error": "Resume must be 5 MB or smaller."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if resume.size < 5 or resume.read(5) != b"%PDF-":
        return Response(
            {"error": "The uploaded file is not a valid PDF."},
            status=status.HTTP_400_BAD_REQUEST
        )

    resume.seek(0)

    application = JobApplication.objects.create(
        job=job,
        applicant=request.user,
        full_name=full_name,
        email=email,
        mobile=mobile,
        education=education,
        cover_message=cover_message,
        resume=resume,
    )

    return Response(
        {
            "message": "Application submitted successfully.",
            "application_id": application.id,
            "job_title": job.title,
            "status": application.status,
        },
        status=status.HTTP_201_CREATED
    )


# --------------------------------------------------
# COMPANY: VIEW APPLICATIONS
# --------------------------------------------------

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def company_application_list(request):

    profile = get_verified_company_profile(request.user)

    if not profile:
        return Response(
            {"error": "Only verified companies can view applications."},
            status=status.HTTP_403_FORBIDDEN
        )

    applications = JobApplication.objects.filter(
        job__owner=request.user
    ).select_related(
        "job",
        "applicant"
    ).order_by("-applied_at")

    results = []

    for application in applications:
        results.append({
            "id": application.id,
            "job_id": application.job.id,
            "job_title": application.job.title,
            "applicant_name": application.full_name,
            "email": application.email,
            "mobile": application.mobile,
            "education": application.education,
            "cover_message": application.cover_message,
            "resume_name": application.resume.name.split("/")[-1],
            "status": application.status,
            "applied_at": application.applied_at,
        })

    return Response(results)


# --------------------------------------------------
# COMPANY: SHORTLIST OR REJECT APPLICATION
# --------------------------------------------------

@api_view(["PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def company_application_update(request, application_id):

    profile = get_verified_company_profile(request.user)

    if not profile:
        return Response(
            {"error": "Only verified companies can update applications."},
            status=status.HTTP_403_FORBIDDEN
        )

    application = get_object_or_404(
        JobApplication,
        id=application_id,
        job__owner=request.user
    )

    new_status = request.data.get("status")

    if new_status not in ["Shortlisted", "Rejected"]:
        return Response(
            {"error": "Status must be Shortlisted or Rejected."},
            status=status.HTTP_400_BAD_REQUEST
        )

    application.status = new_status
    application.save(update_fields=["status", "updated_at"])

    subject = f"Update on your application for {application.job.title}"

    if new_status == "Shortlisted":
        message = (
            f"Hello {application.full_name},\\n\\n"
            f"Congratulations! Your application for "
            f"{application.job.title} at {application.job.company} "
            f"has been shortlisted.\\n\\n"
            "The company may contact you with further details.\\n\\n"
            "Regards,\\nNearby Jobs Team"
        )
    else:
        message = (
            f"Hello {application.full_name},\\n\\n"
            f"Your application for {application.job.title} "
            f"at {application.job.company} has been marked as rejected.\\n\\n"
            "Thank you for your interest and best wishes for your job search.\\n\\n"
            "Regards,\\nNearby Jobs Team"
        )

    # Send the email through Resend when an API key is configured.
    # Without a key, use Django's configured local email backend.
    resend_api_key = os.environ.get("RESEND_API_KEY", "").strip()
    email_from = os.environ.get(
        "EMAIL_FROM",
        "Nearby Jobs <onboarding@resend.dev>"
    ).strip()

    try:
        if resend_api_key:
            resend.api_key = resend_api_key
            resend.Emails.send({
                "from": email_from,
                "to": [application.email],
                "subject": subject,
                "text": message,
            })
        else:
            send_mail(
                subject,
                message,
                None,
                [application.email],
                fail_silently=False
            )
    except Exception as exc:
        # Do not undo the applicant status update if email delivery fails.
        print(f"Email notification failed for application {application.id}: {exc}")

    return Response({
        "message": "Application status updated successfully.",
        "application_id": application.id,
        "status": application.status,
    })


# --------------------------------------------------
# JOB SEEKER: VIEW MY APPLICATIONS
# --------------------------------------------------

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_applications(request):

    try:
        profile = request.user.profile
    except Exception:
        return Response(
            {"error": "Account profile not found."},
            status=status.HTTP_403_FORBIDDEN
        )

    if profile.account_type != "jobseeker":
        return Response(
            {"error": "Only job seekers can view their applications."},
            status=status.HTTP_403_FORBIDDEN
        )

    applications = JobApplication.objects.filter(
        applicant=request.user
    ).select_related(
        "job"
    ).order_by("-applied_at")

    results = []

    for application in applications:
        results.append({
            "id": application.id,
            "job_id": application.job.id,
            "job_title": application.job.title,
            "company": application.job.company,
            "location": application.job.location,
            "job_type": application.job.job_type,
            "status": application.status,
            "applied_at": application.applied_at,
            "updated_at": application.updated_at,
        })

    return Response(results)

# --------------------------------------------------
# SECURE RESUME DOWNLOAD
# --------------------------------------------------

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def download_application_resume(request, application_id):

    application = get_object_or_404(
        JobApplication,
        id=application_id
    )

    # Allow the applicant to download their own resume
    is_applicant = application.applicant_id == request.user.id

    # Allow only the verified company owning the job
    profile = get_verified_company_profile(request.user)

    is_company_owner = (
        profile is not None
        and application.job.owner_id == request.user.id
    )

    if not (is_applicant or is_company_owner):
        return Response(
            {"error": "You are not authorized to download this resume."},
            status=status.HTTP_403_FORBIDDEN
        )

    if not application.resume:
        return Response(
            {"error": "Resume file not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        filename = os.path.basename(application.resume.name)

        return FileResponse(
            application.resume.open("rb"),
            as_attachment=True,
            filename=filename,
            content_type="application/pdf"
        )

    except (FileNotFoundError, OSError, ValueError):
        return Response(
            {"error": "Unable to access the resume file."},
            status=status.HTTP_404_NOT_FOUND
        )

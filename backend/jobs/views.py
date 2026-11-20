
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Job


def get_verified_company_profile(user):
    try:
        profile = user.profile
    except Exception:
        return None

    if profile.account_type != "company" or not profile.company_verified:
        return None

    return profile


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


# Public API: Display only approved jobs
@api_view(["GET"])
def job_list(request):
    jobs = Job.objects.filter(
        is_active=True,
        status="Approved"
    ).order_by("-created_at")

    return Response([job_data(job) for job in jobs])


# Company API: List jobs and create a new draft
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


# Company API: Edit or delete its own draft/rejected jobs
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


# Company API: Submit a draft/rejected job for admin approval
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

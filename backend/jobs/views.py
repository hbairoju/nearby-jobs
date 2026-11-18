
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Job


@api_view(["GET"])
def job_list(request):

    # Display only active jobs approved by the admin
    jobs = Job.objects.filter(
        is_active=True,
        status="Approved"
    ).order_by("-created_at")

    data = []

    for job in jobs:
        data.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "job_type": job.job_type,
            "salary": job.salary,
            "description": job.description,
            "requirements": job.requirements,
            "is_verified": job.is_verified,
            "application_url": job.application_url,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
        })

    return Response(data)

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Job


@api_view(['GET'])
def job_list(request):
    jobs = Job.objects.filter(is_active=True)

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
            "created_at": job.created_at,
        })

    return Response(data)
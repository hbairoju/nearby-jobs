
from django.db import models


class Job(models.Model):

    JOB_TYPES = [
        ("Full-time", "Full-time"),
        ("Part-time", "Part-time"),
        ("Internship", "Internship"),
        ("Work from Home", "Work from Home"),
        ("Freelancing", "Freelancing"),
    ]

    JOB_STATUS = [
        ("Draft", "Draft"),
        ("Pending Admin Approval", "Pending Admin Approval"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=100)

    job_type = models.CharField(
        max_length=100,
        choices=JOB_TYPES
    )

    salary = models.CharField(max_length=100, blank=True)

    description = models.TextField()
    requirements = models.TextField(blank=True)

    status = models.CharField(
        max_length=50,
        choices=JOB_STATUS,
        default="Draft"
    )

    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    application_url = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

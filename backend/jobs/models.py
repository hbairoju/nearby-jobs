
from django.db import models
from django.contrib.auth.models import User


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

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="company_jobs",
        null=True,
        blank=True
    )

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

class JobApplication(models.Model):

    APPLICATION_STATUS = [
        ("Pending", "Pending"),
        ("Shortlisted", "Shortlisted"),
        ("Rejected", "Rejected"),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_applications"
    )

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    mobile = models.CharField(max_length=10)
    education = models.CharField(max_length=200)

    cover_message = models.TextField(blank=True)

    resume = models.FileField(
        upload_to="resumes/"
    )

    status = models.CharField(
        max_length=20,
        choices=APPLICATION_STATUS,
        default="Pending"
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["job", "applicant"],
                name="unique_job_application_per_user"
            )
        ]

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"

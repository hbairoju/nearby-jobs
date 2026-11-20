
from django.db import models
from django.contrib.auth.models import User


class AccountProfile(models.Model):

    ACCOUNT_TYPES = [
        ("jobseeker", "Job Seeker"),
        ("company", "Company"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPES
    )

    full_name = models.CharField(max_length=150, blank=True)

    company_name = models.CharField(max_length=200, blank=True)

    mobile = models.CharField(max_length=10, unique=True)

    education = models.CharField(max_length=200, blank=True)

    website = models.URLField(blank=True)

    company_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.account_type}"
    
class CompanyVerificationRequest(models.Model):

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="verification_requests"
    )

    company_name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    official_email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()

    document = models.FileField(
        upload_to="company_proofs/"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.company_name} - {self.status}"


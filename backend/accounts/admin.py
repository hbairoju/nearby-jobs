
from django.contrib import admin
from django.utils import timezone
from .models import AccountProfile, CompanyVerificationRequest


@admin.register(AccountProfile)
class AccountProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "account_type",
        "company_name",
        "company_verified",
        "created_at",
    )
    list_filter = ("account_type", "company_verified")
    search_fields = ("user__email", "company_name", "mobile")


@admin.register(CompanyVerificationRequest)
class CompanyVerificationRequestAdmin(admin.ModelAdmin):
    list_display = (
        "company_name",
        "official_email",
        "phone",
        "status",
        "submitted_at",
    )
    list_filter = ("status", "submitted_at")
    search_fields = ("company_name", "official_email")
    readonly_fields = ("submitted_at", "reviewed_at")

    def save_model(self, request, obj, form, change):
        if obj.status in ("Approved", "Rejected"):
            obj.reviewed_at = timezone.now()

        super().save_model(request, obj, form, change)

        profile = obj.user.profile
        profile.company_name = obj.company_name
        profile.website = obj.website
        profile.company_verified = (obj.status == "Approved")
        profile.save(
            update_fields=[
                "company_name",
                "website",
                "company_verified",
            ]
        )

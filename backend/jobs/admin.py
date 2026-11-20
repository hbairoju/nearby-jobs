
from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "company",
        "location",
        "job_type",
        "status",
        "is_verified",
        "is_active",
        "created_at",
    )

    list_filter = (
        "job_type",
        "status",
        "is_verified",
        "is_active",
    )

    search_fields = (
        "title",
        "company",
        "location",
    )

    list_editable = (
        "status",
        "is_active",
    )

    ordering = ("-created_at",)

    def save_model(self, request, obj, form, change):
        if obj.status == "Approved":
            obj.is_verified = True
            obj.is_active = True
        else:
            obj.is_verified = False

        super().save_model(request, obj, form, change)

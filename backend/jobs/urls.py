
from django.urls import path
from . import views

urlpatterns = [
    # Public jobs
    path("jobs/", views.job_list, name="job-list"),

    # Company job management
    path(
        "company/jobs/",
        views.company_job_list_create,
        name="company-job-list-create"
    ),

    path(
        "company/jobs/<int:job_id>/",
        views.company_job_detail,
        name="company-job-detail"
    ),

    path(
        "company/jobs/<int:job_id>/submit/",
        views.company_job_submit,
        name="company-job-submit"
    ),
]

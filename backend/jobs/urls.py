
from django.urls import path
from . import views

urlpatterns = [
    # Secure applicant resume download
path(
    "applications/<int:application_id>/resume/",
    views.download_application_resume,
    name="download-application-resume"
),
    # Public jobs
    path(
        "jobs/",
        views.job_list,
        name="job-list"
    ),

    # Job seeker application submission
    path(
        "jobs/<int:job_id>/apply/",
        views.submit_job_application,
        name="submit-job-application"
    ),
    path(
    "my-applications/",
    views.my_applications,
    name="my-applications"
    ),

    # Company applications
    path(
        "company/applications/",
        views.company_application_list,
        name="company-application-list"
    ),

    # Shortlist or reject applications
    path(
        "company/applications/<int:application_id>/",
        views.company_application_update,
        name="company-application-update"
    ),

    # Company job management
    path(
        "company/jobs/",
        views.company_job_list_create,
        name="company-job-list-create"
    ),

    # Edit or delete company jobs
    path(
        "company/jobs/<int:job_id>/",
        views.company_job_detail,
        name="company-job-detail"
    ),

    # Submit jobs for admin approval
    path(
        "company/jobs/<int:job_id>/submit/",
        views.company_job_submit,
        name="company-job-submit"
    ),
]


from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('jobs.urls')),
]

from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.job_list, name='job-list'),
]
'EOF'
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('jobs.urls')),
]
'EOF'
from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.job_list, name='job-list'),
]
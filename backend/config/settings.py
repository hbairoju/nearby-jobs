
"""
Django settings for Nearby Jobs project.
"""

import os
import dj_database_url

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


# Security settings
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "dev-only-key-change-before-production"
)

DEBUG = os.environ.get("DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "nearby-jobs-8gqs.vercel.app",
]

render_hostname = os.environ.get("RENDER_EXTERNAL_HOSTNAME")

if render_hostname:
    ALLOWED_HOSTS.append(render_hostname)


# Applications
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "jobs",
    "accounts",
]


# Middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database: SQLite locally, PostgreSQL on Render
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=bool(os.environ.get("DATABASE_URL")),
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# Static files
STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}



# Email configuration
# Resend API is used directly in jobs/views.py.
# Console backend is retained for local development fallback.

MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.console.EmailBackend",
    },
}

DEFAULT_FROM_EMAIL = "Nearby Jobs <noreply@nearbyjobs.com>"

# React frontend connection
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nearby-jobs-8gqs.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "https://nearby-jobs-8gqs.vercel.app",
]

if render_hostname:
    CSRF_TRUSTED_ORIGINS.append(f"https://{render_hostname}")

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# Default primary key
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

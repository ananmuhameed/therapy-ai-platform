# from django.contrib import admin
# from .models import Patient


# @admin.register(Patient)
# class PatientAdmin(admin.ModelAdmin):
#     list_display = ("id", "full_name", "therapist", "gender", "contact_phone", "contact_email", "created_at")
#     list_filter = ("gender", "created_at")
#     search_fields = ("full_name", "contact_phone", "contact_email", "therapist__email", "therapist__full_name")
#     autocomplete_fields = ("therapist",)
#     readonly_fields = ("created_at", "updated_at")

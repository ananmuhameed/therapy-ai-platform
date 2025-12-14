# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.contrib.auth import get_user_model
# from .models import TherapistProfile

# User = get_user_model()

# # Ensure idempotent registration
# try:
#     admin.site.unregister(User)
# except admin.sites.NotRegistered:
#     pass


# @admin.register(User)
# class CustomUserAdmin(BaseUserAdmin):
#     ordering = ["email"]
#     list_display = ("email", "is_staff", "is_superuser", "is_therapist")
#     fieldsets = (
#         (None, {"fields": ("email", "password")}),
#         ("Personal Info", {"fields": ("first_name", "last_name")}),
#         ("Flags", {"fields": ("is_therapist",)}),
#         ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
#         ("Important dates", {"fields": ("last_login",)}),
#     )
#     add_fieldsets = (
#         (None, {
#             "classes": ("wide",),
#             "fields": ("email", "password1", "password2", "is_staff", "is_superuser"),
#         }),
#     )

# @admin.register(TherapistProfile)
# class TherapistProfileAdmin(admin.ModelAdmin):
#     list_display = ("user_email", "specialization", "license_number", "clinic_name", "country", "city")
#     search_fields = ("user__email", "specialization", "license_number", "clinic_name")

#     def user_email(self, obj):
#         return obj.user.email
#     user_email.short_description = "Email"

# @admin.register(Patient)
# class PatientAdmin(admin.ModelAdmin):
#     list_display = ("full_name", "therapist_email", "date_of_birth", "contact_email")
#     search_fields = ("full_name", "therapist__user__email", "contact_email")

#     def therapist_email(self, obj):
#         return obj.therapist.user.email
#     therapist_email.short_description = "Therapist Email"
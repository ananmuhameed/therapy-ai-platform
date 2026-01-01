import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import api from "../../api/axiosInstance";
import { getUser, logout } from "../../auth/storage";
import { useAppFormik } from "../../Forms/useAppFormik";
import {
  therapistProfileSchema,
  toTherapistProfilePayload,
  mapTherapistProfileFieldErrors,
} from "../../Forms/schemas";

// Sub-components
import ProfileHeader from "./ProfileHeader";
import CredentialsCard from "./CredentialsCard";
import ExperienceCard from "./ExperienceCard";
import LocationCard from "./LocationCard";

export default function TherapistProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const user = getUser();

  const { formik, apiError } = useAppFormik({
    initialValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      specialization: "",
      licenseNumber: "",
      clinicName: "",
      city: "",
      country: "",
      yearsExperience: "",
    },
    validationSchema: therapistProfileSchema,
    mapFieldErrors: mapTherapistProfileFieldErrors,
    onSubmit: async (values) => {
      await api.patch("/therapist/profile/", toTherapistProfilePayload(values));
      setIsEditing(false);
    },
  });

  const isFormValid = formik.isValid;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get("/therapist/profile/");
        formik.setValues((prev) => ({
          ...prev,
          specialization: data.specialization || "",
          licenseNumber: data.license_number || "",
          clinicName: data.clinic_name || "",
          city: data.city || "",
          country: data.country || "",
          yearsExperience: data.years_experience || "",
        }));
        if (!data.specialization) setIsEditing(true);
      } catch (error) {
        console.error("Error loading profile:", error);
        setIsEditing(true); // likely 404
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This cannot be undone."
      )
    ) {
      try {
        await api.delete("/therapist/profile/");
        await logout();
        navigate("/login");
      } catch (error) {
        alert("Error deleting profile");
      }
    }
  };

  const handleEditToggle = async (e) => {
    if (e) e.preventDefault();
    if (isEditing) {
      if (!checkFormValidity()) {
        alert("Please fill in all fields before saving.");
        return;
      }
      await formik.submitForm();
    } else {
      setIsEditing(true);
    }
  };

  // Helper for input styles inside components
  const getInputClass = (isError) => {
    const base = "w-full transition-all duration-200 rounded px-2 py-1 ";
    if (!isEditing)
      return (
        base +
        "bg-transparent border-transparent cursor-default pointer-events-none"
      );
    return (
      base +
      `bg-white border ${
        isError
          ? "border-red-400 bg-red-50"
          : "border-gray-300 focus:border-blue-500 outline-none"
      }`
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-800 pb-32">
      <ProfileHeader
        user={formik.values}
        isEditing={isEditing}
        onLogout={async () => {
          await logout();
          navigate("/login");
        }}
        onToggleEdit={handleEditToggle}
        onDelete={handleDelete}
      />

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
          {apiError}
        </div>
      )}

      {isEditing && !isFormValid && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
          <ShieldCheck size={20} />
          <span>
            Please fill in <strong>all fields</strong> to continue.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CredentialsCard
            data={formik.values}
            isEditing={isEditing}
            errors={formik.errors}
            onChange={formik.handleChange}
            getInputClass={getInputClass}
          />
        </div>

        <div className="space-y-6">
          <ExperienceCard
            years={formik.values.yearsExperience}
            isEditing={isEditing}
            onChange={formik.handleChange}
          />
          <LocationCard
            data={formik.values}
            isEditing={isEditing}
            errors={formik.errors}
            onChange={formik.handleChange}
            getInputClass={getInputClass}
          />
        </div>
      </div>

      <div className="flex items-center mt-6 w-fit">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          disabled={!isFormValid}
          className={`
            w-full flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-normal text-lg transition-all
            ${
              isFormValid
                ? "bg-[#3078E2] text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70"
            }
          `}
        >
          <span>Go to Dashboard</span>
          {isFormValid && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}

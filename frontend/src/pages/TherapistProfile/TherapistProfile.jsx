import { useState, useEffect, useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import api from "../../api/axiosInstance";
import { getUser, logout, setUser } from "../../auth/storage";
import { useNavigate } from "react-router-dom";
import { useAppFormik } from "../../Forms/useAppFormik";

import {
  therapistProfileSchema,
  toTherapistProfilePayload,
  mapTherapistProfileFieldErrors,
} from "../../Forms/schemas";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Sub-components
import ProfileHeader from "./ProfileHeader";
import CredentialsCard from "./CredentialsCard";
import ExperienceCard from "./ExperienceCard";
import LocationCard from "./LocationCard";

export default function TherapistProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Snapshot of last saved/loaded values for Cancel
  const [savedValues, setSavedValues] = useState(null);

  const user = getUser();

  const initialValues = useMemo(
    () => ({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      specialization: "",
      licenseNumber: "",
      clinicName: "",
      city: "",
      country: "",
      yearsExperience: "",
    }),
    [user?.first_name, user?.last_name, user?.email]
  );

  const { formik, apiError } = useAppFormik({
    initialValues,
    validationSchema: therapistProfileSchema,
    mapFieldErrors: mapTherapistProfileFieldErrors,
    onSubmit: async (values) => {
      await api.patch("/therapist/profile/", toTherapistProfilePayload(values));
    },
  });

  const isFormValid = formik.isValid;

  // Load profile
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get("/therapist/profile/");

        const nextValues = {
          ...formik.values,
          specialization: data.specialization || "",
          licenseNumber: data.license_number || "",
          clinicName: data.clinic_name || "",
          city: data.city || "",
          country: data.country || "",
          yearsExperience: data.years_experience || "",
        };
        formik.setValues(nextValues);
        setSavedValues(nextValues);

       if (data.is_completed === true) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }

    } catch (error) {
      console.error("Error loading profile:", error);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllTouched = () => {
    formik.setTouched(
      Object.keys(formik.values).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
      true
    );
  };

  const handleSave = async () => {
    if (isSaving) return false;

    setIsSaving(true);
    try {
      markAllTouched();
      await formik.submitForm();

      if (Object.keys(formik.errors || {}).length > 0) {
        toast.error("Please fix the highlighted fields before saving.");
        return false;
      }

      if (apiError) return false;

      const { data: me } = await api.get("/auth/me/");
      setUser(me);

      setSavedValues(formik.values);
      setIsEditing(false);
      toast.success("Profile saved successfully");
      return true;
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancel = async () => {
    if (!formik.dirty) {
      setIsEditing(false);
      return;
    }

    const res = await Swal.fire({
      title: "Discard changes?",
      text: "Your unsaved changes will be lost.",
      icon: "warning",
      iconColor: "#2563eb",
      width: "420px",
      padding: "1.5rem",
      showCancelButton: true,
      confirmButtonColor: "#64748b",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Discard",
      cancelButtonText: "Keep editing",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (!res.isConfirmed) return;

    if (savedValues) formik.resetForm({ values: savedValues });
    else formik.resetForm();

    setIsEditing(false);
    toast.info("Changes discarded");
  };

  // Dashboard on left in header, but still autosave if dirty
  const handleGoToDashboard = async () => {
    if (!isEditing) {
      navigate("/dashboard");
      return;
    }

    if (!formik.dirty) {
      navigate("/dashboard");
      return;
    }

    const ok = await handleSave();
    if (ok) navigate("/dashboard");
  };

  // Delete account now moved to bottom-left button (red background)
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      text: "This action is permanent and cannot be undone.",
      icon: "warning",
      iconColor: "#dc2626",
      width: "420px",
      padding: "1.5rem",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-2xl",
        cancelButton: "rounded-2xl",
      },
    });

    if (result.isConfirmed) {
      try {
        await api.delete("/therapist/profile/");
        toast.success("Account deleted successfully", { autoClose: 1500 });

        // keep behavior: logout after delete
        setTimeout(async () => {
          await logout();
          navigate("/login");
        }, 1500);
      } catch (error) {
        console.error(error);
        toast.error("Error deleting account");
      }
    }
  };

  const getInputClass = (isError) => {
    const base = "w-full transition-all duration-200 rounded px-2 py-1 ";
    if (!isEditing)
      return base + "bg-transparent border-transparent cursor-default pointer-events-none";
    return (
      base +
      `bg-white border ${
        isError
          ? "border-red-400 bg-red-50"
          : "border-gray-300 focus:border-blue-500 outline-none"
      }`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-800 pb-32">
      <ProfileHeader
        user={formik.values}
        isEditing={isEditing}
        isSaving={isSaving}
        onGoDashboard={handleGoToDashboard}
        onStartEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
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

      {/* Bottom-left Delete Account button (red background) */}
      <div className="mt-10 flex justify-start">
        <button
          type="button"
          onClick={handleDelete}
          className="
            inline-flex items-center gap-2 px-5 py-3 rounded-2xl
            bg-red-600 text-white hover:bg-red-700 transition-all
            shadow-md hover:shadow-lg
          "
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePatients } from "../../queries/patients"; // React Query hook

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { data: patients, isLoading, isError, error, refetch } = usePatients();

  // --- Alert Logic ---
  const showProfileAlert = () => {
    Swal.fire({
      icon: "warning",
      iconColor: "#3078E2",
      title: "Profile incomplete",
      text: "Please complete your profile first.",
      showCancelButton: true,
      confirmButtonText: "Go to profile",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3078E2",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-2xl",
        cancelButton: "rounded-2xl",
      },
    }).then((res) => {
      if (res.isConfirmed) {
        navigate("/therapistprofile");
      }
    });
  };

  // --- React Query Handling ---
  useEffect(() => {
    if (isError) {
      console.error("Error fetching patients: ", error);
    }
  }, [isError, error]);

  // Check if the profile is incomplete
  useEffect(() => {
    // Replace this condition with your actual logic for checking if the profile is incomplete
    const profileIncomplete = false; // Example condition
    if (profileIncomplete) {
      showProfileAlert();
    }
  }, []); // This effect runs only once on mount

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || "Something went wrong!"}</div>;
  }

  return (
    <div>
      <h1>Patient Dashboard</h1>
      <div>
        {patients && patients.length > 0 ? (
          <ul>
            {patients.map((patient) => (
              <li key={patient.id}>{patient.full_name}</li>
            ))}
          </ul>
        ) : (
          <p>No patients found.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
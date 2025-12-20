import React from "react";
import PatientsList from "../components/PatientsList"; 

const PatientsListPage = () => {
  return (
    <div className="w-full flex justify-center px-10 py-14">
      <PatientsList
        onAddPatient={() => console.log("add patient")}
        onViewProfile={(p) => console.log("view profile", p)}
      />
    </div>
  );
};

export default PatientsListPage;

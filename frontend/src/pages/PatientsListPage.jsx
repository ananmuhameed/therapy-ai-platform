import React from "react";
import PatientsList from "../components/PatientsList";
import { BsClipboard2HeartFill } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";

const PatientsListPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/*  Nav */}
      <div className="w-full flex items-center justify-between px-10 py-8">
        
        {/* logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#eaeaea] flex items-center justify-center">
            <BsClipboard2HeartFill className="text-[#3078E2] text-xl" />
          </div>
        </div>

        {/* nav */}
        <div className="flex items-center gap-8 text-[#7d7d7d] font-medium">
          <span className="cursor-pointer hover:text-[#3078E2]">Dashboard</span>
          <span className="cursor-pointer text-[#3078E2]">Patients</span>
          <span className="cursor-pointer hover:text-[#3078E2]">Reports</span>
        </div>

        {/* profile */}
        <button
          className="px-6 py-3 rounded-full text-white font-medium flex items-center gap-3 shadow-sm"
          style={{ background: "linear-gradient(90deg, #3078E2, #8AAEE0)" }}
        >
          <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
            <CgProfile className="text-white text-lg" />
          </span>
          Profile
        </button>
      </div>

      {/* Content */}
      <div className="w-full flex justify-center px-10 pb-14">
        <PatientsList
          onAddPatient={() => console.log("add patient")}
          onViewProfile={(p) => console.log("view profile", p)}
        />
      </div>
    </div>
  );
};

export default PatientsListPage;

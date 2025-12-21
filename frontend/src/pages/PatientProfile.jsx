
/* DONT DELETE ANY COMMENTED LINES FOR NOW PLEASE ANAN, BUT YOU CAN REPLACE WITH THE ACTUAL THINGS */

import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiEye,
} from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

export default function PatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  /*STATE*/
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    contact_phone: "",
    contact_email: "",
    notes: "",
  });

  const [sessions, setSessions] = useState([]);

  /* =========================
     HELPERS
  ========================== */
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  /* =========================
     FETCH DATA 
  ========================== */

  useEffect(() => {
    // TODO: FETCH PATIENT
    // axios.get(`/api/patients/${patientId}/`)
    //   .then(res => setPatient(res.data));

    // TODO: FETCH SESSIONS HISTORY
    // axios.get(`/api/sessions/?patient_id=${patientId}`)
    //   .then(res => setSessions(res.data));

    // PLACEHOLDER (safe)
    setSessions([]);
  }, [patientId]);

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: PATCH /api/patients/:id/
    // axios.patch(`/api/patients/${patientId}/`, patient);

    setIsEditing(false);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient profile?"
    );
    if (!confirmed) return;

    // TODO: DELETE /api/patients/:id/
    // axios.delete(`/api/patients/${patientId}/`)
    //   .then(() => navigate("/patients"));

    navigate("/patients");
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-[#3078E2] font-medium"
        >
          <FiArrowLeft size={24} />
          
        </button>

        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-[#3078E2] text-white w-30 justify-center"
              >
                <FiEdit />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2  bg-[#E23030] text-white rounded-3xl w-30 justify-center"
              >
                <FiTrash2 />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-3xl w-30 justify-center"
              >
                <FiCheck />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-3xl w-30 justify-center"
              >
                <FiX />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-3">
          <IoPersonOutline size={26} className="text-[#3078E2]" />

          {isEditing ? (
            <input
              name="full_name"
              value={patient.full_name}
              onChange={handleChange}
              placeholder="Patient name"
              className="border rounded px-3 py-1 w-full max-w-sm"
            />
          ) : (
            <h1 className="text-2xl font-semibold">
              {patient.full_name || "PATIENT NAME"}
            </h1>
          )}
        </div>

        {isEditing ? (
          <div className="flex gap-3 mt-2 items-center">
            <input
              name="gender"
              value={patient.gender}
              onChange={handleChange}
              placeholder="Gender"
              className="border rounded px-3 py-1 w-28"
            />
            <input
              type="date"
              name="date_of_birth"
              value={patient.date_of_birth}
              onChange={handleChange}
              className="border rounded px-3 py-1"
            />
          </div>
        ) : (
          <p className="text-sm text-[#727473] mt-1">
            {patient.gender || "Gender"} ·{" "}
            {calculateAge(patient.date_of_birth) || "Age"}
          </p>
        )}
      </div>

<div className="bg-white rounded-xl shadow p-6 mb-6">
  <h2 className="font-semibold mb-4">Contact Info</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5 place-self-center">
    <div className="flex items-center gap-2 border border-white shadow rounded-2xl p-2 w-65 ">
      <FiPhone className="text-[#3078E2]" />
      {isEditing ? (
        <input
          name="contact_phone"
          value={patient.contact_phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full outline-none text-sm"
        />
      ) : (
        <span className="text-sm text-[#727473]">
          {patient.contact_phone || "No phone"}
        </span>
      )}
    </div>

    <div className="flex items-center gap-2 border border-white shadow rounded-2xl p-2 w-65">
      <FiMail className="text-[#3078E2]" />
      {isEditing ? (
        <input
          name="contact_email"
          value={patient.contact_email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full outline-none text-sm"
        />
      ) : (
        <span className="text-sm text-[#727473]">
          {patient.contact_email || "No email"}
        </span>
      )}
    </div>
  </div>
</div>


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Sessions</h2>

          <div className="grid grid-cols-4 text-sm text-[#727473] border-b pb-2 mb-3">
            <span>Session</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right pl">View</span>
          </div>

          {sessions.length === 0 ? (
            <p className="text-center text-[#727473] py-10">
              No sessions available
            </p>
          ) : (
            sessions.map((s, i) => (
              <div
                key={s.id}
                className="grid grid-cols-4 items-center text-sm py-3 border-b last:border-b-0"
              >
                <span>#{i + 1}</span>
                <span>
                  {new Date(s.session_date).toLocaleDateString()}
                </span>
                <span className="capitalize">{s.status}</span>
                <button
                /* we will replace history with the actual path when we make the session view page */
                  onClick={() => navigate(`/history/${s.id}`)}
                  className="flex justify-end text-[#3078E2]"
                >
                  <FiEye />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-3">Notes</h2>
          {isEditing ? (
            <textarea
              name="notes"
              value={patient.notes}
              onChange={handleChange}
              className="border rounded w-full p-2 text-sm"
            />
          ) : (
            <p className="text-sm text-[#727473]">
              {patient.notes || "No notes"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

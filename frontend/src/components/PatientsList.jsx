import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { FaChevronDown } from "react-icons/fa6";
import { FaSearch, FaArrowCircleRight } from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";

const calcAge = (dob) => {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 0 ? "—" : age;
};

const PatientsList = ({ onAddPatient, onViewProfile }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/patients/");
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let msg = "Failed to load patients.";
      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      else if (status === 404) msg = "Patients not found";
      else if (data?.detail) msg = data.detail;

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();

    return patients.filter((p) => {
      const name = (p.full_name || p.name || "").toLowerCase();
      const gender = (p.gender || "").toLowerCase();

      const matchSearch = !q || name.includes(q);
      const matchGender =
        filterGender === "all" || gender === filterGender.toLowerCase();

      return matchSearch && matchGender;
    });
  }, [patients, search, filterGender]);

  return (
    <div className="w-full max-w-6xl">
      <h1 className="text-4xl font-semibold text-[#2f6fd6] mb-6 drop-shadow-sm">
        Patient List
      </h1>

      <div className="w-full border border-[#e6e6e6] rounded-2xl overflow-hidden bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-6">
            {/* filter */}
            <div className="relative">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="appearance-none px-6 py-3 rounded-full bg-[#f5f5f5] text-[#444] font-medium w-44 outline-none capitalize"
              >
                <option value="all">Filter by</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#727473]" />
            </div>

            {/* search */}
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="px-6 py-3 rounded-full bg-[#f5f5f5] text-[#727473] w-72 outline-none pr-12"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#727473]" />
            </div>
          </div>

          {/* Add Patient */}
          <button
            onClick={onAddPatient}
            className="px-7 py-3 rounded-full text-white font-medium flex items-center gap-3 shadow-sm"
            style={{ background: "linear-gradient(90deg, #3078E2, #8AAEE0)" }}
          >
            Add Patient
            <IoAddCircleOutline className="text-xl" />
          </button>
        </div>

        {/* header */}
        <div className="grid grid-cols-12 px-10 py-4 text-[#9a9a9a] text-sm border-b border-[#e6e6e6]">
          <div className="col-span-4">Full Name</div>
          <div className="col-span-3">Gender</div>
          <div className="col-span-2">Age</div>
          <div className="col-span-2">Last session</div>
          <div className="col-span-1" />
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-[420px] bg-white">
          {loading && (
            <div className="w-full flex justify-center items-center py-16 text-[#727473]">
              Loading patients...
            </div>
          )}

          {!loading && error && (
            <div className="w-full flex justify-center items-center py-16 text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && filteredPatients.length === 0 && (
            <div className="w-full flex flex-col justify-center items-center py-20 text-[#727473]">
              <p className="font-medium">No patients found</p>
              <p className="text-sm mt-2">Try a different search or filter.</p>
            </div>
          )}

          {!loading && !error && filteredPatients.length > 0 && (
            <div className="flex flex-col gap-6">
              {filteredPatients.map((p) => {
                const name = p.full_name || p.name || "—";
                const gender = p.gender || "—";
                const age = p.age ?? calcAge(p.date_of_birth);

                const lastSession =
                  p.last_session || p.last_session_date || p.lastSession || "—";

                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 items-center bg-white rounded-2xl px-10 py-6 shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
                  >
                    <div className="col-span-4 text-[#666]">{name}</div>
                    <div className="col-span-3 text-[#666]">{gender}</div>
                    <div className="col-span-2 text-[#666]">{age}</div>
                    <div className="col-span-2 text-[#666]">{lastSession}</div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => onViewProfile?.(p)}
                        className="text-[#222] font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer"
                      >
                        View profile
                        <FaArrowCircleRight />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsList;

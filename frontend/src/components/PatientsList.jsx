import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";
import { FiEye, FiRefreshCw } from "react-icons/fi";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

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

function GenderPill({ gender }) {
  const g = String(gender || "").toLowerCase();
  const styles = {
    male: "bg-blue-50 text-blue-700 ring-blue-100",
    female: "bg-pink-50 text-pink-700 ring-pink-100",
    other: "bg-gray-100 text-gray-700 ring-gray-200",
    unknown: "bg-gray-100 text-gray-700 ring-gray-200",
  };

  const label =
    g === "m" || g === "male"
      ? "Male"
      : g === "f" || g === "female"
      ? "Female"
      : gender
      ? String(gender)
      : "—";

  const key =
    g === "m" || g === "male"
      ? "male"
      : g === "f" || g === "female"
      ? "female"
      : gender
      ? "other"
      : "unknown";

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[key]
      )}
    >
      {label}
    </span>
  );
}

export default function PatientsList({
  onAddPatient,
  onViewProfile,
  onRenderSkeleton,
}) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500";

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/patients/");
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setPatients(list);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let msg = "Failed to load patients.";
      if (status === 401) msg = "Unauthorized. Please login again.";
      else if (status === 403) msg = "Forbidden. You don’t have permission.";
      else if (status === 404) msg = "Patients not found.";
      else if (data?.detail) msg = data.detail;

      setError(msg);
      setPatients([]);
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
      const gender = String(p.gender || "").toLowerCase();
      const matchSearch = !q || name.includes(q);
      const matchGender =
        filterGender === "all" || gender === filterGender.toLowerCase();
      return matchSearch && matchGender;
    });
  }, [patients, search, filterGender]);

  const totalLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "—";
    return `${filteredPatients.length} shown`;
  }, [loading, error, filteredPatients.length]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Patient List</div>
              <div className="text-xs text-gray-500">{totalLabel}</div>
            </div>

            <button
              onClick={fetchPatients}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
              title="Refresh"
              type="button"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[180px]">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className={classNames(
                  inputBase,
                  "appearance-none pr-10 capitalize cursor-pointer"
                )}
              >
                <option value="all">All genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative w-full sm:w-[320px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className={classNames(inputBase, "pr-10")}
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={onAddPatient}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
              type="button"
            >
              <IoAddCircleOutline className="text-xl" />
              Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 border-b border-gray-100 bg-white">
          <div className="col-span-5">Full Name</div>
          <div className="col-span-2">Gender</div>
          <div className="col-span-2">Age</div>
          <div className="col-span-2">Last session</div>
          <div className="col-span-1 text-right">Open</div>
        </div>

        <div className="min-h-[420px] bg-white">
          {loading && (onRenderSkeleton ? onRenderSkeleton(6) : null)}

          {!loading && error && (
            <div className="p-6">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <p className="mt-2 text-sm text-gray-600">
                Check your token / permissions and the patients endpoint.
              </p>
            </div>
          )}

          {!loading && !error && filteredPatients.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-700 font-medium">No patients found.</p>
              <p className="mt-1 text-xs text-gray-500">
                Try a different search or clear the gender filter.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterGender("all");
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer"
                  type="button"
                >
                  Clear filters
                </button>
                <button
                  onClick={onAddPatient}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3078E2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95 active:brightness-90 cursor-pointer"
                  type="button"
                >
                  <IoAddCircleOutline className="text-lg" />
                  Add Patient
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredPatients.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredPatients.map((p) => {
                const name = p.full_name || p.name || "—";
                const age = p.age ?? calcAge(p.date_of_birth);
                const lastSession =
                  p.last_session || p.last_session_date || p.lastSession || "—";

                return (
                  <div
                    key={p.id}
                    onClick={() => onViewProfile?.(p)}
                    className="grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white hover:bg-gray-50 transition cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onViewProfile?.(p);
                    }}
                  >
                    <div className="col-span-5 text-sm text-gray-900 font-medium truncate">
                      {name}
                      <div className="mt-0.5 text-xs text-gray-500 font-normal">
                        ID: <span className="font-mono">{p.id}</span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <GenderPill gender={p.gender} />
                    </div>

                    <div className="col-span-2 text-sm text-gray-700">{age}</div>

                    <div className="col-span-2 text-sm text-gray-700 truncate">
                      {lastSession}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProfile?.(p);
                        }}
                        className="inline-flex items-center justify-center rounded-full p-2 text-[#3078E2] hover:bg-[#3078E2]/10 cursor-pointer"
                        aria-label={`View profile for ${name}`}
                        title="View profile"
                        type="button"
                      >
                        <FiEye />
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
}

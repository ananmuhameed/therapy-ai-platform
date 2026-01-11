import { IoPersonOutline } from "react-icons/io5";
import { calculateAge, classNames } from "../../utils/helpers";

export default function PatientInfoCard({
  patient,
  patientId,
  isEditing,
  onChange,
}) {
  const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#3078E2] focus:ring-2 focus:ring-[#3078E2]/20 disabled:bg-gray-50 disabled:text-gray-500 cursor-text";

  const cardBase = "rounded-2xl bg-white shadow-sm ring-1 ring-gray-100";

  const age = calculateAge(patient.date_of_birth);

  return (
    <div className={classNames(cardBase, "p-6 mb-6")}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3078E2]/10 shrink-0">
            <IoPersonOutline size={22} className="text-[#3078E2]" />
          </div>

          <div className="w-full">
            {/* Name */}
            {isEditing ? (
              <input
                name="full_name"
                value={patient.full_name}
                onChange={onChange}
                placeholder="Patient name"
                className={classNames(inputBase, "max-w-md")}
              />
            ) : (
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.full_name || "Patient"}
              </h1>
            )}

            {/* Gender + DOB */}
            {!isEditing ? (
              <p className="mt-1 text-sm text-gray-600">
                {patient.gender || "Gender"}
                {age ? (
                  <>
                    <span className="mx-1">•</span>
                    {age} years
                  </>
                ) : null}
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                {/* ✅ Gender dropdown */}
                <select
                  name="gender"
                  value={patient.gender || ""}
                  onChange={onChange}
                  className={inputBase}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                {/* Date of birth */}
                <input
                  type="date"
                  name="date_of_birth"
                  value={patient.date_of_birth || ""}
                  onChange={onChange}
                  className={inputBase}
                />
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="hidden md:block text-right shrink-0">
            <div className="text-xs text-gray-500">Patient ID</div>
            <div className="font-mono text-sm text-gray-800">
              {patientId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

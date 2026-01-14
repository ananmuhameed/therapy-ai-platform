import React from "react";
import ListControls from "../../components/ui/ListControls";

export default function PatientsControls({
  totalLabel,
  search,
  onSearchChange,
  filterGender,
  onFilterGenderChange,
  onAddPatient,
}) {
  return (
    <ListControls
      title="All Patients"
      totalLabel={totalLabel}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name…"
      filterValue={filterGender}
      onFilterChange={onFilterGenderChange}
      filterPlaceholder="All genders"
      filterOptions={[
        { value: "female", label: "Female" },
        { value: "male", label: "Male" },
      ]}
    >
      <button
        onClick={onAddPatient}
        className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 cursor-pointer transition-colors"
        type="button"
      >
        Add Patient
      </button>
    </ListControls>
  );
}

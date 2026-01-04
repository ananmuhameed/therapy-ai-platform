import React from "react";
import ListControls from "../../components/ui/ListControls";

export default function SessionsControls({
  totalLabel,
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) {
  return (
    <ListControls
      title="All Sessions"
      totalLabel={totalLabel}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by patient name…"
      filterValue={filterStatus}
      onFilterChange={onFilterChange}
      filterPlaceholder="All statuses"
      filterOptions={[
        { value: "empty", label: "Empty" },
        { value: "uploaded", label: "Uploaded" },
        { value: "recorded", label: "Recorded" },
        { value: "transcribing", label: "Transcribing" },
        { value: "analyzing", label: "Analyzing" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
      ]}
    />
  );
}

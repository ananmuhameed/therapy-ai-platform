import React from "react";
import ListControls from "../../components/ui/ListControls";

export default function ReportsControls({
  totalLabel,
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) {
  return (
    <ListControls
      title="All Reports"
      totalLabel={totalLabel}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by patient name…"
      filterValue={filterStatus}
      onFilterChange={onFilterChange}
      filterPlaceholder="All statuses"
      filterOptions={[
        { value: "ready", label: "Ready" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
        { value: "draft", label: "Draft" },
        { value: "analyzing", label: "Analyzing" },
      ]}
    />
  );
}

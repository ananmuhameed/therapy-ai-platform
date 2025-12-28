import React from "react";
import { classNames } from "../../utils/helpers";

export default function GenderPill({ gender }) {
  const g = String(gender || "").toLowerCase();
  
  const styles = {
    male: "bg-blue-50 text-blue-700 ring-blue-100",
    female: "bg-pink-50 text-pink-700 ring-pink-100",
    other: "bg-gray-100 text-gray-700 ring-gray-200",
    unknown: "bg-gray-100 text-gray-700 ring-gray-200",
  };

  let key = "unknown";
  let label = "—";

  if (g === "m" || g === "male") {
    key = "male";
    label = "Male";
  } else if (g === "f" || g === "female") {
    key = "female";
    label = "Female";
  } else if (gender) {
    key = "other";
    label = String(gender);
  }

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
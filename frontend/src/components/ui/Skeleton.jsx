import React from "react";
import { classNames } from "../../utils/helpers";

export default function Skeleton({ className }) {
  return (
    <div className={classNames("animate-pulse rounded-md bg-gray-200/70", className)} />
  );
}
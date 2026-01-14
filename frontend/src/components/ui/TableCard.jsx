import React from "react";
import Skeleton from "./Skeleton";

export default function TableCard({
  columns = [], // [{ label, className }]
  loading,
  error,
  rowsCount = 0,
  emptyTitle = "No items found.",
  emptySubtitle = "Try changing filters or search.",
  emptyActions = null,
  children, // rows renderer
  skeletonRows = 7,
}) {
  return (
    <div className="rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] overflow-hidden transition-colors">
      {/* Header */}
      <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-xs font-medium text-[rgb(var(--text-muted))] border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        {columns.map((c, idx) => (
          <div key={idx} className={c.className}>
            {c.label}
          </div>
        ))}
      </div>

      <div className="min-h-[420px] bg-[rgb(var(--card))] transition-colors">
        {/* Loading */}
        {loading && (
          <div className="p-4 sm:p-6 space-y-3">
            {Array.from({ length: skeletonRows }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6">
            <p className="text-sm font-medium text-red-500">{error}</p>
            <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              Check your token / permissions and the endpoint.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rowsCount === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-[rgb(var(--text))] font-medium">
              {emptyTitle}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
              {emptySubtitle}
            </p>
            {emptyActions ? <div className="mt-4">{emptyActions}</div> : null}
          </div>
        )}

        {/* Rows */}
        {!loading && !error && rowsCount > 0 && (
          <div className="divide-y divide-[rgb(var(--border))]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { classNames } from "../../utils/helpers";

export default function ClickableRow({ canOpen, onOpen, children, title }) {
  return (
    <div
      onClick={() => canOpen && onOpen?.()}
      className={classNames(
        "grid grid-cols-12 items-center px-4 sm:px-6 py-3 bg-white transition",
        canOpen ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
      )}
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (!canOpen) return;
        if (e.key === "Enter" || e.key === " ") onOpen?.();
      }}
      title={title}
    >
      {children}
    </div>
  );
}

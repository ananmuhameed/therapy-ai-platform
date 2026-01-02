import React from "react";
import { classNames } from "../utils/helpers";

export default function AuthSplitLayout({ 
  // Support both prop naming conventions
  imageSide, 
  formSide, 
  leftContent, 
  rightContent,
  reverse = false 
}) {
  // Normalize props: Use leftContent if available, otherwise fallback to imageSide
  const left = leftContent || imageSide;
  const right = rightContent || formSide;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-6 bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]">
      <div className="w-full max-w-6xl">
        <div 
          className={classNames(
            "rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]",
            reverse ? "lg:flex-row-reverse" : ""
          )}
        >
          {/* Branding / Image Side (Left) */}
          <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-[#395886] via-[#638ECB] to-[#8AAEE0]">
            {left}
          </div>

          {/* Form Side (Right) */}
          <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-[#8AAEE0] via-[#B1C9EF] to-[#B1C9EF]">
             <div className="max-w-md mx-auto w-full">
                {right}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
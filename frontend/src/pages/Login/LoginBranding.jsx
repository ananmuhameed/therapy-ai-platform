import React from "react";

export default function LoginBranding() {
  const features = [
    {
      title: "Secure & Private",
      desc: "Your data is encrypted and protected with industry-standard security",
      iconPath: "M5 13l4 4L19 7",
    },
    {
      title: "Lightning Fast",
      desc: "Experience seamless performance with our optimized platform",
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "24/7 Support",
      desc: "Our dedicated team is always here to help you succeed",
      iconPath:
        "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  return (
    <div className="max-w-md mx-auto lg:mx-0">
      <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-[#F0F3FA]">
        Welcome Back
      </h1>
      <p className="text-base lg:text-lg mb-8 leading-relaxed text-[#D4CDCB]">
        Sign in to access your dashboard and manage your patients with ease. We're
        glad to have you back!
      </p>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((f, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#5B687C" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#D4CDCB" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={f.iconPath}
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-[#D4CDCB]">{f.title}</h3>
              <p className="text-sm text-[#ded8d7]">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
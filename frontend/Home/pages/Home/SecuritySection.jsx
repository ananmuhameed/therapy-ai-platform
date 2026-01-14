import { FaCheck } from "react-icons/fa";
import FadeUp from "../../Layout/Fadeup";
import Brain from "./BrainVideoOverlay";

export default function SecuritySection() {
  return (
    <section className="py-24 px-6 bg-[rgb(var(--bg))] transition-colors">
      <FadeUp delay={0.3}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Brain Video */}
          <div className="flex justify-center">
            <Brain />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-[rgb(var(--primary))] via-blue-400 to-blue-300 bg-clip-text text-transparent">
              Secure, Trusted, and Built for Professionals
            </h2>

            <p className="mt-4 text-[rgb(var(--text-muted))] leading-relaxed">
              Our platform is designed with enterprise-grade security standards to
              ensure your data remains private, encrypted, and fully protected.
              Every therapist on our platform is verified and licensed to guarantee
              safe and ethical care.
            </p>

            <FadeUp delay={0.4}>
              <ul className="mt-6 space-y-3 text-[rgb(var(--text-muted))]">
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  End-to-end encrypted data
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  HIPAA-ready infrastructure
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  Verified & licensed therapists
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  Secure cloud storage
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  Role-based access control
                </li>
              </ul>
            </FadeUp>
          </div>

        </div>
      </FadeUp>
    </section>
  );
}

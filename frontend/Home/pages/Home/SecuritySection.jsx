import { FaCheck } from "react-icons/fa";
import FadeUp from "../../Layout/Fadeup";
import Brain from "./BrainVideoOverlay";




export default function SecuritySection() {
  return (
    <section className="py-24 px-6 bg-white">
      <FadeUp delay={0.3}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Brain Video */}
          <div className="flex justify-center">
            <Brain/>
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-[#3078E2] via-[#5D93E1] to-[#8AAEE0] bg-clip-text text-transparent">
              Secure, Trusted, and Built for Professionals
            </h2>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Our platform is designed with enterprise-grade security standards to
              ensure your data remains private, encrypted, and fully protected.
              Every therapist on our platform is verified and licensed to guarantee
              safe and ethical care.
            </p>

            <FadeUp delay={0.4}>
              <ul className="mt-6 space-y-3 text-gray-600">
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-blue-500" /> End-to-end encrypted data
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-blue-500" /> HIPAA-ready infrastructure
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-blue-500" /> Verified & licensed therapists
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-blue-500" /> Secure cloud storage
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-blue-500" /> Role-based access control
                </li>
              </ul>
            </FadeUp>
          </div>

        </div>
      </FadeUp>
    </section>
  );
}

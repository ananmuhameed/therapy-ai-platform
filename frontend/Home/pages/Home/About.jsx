import FadeUp from "../../Layout/Fadeup";
import { FaCheck } from "react-icons/fa";

const About = () => {
  return (
    <section className="py-24 px-6 bg-[rgb(var(--bg-secondary))] transition-colors">
      <FadeUp delay={0.3}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-[rgb(var(--primary))] via-blue-400 to-blue-300 bg-clip-text text-transparent">
              About Our Platform
            </h2>

            <p className="mt-4 text-[rgb(var(--text-muted))] leading-relaxed">
              We help therapists automate session documentation, generate accurate
              transcripts, and create structured AI-powered reports. Our mission is
              to reduce admin workload so professionals can focus on what truly
              matters — patient care.
            </p>
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 shadow-lg transition-colors">
            <FadeUp delay={0.4}>
              <ul className="space-y-4 text-[rgb(var(--text-muted))]">
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  Secure cloud storage
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  AI-powered transcription
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  Smart report generation
                </li>
                <li className="flex gap-2 items-center">
                  <FaCheck className="text-[rgb(var(--primary))]" />
                  HIPAA-ready architecture
                </li>
              </ul>
            </FadeUp>
          </div>

        </div>
      </FadeUp>
    </section>
  );
};

export default About;

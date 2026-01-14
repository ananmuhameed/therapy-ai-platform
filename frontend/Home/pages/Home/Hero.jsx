import FadeUp from "../../Layout/Fadeup";
import { useNavigate } from "react-router-dom";
import ThemeWrapper from "../../../src/components/ui/ThemeWraper";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <FadeUp delay={0.3}>
      <ThemeWrapper>
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <span className="px-4 py-1 rounded-full bg-[rgb(var(--bg-secondary))] text-[rgb(var(--primary))] text-sm mb-6">
            Mental Healthcare Documentation
          </span>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight max-w-3xl">
            Therapist Transcription and AI Reporting Platform
          </h1>

          <p className="mt-4 text-[rgb(var(--text-muted))] max-w-2xl">
            Platform provides an automated solution where therapists can manage
            their patients, record therapy sessions, and automatically generate
            session transcripts and structured reports.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 rounded-2xl bg-[rgb(var(--primary))] text-white hover:opacity-90 transition"
            >
              Get started Free
            </button>

            <button
              onClick={() => navigate("/plans")}
              className="px-6 py-3 rounded-2xl bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text))] hover:opacity-80 transition"
            >
              Discover Paid Plans
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 text-center">
            <div>
              <h3 className="text-3xl font-semibold">60%</h3>
              <p className="text-[rgb(var(--text-muted))] mt-2">
                Time Saved on Documentation
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-semibold">40%</h3>
              <p className="text-[rgb(var(--text-muted))] mt-2">
                More in-session focus
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-semibold">98%</h3>
              <p className="text-[rgb(var(--text-muted))] mt-2">
                Accuracy rate
              </p>
            </div>
          </div>
        </section>
      </ThemeWrapper>
    </FadeUp>
  );
};

export default Hero;

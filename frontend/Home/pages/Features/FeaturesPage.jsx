import { motion } from "framer-motion";
import { FileText, Mic, Download, Headphones } from "lucide-react";

const features = [
  {
    title: "AI Report Summary",
    description:
      "Get a complete AI-generated overview of every session to support better clinical decisions.",
    points: [
      "High Risk Alerts",
      "Executive Summary",
      "Key Points",
      "Suggested Treatment Plan",
    ],
    icon: FileText,
  },
  {
    title: "Session Recording",
    description:
      "Record every session securely and replay it anytime to review tone, emotions, and context.",
    points: [
      "High-quality audio recording",
      "Secure storage",
      "Replay anytime",
    ],
    icon: Mic,
  },
  {
    title: "Download & Edit Summaries",
    description:
      "Download, customize, and store your session reports with full flexibility.",
    points: [
      "Editable formats",
      "Easy sharing",
      "Professional documentation",
    ],
    icon: Download,
  },
  {
    title: "AI Transcription",
    description:
      "Automatically converts speech into accurate, searchable text.",
    points: [
      "Fast transcription",
      "Long-session support",
      "Searchable text",
    ],
    icon: Headphones,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen px-6 py-20 bg-[rgb(var(--bg))] text-[rgb(var(--text))] relative overflow-hidden transition-colors">

      {/* Glow blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features, Built for Professionals
          </h1>
          <p className="max-w-2xl mx-auto text-[rgb(var(--text-muted))]">
            Our platform helps therapists save time, reduce manual work, and focus
            on what matters most — patient care.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -6 }}
                className="group relative rounded-2xl p-8 backdrop-blur-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] transition-all duration-300 overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[rgb(var(--primary))]">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="mb-4 text-[rgb(var(--text-muted))]">
                    {feature.description}
                  </p>

                  <ul className="space-y-2">
                    {feature.points.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-[rgb(var(--text))]"
                      >
                        <span className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

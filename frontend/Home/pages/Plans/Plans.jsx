import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { plans } from "./pricing";

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");
  const navigate = useNavigate();

  const comparison = [
    ["1-hour session limit", true, false, false],
    ["Unlimited sessions", false, true, true],
    ["Full AI reports", true, true, true],
    ["Session recording", true, true, true],
    ["Download summaries", false, true, true],
    ["Priority support", false, true, true],
    ["Multiple users access", false, false, true],
  ];

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
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-2xl mx-auto text-[rgb(var(--text-muted))]">
            Start free. Upgrade when you need more power.
          </p>

          <div className="flex justify-center mt-8">
            <div className="bg-[rgb(var(--bg-secondary))] p-1 rounded-full flex border border-[rgb(var(--border))]">
              {["monthly", "yearly"].map((type) => (
                <button
                  key={type}
                  onClick={() => setBilling(type)}
                  className={`px-6 py-2 rounded-full transition text-sm font-medium ${
                    billing === type
                      ? "bg-[rgb(var(--primary))] text-white"
                      : "text-[rgb(var(--text-muted))] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {type === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className={`group relative rounded-2xl p-8 backdrop-blur-xl border transition-all duration-300 overflow-hidden flex flex-col
              ${
                plan.highlight
                  ? "bg-[rgb(var(--bg-secondary))] border-[rgb(var(--primary))]"
                  : "bg-[rgb(var(--card))] border-[rgb(var(--border))]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute top-4 right-6 bg-[rgb(var(--primary))] text-white text-xs px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-[rgb(var(--text-muted))] mb-6">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {billing === "monthly" ? plan.priceMonthly : plan.priceYearly}
                </span>
                <span className="text-[rgb(var(--text-muted))] ml-2">
                  /EGP {billing === "monthly" ? "mo" : "yr"}
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[rgb(var(--primary))]">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[rgb(var(--text))]">
                        {feature.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto">
                <button
                  onClick={() => navigate(`/signup`)}
                  className={`w-full py-3 rounded-full font-medium transition
                  ${
                    plan.highlight
                      ? "bg-[rgb(var(--primary))] text-white hover:opacity-90"
                      : "border border-[rgb(var(--border))] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-32">
          <div className="px-8 py-4 w-fit bg-gradient-to-r from-[rgb(var(--primary))] via-blue-400 to-blue-300 bg-clip-text text-transparent rounded-full mb-10 flex justify-center mx-auto">
            <h2 className="text-3xl font-bold text-center">
              Compare Plans
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[rgb(var(--card))] backdrop-blur-xl border border-[rgb(var(--border))]">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[rgb(var(--border))]">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center">Free</th>
                  <th className="p-4 text-center">Pro</th>
                  <th className="p-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([feature, free, pro, enterprise]) => (
                  <tr key={feature} className="border-b border-[rgb(var(--border))]">
                    <td className="p-4">{feature}</td>

                    <td className="p-4 text-center">
                      {free ? (
                        <Check className="text-[rgb(var(--primary))] mx-auto" />
                      ) : (
                        <X className="text-[rgb(var(--text-muted))] mx-auto" />
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {pro ? (
                        <Check className="text-[rgb(var(--primary))] mx-auto" />
                      ) : (
                        <X className="text-[rgb(var(--text-muted))] mx-auto" />
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {enterprise ? (
                        <Check className="text-[rgb(var(--primary))] mx-auto" />
                      ) : (
                        <X className="text-[rgb(var(--text-muted))] mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

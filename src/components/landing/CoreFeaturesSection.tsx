import React from "react";
import { motion } from "motion/react";
import { Building2, Laptop, Network, Search, ShieldCheck } from "lucide-react";

const CoreFeaturesSection: React.FC = () => {
  const featureList = [
    {
      title: "Extensive Asset Registration",
      description:
        "Store high-fidelity records including serial numbers, hardware categories, purchase dates, warranties, and photographic evidence for every asset.",
    },
    {
      title: "Hierarchical Ownership Mapping",
      description:
        "Directly assign assets to specific bank employees, bind them to entire departments, or anchor them to regional branches.",
    },
    {
      title: "Strict Business Rule Transitions",
      description:
        "Enforce logical progression. Assets cannot be 'Written Off' without being marked as 'Lost' or 'In Repair' first, ensuring auditable state management.",
    },
    {
      title: "Advanced Search & Discovery",
      description:
        "Comb through thousands of records instantly using granular filters for branch, department, category, type, and current status.",
    },
    {
      title: "Enterprise Architecture",
      description:
        "Built on scalable, secure, and compliant cloud infrastructure, protecting sensitive operational data behind robust access controls.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Engineered for{" "}
            <span className="text-cyan-600">Enterprise Control</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Deep configurations that adapt to your internal workflows while
            enforcing best-practice lifecycle standards.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual Grid Graphic */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 relative h-[500px] w-full bg-slate-50 rounded-3xl border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden"
          >
            {/* Abstract Graphic */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/50 via-transparent to-transparent opacity-50"></div>

            <div className="relative z-10 w-full max-w-md">
              {/* Fake UI component */}
              <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-6 relative">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      MacBook Pro 16"
                    </h4>
                    <p className="text-sm text-slate-500">SN: C02X1234F3M4</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      ASSIGNED
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Main Headquarters
                      </p>
                      <p className="text-xs text-slate-500">
                        Corporate Banking Dept
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Network className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Jane Smith
                      </p>
                      <p className="text-xs text-slate-500">
                        VP, Commercial Lending
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit pulse effect */}
                <div className="absolute -right-4 -bottom-4 bg-slate-900 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold">
                    Audit Log Updated
                  </span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-10 -right-10 bg-white p-3 rounded-lg shadow-md border border-slate-100 flex items-center gap-3">
                <Search className="w-4 h-4 text-cyan-600" />
                <div className="w-20 h-2 bg-slate-100 rounded"></div>
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <div className="order-1 lg:order-2 space-y-8">
            {featureList.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreFeaturesSection;

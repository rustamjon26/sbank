import React from "react";
import LandingHeader from "../components/landing/LandingHeader";
import HeroSection from "../components/landing/HeroSection";
import LandingFooter from "../components/landing/LandingFooter";
import {
  AlertCircle,
  EyeOff,
  FileQuestion,
  Users,
  FileWarning,
} from "lucide-react";

const Landing: React.FC = () => {
  const problems = [
    {
      icon: EyeOff,
      title: "Unclear Ownership",
      description:
        "Laptops and devices move between employees without proper tracking, leading to confused accountability.",
    },
    {
      icon: Users,
      title: "Branch-Level Blind Spots",
      description:
        "Headquarters lacks visibility into hardware assigned to distant branches, leading to misallocation.",
    },
    {
      icon: AlertCircle,
      title: "Operational Risk",
      description:
        "Lost or broken assets cause unexpected downtime, compliance issues, and unbudgeted replacement costs.",
    },
    {
      icon: FileWarning,
      title: "Manual Inventory Audits",
      description:
        "Periodic audits involve slow, error-prone spreadsheet updates rather than real-time digital verification.",
    },
    {
      icon: FileQuestion,
      title: "Accountability Gaps",
      description:
        "Incomplete asset history makes it impossible to know who authorized changes in asset status or location.",
    },
  ];

  return (
    <div className="font-sans text-slate-900 overflow-x-hidden bg-slate-50 selection:bg-cyan-500/30">
      <LandingHeader />
      <main>
        <HeroSection />
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="w-full md:w-1/3">
                <div>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
                    The Financial <br />
                    <span className="text-cyan-600">Black Hole</span> <br />
                    of IT Assets
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Banks manage thousands of devices. Without a unified ledger
                    of where assets are and who holds them, operational risks
                    multiply and audit readiness drops.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="grid sm:grid-cols-2 gap-6 relative">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10 hidden sm:block"></div>
                  <div className="absolute top-0 left-1/2 w-px h-full bg-slate-200 -z-10 hidden sm:block"></div>

                  {problems.map((problem, index) => (
                    <div
                      key={index}
                      className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative z-10 ${index === 4 ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : ""}`}
                    >
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-4 border border-rose-100">
                        <problem.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {problem.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;

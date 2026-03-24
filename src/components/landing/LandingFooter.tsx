import React from "react";
import { Link } from "react-router-dom";
import { Building2, Github, Twitter, Linkedin, Mail } from "lucide-react";

const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-cyan-600 p-2 rounded-xl">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AssetFlow <span className="text-cyan-500">Bank</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs">
              The unified platform for financial institutions to track, audit,
              and secure office and IT assets across every branch and
              department.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all border border-slate-800"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#features"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#ai-insights"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  AI Insights
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Audit Templates
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Branch Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Security PDF
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail className="w-4 h-4 text-cyan-500" />
                contact@assetflow.bank
              </li>
              <li className="text-slate-500 text-sm leading-relaxed">
                123 Financial District,
                <br />
                Innovation Hub, Suite 402
                <br />
                London, UK
              </li>
              <li>
                <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mb-1 leading-tight">
                    System Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-white">
                      All Systems Operational
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-xs">
            © {currentYear} AssetFlow Bank. Built for Modern Financial
            Institutions.
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

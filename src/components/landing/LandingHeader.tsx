import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "AI Insights", href: "#ai-insights" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href.startsWith("#")) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-cyan-600 transition-colors">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span
            className={`text-xl font-bold tracking-tight transition-colors ${isScrolled ? "text-slate-900" : "text-white"}`}
          >
            AssetFlow <span className="text-cyan-600">Bank</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className={`text-sm font-medium hover:text-cyan-600 transition-colors ${
                isScrolled ? "text-slate-600" : "text-slate-200"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className={`text-sm font-medium hover:text-cyan-600 transition-colors ${
              isScrolled ? "text-slate-600" : "text-white"
            }`}
          >
            Sign In
          </Link>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full px-6 font-medium border-0"
            onClick={() => navigate("/login")}
          >
            Request Demo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X
              className={`h-6 w-6 ${isScrolled ? "text-slate-900" : "text-white"}`}
            />
          ) : (
            <Menu
              className={`h-6 w-6 ${isScrolled ? "text-slate-900" : "text-white"}`}
            />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-lg font-medium text-slate-800 py-2 border-b border-slate-100"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <Link
              to="/login"
              className="text-center py-3 text-slate-600 font-medium"
            >
              Sign In
            </Link>
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg rounded-xl"
              onClick={() => navigate("/login")}
            >
              Request Demo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;

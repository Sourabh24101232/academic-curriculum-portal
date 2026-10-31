import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  BookOpen,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';

/**
 * Footer Component
 * Institutional 4-column footer adhering to standard Government / IIIT guidelines:
 * - Col 1: Institutional Contact Information & Permanent Address
 * - Col 2: Quick Portal Links & Academic Ordinances
 * - Col 3: Academic Degree Programmes & Departments
 * - Col 4: Useful Campus Resources, Statutory Compliance & Portals
 * - Bottom Bar: Copyright notice, legal disclaimers & timestamp
 */
const Footer = () => {
  return (
    <footer className="bg-institute-navy text-slate-200 border-t-4 border-institute-gold">
      {/* Main 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Column 1: Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-institute-gold" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                Contact Information
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 font-medium">
              Indian Institute of Information Technology Bhagalpur
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>
                  Permanent Campus, Sabour,<br />
                  Bhagalpur, Bihar – 813210, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-institute-gold flex-shrink-0" />
                <span>+91 (0641) 222-3000 / 222-3001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-institute-gold flex-shrink-0" />
                <a
                  href="mailto:academic@iiitbh.ac.in"
                  className="hover:text-institute-gold transition-colors"
                >
                  academic@iiitbh.ac.in
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-institute-gold flex-shrink-0" />
                <a
                  href="https://www.iiitbh.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-institute-gold inline-flex items-center gap-1 transition-colors"
                >
                  www.iiitbh.ac.in
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-institute-gold" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                Quick Links
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a
                  href="/"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-institute-gold" />
                  <span>Portal Home</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.iiitbh.ac.in/academic-calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <Calendar className="w-3 h-3 text-institute-gold" />
                  <span>Academic Calendar</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.iiitbh.ac.in/ordinance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <BookOpen className="w-3 h-3 text-institute-gold" />
                  <span>Academic Ordinances &amp; Regulations</span>
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <Lock className="w-3 h-3 text-institute-gold" />
                  <span>Faculty &amp; Admin Dashboard</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.iiitbh.ac.in/rti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-institute-gold" />
                  <span>Right to Information (RTI) Cell</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.iiitbh.ac.in/nirf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-institute-gold" />
                  <span>NIRF &amp; Accreditations</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Programmes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-institute-gold" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                Academic Programmes
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>B.Tech in Computer Science &amp; Engineering (CSE)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>B.Tech in Electronics &amp; Communication Engg (ECE)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>B.Tech in Mechatronics &amp; Automation Engg (MEA)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>M.Tech in AI &amp; Data Science / VLSI Systems</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>Ph.D. Doctoral Research Programmes</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-institute-gold flex-shrink-0 mt-0.5" />
                <span>Minor Degrees &amp; Honors Specializations</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Useful Resources */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-institute-gold" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-white">
                Useful Resources
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a
                  href="https://www.iiitbh.ac.in/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>Central Library &amp; Digital Repositories</span>
                </a>
              </li>
              <li>
                <a
                  href="https://erp.iiitbh.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>Institute ERP Portal (AIMS)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.iiitbh.ac.in/icc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ShieldAlert className="w-3 h-3 text-slate-400" />
                  <span>Internal Complaints Committee (ICC)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.antiragging.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-amber-300 hover:text-institute-gold transition-colors"
                >
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span className="font-medium">Anti-Ragging Undertaking &amp; Helpline</span>
                </a>
              </li>
              <li>
                <a
                  href="https://nad.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-institute-gold transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>National Academic Depository (NAD / ABC)</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Bar */}
      <div className="bg-institute-navyDark border-t border-slate-800 text-slate-400 text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p>
              Copyright &copy; 2026 Indian Institute of Information Technology Bhagalpur. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Designed &amp; Maintained by Computer Science &amp; Engineering Department &bull; Academic Portal v1.0
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <a href="/privacy" className="hover:text-institute-gold transition-colors">Privacy Policy</a>
            <span>&bull;</span>
            <a href="/terms" className="hover:text-institute-gold transition-colors">Terms of Use</a>
            <span>&bull;</span>
            <a href="/disclaimer" className="hover:text-institute-gold transition-colors">Disclaimer</a>
            <span>&bull;</span>
            <a href="/hyperlink" className="hover:text-institute-gold transition-colors">Hyperlink Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import {
  Home,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const USEFUL_LINKS = [
  'EVENTS',
  'NEWS AND NOTICES',
  'STUDY IN INDIA',
  'ONLINE FEE PAYMENT',
  'WEBMAIL',
  'ONLINE PAYMENT TERMS & CONDITIONS [CANARA BANK]',
  'REFUND RULES [SBI BANK]',
  'ANTI RAGGING',
  'WOMEN CELL',
  'GENDER WISE DATA',
  'RECRUITMENTS',
  'JOSAA',
  'DOWNLOADS',
  'TENDERS/NIQS',
  'AUDIT & ANNUAL REPORT',
  'CSAB',
  'GRIEVANCE CELL',
  'ICC',
  'IIITBH ALUMNI',
  'OUTREACH',
  'RTI'
];

const LOCATION_LINKS = [
  'HOW TO REACH',
  'HOTELS NEAR THE INSTITUTE'
];

/**
 * Footer Component
 * Matches the official IIIT Bhagalpur website footer with golden headings,
 * contact details, social media icons, and total visitors counter.
 * All links are rendered as inactive.
 */
const Footer = () => {
  return (
    <footer className="bg-[#011844] text-white text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Useful Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-4">
              USEFUL LINKS
            </h3>
            <ul className="space-y-1.5 text-[11px] font-medium tracking-wide">
              {USEFUL_LINKS.map((link, idx) => (
                <li key={idx}>
                  <span
                    className={`cursor-default transition-colors ${
                      link === 'OUTREACH' ? 'text-blue-400' : 'text-slate-100 hover:text-slate-100'
                    }`}
                  >
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Location */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-4">
              LOCATION
            </h3>
            <ul className="space-y-2 text-[11px] font-medium tracking-wide">
              {LOCATION_LINKS.map((link, idx) => (
                <li key={idx}>
                  <span className="cursor-default text-slate-100 hover:text-slate-100">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-4">
              CONTACT INFO
            </h3>
            <div className="space-y-3 text-[11px] font-medium text-slate-100 leading-relaxed">
              <p>
                Indian Institute of Information<br />
                Technology Bhagalpur.
              </p>
              <div className="flex items-start gap-2 pt-1">
                <Home className="w-4 h-4 text-[#d3b62a] flex-shrink-0 mt-0.5" />
                <span>Sabour, Bhagalpur - 813210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d3b62a] flex-shrink-0" />
                <span className="cursor-default">pro@iiitbh.ac.in</span>
              </div>
            </div>
          </div>

          {/* Column 4: Connect With Us & Visitors */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-4">
              CONNECT WITH US
            </h3>
            
            {/* Social Icons in Yellow */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="w-7 h-7 rounded bg-[#d3b62a] text-[#011844] flex items-center justify-center cursor-default hover:opacity-90"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </span>
              <span
                className="w-7 h-7 rounded bg-[#d3b62a] text-[#011844] flex items-center justify-center cursor-default hover:opacity-90"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 fill-current" />
              </span>
              <span
                className="w-7 h-7 rounded bg-[#d3b62a] text-[#011844] flex items-center justify-center cursor-default hover:opacity-90"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </span>
              <span
                className="w-7 h-7 rounded bg-[#d3b62a] text-[#011844] flex items-center justify-center cursor-default hover:opacity-90"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 fill-current" />
              </span>
            </div>

            {/* Visitors Counter */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-2">
                VISITORS
              </h4>
              <p className="text-[11px] text-slate-100 flex items-center gap-1.5 font-medium">
                <span className="text-sm leading-none">&bull;</span>
                <span>Total Visitors: <strong>4578545</strong></span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Bar */}
      <div className="border-t border-slate-800/80 bg-[#001030] py-3.5 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            &copy; 2024 Indian Institute of Information Technology Bhagalpur. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="cursor-default">Privacy Policy</span>
            <span>|</span>
            <span className="cursor-default">Terms of Use</span>
            <span>|</span>
            <span className="cursor-default">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

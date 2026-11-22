import React from 'react';
import {
  Home,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const LOCATION_LINKS = [
  {
    label: 'HOW TO REACH',
    href: 'https://www.iiitbh.ac.in/how-reach'
  },
  {
    label: 'HOTELS NEAR THE INSTITUTE',
    href: 'https://www.iiitbh.ac.in/accomodation'
  }
];

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/iiitbh.ac.in/',
    icon: Facebook,
    filled: true
  },
  {
    name: 'Twitter',
    href: 'https://x.com/iiitbhagalpur',
    icon: Twitter,
    filled: true
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/iiit_bhagalpur_official?igshid=t1twlv86zcrj',
    icon: Instagram,
    filled: false
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/school/iiitbh/posts/?feedView=all',
    icon: Linkedin,
    filled: true
  }
];

/**
 * Footer Component
 * Matches the official IIIT Bhagalpur website footer with golden headings,
 * contact details, and clickable location and social media links.
 */
const Footer = () => {
  return (
    <footer className="bg-[#011844] text-white text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Column 1: Location */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-4">
              LOCATION
            </h3>
            <ul className="space-y-2 text-[11px] font-medium tracking-wide">
              {LOCATION_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-100 hover:text-[#d3b62a] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Contact Info */}
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

          {/* Column 3: Connect With Us */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#d3b62a] uppercase mb-4">
              CONNECT WITH US
            </h3>
            
            {/* Social Icons in Yellow */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded bg-[#d3b62a] text-[#011844] flex items-center justify-center hover:opacity-90 transition-opacity"
                    aria-label={item.name}
                  >
                    <IconComponent className={`w-4 h-4 ${item.filled ? 'fill-current' : ''}`} />
                  </a>
                );
              })}
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

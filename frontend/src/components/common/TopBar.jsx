import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

/**
 * TopBar Component
 * Official dark navy institutional utility bar with bilingual language indicator,
 * national institute affiliation, and accessible social channels.
 */
const TopBar = () => {
  return (
    <div className="bg-institute-navyDark text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Institute Status & Language Indicator */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-200">
            Ministry of Education, Govt. of India
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-institute-gold" />
            <span className="font-semibold text-slate-100">हिंदी</span>
            <span className="text-slate-500">/</span>
            <span>English</span>
          </div>
        </div>

        {/* Right: Quick Links & Social Channels */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.iiitbh.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-institute-gold transition-colors duration-150"
          >
            Main Institute Website
          </a>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IIIT Bhagalpur Facebook"
              className="text-slate-400 hover:text-institute-gold transition-colors"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IIIT Bhagalpur Twitter / X"
              className="text-slate-400 hover:text-institute-gold transition-colors"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IIIT Bhagalpur LinkedIn"
              className="text-slate-400 hover:text-institute-gold transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IIIT Bhagalpur YouTube"
              className="text-slate-400 hover:text-institute-gold transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

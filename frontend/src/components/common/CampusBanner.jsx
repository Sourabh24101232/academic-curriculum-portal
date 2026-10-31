import React from 'react';
import { ChevronRight, Home, GraduationCap } from 'lucide-react';

/**
 * CampusBanner Component
 * Official hero banner with campus architectural motif,
 * dark navy institutional gradient overlay, page title, subtitle, and breadcrumb trail.
 *
 * @param {Object} props
 * @param {string} [props.title='Academic Curriculum'] - Primary banner title
 * @param {string} [props.subtitle='Official Course Structures, Syllabi & Evaluation Schemes'] - Explanatory subtitle
 * @param {Array<{label: string, href?: string}>} [props.breadcrumbs] - Breadcrumb navigation items
 * @param {string} [props.badge='NEP 2020 Aligned'] - Optional pill badge text
 * @param {string} [props.bgImage] - Optional background image URL
 */
const CampusBanner = ({
  title = 'Academic Curriculum',
  subtitle = 'Official Course Structures, Syllabi & Evaluation Schemes',
  breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Curriculum' }
  ],
  badge = 'NEP 2020 Aligned',
  bgImage
}) => {
  return (
    <div className="relative bg-institute-navyDark text-white overflow-hidden shadow-md">
      {/* Background Layer: Optional image or geometric architectural backdrop */}
      {bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Subtle Institutional Architectural Grid / Geometric Pattern */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="campus-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.4" />
                <circle cx="24" cy="24" r="1.5" fill="#FFFFFF" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#campus-grid)" />
          </svg>
        </div>
      )}

      {/* Dark Navy Institutional Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-institute-navyDark/95 via-institute-navy/90 to-institute-navyDark/85" />

      {/* Gold Top Accent Line */}
      <div className="relative h-1 bg-gradient-to-r from-institute-gold via-amber-400 to-yellow-500" />

      {/* Banner Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-14">
        
        {/* Breadcrumb Navigation Trail */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-300">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={idx} className="flex items-center gap-1.5">
                    {idx === 0 && <Home className="w-3.5 h-3.5 text-institute-gold flex-shrink-0" />}
                    {crumb.href && !isLast ? (
                      <a
                        href={crumb.href}
                        className="hover:text-institute-gold text-slate-300 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className={isLast ? 'text-institute-gold font-semibold' : 'text-slate-300'}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Title & Badge */}
        <div className="max-w-3xl">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-institute-gold/20 text-institute-gold border border-institute-gold/30 mb-3 backdrop-blur-sm">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-base md:text-lg text-slate-300 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

      </div>

      {/* Decorative Bottom Wave / Border Accent */}
      <div className="h-1 bg-institute-gold/40" />
    </div>
  );
};

export default CampusBanner;

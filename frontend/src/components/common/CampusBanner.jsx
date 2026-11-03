import React from 'react';
import backgroundImage from '../../assets/images/backgroundImage.png';

/**
 * CampusBanner Component
 * Renders the panoramic campus photograph banner with title and subtitle
 * matching the proposed student UI mockup.
 */
const CampusBanner = ({
  title = 'Curriculum',
  subtitle = 'Explore semester-wise curriculum and course syllabi for all batches.',
  bgImage
}) => {
  const image = bgImage || backgroundImage;

  return (
    <div className="relative w-full h-36 sm:h-44 md:h-48 bg-slate-900 overflow-hidden shadow-sm flex items-center">
      {/* Campus Background Image */}
      <img
        src={image}
        alt="IIIT Bhagalpur Campus Banner"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      
      {/* Translucent overlay on left for typography readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none" />

      {/* Banner Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-slate-100 max-w-xl font-normal drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default CampusBanner;

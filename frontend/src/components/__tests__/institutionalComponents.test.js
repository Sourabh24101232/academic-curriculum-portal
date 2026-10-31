import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert';

import TopBar from '../common/TopBar.jsx';
import Header from '../common/Header.jsx';
import CampusBanner from '../common/CampusBanner.jsx';
import Footer from '../common/Footer.jsx';
import App from '../../App.jsx';

console.log('--- Testing Step 30 Institutional Components ---');

// 1. TopBar Component Test
{
  const html = renderToString(React.createElement(TopBar));
  assert(html.includes('Ministry of Education, Govt. of India'), 'TopBar should contain Ministry of Education text');
  assert(html.includes('हिंदी'), 'TopBar should contain Hindi language indicator');
  assert(html.includes('English'), 'TopBar should contain English language indicator');
  assert(html.includes('bg-institute-navyDark'), 'TopBar should use dark navy background token');
  console.log('✓ TopBar: successfully rendered with language indicator and institutional affiliation');
}

// 2. Header Component Test
{
  const html = renderToString(React.createElement(Header));
  assert(html.includes('भारतीय सूचना प्रौद्योगिकी संस्थान भागलपुर'), 'Header should contain Hindi title');
  assert(html.includes('Indian Institute of Information Technology Bhagalpur'), 'Header should contain English title');
  assert(html.includes('An Institute of National Importance under an Act of Parliament'), 'Header should contain subtitle');
  assert(html.includes('IIIT BHAGALPUR'), 'Header should contain IIIT Bhagalpur text in seal');
  assert(html.includes('विद्या ददाति विनयं'), 'Header seal should contain Sanskrit motto');
  assert(html.includes('Azadi Ka Amrit Mahotsav'), 'Header should contain Azadi Ka Amrit Mahotsav logo');
  assert(html.includes('75'), 'Header should contain 75 Azadi emblem');
  console.log('✓ Header: successfully rendered with circular crest seal, bilingual title, and Azadi emblem');
}

// 3. CampusBanner Component Test
{
  const defaultBanner = renderToString(React.createElement(CampusBanner));
  assert(defaultBanner.includes('Academic Curriculum'), 'CampusBanner should display default title');
  assert(defaultBanner.includes('Official Course Structures, Syllabi &amp; Evaluation Schemes') || defaultBanner.includes('Evaluation Schemes'), 'CampusBanner should display default subtitle');
  assert(defaultBanner.includes('Curriculum'), 'CampusBanner should contain breadcrumbs');
  assert(defaultBanner.includes('NEP 2020 Aligned'), 'CampusBanner should display NEP 2020 badge');

  const customBanner = renderToString(React.createElement(CampusBanner, {
    title: 'Computer Science & Engineering',
    subtitle: 'Undergraduate B.Tech Degree Syllabus',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Programmes', href: '/programmes' },
      { label: 'CSE' }
    ],
    badge: 'Autonomous Scheme'
  }));
  assert(customBanner.includes('Computer Science &amp; Engineering') || customBanner.includes('Computer Science & Engineering'), 'CampusBanner should display custom title');
  assert(customBanner.includes('Undergraduate B.Tech Degree Syllabus'), 'CampusBanner should display custom subtitle');
  assert(customBanner.includes('Autonomous Scheme'), 'CampusBanner should display custom badge');
  console.log('✓ CampusBanner: successfully rendered with default and custom props');
}

// 4. Footer Component Test
{
  const html = renderToString(React.createElement(Footer));
  // Col 1: Contact
  assert(html.includes('Contact Information'), 'Footer should contain Col 1 Contact Information');
  assert(html.includes('Sabour'), 'Footer should mention Sabour location');
  assert(html.includes('813210'), 'Footer should contain PIN code 813210');
  assert(html.includes('academic@iiitbh.ac.in'), 'Footer should contain academic email');

  // Col 2: Quick Links
  assert(html.includes('Quick Links'), 'Footer should contain Col 2 Quick Links');
  assert(html.includes('Academic Calendar'), 'Footer should link Academic Calendar');
  assert(html.includes('Academic Ordinances'), 'Footer should link Academic Ordinances');

  // Col 3: Academic Programmes
  assert(html.includes('Academic Programmes'), 'Footer should contain Col 3 Academic Programmes');
  assert(html.includes('Computer Science &amp; Engineering') || html.includes('Computer Science & Engineering'), 'Footer should list CSE');
  assert(html.includes('Electronics &amp; Communication Engg') || html.includes('Electronics & Communication Engg'), 'Footer should list ECE');
  assert(html.includes('Mechatronics &amp; Automation Engg') || html.includes('Mechatronics & Automation Engg'), 'Footer should list MEA');

  // Col 4: Resources
  assert(html.includes('Useful Resources'), 'Footer should contain Col 4 Resources');
  assert(html.includes('Central Library'), 'Footer should list Central Library');
  assert(html.includes('Anti-Ragging'), 'Footer should list Anti-Ragging');

  // Bottom Bar
  assert(html.includes('Copyright &copy; 2026') || html.includes('Copyright © 2026'), 'Footer should contain 2026 copyright');
  assert(html.includes('border-institute-gold'), 'Footer should have gold accent border');
  console.log('✓ Footer: successfully rendered with 4-column layout, contact info, and copyright');
}

import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../App.jsx';

// 5. Integrated App Test
{
  const html = renderToString(
    React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(AppRoutes))
  );
  assert(html.includes('Indian Institute of Information Technology Bhagalpur'), 'App should contain Header');
  assert(html.includes('Ministry of Education'), 'App should contain TopBar');
  assert(html.includes('Academic Curriculum'), 'App should contain CampusBanner');
  assert(html.includes('academic@iiitbh.ac.in'), 'App should contain Footer');
  console.log('✓ App: successfully rendered all institutional components together');
}

console.log('--- ALL STEP 30 COMPONENT TESTS PASSED ---');


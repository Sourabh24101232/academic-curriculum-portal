import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert';

import FilterBar from '../student/FilterBar.jsx';

console.log('--- Testing Step 32 Student Reactive Filter Bar Component ---');

// 1. Rendering Verification: 4 Select Dropdowns & Options
{
  const html = renderToString(React.createElement(FilterBar));

  // Check Dropdown IDs
  assert(html.includes('id="filter-programme"'), 'FilterBar must render Programme select');
  assert(html.includes('id="filter-batch"'), 'FilterBar must render Batch select');
  assert(html.includes('id="filter-branch"'), 'FilterBar must render Branch select');
  assert(html.includes('id="filter-semester"'), 'FilterBar must render Semester select');

  // Check Default Option Prompts
  assert(html.includes('Select Programme'), 'FilterBar must include "Select Programme" placeholder option');
  assert(html.includes('Select Batch'), 'FilterBar must include "Select Batch" placeholder option');
  assert(html.includes('Select Branch'), 'FilterBar must include "Select Branch" placeholder option');
  assert(html.includes('Select Semester'), 'FilterBar must include "Select Semester" placeholder option');

  // Check Programme Options
  assert(html.includes('<option value="BTech">BTech</option>'), 'Must render BTech option');
  assert(html.includes('<option value="MTech">MTech</option>'), 'Must render MTech option');
  assert(html.includes('<option value="PhD">PhD</option>'), 'Must render PhD option');

  // Check Batch Options
  assert(html.includes('2024 - 2028'), 'Must render 2024 - 2028 batch option');
  assert(html.includes('2026 - 2030'), 'Must render 2026 - 2030 batch option');

  // Check Branch Options
  assert(html.includes('<option value="CSE">CSE</option>'), 'Must render CSE option');
  assert(html.includes('<option value="MnC">MnC</option>'), 'Must render MnC option');
  assert(html.includes('<option value="ECE">ECE</option>'), 'Must render ECE option');
  assert(html.includes('<option value="MAE">MAE</option>'), 'Must render MAE option');

  // Check Semester Options
  assert(html.includes('<option value="Semester 1">Semester 1</option>'), 'Must render Semester 1');
  assert(html.includes('<option value="Semester 8">Semester 8</option>'), 'Must render Semester 8');
  assert(html.includes('<option value="All Semesters">All Semesters</option>'), 'Must render All Semesters option');

  console.log('✓ FilterBar: Successfully renders Programme, Batch, Branch, and Semester dropdowns with complete options');
}

// 2. Strict Design Invariant: STRICTLY NO SEARCH BAR
{
  const html = renderToString(React.createElement(FilterBar));

  // Assert NO <input> elements at all in the component
  assert(!html.includes('<input'), 'STRICT REQUIREMENT: FilterBar must NOT contain any <input> element (NO search bar)');
  assert(!html.includes('type="search"'), 'STRICT REQUIREMENT: FilterBar must NOT contain search input type');
  assert(!html.includes('type="text"'), 'STRICT REQUIREMENT: FilterBar must NOT contain text input type');
  assert(!html.includes('search'), 'STRICT REQUIREMENT: FilterBar must NOT contain search-related terms or classes');

  console.log('✓ FilterBar: STRICTLY NO SEARCH BAR invariant strictly verified (0 input elements)');
}

// 3. Reset Filters Action Button Verification
{
  // Test with no active filters (Reset button should be disabled)
  const emptyHtml = renderToString(React.createElement(FilterBar, {
    filters: { programme: '', batch: '', branch: '', semester: '' }
  }));
  assert(emptyHtml.includes('Reset Filters'), 'FilterBar must render "Reset Filters" button');
  assert(emptyHtml.includes('disabled=""') || emptyHtml.includes('disabled'), 'Reset button must be disabled when no filters are active');

  // Test with active filters (Reset button should be enabled)
  const activeHtml = renderToString(React.createElement(FilterBar, {
    filters: { programme: 'BTech', batch: '2024 - 2028', branch: 'CSE', semester: 'Semester 5' }
  }));
  assert(activeHtml.includes('Reset Filters'), 'FilterBar must render "Reset Filters" button with active filters');
  assert(activeHtml.includes('Active Filters Applied'), 'FilterBar should show active filter indicator');

  console.log('✓ FilterBar: Successfully renders Reset Filters button with proper active/disabled state');
}

// 4. Custom Options Prop Override Verification
{
  const customHtml = renderToString(React.createElement(FilterBar, {
    options: {
      programmes: ['BTech'],
      batches: ['2024 - 2028'],
      branches: ['CSE'],
      semesters: ['Semester 5', 'All Semesters']
    }
  }));

  assert(customHtml.includes('<option value="BTech">BTech</option>'), 'Custom programme rendered');
  assert(!customHtml.includes('<option value="PhD">PhD</option>'), 'Overridden options should exclude unprovided programmes');
  assert(customHtml.includes('2024 - 2028'), 'Custom batch rendered');
  assert(!customHtml.includes('2023 - 2027'), 'Overridden options should exclude unprovided batches');

  console.log('✓ FilterBar: Successfully accepts and renders dynamic options prop overrides');
}

console.log('--- ALL STEP 32 FILTERBAR TESTS PASSED ---');

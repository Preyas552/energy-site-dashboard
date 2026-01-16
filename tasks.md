# Implementation Plan: Next.js Solar Site Selector

## Overview

This implementation plan breaks down the development of the Solar Site Selector into discrete, manageable tasks. Each task builds incrementally on previous work, ensuring the application remains functional at each stage.

**Development Approach:**
- Start with core infrastructure (Next.js setup, basic map)
- Add grid system and selection logic
- Integrate NASA POWER API and data processing
- Implement fuzzy number generation
- Connect Python TOPSIS service
- Add results visualization
- Polish and optimize

---

## Tasks

- [x] 1. Project Setup and Infrastructure
  - Create new Next.js 14+ project with TypeScript in "energy-site-selector" directory
  - Configure environment variables (.env.local, .env.example)
  - Install core dependencies (Mapbox GL JS, Deck.gl, TypeScript types)
  - Set up project structure (/app, /lib, /components)
  - Configure ESLint and Prettier
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Basic Map Implementation
  - Create MapContainer client component with Mapbox GL JS
  - Configure Mapbox token from environment variables
  - Set up initial viewport (centered on GTA region)
  - Implement basic map controls (zoom, pan)
  - Add loading state for map initialization
  - _Requirements: 2.1_

- [x] 3. Grid System Core Logic
  - Create gridUtils.ts with grid generation function
  - Implement GridCell interface and type definitions
  - Write function to generate grid cells based on bounds and cell size
  - Add function to convert km to lat/lng degrees
  - Create unit tests for grid generation
  - _Requirements: 2.2_



- [x] 4. Interactive Grid Layer
  - Create GridLayer component using Deck.gl PolygonLayer
  - Implement cell click handler to toggle selection
  - Add visual states (unselected, selected, merged)
  - Render grid overlay on map
  - Update cell colors based on selection state
  - _Requirements: 2.3, 2.4_

- [x] 5. Cell Selection State Management
  - Add selectedCells state to MapContainer
  - Implement handleCellClick function
  - Create selection counter display
  - Add "Clear Selection" button
  - Update UI to show cell count
  - _Requirements: 2.5, 11.1_

- [x] 6. Adjacent Cell Detection
  - Implement areAdjacent function in gridUtils.ts
  - Add tolerance for floating-point comparison
  - Handle both vertical and horizontal neighbors
  - Create unit tests for adjacency detection
  - _Requirements: 3.1_

- [x] 7. Site Merging Algorithm
  - Implement mergeCells function using BFS algorithm
  - Create Site interface with cells and centroid
  - Add calculateCentroid helper function
  - Update UI to show merged site count
  - Add visual indication for merged sites (distinct border)
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Control Panel UI
  - Create ControlPanel component
  - Add selection info display (cells selected, sites after merging)
  - Implement "Analyze Sites" button
  - Add "Clear Selection" button
  - Disable "Analyze" button when no cells selected
  - _Requirements: 11.2, 11.3, 11.5_



- [ ] 9. NASA POWER API Route
  - Create /app/api/nasa-power/route.ts
  - Implement POST handler for solar data requests
  - Add fetchNASAPower function for API calls
  - Handle current year and historical year parameters
  - Implement error handling and response formatting
  - _Requirements: 4.2, 4.3, 10.1, 10.2_

- [ ] 10. Solar Data Processing
  - Create processCurrentYear function to parse NASA POWER response
  - Create processHistorical function for 5-year data
  - Calculate daily averages from raw data
  - Extract GHI, DNI, DHI values
  - Format data into SolarData interface
  - _Requirements: 5.1, 5.2_

- [ ] 11. Historical Statistics Calculation
  - Implement calculateStatistics function
  - Compute mean, standard deviation, min, max
  - Calculate coefficient of variation
  - Identify seasonal patterns (optional for v1)
  - Store processed statistics for each site
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 12. Fuzzy Number Generation
  - Create fuzzyUtils.ts with fuzzy number functions
  - Implement generateFuzzyFromHistorical function
  - Use historical mean ± std_dev for bounds
  - Use current year average as most_likely value
  - Create FuzzyNumber interface
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13. Confidence Calculation
  - Implement calculateConfidence function
  - Factor in sample size (number of years)
  - Factor in data consistency (coefficient of variation)
  - Factor in current year alignment with historical
  - Return confidence score (0-1)
  - _Requirements: 6.5_



- [ ] 14. Fuzzy Site Data Consolidation
  - Create consolidateFuzzySiteData function
  - Generate fuzzy numbers for all criteria (solar potential, land suitability, etc.)
  - Create FuzzySiteData interface
  - Add metadata (historical years, confidence)
  - Format data for TOPSIS service
  - _Requirements: 6.5_

- [ ] 15. Python TOPSIS Service Setup
  - Copy existing fuzzy_topsis.py to new topsis-service directory
  - Create Flask app.py with /api/fuzzy-topsis/analyze endpoint
  - Implement request parsing for fuzzy alternatives
  - Convert JSON fuzzy numbers to TriangularFuzzyNumber objects
  - Return rankings in standardized format
  - _Requirements: 9.1, 9.3_

- [ ] 16. TOPSIS API Route
  - Create /app/api/topsis/route.ts
  - Implement POST handler to proxy requests to Python service
  - Transform Next.js request format to Python service format
  - Parse Python service response
  - Map rankings back to site IDs
  - _Requirements: 9.2, 10.3_

- [ ] 17. Analysis Workflow Integration
  - Create analyzeAllSites function in MapContainer
  - Fetch solar data for all sites in parallel
  - Process historical data and generate fuzzy numbers
  - Send fuzzy data to TOPSIS service
  - Handle loading states during analysis
  - _Requirements: 4.1, 4.4, 7.1, 7.2_

- [ ] 18. Progress Indicator
  - Add analysis progress state to MapContainer
  - Display "Fetching data for site X of Y" message
  - Show progress bar or spinner
  - Update progress as each site completes
  - Handle partial failures gracefully
  - _Requirements: 4.4, 4.5, 11.4_



- [ ] 19. Results Visualization on Map
  - Update GridLayer to show ranked sites
  - Implement color coding based on rank (green → yellow → red)
  - Display rank numbers on each site
  - Add special highlight for #1 ranked site
  - Update site styling after analysis completes
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 20. Results Panel Component
  - Create ResultsPanel component
  - Display ranked list of sites
  - Show TOPSIS score for each site
  - Display viability category (Excellent/Good/Fair/Poor)
  - Add click handler to focus map on selected site
  - _Requirements: 7.5, 8.4_

- [ ] 21. Site Details Popup
  - Create SiteDetailsPopup component
  - Show detailed metrics when site is clicked
  - Display fuzzy criteria values (lower, most_likely, upper)
  - Show confidence score
  - Display historical data summary
  - _Requirements: 8.4_

- [ ] 22. Error Handling Implementation
  - Create error state management in MapContainer
  - Implement handleAnalysisError function
  - Display user-friendly error messages
  - Add retry logic for failed API calls
  - Log detailed errors to console
  - _Requirements: 9.4, 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 23. API Response Caching
  - Implement cache mechanism for NASA POWER responses
  - Set 24-hour TTL for cached data
  - Create cache key from lat/lng coordinates
  - Add cache hit/miss logging
  - Implement cache invalidation strategy
  - _Requirements: 10.4_



- [ ] 24. Performance Optimization
  - Implement lazy loading for MapContainer component
  - Add code splitting for Deck.gl library
  - Optimize bundle size with tree shaking
  - Implement parallel API calls for multiple sites
  - Add memoization for expensive calculations
  - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [ ] 25. Environment Configuration
  - Create .env.example with all required variables
  - Document each environment variable
  - Add validation for required variables at build time
  - Implement proper NEXT_PUBLIC_ prefixing
  - Add environment-specific configurations
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 26. Docker Configuration
  - Create Dockerfile for Next.js application
  - Create Dockerfile for Python TOPSIS service
  - Create docker-compose.yml for both services
  - Configure service networking
  - Add health check endpoints
  - _Requirements: 15.2, 15.3, 15.5_

- [ ] 27. Deployment Configuration
  - Create vercel.json for Vercel deployment
  - Configure build and dev commands
  - Set up environment variables in Vercel
  - Configure CORS settings for API routes
  - Test deployment process
  - _Requirements: 15.1, 15.4_

- [ ]* 28. Unit Tests
  - Write tests for gridUtils functions
  - Write tests for fuzzyUtils functions
  - Write tests for site merging algorithm
  - Write tests for confidence calculation
  - Achieve 70%+ code coverage
  - _Requirements: Testing strategy_



- [ ]* 29. Integration Tests
  - Test NASA POWER API route with real API calls
  - Test TOPSIS API route with Python service
  - Test complete analysis workflow end-to-end
  - Test error handling scenarios
  - Test caching behavior
  - _Requirements: Testing strategy_

- [ ]* 30. Documentation
  - Create comprehensive README.md
  - Document setup instructions
  - Add API route documentation
  - Document environment variables
  - Create deployment guide
  - _Requirements: Documentation needs_

---

## Task Execution Notes

**Order of Execution:**
1. Tasks 1-8: Core infrastructure and grid system
2. Tasks 9-14: Data fetching and fuzzy number generation
3. Tasks 15-18: TOPSIS integration and analysis workflow
4. Tasks 19-21: Results visualization
5. Tasks 22-27: Polish, optimization, and deployment
6. Tasks 28-30: Testing and documentation (optional)

**Dependencies:**
- Task 4 depends on Task 3 (grid logic before grid layer)
- Task 7 depends on Task 6 (adjacency detection before merging)
- Task 10 depends on Task 9 (API route before processing)
- Task 12 depends on Task 11 (statistics before fuzzy generation)
- Task 16 depends on Task 15 (Python service before API route)
- Task 17 depends on Tasks 9-16 (all data processing complete)
- Task 19 depends on Task 17 (analysis before visualization)

**Estimated Time:**
- Core infrastructure (Tasks 1-8): 8-12 hours
- Data processing (Tasks 9-14): 10-14 hours
- TOPSIS integration (Tasks 15-18): 6-8 hours
- Visualization (Tasks 19-21): 6-8 hours
- Polish and deployment (Tasks 22-27): 8-10 hours
- Testing and docs (Tasks 28-30): 6-8 hours (optional)

**Total: 44-60 hours (5-7 days of focused work)**

---

## Success Criteria

The implementation is complete when:
- ✅ User can select grid cells on the map
- ✅ Adjacent cells automatically merge into sites
- ✅ "Analyze Sites" button fetches real NASA POWER data
- ✅ Historical data is processed into fuzzy numbers
- ✅ Fuzzy TOPSIS ranks all sites
- ✅ Results display on map with color coding
- ✅ #1 ranked site is clearly highlighted
- ✅ Application is deployable via Docker or Vercel
- ✅ No bloat - only essential features implemented

# Requirements Document: Next.js Solar Site Selector

## Introduction

This document outlines the requirements for creating a **completely separate, standalone** Next.js application for interactive solar energy site selection. This is a focused, minimal application that allows users to select grid cells on a map, fetches real solar data from APIs, converts that data to fuzzy numbers using historical patterns, and ranks sites using fuzzy TOPSIS algorithm.

**Core Workflow:**
1. User selects grid cells on an interactive map
2. Adjacent cells automatically merge into single sites
3. System fetches current year + 5-year historical solar data from NASA POWER API
4. System calculates fuzzy numbers from historical data (lower, most_likely, upper bounds)
5. Fuzzy TOPSIS algorithm ranks all selected sites
6. User sees ranked results with best site highlighted

**Scope:**
- Solar infrastructure only (wind support planned for future)
- Minimal UI - only essential controls
- No bloat - only necessary systems
- Standalone application in separate directory

## Glossary

- **Next.js Application**: The standalone web application built with Next.js 14+ App Router
- **Interactive Grid**: Clickable grid overlay on the map where users select potential sites
- **Grid Cell**: Individual square in the grid (default 1km x 1km)
- **Site**: One or more adjacent grid cells merged together as a single location
- **NASA POWER API**: External API providing 5-year historical solar irradiance data
- **Google Solar API**: External API providing solar potential data for specific locations
- **Fuzzy Number**: Triangular fuzzy number (lower, most_likely, upper) representing uncertainty
- **Fuzzy TOPSIS**: Multi-criteria decision analysis algorithm using fuzzy numbers
- **Historical Data**: Past 5 years of daily solar irradiance measurements
- **Current Year Data**: Solar data for the current calendar year
- **Consolidated Fuzzy Data**: Fuzzy numbers generated from statistical analysis of historical data

## Requirements

### Requirement 1: Standalone Project Structure

**User Story:** As a developer, I want to create a completely separate Next.js application, so that it can be developed, deployed, and maintained independently.

#### Acceptance Criteria

1. THE Next.js Application SHALL be created in a new directory named "energy-site-selector" at the root level
2. THE Next.js Application SHALL have its own package.json with independent dependencies
3. THE Next.js Application SHALL not share any code directly with the smart-city-platform
4. THE Next.js Application SHALL have its own environment configuration (.env.local)
5. THE Next.js Application SHALL have its own deployment configuration independent of other projects

### Requirement 2: Interactive Grid System

**User Story:** As a user, I want to click on grid cells on a map, so that I can select potential locations for solar panel installation.

#### Acceptance Criteria

1. WHEN the application loads, THE Next.js Application SHALL display a Mapbox map with a visible grid overlay
2. THE Next.js Application SHALL render grid cells of configurable size (default 1km x 1km)
3. WHEN a user clicks on an unselected grid cell, THE Next.js Application SHALL highlight it and add it to the selection
4. WHEN a user clicks on a selected grid cell, THE Next.js Application SHALL deselect it and remove the highlight
5. THE Next.js Application SHALL display the count of selected grid cells in the UI

### Requirement 3: Adjacent Cell Merging

**User Story:** As a user, I want adjacent selected cells to be treated as a single site, so that larger contiguous areas are analyzed together.

#### Acceptance Criteria

1. WHEN multiple adjacent grid cells are selected, THE Next.js Application SHALL automatically detect and merge them into a single site
2. THE Next.js Application SHALL calculate the centroid (center point) of merged cells as the site's coordinates
3. THE Next.js Application SHALL visually indicate merged sites with a distinct border or grouping
4. WHEN a cell is deselected from a merged site, THE Next.js Application SHALL recalculate site boundaries
5. THE Next.js Application SHALL display the number of unique sites (after merging) separately from total selected cells

### Requirement 4: Solar Data Fetching

**User Story:** As a user, I want the system to fetch real solar data for my selected sites, so that the analysis is based on actual conditions.

#### Acceptance Criteria

1. WHEN a user clicks "Analyze Sites" button, THE Next.js Application SHALL fetch solar data for all selected site centroids
2. THE Next.js Application SHALL fetch current year solar data from NASA POWER API for each site
3. THE Next.js Application SHALL fetch 5-year historical solar data from NASA POWER API for each site
4. THE Next.js Application SHALL display a loading indicator showing progress (e.g., "Fetching data for site 2 of 4")
5. IF an API call fails for a site, THE Next.js Application SHALL display an error for that specific site and continue with others

### Requirement 5: Historical Data Processing

**User Story:** As a developer, I want to process historical solar data into statistical measures, so that fuzzy numbers can be generated accurately.

#### Acceptance Criteria

1. WHEN historical data is received, THE Next.js Application SHALL calculate the average solar irradiance for the past 5 years
2. THE Next.js Application SHALL calculate the average solar irradiance for the current year
3. THE Next.js Application SHALL compute statistical measures (mean, standard deviation, min, max) from historical data
4. THE Next.js Application SHALL identify seasonal patterns in the historical data
5. THE Next.js Application SHALL store processed data for each site before fuzzy conversion

### Requirement 6: Fuzzy Number Generation

**User Story:** As a user, I want solar data converted to fuzzy numbers, so that uncertainty and variability are represented in the analysis.

#### Acceptance Criteria

1. WHEN statistical analysis is complete, THE Next.js Application SHALL generate triangular fuzzy numbers for each criterion
2. THE Next.js Application SHALL use historical data to determine lower bound (pessimistic scenario)
3. THE Next.js Application SHALL use current year average as the most_likely value (expected scenario)
4. THE Next.js Application SHALL use historical data to determine upper bound (optimistic scenario)
5. THE Next.js Application SHALL consolidate all criteria into fuzzy format before TOPSIS analysis

### Requirement 7: Fuzzy TOPSIS Analysis

**User Story:** As a user, I want sites ranked using fuzzy TOPSIS algorithm, so that I can identify the best location for solar infrastructure.

#### Acceptance Criteria

1. WHEN fuzzy data is ready for all sites, THE Next.js Application SHALL execute fuzzy TOPSIS algorithm
2. THE Next.js Application SHALL use multiple criteria (solar potential, land suitability, grid proximity)
3. THE Next.js Application SHALL calculate TOPSIS scores for each site (0-100 scale)
4. THE Next.js Application SHALL rank sites from best (rank 1) to worst based on TOPSIS scores
5. THE Next.js Application SHALL display rankings with scores and viability categories

### Requirement 8: Results Visualization

**User Story:** As a user, I want to see ranked results on the map, so that I can visually compare site quality.

#### Acceptance Criteria

1. WHEN TOPSIS analysis completes, THE Next.js Application SHALL display ranked sites on the map
2. THE Next.js Application SHALL color-code sites based on rank (green for best, red for worst)
3. THE Next.js Application SHALL display rank numbers on each site
4. WHEN a user clicks on a ranked site, THE Next.js Application SHALL show detailed metrics in a popup
5. THE Next.js Application SHALL highlight the #1 ranked site with a special indicator

### Requirement 9: Python TOPSIS Service Integration

**User Story:** As a developer, I want to use the existing Python fuzzy TOPSIS implementation, so that I don't need to reimplement complex algorithms.

#### Acceptance Criteria

1. THE Next.js Application SHALL communicate with a separate Python Flask service for TOPSIS calculations
2. THE Next.js Application SHALL send fuzzy data to the Python service via API routes
3. THE Python Service SHALL execute fuzzy TOPSIS algorithm and return rankings
4. THE Next.js Application SHALL handle Python service errors gracefully
5. THE Python Service SHALL be deployable as a separate container or process

### Requirement 10: API Routes Layer

**User Story:** As a developer, I want Next.js API routes to handle external API calls, so that API keys are protected and caching can be implemented.

#### Acceptance Criteria

1. THE Next.js Application SHALL implement API routes in /app/api for all external service calls
2. WHEN fetching NASA POWER data, THE Next.js Application SHALL use server-side API routes
3. WHEN fetching Google Solar API data, THE Next.js Application SHALL implement rate limiting
4. THE Next.js Application SHALL cache API responses for identical locations with 24-hour TTL
5. THE Next.js Application SHALL implement proper error handling for all API calls

### Requirement 11: Minimal UI Controls

**User Story:** As a user, I want simple, essential controls, so that I can focus on site selection without distractions.

#### Acceptance Criteria

1. THE Next.js Application SHALL provide a "Clear Selection" button to reset all selected cells
2. THE Next.js Application SHALL provide an "Analyze Sites" button to trigger the analysis
3. THE Next.js Application SHALL display selection count (cells selected, sites after merging)
4. THE Next.js Application SHALL show analysis progress during data fetching
5. THE Next.js Application SHALL NOT include unnecessary features or complex controls

### Requirement 12: Environment Configuration

**User Story:** As a developer, I want to manage API keys securely, so that credentials are protected.

#### Acceptance Criteria

1. THE Next.js Application SHALL use .env.local for environment variables
2. THE Next.js Application SHALL prefix client-side variables with NEXT_PUBLIC_
3. THE Next.js Application SHALL keep server-side API keys without the NEXT_PUBLIC_ prefix
4. THE Next.js Application SHALL provide .env.example with all required variables documented
5. THE Next.js Application SHALL validate required environment variables at build time

### Requirement 13: Performance Optimization

**User Story:** As a user, I want the application to load quickly and run smoothly, so that I can efficiently analyze sites.

#### Acceptance Criteria

1. THE Next.js Application SHALL lazy load the map component only when needed
2. THE Next.js Application SHALL implement code splitting for large libraries (Mapbox, Deck.gl)
3. THE Next.js Application SHALL optimize bundle size with tree shaking
4. THE Next.js Application SHALL achieve a Lighthouse performance score of 85+ on desktop
5. THE Next.js Application SHALL handle up to 20 selected sites without performance degradation

### Requirement 14: Error Handling

**User Story:** As a user, I want clear error messages, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an API call fails, THE Next.js Application SHALL display a user-friendly error message
2. WHEN no cells are selected, THE Next.js Application SHALL disable the "Analyze Sites" button
3. WHEN TOPSIS analysis fails, THE Next.js Application SHALL show which step failed
4. WHEN network connectivity is lost, THE Next.js Application SHALL display a connection error
5. THE Next.js Application SHALL log detailed errors to the console for debugging

### Requirement 15: Deployment Configuration

**User Story:** As a developer, I want to deploy the application easily, so that it can be shared with users.

#### Acceptance Criteria

1. THE Next.js Application SHALL support deployment to Vercel with zero configuration
2. THE Next.js Application SHALL provide Docker configuration for containerized deployment
3. THE Next.js Application SHALL configure proper CORS settings for API routes
4. THE Next.js Application SHALL implement health check endpoints for monitoring
5. THE Python TOPSIS Service SHALL be deployable alongside the Next.js application

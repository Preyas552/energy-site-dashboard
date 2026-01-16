# Implementation Plan

- [x] 1. Implement crisp TOPSIS backend service
  - [x] 1.1 Add CrispTOPSIS class to topsis-service/app.py
    - Implement __init__ method to accept numeric alternatives, weights, and criteria types
    - Implement normalize_matrix method using vector normalization
    - Implement calculate_weighted_matrix method
    - Implement calculate_ideal_solutions method for benefit/cost criteria
    - Implement calculate_distances method using Euclidean distance
    - Implement calculate_closeness_coefficients method
    - Implement rank method to orchestrate the complete crisp TOPSIS flow
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.2 Add /api/crisp-topsis/analyze endpoint to topsis-service/app.py
    - Create POST endpoint that accepts alternatives, weights, and criteria_types
    - Parse request JSON data
    - Instantiate CrispTOPSIS with parsed data
    - Call rank method and return rankings in JSON format
    - Add error handling for invalid inputs and calculation errors
    - _Requirements: 2.1, 2.6_

- [x] 2. Create frontend API route for crisp TOPSIS
  - [x] 2.1 Create energy-site-selector/app/api/topsis/crisp/route.ts
    - Implement POST handler that accepts sites and weights
    - Extract most_likely values from fuzzy site criteria (solar_potential, land_suitability, grid_proximity, installation_cost)
    - Extract most_likely values from fuzzy weights
    - Create crisp alternatives array with extracted values
    - Define criteria types array (benefit/cost)
    - Call Python crisp TOPSIS service at /api/crisp-topsis/analyze
    - Transform Python response to frontend TOPSISResult format
    - Add error handling for service failures
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Add comparison type definitions and utilities
  - [x] 3.1 Extend energy-site-selector/lib/topsisTypes.ts with comparison types
    - Add ComparisonMetrics interface (sites_with_rank_changes, max_rank_difference, average_score_difference, rank_correlation)
    - Add ComparisonResult interface (site_id, fuzzy_rank, crisp_rank, rank_change, fuzzy_score, crisp_score, score_difference, location, criteria_scores)
    - Add ComparisonData interface (fuzzy_results, crisp_results, comparison_results, metrics)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 3.2 Create energy-site-selector/lib/comparisonUtils.ts
    - Implement calculateComparisonMetrics function to merge fuzzy and crisp results
    - Calculate sites_with_rank_changes by counting rank differences
    - Calculate max_rank_difference across all sites
    - Calculate average_score_difference between methods
    - Implement calculateSpearmanCorrelation helper function for rank correlation
    - Implement getRankChangeIcon helper (↑↓=)
    - Implement getRankChangeColor helper (green/red/gray)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Update ControlPanel component for comparison mode
  - [x] 4.1 Modify energy-site-selector/components/ControlPanel.tsx
    - Add comparisonMode prop to ControlPanelProps interface
    - Add onToggleComparison callback prop to ControlPanelProps interface
    - Add checkbox input for comparison mode toggle
    - Add label "Compare Fuzzy vs Crisp TOPSIS" next to checkbox
    - Add help text explaining comparison mode when enabled
    - Style comparison mode section with bg-gray-50 background
    - _Requirements: 4.1, 4.2_

- [x] 5. Enhance ResultsPanel component for comparison view
  - [x] 5.1 Update energy-site-selector/components/ResultsPanel.tsx interface
    - Add optional comparisonData prop to ResultsPanelProps
    - Update component to conditionally render comparison view when comparisonData is provided
    - _Requirements: 1.1, 1.2_

  - [x] 5.2 Create ComparisonSummary sub-component in ResultsPanel.tsx
    - Accept metrics prop (ComparisonMetrics)
    - Display sites_with_rank_changes in grid layout
    - Display max_rank_difference in grid layout
    - Display average_score_difference formatted to 2 decimals
    - Display rank_correlation formatted to 3 decimals
    - Style with bg-blue-50 background and blue text
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 5.3 Create ComparisonTable sub-component in ResultsPanel.tsx
    - Accept comparison_results prop (ComparisonResult[])
    - Create table with columns: Site, Fuzzy Rank, Crisp Rank, Change, Fuzzy Score, Crisp Score
    - Display site_id in first column
    - Display fuzzy_rank and crisp_rank with # prefix
    - Display rank change with icon (↑↓=) and color coding
    - Display fuzzy_score and crisp_score formatted to 1 decimal
    - Add hover effect on table rows
    - Make table horizontally scrollable
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 5.4 Implement comparison view layout in ResultsPanel.tsx
    - Render ComparisonSummary at top when comparisonData exists
    - Create two-column grid layout for side-by-side comparison
    - Render fuzzy results in left column with "Fuzzy TOPSIS" heading
    - Render crisp results in right column with "Crisp TOPSIS" heading
    - Render ComparisonTable below the two-column layout
    - Increase max-width to max-w-4xl for comparison view
    - _Requirements: 1.1, 1.2_

- [x] 6. Update MapContainer to orchestrate comparison analysis
  - [x] 6.1 Modify energy-site-selector/components/MapContainer.tsx
    - Add comparisonMode state variable (boolean)
    - Add comparisonData state variable (ComparisonData | null)
    - Add setComparisonMode state setter
    - Pass comparisonMode to ControlPanel component
    - Pass onToggleComparison handler to ControlPanel
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Update handleAnalyze function in MapContainer.tsx
    - Check if comparisonMode is enabled
    - If comparison mode: make parallel API calls to /api/topsis and /api/topsis/crisp using Promise.all
    - Parse both responses (fuzzyData and crispData)
    - Call calculateComparisonMetrics with both result sets
    - Set comparisonData state with calculated comparison
    - If not comparison mode: execute existing fuzzy-only analysis
    - Add loading indicators for both analyses
    - Handle errors from either API call gracefully
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 6.3 Update ResultsPanel usage in MapContainer.tsx
    - Pass comparisonData prop to ResultsPanel when in comparison mode
    - Pass regular results prop when not in comparison mode
    - Clear comparisonData when switching out of comparison mode
    - _Requirements: 1.1_

- [x] 7. Add export functionality for comparison results
  - [x] 7.1 Create energy-site-selector/lib/exportUtils.ts
    - Implement exportComparisonData function accepting comparisonData, weights, and format ('json' | 'csv')
    - For JSON format: create export object with timestamp, analysis_type, parameters, metrics, and results
    - For JSON format: create Blob and trigger download with filename topsis-comparison-{timestamp}.json
    - For CSV format: implement convertToCSV helper to transform comparison_results to CSV string
    - For CSV format: create Blob and trigger download with filename topsis-comparison-{timestamp}.csv
    - Implement downloadBlob helper function to create download link and trigger click
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 Add export button to ResultsPanel comparison view
    - Add "Export Results" button in comparison view header
    - Add dropdown or toggle for JSON/CSV format selection
    - Call exportComparisonData when button is clicked
    - Pass current comparisonData and weights to export function
    - Style button prominently with blue background
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

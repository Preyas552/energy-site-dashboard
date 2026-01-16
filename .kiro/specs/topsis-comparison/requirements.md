# Requirements Document

## Introduction

This feature enables side-by-side comparison of TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) analysis results using two approaches: traditional crisp TOPSIS with deterministic values and fuzzy TOPSIS with triangular fuzzy numbers. The comparison will help users understand the impact of uncertainty modeling on site ranking decisions for renewable energy site selection.

## Glossary

- **TOPSIS**: Technique for Order of Preference by Similarity to Ideal Solution, a multi-criteria decision analysis method
- **Fuzzy TOPSIS**: TOPSIS variant that uses fuzzy numbers to handle uncertainty and imprecision in criteria values
- **Crisp TOPSIS**: Traditional TOPSIS using deterministic (single-value) criteria
- **Triangular Fuzzy Number**: A fuzzy number represented by three values (lower, most_likely, upper)
- **Closeness Coefficient**: TOPSIS score indicating how close an alternative is to the ideal solution (0-1 scale)
- **Site**: A geographic location being evaluated for renewable energy installation
- **Criteria**: Evaluation factors including solar_potential, land_suitability, grid_proximity, and installation_cost
- **Ranking**: Ordered list of sites based on their TOPSIS scores
- **Application**: The energy site selector web application
- **TOPSIS Service**: The Python Flask backend service that performs TOPSIS calculations

## Requirements

### Requirement 1

**User Story:** As a renewable energy analyst, I want to compare fuzzy and crisp TOPSIS results side-by-side in the results panel, so that I can understand how uncertainty modeling affects site rankings

#### Acceptance Criteria

1. WHEN the user requests a comparison analysis, THE Application SHALL display both fuzzy TOPSIS and crisp TOPSIS results in the ResultsPanel component
2. THE Application SHALL present rankings from both methods in a two-column comparison layout within the ResultsPanel
3. THE Application SHALL highlight differences in rankings between the two methods using visual indicators
4. THE Application SHALL display closeness coefficients from both methods for each site in the comparison view
5. WHERE a site's rank differs between methods, THE Application SHALL show rank change arrows or badges next to the site entry

### Requirement 2

**User Story:** As a developer, I want a crisp TOPSIS implementation in the backend service, so that the system can perform traditional TOPSIS analysis without fuzzy numbers

#### Acceptance Criteria

1. THE TOPSIS Service SHALL implement a crisp TOPSIS algorithm using deterministic values
2. THE TOPSIS Service SHALL accept crisp input data with single values per criterion
3. THE TOPSIS Service SHALL normalize the decision matrix using vector normalization
4. THE TOPSIS Service SHALL calculate positive and negative ideal solutions for crisp values
5. THE TOPSIS Service SHALL compute closeness coefficients for crisp TOPSIS
6. THE TOPSIS Service SHALL return rankings ordered by closeness coefficient

### Requirement 3

**User Story:** As a system integrator, I want the frontend to convert fuzzy data to crisp values using the most_likely element, so that the same site data can be analyzed using both methods

#### Acceptance Criteria

1. THE Application SHALL extract the most_likely value from each triangular fuzzy number (solar_potential, land_suitability, grid_proximity, installation_cost)
2. THE Application SHALL create crisp alternatives as single numeric values using the extracted most_likely values
3. THE Application SHALL create crisp weights as single numeric values using the most_likely weight values
4. THE Application SHALL maintain the same criteria types (benefit/cost) for both analysis methods
5. THE Application SHALL preserve site metadata and location information when converting between formats

**Example:** For a fuzzy number `{lower: 180, most_likely: 200, upper: 220}`, THE Application SHALL use `200` as the crisp value

### Requirement 4

**User Story:** As a user, I want to trigger comparison analysis with a single action, so that I can efficiently evaluate sites using both methods

#### Acceptance Criteria

1. THE Application SHALL provide a comparison mode toggle in the control panel
2. WHEN comparison mode is enabled, THE Application SHALL execute both fuzzy and crisp TOPSIS analyses
3. THE Application SHALL execute both analyses using the same input sites and weights
4. THE Application SHALL display loading indicators while both analyses are in progress
5. IF either analysis fails, THEN THE Application SHALL display an error message indicating which method failed

### Requirement 5

**User Story:** As a data analyst, I want to see detailed comparison metrics in the results panel, so that I can quantify the differences between fuzzy and crisp approaches

#### Acceptance Criteria

1. THE Application SHALL calculate rank correlation between fuzzy and crisp results
2. THE Application SHALL display the number of sites with rank changes in a comparison summary section
3. THE Application SHALL show the maximum rank difference across all sites in the ResultsPanel
4. THE Application SHALL display average score difference between methods in the comparison summary
5. THE Application SHALL present comparison statistics at the top of the ResultsPanel when comparison mode is active

### Requirement 6

**User Story:** As a decision maker, I want to export comparison results, so that I can share analysis findings with stakeholders

#### Acceptance Criteria

1. THE Application SHALL provide an export function for comparison results
2. THE Application SHALL include both fuzzy and crisp rankings in the export
3. THE Application SHALL include comparison metrics in the export
4. THE Application SHALL format exported data as JSON or CSV
5. THE Application SHALL include timestamp and analysis parameters in the export

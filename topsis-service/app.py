from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)


class TriangularFuzzyNumber:
    """Represents a triangular fuzzy number (lower, most_likely, upper)"""

    def __init__(self, lower, most_likely, upper):
        self.lower = float(lower)
        self.most_likely = float(most_likely)
        self.upper = float(upper)

    def to_dict(self):
        return {
            'lower': self.lower,
            'most_likely': self.most_likely,
            'upper': self.upper
        }


class FuzzyTOPSIS:
    """Fuzzy TOPSIS implementation for multi-criteria decision analysis"""

    def __init__(self, alternatives, weights, criteria_types):
        """
        alternatives: List of lists of TriangularFuzzyNumber objects
        weights: List of TriangularFuzzyNumber objects for criteria weights
        criteria_types: List of booleans (True for benefit, False for cost)
        """
        self.alternatives = alternatives
        self.weights = weights
        self.criteria_types = criteria_types
        self.n_alternatives = len(alternatives)
        self.n_criteria = len(alternatives[0])

    def normalize_fuzzy_matrix(self):
        """Normalize the fuzzy decision matrix"""
        normalized = []

        for i in range(self.n_alternatives):
            normalized_alt = []
            for j in range(self.n_criteria):
                fuzzy_val = self.alternatives[i][j]

                if self.criteria_types[j]:  # Benefit criterion
                    # Find max upper value for this criterion
                    max_upper = max(alt[j].upper for alt in self.alternatives)
                    if max_upper > 0:
                        normalized_alt.append(TriangularFuzzyNumber(
                            fuzzy_val.lower / max_upper,
                            fuzzy_val.most_likely / max_upper,
                            fuzzy_val.upper / max_upper
                        ))
                    else:
                        normalized_alt.append(TriangularFuzzyNumber(0, 0, 0))
                else:  # Cost criterion
                    # Find min lower value for this criterion
                    min_lower = min(alt[j].lower for alt in self.alternatives if alt[j].lower > 0)
                    if min_lower > 0:
                        normalized_alt.append(TriangularFuzzyNumber(
                            min_lower / fuzzy_val.upper,
                            min_lower / fuzzy_val.most_likely,
                            min_lower / fuzzy_val.lower if fuzzy_val.lower > 0 else 1
                        ))
                    else:
                        normalized_alt.append(TriangularFuzzyNumber(0, 0, 0))

            normalized.append(normalized_alt)

        return normalized

    def calculate_weighted_matrix(self, normalized):
        """Apply weights to normalized matrix"""
        weighted = []

        for i in range(self.n_alternatives):
            weighted_alt = []
            for j in range(self.n_criteria):
                norm = normalized[i][j]
                weight = self.weights[j]

                weighted_alt.append(TriangularFuzzyNumber(
                    norm.lower * weight.lower,
                    norm.most_likely * weight.most_likely,
                    norm.upper * weight.upper
                ))

            weighted.append(weighted_alt)

        return weighted

    def calculate_ideal_solutions(self, weighted):
        """Calculate fuzzy positive and negative ideal solutions"""
        fpis = []  # Fuzzy Positive Ideal Solution
        fnis = []  # Fuzzy Negative Ideal Solution

        for j in range(self.n_criteria):
            criterion_values = [weighted[i][j] for i in range(self.n_alternatives)]

            if self.criteria_types[j]:  # Benefit
                fpis.append(TriangularFuzzyNumber(
                    max(v.lower for v in criterion_values),
                    max(v.most_likely for v in criterion_values),
                    max(v.upper for v in criterion_values)
                ))
                fnis.append(TriangularFuzzyNumber(
                    min(v.lower for v in criterion_values),
                    min(v.most_likely for v in criterion_values),
                    min(v.upper for v in criterion_values)
                ))
            else:  # Cost
                fpis.append(TriangularFuzzyNumber(
                    min(v.lower for v in criterion_values),
                    min(v.most_likely for v in criterion_values),
                    min(v.upper for v in criterion_values)
                ))
                fnis.append(TriangularFuzzyNumber(
                    max(v.lower for v in criterion_values),
                    max(v.most_likely for v in criterion_values),
                    max(v.upper for v in criterion_values)
                ))

        return fpis, fnis

    def fuzzy_distance(self, fuzzy1, fuzzy2):
        """Calculate distance between two fuzzy numbers"""
        return np.sqrt(
            (1/3) * (
                (fuzzy1.lower - fuzzy2.lower)**2 +
                (fuzzy1.most_likely - fuzzy2.most_likely)**2 +
                (fuzzy1.upper - fuzzy2.upper)**2
            )
        )

    def calculate_distances(self, weighted, fpis, fnis):
        """Calculate distances from ideal solutions"""
        d_plus = []  # Distance from FPIS
        d_minus = []  # Distance from FNIS

        for i in range(self.n_alternatives):
            dist_plus = sum(
                self.fuzzy_distance(weighted[i][j], fpis[j])
                for j in range(self.n_criteria)
            )
            dist_minus = sum(
                self.fuzzy_distance(weighted[i][j], fnis[j])
                for j in range(self.n_criteria)
            )

            d_plus.append(dist_plus)
            d_minus.append(dist_minus)

        return d_plus, d_minus

    def calculate_closeness_coefficients(self, d_plus, d_minus):
        """Calculate closeness coefficients (CC)"""
        cc = []
        for i in range(self.n_alternatives):
            if d_plus[i] + d_minus[i] > 0:
                cc.append(d_minus[i] / (d_plus[i] + d_minus[i]))
            else:
                cc.append(0)
        return cc

    def rank(self):
        """Perform complete fuzzy TOPSIS ranking"""
        # Step 1: Normalize
        normalized = self.normalize_fuzzy_matrix()

        # Step 2: Apply weights
        weighted = self.calculate_weighted_matrix(normalized)

        # Step 3: Calculate ideal solutions
        fpis, fnis = self.calculate_ideal_solutions(weighted)

        # Step 4: Calculate distances
        d_plus, d_minus = self.calculate_distances(weighted, fpis, fnis)

        # Step 5: Calculate closeness coefficients
        cc = self.calculate_closeness_coefficients(d_plus, d_minus)

        # Step 6: Rank alternatives
        rankings = []
        for i, coefficient in enumerate(cc):
            rankings.append({
                'alternative_index': i,
                'closeness_coefficient': coefficient,
                'rank': 0  # Will be set after sorting
            })

        # Sort by closeness coefficient (descending)
        rankings.sort(key=lambda x: x['closeness_coefficient'], reverse=True)

        # Assign ranks
        for rank, item in enumerate(rankings, 1):
            item['rank'] = rank

        return rankings


class CrispTOPSIS:
    """Traditional TOPSIS implementation using deterministic values"""

    def __init__(self, alternatives, weights, criteria_types):
        """
        alternatives: List of lists of numeric values
        weights: List of numeric values for criteria weights
        criteria_types: List of booleans (True for benefit, False for cost)
        """
        self.alternatives = np.array(alternatives, dtype=float)
        self.weights = np.array(weights, dtype=float)
        self.criteria_types = criteria_types
        self.n_alternatives = len(alternatives)
        self.n_criteria = len(alternatives[0])

    def normalize_matrix(self):
        """Normalize using vector normalization"""
        # Calculate column-wise norms
        norms = np.sqrt(np.sum(self.alternatives ** 2, axis=0))
        # Avoid division by zero
        norms[norms == 0] = 1
        return self.alternatives / norms

    def calculate_weighted_matrix(self, normalized):
        """Apply weights to normalized matrix"""
        return normalized * self.weights

    def calculate_ideal_solutions(self, weighted):
        """Calculate positive and negative ideal solutions"""
        pis = []  # Positive Ideal Solution
        nis = []  # Negative Ideal Solution

        for j in range(self.n_criteria):
            if self.criteria_types[j]:  # Benefit
                pis.append(np.max(weighted[:, j]))
                nis.append(np.min(weighted[:, j]))
            else:  # Cost
                pis.append(np.min(weighted[:, j]))
                nis.append(np.max(weighted[:, j]))

        return np.array(pis), np.array(nis)

    def calculate_distances(self, weighted, pis, nis):
        """Calculate Euclidean distances from ideal solutions"""
        d_plus = np.sqrt(np.sum((weighted - pis) ** 2, axis=1))
        d_minus = np.sqrt(np.sum((weighted - nis) ** 2, axis=1))
        return d_plus, d_minus

    def calculate_closeness_coefficients(self, d_plus, d_minus):
        """Calculate closeness coefficients"""
        # Avoid division by zero
        denominator = d_plus + d_minus
        denominator[denominator == 0] = 1
        return d_minus / denominator

    def rank(self):
        """Perform complete crisp TOPSIS ranking"""
        # Step 1: Normalize
        normalized = self.normalize_matrix()

        # Step 2: Apply weights
        weighted = self.calculate_weighted_matrix(normalized)

        # Step 3: Calculate ideal solutions
        pis, nis = self.calculate_ideal_solutions(weighted)

        # Step 4: Calculate distances
        d_plus, d_minus = self.calculate_distances(weighted, pis, nis)

        # Step 5: Calculate closeness coefficients
        cc = self.calculate_closeness_coefficients(d_plus, d_minus)

        # Step 6: Create rankings
        rankings = []
        for i, coefficient in enumerate(cc):
            rankings.append({
                'alternative_index': i,
                'closeness_coefficient': float(coefficient),
                'rank': 0
            })

        # Sort and assign ranks
        rankings.sort(key=lambda x: x['closeness_coefficient'], reverse=True)
        for rank, item in enumerate(rankings, 1):
            item['rank'] = rank

        return rankings


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'fuzzy-topsis'})


@app.route('/api/fuzzy-topsis/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json

        # Parse alternatives (fuzzy numbers)
        alternatives = []
        for alt in data['alternatives']:
            fuzzy_alt = []
            for criterion in alt:
                fuzzy_alt.append(TriangularFuzzyNumber(
                    criterion['lower'],
                    criterion['most_likely'],
                    criterion['upper']
                ))
            alternatives.append(fuzzy_alt)

        # Parse weights (fuzzy numbers)
        weights = []
        for w in data['weights']:
            weights.append(TriangularFuzzyNumber(
                w['lower'],
                w['most_likely'],
                w['upper']
            ))

        # Parse criteria types
        criteria_types = data['criteria_types']

        # Run fuzzy TOPSIS
        topsis = FuzzyTOPSIS(alternatives, weights, criteria_types)
        rankings = topsis.rank()

        return jsonify({
            'success': True,
            'rankings': rankings
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/crisp-topsis/analyze', methods=['POST'])
def analyze_crisp():
    try:
        data = request.json

        # Parse request data
        alternatives = data.get('alternatives')
        weights = data.get('weights')
        criteria_types = data.get('criteria_types')

        # Validate inputs
        if not alternatives or not isinstance(alternatives, list):
            return jsonify({
                'success': False,
                'error': 'Invalid or missing alternatives'
            }), 400

        if not weights or not isinstance(weights, list):
            return jsonify({
                'success': False,
                'error': 'Invalid or missing weights'
            }), 400

        if not criteria_types or not isinstance(criteria_types, list):
            return jsonify({
                'success': False,
                'error': 'Invalid or missing criteria_types'
            }), 400

        # Validate dimensions
        if len(alternatives) == 0:
            return jsonify({
                'success': False,
                'error': 'No alternatives provided'
            }), 400

        n_criteria = len(alternatives[0])
        if len(weights) != n_criteria or len(criteria_types) != n_criteria:
            return jsonify({
                'success': False,
                'error': 'Weights and criteria_types must match number of criteria'
            }), 400

        # Run crisp TOPSIS
        topsis = CrispTOPSIS(alternatives, weights, criteria_types)
        rankings = topsis.rank()

        return jsonify({
            'success': True,
            'rankings': rankings
        })

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid input data: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Calculation error: {str(e)}'
        }), 500


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)

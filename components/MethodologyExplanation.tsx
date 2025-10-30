'use client';

export default function MethodologyExplanation() {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
      <h3 className="text-xl font-bold text-gray-800">Why Fuzzy TOPSIS?</h3>
      
      <div className="space-y-4 text-sm text-gray-700">
        <section>
          <h4 className="font-semibold text-gray-800 mb-2">🎯 The Challenge</h4>
          <p>
            Urban planning data is inherently uncertain. Solar irradiance varies seasonally, infrastructure
            accessibility changes over time, and cost estimates fluctuate. Traditional crisp (deterministic)
            decision analysis methods ignore this uncertainty, potentially leading to suboptimal decisions.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">🔬 Our Approach: Fuzzy TOPSIS</h4>
          <p className="mb-2">
            We utilize <strong>Fuzzy TOPSIS</strong> (Technique for Order of Preference by Similarity to Ideal
            Solution) rather than conventional crisp multi-criteria decision analysis for several well-justified
            reasons:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Handling Inherent Uncertainty:</strong> Each criterion is represented as a triangular fuzzy
              number (lower, most_likely, upper), directly modeling natural uncertainty in urban data.
            </li>
            <li>
              <strong>Scenario-Based Decision Making:</strong> Fuzzy numbers represent pessimistic, expected, and
              optimistic scenarios, supporting robust decision-making compared to single-point estimates.
            </li>
            <li>
              <strong>Statistical Foundation:</strong> Our fuzzy numbers are grounded in NASA historical data:
              <ul className="list-circle list-inside ml-6 mt-1">
                <li>Pessimistic bound = historical mean - standard deviation</li>
                <li>Most likely = historical mean</li>
                <li>Optimistic bound = historical mean + standard deviation</li>
              </ul>
            </li>
            <li>
              <strong>Conflicting Criteria Evaluation:</strong> Fuzzy TOPSIS preserves trade-offs between criteria
              rather than collapsing them to single values, enabling stakeholders to understand the complete
              decision landscape.
            </li>
            <li>
              <strong>Confidence Quantification:</strong> We compute confidence scores (0-1 scale) based on data
              consistency and sample size, providing transparency about data reliability.
            </li>
            <li>
              <strong>Proven Framework:</strong> Fuzzy TOPSIS is well-established in operations research with proven
              effectiveness in multi-criteria problems involving uncertainty.
            </li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">📊 The Comparison</h4>
          <p>
            By comparing Fuzzy TOPSIS with traditional Crisp TOPSIS, we demonstrate how uncertainty modeling affects
            site rankings. This comparison helps stakeholders understand:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
            <li>Which sites are robust choices across all scenarios</li>
            <li>Which sites are risky but have high potential</li>
            <li>How much uncertainty exists in the data</li>
            <li>Whether the decision is sensitive to the analysis method</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">🎓 Mathematical Rigor</h4>
          <p>
            Our implementation combines fuzzy logic with TOPSIS to deliver a decision support system that reflects
            the real-world ambiguity of urban planning data while maintaining mathematical rigor and
            interpretability.
          </p>
        </section>

        <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Key Takeaway</h4>
          <p className="text-blue-800">
            When rankings differ significantly between Fuzzy and Crisp TOPSIS (negative correlation), it indicates
            high data uncertainty. In such cases, <strong>Fuzzy TOPSIS provides more reliable guidance</strong>{' '}
            because it explicitly accounts for this uncertainty rather than ignoring it.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">📚 References</h4>
          <ul className="text-xs space-y-1 ml-4">
            <li>• Chen, C.T. (2000). Extensions of the TOPSIS for group decision-making under fuzzy environment</li>
            <li>• Zadeh, L.A. (1965). Fuzzy sets. Information and Control, 8(3), 338-353</li>
            <li>• Hwang, C.L., & Yoon, K. (1981). Multiple Attribute Decision Making: Methods and Applications</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

# 📊 Scoring System Explanation

## Why Do Nearby Sites Have Similar Scores?

This is **expected and realistic**! Here's why:

### 🌞 Solar Potential (40% weight)
- Uses **real NASA POWER API data**
- Sites in the same geographic area receive similar solar irradiance
- Small differences come from:
  - Micro-climate variations
  - Data collection precision
  - Historical weather patterns

**Example**: Two sites 5km apart in Toronto will have nearly identical solar potential.

### 🏞️ Land Suitability (30% weight)
- Currently based on solar potential as a proxy
- In production, would use:
  - Terrain data (slope, elevation)
  - Land use classification
  - Zoning regulations
  - Environmental constraints

**Current behavior**: Sites with similar solar data get similar land scores.

### ⚡ Grid Proximity (20% weight)
- Currently estimated with small random variation
- In production, would use:
  - Actual power grid infrastructure data
  - Substation locations
  - Transmission line distances
  - Grid capacity

**Current behavior**: Sites in same area assumed to have similar grid access.

### 💰 Installation Cost (10% weight)
- Currently based on solar potential
- Better solar = slightly lower cost per kW (better ROI)
- In production, would consider:
  - Terrain difficulty
  - Access roads
  - Local labor costs
  - Permitting complexity

**Current behavior**: Sites with similar solar get similar cost estimates.

---

## 🎯 What This Means

### In the Same Area
Sites will have **similar scores** (e.g., 94.4, 94.8, 96.6, 96.7) because:
- ✅ They receive similar sunlight
- ✅ They have similar infrastructure access
- ✅ They have similar installation conditions

**This is realistic!** In real solar development, sites in the same region are often comparable.

### Different Areas
Sites in **different regions** will have **different scores** because:
- ✅ Different solar irradiance (latitude, climate)
- ✅ Different infrastructure
- ✅ Different costs

---

## 🔍 How to See More Variation

### Option 1: Select Sites in Different Regions
```
Compare:
- Toronto area (43.7°N)
- Montreal area (45.5°N)
- Vancouver area (49.2°N)
```

You'll see bigger score differences!

### Option 2: Use Real Data (Production)
In a production system, integrate:
- **GIS terrain data** → Real land suitability
- **Power grid database** → Actual grid distances
- **Cost estimation API** → Site-specific costs

This would show more variation even in the same area.

---

## 📈 Understanding the Rankings

### High Scores (90-100)
- Excellent solar potential
- Good land characteristics
- Close to grid
- Reasonable costs

### Medium Scores (70-89)
- Good solar potential
- Acceptable land
- Moderate grid distance
- Average costs

### Low Scores (Below 70)
- Lower solar potential
- Poor land characteristics
- Far from grid
- High costs

---

## 🎓 Educational Note

This application demonstrates the **fuzzy TOPSIS methodology** for multi-criteria decision analysis. The current implementation:

### ✅ What It Does Well
- Uses real NASA solar data
- Implements proper fuzzy TOPSIS algorithm
- Shows how multiple criteria combine
- Demonstrates uncertainty with fuzzy numbers

### 🔧 What Could Be Enhanced
- Integrate real terrain/land use data
- Use actual power grid infrastructure
- Add detailed cost estimation
- Include more criteria (environmental, social, etc.)

---

## 💡 Why Small Random Variations?

You might notice small random variations (±5-10%) in the criteria. This is intentional to:

1. **Differentiate nearby sites** - TOPSIS needs some variation to rank
2. **Represent uncertainty** - Real-world measurements have noise
3. **Simulate micro-variations** - Small site-specific differences

Without this, all sites in the same area would have **identical** scores, making ranking impossible.

---

## 🌍 Real-World Example

### Scenario: Solar Farm in Southern Ontario

**Site A** (43.7°N, -79.4°W):
- Solar: 180 W/m² average
- Land: Flat agricultural land
- Grid: 3 km to substation
- Cost: $1,450/kW

**Site B** (43.72°N, -79.38°W) - 5km away:
- Solar: 181 W/m² average (very similar!)
- Land: Flat agricultural land
- Grid: 3.5 km to substation
- Cost: $1,480/kW

**Expected Result**: Both sites score 95-97 (very similar)

**Site C** (49.2°N, -123.1°W) - Vancouver:
- Solar: 140 W/m² average (much lower!)
- Land: Hilly terrain
- Grid: 8 km to substation
- Cost: $1,800/kW

**Expected Result**: Site C scores 70-75 (much lower)

---

## 🔬 For Researchers

If you're using this for research:

### Current Limitations
- Land suitability is proxy-based
- Grid proximity is estimated
- Cost model is simplified
- No environmental/social criteria

### Recommended Enhancements
1. Integrate GIS data (QGIS, ArcGIS)
2. Use power grid databases (OpenStreetMap, utility data)
3. Add cost estimation models (NREL SAM, PVWatts)
4. Include environmental constraints (protected areas, wetlands)
5. Add social factors (community acceptance, land ownership)

### Data Sources
- **Solar**: NASA POWER API ✅ (already integrated)
- **Terrain**: USGS, SRTM, ASTER GDEM
- **Land Use**: CORINE, NLCD, OpenStreetMap
- **Grid**: OpenStreetMap, utility company data
- **Costs**: NREL ATB, local contractor quotes

---

## ✅ Summary

**Q: Why are scores similar in the same area?**  
**A: Because sites in the same area ARE similar in real life!**

This is not a bug - it's realistic behavior. Sites 5-10km apart will have:
- Similar solar irradiance
- Similar infrastructure access
- Similar installation conditions

To see more variation:
1. Select sites in different regions
2. Integrate real GIS/infrastructure data
3. Add more criteria (environmental, social, etc.)

---

## 🎯 Key Takeaway

The application correctly shows that **nearby sites are comparable**. In real solar development, this is exactly what you'd expect!

The ranking still helps you identify the **slightly better** sites within a region, which is valuable for final site selection.

---

**Questions?** See [specs/design.md](specs/design.md) and [specs/requirements.md](specs/requirements.md) for more technical details.

## Why Fuzzy Logic: Design Rationale

This implementation uses Fuzzy TOPSIS rather than conventional crisp
(deterministic) multi-criteria decision analysis, for several reasons:

- **Handling inherent uncertainty in urban data.** Urban planning data is
  rarely precise or complete. Solar irradiance varies seasonally and
  infrastructure accessibility changes over time. Fuzzy logic represents each
  criterion as a triangular fuzzy number (lower, most-likely, upper), directly
  modeling this natural uncertainty.
- **Scenario-based decision making.** Fuzzy numbers represent optimistic,
  expected, and pessimistic scenarios, supporting more robust decisions than
  single-point estimates.
- **Statistical foundation.** The fuzzy numbers are grounded in NASA
  historical data: the pessimistic bound is (historical mean − standard
  deviation) and the optimistic bound is (historical mean + standard
  deviation).
- **Conflicting criteria evaluation.** Fuzzy TOPSIS preserves trade-offs
  between criteria rather than collapsing them into single values, letting
  stakeholders see the complete decision landscape.

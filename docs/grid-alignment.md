# 🗺️ Grid Alignment Guide

## Overview

The grid is now **aligned to fixed geographic coordinates**, ensuring consistency across different zoom levels and pan positions.

---

## 🎯 How It Works

### Before (Viewport-Dependent)
- Grid generated based on current map view
- Moving the map created misaligned grids
- Cells didn't line up when panning

### After (Coordinate-Aligned)
- Grid snaps to fixed geographic coordinates
- Same grid cells appear regardless of zoom/pan
- Cells align consistently across the map

---

## 📍 Default Alignment

### GTA Region
**Origin Point**: 43°N, -80°W

This ensures the grid aligns with:
- Major latitude/longitude lines
- Consistent across the entire GTA
- Predictable cell boundaries

---

## 🔧 Custom Alignment

You can align the grid to specific landmarks or intersections!

### Example: Align to CN Tower

Edit `energy-site-selector/components/MapContainer.tsx`:

```typescript
const initialCells = generateGrid({
  cellSize: 1, // 1km cells
  bounds: {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  },
  origin: { 
    lat: 43.6426,  // CN Tower latitude
    lng: -79.3871  // CN Tower longitude
  }
});
```

### Example: Align to Yonge & Bloor

```typescript
origin: { 
  lat: 43.6708,  // Yonge & Bloor
  lng: -79.3860 
}
```

### Example: Align to City Hall

```typescript
origin: { 
  lat: 43.6534,  // Toronto City Hall
  lng: -79.3839 
}
```

---

## 🌍 How to Find Coordinates

### Method 1: Google Maps
1. Right-click on the location
2. Click the coordinates at the top
3. Copy the lat/lng values

### Method 2: Mapbox
1. Click on the map
2. Coordinates appear in the URL or console
3. Use those values

### Method 3: Your Application
1. Open browser console (F12)
2. Click on the map
3. Coordinates are logged

---

## 📐 Grid Snapping Explained

### What is Snapping?

The grid "snaps" to the nearest grid line based on the origin point.

**Example with 1km cells:**
- Origin: 43.0°N, -80.0°W
- Cell size: 1km ≈ 0.009° latitude
- Grid lines at: 43.000°, 43.009°, 43.018°, 43.027°, etc.

**If you pan to 43.015°:**
- Grid snaps to nearest line (43.009°)
- Cells remain aligned

---

## 🎨 Visual Alignment

### Street Grid Alignment

For cities with regular street grids (like Toronto), you can align to major intersections:

```typescript
// Align to major intersection
origin: { 
  lat: 43.6500,  // Round to major street
  lng: -79.3800  // Round to major street
}
```

### UTM Grid Alignment

For surveying or GIS work:

```typescript
// Align to UTM grid
origin: { 
  lat: 43.0,     // UTM zone boundary
  lng: -81.0     // UTM zone boundary
}
```

---

## 🔄 Dynamic Grid Updates

The grid automatically updates when you:
- Pan the map
- Zoom in/out
- Resize the window

But the **alignment stays consistent**!

---

## 💡 Tips for Best Alignment

### 1. Use Round Numbers
```typescript
// Good - aligns to clean coordinates
origin: { lat: 43.65, lng: -79.38 }

// Less ideal - arbitrary precision
origin: { lat: 43.6426, lng: -79.3871 }
```

### 2. Match Your Use Case

**For urban planning:**
```typescript
// Align to city center
origin: { lat: 43.6532, lng: -79.3832 } // Toronto City Hall
```

**For regional analysis:**
```typescript
// Align to whole degrees
origin: { lat: 43.0, lng: -80.0 }
```

**For property boundaries:**
```typescript
// Align to specific property corner
origin: { lat: 43.6500, lng: -79.3800 }
```

### 3. Consider Cell Size

**1km cells (default):**
- Good for regional planning
- Aligns well with major streets

**500m cells:**
```typescript
cellSize: 0.5
```
- Better for detailed analysis
- Aligns with smaller blocks

**2km cells:**
```typescript
cellSize: 2
```
- Good for large-scale planning
- Faster rendering

---

## 🧪 Testing Alignment

### Verify Grid Alignment

1. **Select a cell**
2. **Pan the map away**
3. **Pan back**
4. **Cell should be in the same place!** ✅

### Check Coordinates

Open browser console and check cell IDs:
```
cell_43.6500_-79.3800
cell_43.6590_-79.3800
cell_43.6680_-79.3800
```

Notice the regular intervals? That's alignment working!

---

## 📊 Technical Details

### Snapping Algorithm

```typescript
function snapToGrid(value: number, step: number, origin: number): number {
  return Math.floor((value - origin) / step) * step + origin;
}
```

**Example:**
- Value: 43.6543° (current viewport)
- Step: 0.009° (1km)
- Origin: 43.0°
- Result: 43.654° (snapped to grid)

### Coordinate Conversion

**Latitude:**
- 1 degree ≈ 111 km (constant)
- 1 km ≈ 0.009 degrees

**Longitude (at 43°N):**
- 1 degree ≈ 81 km (varies by latitude)
- 1 km ≈ 0.012 degrees

---

## 🎯 Common Alignments

### Toronto Landmarks

```typescript
// CN Tower
origin: { lat: 43.6426, lng: -79.3871 }

// Rogers Centre
origin: { lat: 43.6414, lng: -79.3894 }

// Union Station
origin: { lat: 43.6452, lng: -79.3806 }

// Pearson Airport
origin: { lat: 43.6777, lng: -79.6248 }
```

### Major Intersections

```typescript
// Yonge & Dundas
origin: { lat: 43.6561, lng: -79.3802 }

// Yonge & Eglinton
origin: { lat: 43.7076, lng: -79.3978 }

// Yonge & Bloor
origin: { lat: 43.6708, lng: -79.3860 }
```

---

## 🔧 Advanced Configuration

### Multiple Grid Systems

You can create different grids for different purposes:

```typescript
// Coarse grid for overview
const coarseGrid = generateGrid({
  cellSize: 5,  // 5km cells
  bounds: largeBounds,
  origin: { lat: 43.0, lng: -80.0 }
});

// Fine grid for detailed analysis
const fineGrid = generateGrid({
  cellSize: 0.5,  // 500m cells
  bounds: smallBounds,
  origin: { lat: 43.65, lng: -79.38 }
});
```

### Rotated Grids (Future Enhancement)

Currently, grids are aligned to lat/lng. For rotated grids (e.g., aligned to street angles), you would need to add rotation parameters.

---

## ✅ Summary

**Grid Alignment Benefits:**
- ✅ Consistent cell positions
- ✅ Predictable boundaries
- ✅ Better for analysis
- ✅ Aligns with real-world features
- ✅ Professional appearance

**How to Use:**
1. Default alignment works for most cases
2. Customize origin for specific landmarks
3. Adjust cell size for your needs
4. Grid stays aligned when panning/zooming

---

## 🎓 For Developers

### Code Location
- **Grid generation**: `energy-site-selector/lib/gridUtils.ts`
- **Grid usage**: `energy-site-selector/components/MapContainer.tsx`
- **Types**: `energy-site-selector/lib/types.ts`

### Key Functions
- `generateGrid()` - Main grid generation with alignment
- `snapToGrid()` - Coordinate snapping algorithm
- `generateAlignedGrid()` - Custom origin grid generation

---

**Questions?** Check the code comments in `gridUtils.ts` for more details!

# 🔒 Map Rotation Lock

## Overview

The map rotation is now **locked by default** to keep the grid aligned north. This ensures the grid cells stay aligned with geographic coordinates and don't rotate with the map.

---

## 🎯 What Changed

### Before
- Users could rotate the map (Ctrl+drag or right-click drag)
- Grid rotated with the map
- Grid cells appeared tilted
- Confusing for analysis

### After
- Map rotation is **disabled by default**
- Grid always stays north-aligned
- Grid cells remain square and aligned
- Better for site selection and analysis

---

## 🔧 Current Behavior

### Disabled Features
- ❌ **Drag rotation** - Can't rotate by dragging
- ❌ **Touch rotation** - Can't rotate on mobile
- ❌ **Compass button** - Hidden from navigation controls
- ❌ **Keyboard rotation** - Shift+arrow keys disabled

### Enabled Features
- ✅ **Pan** - Move the map around
- ✅ **Zoom** - Zoom in and out
- ✅ **Click** - Select grid cells
- ✅ **All analysis features** - Everything else works normally

---

## 🎮 User Experience

### What Users Can Do
1. **Pan the map** - Click and drag to move
2. **Zoom** - Scroll wheel or +/- buttons
3. **Select cells** - Click on grid cells
4. **Analyze sites** - All analysis features work

### What Users Cannot Do
1. ~~Rotate the map~~ - Disabled
2. ~~Tilt the map (3D)~~ - Disabled
3. ~~Use compass button~~ - Hidden

---

## 🔓 Enable Rotation (Optional)

If you want to allow map rotation, edit `energy-site-selector/app/page.tsx`:

```typescript
export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  return (
    <main className="w-full h-screen">
      <MapContainer 
        mapboxToken={mapboxToken}
        allowRotation={true}  // Add this line
      />
    </main>
  );
}
```

**Note**: When rotation is enabled:
- Grid will rotate with the map
- Cells may appear tilted
- Analysis still works, but visual alignment is lost

---

## 🎨 Visual Comparison

### Locked (Default) ✅
```
North always up
Grid aligned to lat/lng
Cells appear square
Easy to analyze
```

### Unlocked (Optional) ⚠️
```
North can be any direction
Grid rotates with map
Cells appear tilted
Harder to analyze
```

---

## 🔍 Technical Details

### Map Configuration

```typescript
new mapboxgl.Map({
  // ... other options
  dragRotate: false,        // Disable drag rotation
  touchZoomRotate: false,   // Disable touch rotation
  touchPitch: false,        // Disable 3D tilt
});
```

### Navigation Controls

```typescript
new mapboxgl.NavigationControl({
  showCompass: false,  // Hide compass button
  showZoom: true,      // Keep zoom buttons
});
```

---

## 💡 Why Lock Rotation?

### Benefits of Locked Rotation

1. **Grid Alignment** ✅
   - Grid stays aligned with north
   - Cells remain square
   - Easy to understand

2. **Analysis Accuracy** ✅
   - Easier to compare sites
   - Clear visual hierarchy
   - No confusion about orientation

3. **User Experience** ✅
   - Simpler interface
   - Less accidental rotation
   - Consistent view

4. **Professional Appearance** ✅
   - Standard map orientation
   - Matches other GIS tools
   - Better for presentations

### When to Enable Rotation

Consider enabling rotation if:
- Users need to see terrain from different angles
- 3D visualization is important
- Users are experienced with map tools
- Grid alignment is less critical

---

## 🎓 For Developers

### Code Location
- **Map initialization**: `energy-site-selector/components/MapContainer.tsx`
- **Rotation prop**: `MapContainerProps` interface

### Key Settings

```typescript
interface MapContainerProps {
  mapboxToken: string;
  allowRotation?: boolean;  // Default: false
}
```

### Mapbox Options

```typescript
// Rotation controls
dragRotate: boolean;        // Mouse drag rotation
touchZoomRotate: boolean;   // Touch rotation
touchPitch: boolean;        // Touch pitch (3D tilt)

// Keyboard controls (automatically disabled with dragRotate)
keyboard: boolean;          // Keyboard shortcuts
```

---

## 🔄 Alternative Approaches

### Option 1: Lock Grid, Allow Map Rotation

Keep grid north-aligned while allowing map rotation:

```typescript
// In GridLayer component
const gridLayer = new PolygonLayer({
  // ... other options
  coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
  // Grid stays aligned to lat/lng regardless of map rotation
});
```

**Pros**: Users can rotate map, grid stays aligned  
**Cons**: More complex implementation

### Option 2: Rotation with Reset Button

Allow rotation but add a "Reset North" button:

```typescript
<button onClick={() => map.current?.resetNorth()}>
  Reset North
</button>
```

**Pros**: Flexibility with easy reset  
**Cons**: Users might forget to reset

### Option 3: Current Approach (Recommended)

Disable rotation entirely:

**Pros**: Simple, clear, no confusion  
**Cons**: Less flexibility for advanced users

---

## 🎯 User Feedback

### Common Questions

**Q: Why can't I rotate the map?**  
A: Rotation is disabled to keep the grid aligned north for accurate analysis.

**Q: How do I see the map from different angles?**  
A: You can pan and zoom, but rotation is locked for grid alignment.

**Q: Can I enable rotation?**  
A: Yes, developers can enable it with the `allowRotation` prop.

---

## 📊 Comparison with Other Tools

### Google Maps
- Default: No rotation
- Optional: Enable with controls

### ArcGIS Online
- Default: No rotation
- Optional: Enable in 3D mode

### QGIS
- Default: No rotation
- Optional: Enable with rotation tool

### Our Application
- Default: No rotation ✅
- Optional: Enable with prop
- **Matches industry standard!**

---

## ✅ Summary

**Current Behavior:**
- ✅ Map rotation is **locked by default**
- ✅ Grid stays **north-aligned**
- ✅ Cells remain **square and aligned**
- ✅ Better for **analysis and selection**

**To Enable Rotation:**
```typescript
<MapContainer 
  mapboxToken={token}
  allowRotation={true}
/>
```

**Recommendation:**
Keep rotation locked for best user experience and grid alignment!

---

## 🔗 Related Documentation

- [grid-alignment.md](grid-alignment.md) - Grid alignment system
- [scoring.md](scoring.md) - How scoring works
- [getting-started.md](getting-started.md) - User guide

---

**Questions?** The current locked rotation is the recommended setting for this application!

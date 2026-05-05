# PatternCanvas.js Documentation

## Overview

PatternCanvas.js is an HTML5 Canvas-based hexagonal dot grid pattern drawing and encoding library. It allows users to draw patterns on a hexagonal grid and converts them into relative direction encoding strings.

## Quick Start

Create a canvas element with id "PatternCanvas" and load the script:

```html
<canvas id="PatternCanvas"></canvas>
<script src="/js/PatternCanvas.js"></script>
```

## Initialization Function

### PatternCanvas(CanvasElement, Config)

**Purpose**: Initializes the entire dot grid system.

**Parameters**:
- `CanvasElement` (optional): Canvas DOM element, defaults to finding `id="PatternCanvas"`
- `Config` (optional): Configuration object that overrides default PatternData settings

**Returns**: Exposed API object containing `Functions`, `ReadOnly`, and `Mutable` categories

**Example**:
```javascript
// Use default configuration
let api = PatternCanvas();

// Pass custom Canvas element
let canvas = document.getElementById("MyCanvas");
let api = PatternCanvas(canvas);

// Pass custom configuration
let api = PatternCanvas(null, {
    Spacing: 100,
    PatternLineColor: "#ff0000",
    debug: true
});
```

---

## Core Data Structures

### PatternData

Global configuration object storing grid styling and parameters.

| Property | Type | Default | Description |
|------|------|--------|------|
| PointWithinColor | string | "#1890ff" | Center color of dots |
| PointOutsideColor | string | "#bae7ff" | Outer color of dots |
| Spacing | number | 80 | Grid spacing (pixels) |
| Size | number | 5 | Dot size |
| PatternLineColor | string | "#009dffff" | Pattern line color |
| PatternLineWidth | number | 4 | Pattern line width |
| SelectPointSize | number | 1 | Highlight dot scale multiplier |
| MouseCloseToTheDisplayPointRange | number | 1.5 | Mouse proximity radius (in grid spacing units) |
| debug | boolean | false | Whether to display virtual coordinates |
| Mode | Array | ["NotFreePainting", "MouseCloseToTheDisplayPoint"] | Rendering mode list |

### PatternCanvasVirtual

Virtual canvas object storing pattern data and canvas offset.

| Property | Type | Description |
|------|------|------|
| X | number | Horizontal canvas offset |
| Y | number | Vertical canvas offset |
| Patterns | Array | List of patterns |

### Pattern Object

| Property | Type | Description |
|------|------|------|
| StrokeOrder | Array<{x,y}> | List of stroke points (virtual coordinates) |
| StartingPointX | number | Starting point X coordinate |
| StartingPointY | number | Starting point Y coordinate |

### PatternCanvasState

Runtime state object (internal use, accessed via API).

| Property | Type | Description |
|------|------|------|
| Messages | Array | Message queue |
| Path | Array<{x,y}> | Current drawing path |
| HighlightPoint | {x,y} \| undefined | Currently highlighted point |
| DrawingStatus | boolean | Whether currently drawing |
| MousePosition | {x,y} \| undefined | Current mouse pixel coordinates |

---

## Exposed API

`PatternCanvas()` returns an object containing the following members:

### api.Functions — Exposed Functions

| Function | Description |
|--------|------|
| VirtualToReal(Point) | Convert virtual coordinates to real pixel coordinates |
| ScreenSizeChanges() | Handle window size changes |
| IsMouseOverPoint(e) | Detect if mouse is over a grid point |
| CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) | Calculate relative direction encoding between two points |
| PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray) | Preprocess pattern list |
| PatternCanvasVirtualToPatternList() | Convert patterns to string list |
| IsAdjacentPoint(MouseMovePoint) | Check if two points are adjacent |
| CreateVirtualPatternCanvas(StartingX, StartingY) | Create virtual canvas object |

### api.ReadOnly — Read-Only Variables

| Variable | Description |
|--------|------|
| PatternCanvas | Currently bound Canvas DOM element (getter) |

### api.Mutable — Modifiable Variables

| Variable | Description |
|--------|------|
| PatternCanvasVirtual | Virtual canvas object (X, Y, Patterns can be modified directly) |
| PatternData | Configuration data object (colors, spacing, etc. can be modified directly) |
| Path | Current drawing path (getter/setter) |

---

## Usage Example

```javascript
let api = PatternCanvas();

// Call exposed functions
let realPos = api.Functions.VirtualToReal({x: 0, y: 0});
console.log(realPos); // {x: 40, y: 0}

// Read read-only property
console.log(api.ReadOnly.PatternCanvas.width);

// Modify mutable state
api.Mutable.PatternData.Spacing = 100;
api.Mutable.PatternCanvasVirtual.X = 50;
api.Mutable.Path = [];

// Get pattern encoding
let patterns = api.Functions.PatternCanvasVirtualToPatternList();
console.log(patterns); // [[0, 0, "ea"], [1, 2, "wqd"]]
```

---

## Function Reference

### VirtualToReal(Point)

**Purpose**: Converts virtual grid coordinates to real pixel coordinates.

**Parameters**:
- `Point`: Virtual coordinates `{x, y}`

**Returns**: `{ x, y }` real pixel coordinates

**Note**:
- Even rows are offset on the X axis by `Spacing / 2`
- Adds virtual canvas offset

---

### ScreenSizeChanges()

**Purpose**: Re-adjusts canvas and refreshes when window size changes.

---

### IsMouseOverPoint(e)

**Purpose**: Detects if the mouse is near a grid dot.

**Parameter**: Mouse event object `e`

**Returns**: If near a dot, returns `{ x, y }` (virtual coordinates); otherwise returns `undefined`

**Note**: Checks if distance is within `Spacing * 0.3`

---

### CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex)

**Purpose**: Calculates the relative direction encoding between two points.

**Parameters**:
- `FromPoint`: Starting point `{x, y}`
- `ToPoint`: Ending point `{x, y}`
- `PreviousDirectionIndex`: Previous absolute direction index (0-5)

**Returns**: `{ DirectionCode, CurrentDirectionIndex }`

**Relative Direction Encoding Map**:

| Turn Value | Angle Change | Code | Meaning |
|--------|----------|------|------|
| 0 | 0° | `w` | Straight |
| +1 | +60° | `q` | Turn right 60° |
| +2 | +120° | `a` | Turn right 120° |
| +3 | 180° | `s` | U-turn |
| -1 | -60° | `e` | Turn left 60° |
| -2 | -120° | `d` | Turn left 120° |

---

### PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray)

**Purpose**: Preprocesses pattern coordinates.

**Parameter**:
- `PatternListArray`: Pattern list

**Returns**: Preprocessed pattern list (does not modify original data)

**Note**: When `y` is even, subtracts `0.5` from `x` coordinate to correct even-row offset in hexagonal grid

---

### PatternCanvasVirtualToPatternList()

**Purpose**: Converts patterns in the virtual canvas to an encoding list.

**Returns**: `[[StartingPointX, StartingPointY, PatternString], ...]`

**Output Example**:
```javascript
[[0, 0, "ea"], [1, 2, "wqd"]]
```

---

### IsAdjacentPoint(MouseMovePoint)

**Purpose**: Checks if the mouse point is adjacent to the last point in the path.

**Parameter**:
- `MouseMovePoint`: Current mouse point `{x, y}`

**Returns**: `true` if adjacent

**Adjacency Conditions** (hexagonal grid):
- `|DeltaX| === 1 && |DeltaY| === 0` (horizontal adjacent)
- `|DeltaX| === 0 && |DeltaY| === 1` (vertical adjacent)
- `|DeltaX| === 1 && |DeltaY| === 1` (diagonal adjacent)

---

### CreateVirtualPatternCanvas(StartingX, StartingY)

**Purpose**: Creates a virtual canvas object.

**Parameters**:
- `StartingX`: Initial horizontal offset, default 0
- `StartingY`: Initial vertical offset, default 0

**Returns**: `{ X, Y, Patterns: [] }`

---

## Rendering Modes

### Mode Configuration

| Mode | Description |
|------|------|
| `"NotFreePainting"` | Can only move to adjacent points |
| `"FreePainting"` | Can freely move to any point |
| `"MouseCloseToTheDisplayPoint"` | Only render dots around mouse (performance optimization) |

---

## Usage Flow

1. After page load, `PatternCanvas()` initializes
2. User moves mouse on canvas, highlighting the nearest dot
3. Click to start drawing, move mouse to record path
4. Click again to end drawing, pattern is saved
5. Call `PatternCanvasVirtualToPatternList()` to get encoding

---

## Hexagonal Grid Coordinate System

- Uses virtual coordinates `(i, j)`
- Even rows are offset on the X axis by `Spacing / 2`
- Six direction angles: 0°, 60°, 120°, 180°, 240°, 300°

```
     ●     ●     ●     ●     ●
       ●     ●     ●     ●
     ●     ●     ●     ●     ●
       ●     ●     ●     ●
     ●     ●     ●     ●     ●
```

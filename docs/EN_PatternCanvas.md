# PatternCanvas.js Documentation

## Overview

PatternCanvas.js is an HTML5 Canvas-based hexagonal dot grid pattern drawing and encoding library. It allows users to draw patterns on a hexagonal grid and converts them into relative direction encoding strings.

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

Runtime state object (exposed as read-only).

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

### Exposed Functions

| Function | Description |
|--------|------|
| VirtualToReal(x, y) | Convert virtual coordinates to real pixel coordinates |
| ScreenSizeChanges() | Handle window size changes |
| IsMouseOverPoint(e) | Detect if mouse is over a grid point |
| CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) | Calculate relative direction encoding between two points |
| PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray) | Preprocess pattern list |
| PatternCanvasVirtualToPatternList() | Convert patterns to string list |
| IsAdjacentPoint(MouseMovePoint) | Check if two points are adjacent |
| CreateVirtualPatternCanvas(StartingX, StartingY) | Create virtual canvas object |
| RefreshPatternCanvas() | Refresh canvas rendering |
| GetPatternData() | Get a copy of PatternData configuration |

### Exposed Variables

| Variable | Modifiable | Description |
|--------|--------|------|
| PatternCanvasState | No (Object.freeze) | Runtime state object |
| PatternCanvasVirtual | Yes | Virtual canvas object (X, Y, Patterns can be modified directly) |

---

## Function Reference

### PatternCanvas()

**Purpose**: Initializes the entire dot grid system.

**Implementation**:
1. Initializes `PatternData` configuration
2. Creates virtual canvas `PatternCanvasVirtual`
3. Initializes message queue and drawing path
4. Registers event triggers
5. Sets canvas size and performs initial refresh
6. Starts the timed message processing loop

**Call timing**: Automatically called after page load.

---

### VirtualToReal(x, y)

**Purpose**: Converts virtual grid coordinates to real pixel coordinates.

**Parameters**:
- `x`: Virtual X coordinate
- `y`: Virtual Y coordinate

**Returns**: `{ x, y }` real pixel coordinates

**Implementation**:
- Even rows are offset on the X axis by `Spacing / 2`
- Adds virtual canvas offset `PatternCanvasVirtual.X` / `.Y`

---

### resizeCanvas()

**Purpose**: Sets Canvas size to window dimensions.

**Implementation**:
- Gets the `PatternCanvas` element
- Sets `width` and `height` to `window.innerWidth` / `window.innerHeight`

---

### RefreshPatternCanvas()

**Purpose**: Refreshes the entire dot grid canvas, including the grid, saved patterns, drawing preview, and highlighted dot.

**Implementation**:
1. Clears the canvas
2. Calculates visible virtual coordinate range
3. If mode includes `MouseCloseToTheDisplayPoint` and mouse is not on canvas, skips grid rendering
4. Draws hexagonal dot grid (even rows offset by `Spacing/2`)
5. If mode includes `MouseCloseToTheDisplayPoint`, only renders dots within specified radius around mouse
6. Draws saved pattern line segments
7. Draws current drawing path preview
8. Draws highlighted dot (enlarged)
9. **Debug mode**: Annotates virtual coordinates `(i,j)` next to each dot

---

### CreateVirtualPatternCanvas(StartingX, StartingY)

**Purpose**: Creates a virtual canvas object.

**Parameters**:
- `StartingX`: Initial horizontal offset, default 0
- `StartingY`: Initial vertical offset, default 0

**Returns**: `{ X, Y, Patterns: [] }`

---

### ScreenSizeChanges()

**Purpose**: Re-adjusts canvas and refreshes when window size changes.

**Implementation**: Calls `resizeCanvas()` + `RefreshPatternCanvas()`

---

### MouseScrollWheel(e)

**Purpose**: Handles mouse wheel events to pan the canvas.

**Implementation**:
- Adjusts `PatternCanvasVirtual.X` / `.Y` based on scroll direction (X or Y axis)
- Calls `RefreshPatternCanvas()` to refresh

---

### IsMouseOverPoint(e)

**Purpose**: Detects if the mouse is near a grid dot.

**Parameter**: Mouse event object `e`

**Returns**: If near a dot, returns `{ x, y }` (virtual coordinates); otherwise returns `undefined`

**Implementation**:
1. Converts mouse coordinates to virtual coordinates
2. Accounts for even row offset
3. Calculates the real pixel position of the nearest dot
4. Checks if distance is within `Spacing * 0.3`

---

### HandleMouseMove(e)

**Purpose**: Handles mouse movement and updates the highlighted dot and mouse position.

**Implementation**:
1. Records mouse pixel coordinates to `PatternCanvasState.MousePosition`
2. Calls `IsMouseOverPoint` to detect
3. If near a dot, sends `PatternCanvasMouseMove` message and sets highlight
4. If not near, clears highlight
5. Triggers `RefreshPatternCanvas()`

---

### CanvasClickClick(e)

**Purpose**: Handles mouse clicks and records the clicked dot.

**Implementation**: Sends `PatternCanvasClickPoint` message

---

### PatternCanvasMouseMoveHandler(Message)

**Purpose**: Handles mouse movement messages and records the drawing path.

**Implementation**:
1. If drawing, adds new point to `Path`
2. **Undo mechanism**: If three consecutive points are identical, deletes the last two points (prevents misselection)

---

### PatternCanvasClickPointHandler(Message)

**Purpose**: Handles click messages to start/end drawing.

**Implementation**:
1. Toggles `DrawingStatus`
2. If ending drawing, packages `Path` as a Pattern into `Patterns`
3. Clears `Path`

---

### MessageProcessing(Message)

**Purpose**: Message dispatch center.

**Supported message types**:
- `PatternCanvasClickPoint`
- `PatternCanvasMouseMove`

---

### PatternCanvasClaw()

**Purpose**: Timed message processing function.

**Implementation**: Processes one message from the queue every 10ms.

---

### PatternCanvasVirtualToPatternList()

**Purpose**: Converts patterns in the virtual canvas to an encoding list.

**Returns**: `[[StartingPointX, StartingPointY, PatternString], ...]`

**Implementation**:
1. Calls preprocessing function to correct coordinates
2. Iterates through each pattern's stroke order
3. Uses `CalculateRelativeDirectionCode` to calculate relative direction encoding
4. Removes the default first `w` (straight)
5. Returns `[startX, startY, encodingString]`

**Output example**:
```javascript
[[0, 0, "ea"], [1, 2, "wqd"]]
```

---

### PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray)

**Purpose**: Preprocesses pattern coordinates.

**Implementation**:
- Iterates through each pattern's `StrokeOrder`
- When `y` is even, subtracts `0.5` from `x` coordinate
- Returns a new preprocessed pattern list (does not modify original data)

**Note**: This corrects the even-row offset in the hexagonal grid for more accurate subsequent direction calculations.

---

### CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex)

**Purpose**: Calculates the relative direction encoding between two points.

**Parameters**:
- `FromPoint`: Starting point `{x, y}`
- `ToPoint`: Ending point `{x, y}`
- `PreviousDirectionIndex`: Previous absolute direction index (0-5)

**Returns**: `{ DirectionCode, CurrentDirectionIndex }`

**Implementation**:
1. Calculates point differences `DeltaX`, `DeltaY`
2. Uses `Math.atan2` to calculate current absolute direction angle
3. Maps angle to 6 direction indices (0-5)
4. Calculates relative turn: `CurrentDirectionIndex - PreviousDirectionIndex`
5. Normalizes to `-3` to `+3`
6. Maps to relative encoding:

| Turn Value | Angle Change | Code | Meaning |
|--------|----------|------|------|
| 0 | 0° | `w` | Straight |
| +1 | +60° | `q` | Turn right 60° |
| +2 | +120° | `a` | Turn right 120° |
| +3 | 180° | `s` | U-turn |
| -1 | -60° | `e` | Turn left 60° |
| -2 | -120° | `d` | Turn left 120° |

---

### CalculateAngleBetweenTwoSides(FirstPoint, CommonPoint, SecondPoint)

**Purpose**: Calculates the angle between two sides (in radians).

**Parameters**:
- `FirstPoint`: Point on the first side
- `CommonPoint`: Intersection point of both sides
- `SecondPoint`: Point on the second side

**Returns**: Angle in radians

**Implementation**:
1. Constructs two vectors: `VectorA = FirstPoint - CommonPoint`
2. Calculates dot product and magnitudes
3. Uses `Math.acos` to calculate the angle
4. Clips cosine value to boundaries (prevents floating point errors)

---

### IsAdjacentPoint(MouseMovePoint)

**Purpose**: Checks if the mouse point is adjacent to the last point in the path.

**Parameters**:
- `MouseMovePoint`: Current mouse point `{x, y}`

**Returns**: `true` if adjacent

**Implementation**:
- Returns `true` if path is empty
- Checks if differences in X and Y directions satisfy adjacency conditions

---

### TriggerRegistration()

**Purpose**: Registers all event listeners.

**Registered events**:
- `resize`: Window size change
- `wheel`: Mouse wheel
- `click`: Mouse click
- `mousemove`: Mouse movement

---

## Usage Flow

1. After page load, `PatternCanvas()` initializes automatically
2. User moves mouse on canvas, highlighting the nearest dot
3. Click to start drawing, move mouse to record path
4. Click again to end drawing, pattern is saved
5. Call `PatternCanvasVirtualToPatternList()` to get encoding

## Hexagonal Grid Coordinate System

- Uses virtual coordinates `(i, j)`
- Even rows are offset on the X axis by `Spacing / 2`
- Six direction angles: 0°, 60°, 120°, 180°, 240°, 300°

## Embedded Usage

Create a canvas element with id "PatternCanvas" and load the script.

Example:

```html
<canvas id="PatternCanvas"></canvas>
<script src="/js/PatternCanvas.js"></script>
```

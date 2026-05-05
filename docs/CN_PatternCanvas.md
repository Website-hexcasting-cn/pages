# PatternCanvas.js 使用说明

## 概述

PatternCanvas.js 是一个基于 HTML5 Canvas 的六边形点阵图案绘制与编码库。它支持用户在六边形网格上绘制图案，并将图案转换为相对方向编码字符串。

## 快速开始

创建 id 为 PatternCanvas 的 canvas 元素并加载脚本：

```html
<canvas id="PatternCanvas"></canvas>
<script src="/js/PatternCanvas.js"></script>
```

## 初始化函数

### PatternCanvas(CanvasElement, Config)

**作用**：初始化整个点阵系统。

**参数**：
- `CanvasElement`（可选）：Canvas DOM 元素，默认查找 `id="PatternCanvas"`
- `Config`（可选）：配置对象，会覆盖默认的 PatternData 配置

**返回值**：暴露的 API 对象，包含 `Functions`、`ReadOnly`、`Mutable` 三个分类

**示例**：
```javascript
// 使用默认配置
let api = PatternCanvas();

// 传入自定义 Canvas 元素
let canvas = document.getElementById("MyCanvas");
let api = PatternCanvas(canvas);

// 传入自定义配置
let api = PatternCanvas(null, {
    Spacing: 100,
    PatternLineColor: "#ff0000",
    debug: true
});
```

---

## 核心数据结构

### PatternData

全局配置对象，存储点阵的样式和参数。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| PointWithinColor | string | "#1890ff" | 点中心颜色 |
| PointOutsideColor | string | "#bae7ff" | 点外围颜色 |
| Spacing | number | 80 | 点阵间距（像素） |
| Size | number | 5 | 点的大小 |
| PatternLineColor | string | "#009dffff" | 图案线条颜色 |
| PatternLineWidth | number | 4 | 图案线条宽度 |
| SelectPointSize | number | 1 | 高亮点放大倍数 |
| MouseCloseToTheDisplayPointRange | number | 1.5 | 鼠标靠近显示点半径（格距倍数） |
| debug | boolean | false | 是否显示虚拟坐标 |
| Mode | Array | ["NotFreePainting", "MouseCloseToTheDisplayPoint"] | 渲染模式列表 |

### PatternCanvasVirtual

虚拟画布对象，存储图案数据和画布偏移量。

| 属性 | 类型 | 说明 |
|------|------|------|
| X | number | 画布水平偏移量 |
| Y | number | 画布垂直偏移量 |
| Patterns | Array | 图案列表 |

### Pattern 对象

| 属性 | 类型 | 说明 |
|------|------|------|
| StrokeOrder | Array<{x,y}> | 笔顺点列表（虚拟坐标） |
| StartingPointX | number | 起始点X坐标 |
| StartingPointY | number | 起始点Y坐标 |

### PatternCanvasState

运行时状态对象（内部使用，通过 API 访问）。

| 属性 | 类型 | 说明 |
|------|------|------|
| Messages | Array | 消息队列 |
| Path | Array<{x,y}> | 当前绘制路径 |
| HighlightPoint | {x,y} \| undefined | 当前高亮点 |
| DrawingStatus | boolean | 是否正在绘制 |
| MousePosition | {x,y} \| undefined | 当前鼠标像素坐标 |

---

## 暴露接口

`PatternCanvas()` 返回一个对象，包含以下成员：

### api.Functions — 暴露的函数

| 函数名 | 说明 |
|--------|------|
| VirtualToReal(Point) | 将虚拟坐标转换为真实像素坐标 |
| ScreenSizeChanges() | 窗口尺寸变化处理 |
| IsMouseOverPoint(e) | 检测鼠标是否位于网格点上方 |
| CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) | 计算两点相对方向编码 |
| PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray) | 预处理图案列表 |
| PatternCanvasVirtualToPatternList() | 将图案转换为字符串列表 |
| IsAdjacentPoint(MouseMovePoint) | 判断两点是否相邻 |
| CreateVirtualPatternCanvas(StartingX, StartingY) | 创建虚拟画布对象 |

### api.ReadOnly — 只读变量

| 变量名 | 说明 |
|--------|------|
| PatternCanvas | 当前绑定的 Canvas DOM 元素（getter） |

### api.Mutable — 可修改变量

| 变量名 | 说明 |
|--------|------|
| PatternCanvasVirtual | 虚拟画布对象（可直接修改 X、Y、Patterns） |
| PatternData | 配置数据对象（可直接修改颜色、间距等） |
| Path | 当前绘制路径（getter/setter） |

---

## 使用示例

```javascript
let api = PatternCanvas();

// 调用暴露的函数
let realPos = api.Functions.VirtualToReal({x: 0, y: 0});
console.log(realPos); // {x: 40, y: 0}

// 读取只读属性
console.log(api.ReadOnly.PatternCanvas.width);

// 修改可变状态
api.Mutable.PatternData.Spacing = 100;
api.Mutable.PatternCanvasVirtual.X = 50;
api.Mutable.Path = [];

// 获取图案编码
let patterns = api.Functions.PatternCanvasVirtualToPatternList();
console.log(patterns); // [[0, 0, "ea"], [1, 2, "wqd"]]
```

---

## 函数详解

### VirtualToReal(Point)

**作用**：将虚拟网格坐标转换为真实像素坐标。

**参数**：
- `Point`：虚拟坐标 `{x, y}`

**返回值**：`{ x, y }` 真实像素坐标

**说明**：
- 偶数行在 X 轴上偏移 `Spacing / 2`
- 加上虚拟画布偏移量

---

### ScreenSizeChanges()

**作用**：窗口大小变化时重新调整画布并刷新。

---

### IsMouseOverPoint(e)

**作用**：检测鼠标是否靠近某个点阵点。

**参数**：鼠标事件对象 `e`

**返回值**：若靠近点，返回 `{ x, y }`（虚拟坐标）；否则返回 `undefined`

**说明**：判断距离是否在 `Spacing * 0.3` 范围内

---

### CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex)

**作用**：计算两点之间的相对方向编码。

**参数**：
- `FromPoint`：起点 `{x, y}`
- `ToPoint`：终点 `{x, y}`
- `PreviousDirectionIndex`：上一方向的绝对方向索引（0-5）

**返回值**：`{ DirectionCode, CurrentDirectionIndex }`

**相对方向编码映射**：

| 转向值 | 角度变化 | 编码 | 含义 |
|--------|----------|------|------|
| 0 | 0° | `w` | 直行 |
| +1 | +60° | `q` | 右转60° |
| +2 | +120° | `a` | 右转120° |
| +3 | 180° | `s` | 掉头 |
| -1 | -60° | `e` | 左转60° |
| -2 | -120° | `d` | 左转120° |

---

### PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray)

**作用**：预处理图案坐标。

**参数**：
- `PatternListArray`：图案列表

**返回值**：预处理后的图案列表（不修改原始数据）

**说明**：当 `y` 为偶数时，`x` 坐标减去 `0.5`，修正六边形网格中偶数行的偏移

---

### PatternCanvasVirtualToPatternList()

**作用**：将虚拟画布中的图案转换为编码列表。

**返回值**：`[[StartingPointX, StartingPointY, PatternString], ...]`

**输出示例**：
```javascript
[[0, 0, "ea"], [1, 2, "wqd"]]
```

---

### IsAdjacentPoint(MouseMovePoint)

**作用**：判断鼠标点是否与路径最后一个点相邻。

**参数**：
- `MouseMovePoint`：鼠标当前点 `{x, y}`

**返回值**：若相邻返回 `true`

**相邻条件**（六边形网格）：
- `|DeltaX| === 1 && |DeltaY| === 0`（水平相邻）
- `|DeltaX| === 0 && |DeltaY| === 1`（垂直相邻）
- `|DeltaX| === 1 && |DeltaY| === 1`（对角相邻）

---

### CreateVirtualPatternCanvas(StartingX, StartingY)

**作用**：创建虚拟画布对象。

**参数**：
- `StartingX`：初始水平偏移，默认 0
- `StartingY`：初始垂直偏移，默认 0

**返回值**：`{ X, Y, Patterns: [] }`

---

## 渲染模式

### Mode 配置项

| 模式 | 说明 |
|------|------|
| `"NotFreePainting"` | 只能移动到相邻点 |
| `"FreePainting"` | 可以自由移动到任意点 |
| `"MouseCloseToTheDisplayPoint"` | 只渲染鼠标周围的点（性能优化） |

---

## 使用流程

1. 页面加载后，`PatternCanvas()` 初始化
2. 用户在画布上移动鼠标，高亮最近的点
3. 点击开始绘制，移动鼠标记录路径
4. 再次点击结束绘制，图案被保存
5. 调用 `PatternCanvasVirtualToPatternList()` 获取编码

---

## 六边形网格坐标系

- 使用虚拟坐标 `(i, j)`
- 偶数行在 X 轴上偏移 `Spacing / 2`
- 六个方向角度：0°, 60°, 120°, 180°, 240°, 300°
# PatternCanvas.js 使用说明

## 概述

PatternCanvas.js 是一个基于 HTML5 Canvas 的六边形点阵图案绘制与编码库。它支持用户在六边形网格上绘制图案，并将图案转换为相对方向编码字符串。

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

运行时状态对象（只读暴露）。

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

### 暴露的函数

| 函数名 | 说明 |
|--------|------|
| VirtualToReal(x, y) | 虚拟坐标转真实像素坐标 |
| ScreenSizeChanges() | 窗口尺寸变化处理 |
| IsMouseOverPoint(e) | 检测鼠标是否位于网格点上方 |
| CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) | 计算两点相对方向编码 |
| PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray) | 预处理图案列表 |
| PatternCanvasVirtualToPatternList() | 将图案转换为字符串列表 |
| IsAdjacentPoint(MouseMovePoint) | 判断两点是否相邻 |
| CreateVirtualPatternCanvas(StartingX, StartingY) | 创建虚拟画布对象 |
| RefreshPatternCanvas() | 刷新画布渲染 |
| GetPatternData() | 获取 PatternData 配置副本 |

### 暴露的变量

| 变量名 | 可修改 | 说明 |
|--------|--------|------|
| PatternCanvasState | 否（Object.freeze） | 运行时状态对象 |
| PatternCanvasVirtual | 是 | 虚拟画布对象（可直接修改 X、Y、Patterns） |

---

## 函数详解

### PatternCanvas()

**作用**：初始化整个点阵系统。

**内部实现**：
1. 初始化 `PatternData` 配置
2. 创建虚拟画布 `PatternCanvasVirtual`
3. 初始化消息队列和绘制路径
4. 注册事件触发器
5. 设置画布尺寸并首次刷新
6. 启动定时消息处理循环

**调用时机**：页面加载完成后自动调用。

---

### VirtualToReal(x, y)

**作用**：将虚拟网格坐标转换为真实像素坐标。

**参数**：
- `x`：虚拟X坐标
- `y`：虚拟Y坐标

**返回值**：`{ x, y }` 真实像素坐标

**内部实现**：
- 偶数行在 X 轴上偏移 `Spacing / 2`
- 加上虚拟画布偏移量 `PatternCanvasVirtual.X` / `.Y`

---

### resizeCanvas()

**作用**：设置 Canvas 尺寸为窗口大小。

**内部实现**：
- 获取 `PatternCanvas` 元素
- 将 `width` 和 `height` 设为 `window.innerWidth` / `window.innerHeight`

---

### RefreshPatternCanvas()

**作用**：刷新整个点阵画布，包括点阵、已保存图案、绘制预览和高亮点。

**内部实现**：
1. 清空画布
2. 计算可见区域的虚拟坐标范围
3. 若模式包含 `MouseCloseToTheDisplayPoint` 且鼠标未进入画布，跳过点阵渲染
4. 绘制六边形点阵（偶数行偏移 `Spacing/2`）
5. 若模式包含 `MouseCloseToTheDisplayPoint`，只渲染鼠标周围指定半径内的点
6. 绘制已保存的图案线段
7. 绘制当前绘制中的路径预览
8. 绘制高亮点（放大显示）
9. **debug 模式**：在每个点旁标注虚拟坐标 `(i,j)`

---

### CreateVirtualPatternCanvas(StartingX, StartingY)

**作用**：创建虚拟画布对象。

**参数**：
- `StartingX`：初始水平偏移，默认 0
- `StartingY`：初始垂直偏移，默认 0

**返回值**：`{ X, Y, Patterns: [] }`

---

### ScreenSizeChanges()

**作用**：窗口大小变化时重新调整画布并刷新。

**内部实现**：调用 `resizeCanvas()` + `RefreshPatternCanvas()`

---

### MouseScrollWheel(e)

**作用**：处理鼠标滚轮事件，平移画布。

**内部实现**：
- 根据滚动方向（X轴或Y轴）调整 `PatternCanvasVirtual.X` / `.Y`
- 调用 `RefreshPatternCanvas()` 刷新

---

### IsMouseOverPoint(e)

**作用**：检测鼠标是否靠近某个点阵点。

**参数**：鼠标事件对象 `e`

**返回值**：若靠近点，返回 `{ x, y }`（虚拟坐标）；否则返回 `undefined`

**内部实现**：
1. 将鼠标坐标转换为虚拟坐标
2. 考虑偶数行偏移
3. 计算最近点的真实像素位置
4. 判断距离是否在 `Spacing * 0.3` 范围内

---

### HandleMouseMove(e)

**作用**：处理鼠标移动，更新高亮点和鼠标位置。

**内部实现**：
1. 记录鼠标像素坐标到 `PatternCanvasState.MousePosition`
2. 调用 `IsMouseOverPoint` 检测
3. 若靠近点，发送 `PatternCanvasMouseMove` 消息并设置高亮
4. 若未靠近，清除高亮
5. 触发 `RefreshPatternCanvas()`

---

### CanvasClickClick(e)

**作用**：处理鼠标点击，记录点击的点。

**内部实现**：发送 `PatternCanvasClickPoint` 消息

---

### PatternCanvasMouseMoveHandler(Message)

**作用**：处理鼠标移动消息，记录绘制路径。

**内部实现**：
1. 若正在绘制，将新点加入 `Path`
2. **后悔机制**：若连续三个点相同，删除最后两个点（防止误选）

---

### PatternCanvasClickPointHandler(Message)

**作用**：处理点击消息，开始/结束绘制。

**内部实现**：
1. 切换 `DrawingStatus`
2. 若结束绘制，将 `Path` 打包为 Pattern 存入 `Patterns`
3. 清空 `Path`

---

### MessageProcessing(Message)

**作用**：消息分发中心。

**支持的消息类型**：
- `PatternCanvasClickPoint`
- `PatternCanvasMouseMove`

---

### PatternCanvasClaw()

**作用**：定时消息处理函数。

**内部实现**：每 10ms 从消息队列中取出一个消息并处理。

---

### PatternCanvasVirtualToPatternList()

**作用**：将虚拟画布中的图案转换为编码列表。

**返回值**：`[[StartingPointX, StartingPointY, PatternString], ...]`

**内部实现**：
1. 调用预处理函数修正坐标
2. 遍历每个图案的笔顺
3. 使用 `CalculateRelativeDirectionCode` 计算相对方向编码
4. 去掉默认的第一个 `w`（直行）
5. 返回 `[起始X, 起始Y, 编码字符串]`

**输出示例**：
```javascript
[[0, 0, "ea"], [1, 2, "wqd"]]
```

---

### PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray)

**作用**：预处理图案坐标。

**内部实现**：
- 遍历每个图案的 `StrokeOrder`
- 当 `y` 为偶数时，`x` 坐标减去 `0.5`
- 返回新的预处理后的图案列表（不修改原始数据）

**说明**：这是为了修正六边形网格中偶数行的偏移，使后续方向计算更准确。

---

### CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex)

**作用**：计算两点之间的相对方向编码。

**参数**：
- `FromPoint`：起点 `{x, y}`
- `ToPoint`：终点 `{x, y}`
- `PreviousDirectionIndex`：上一方向的绝对方向索引（0-5）

**返回值**：`{ DirectionCode, CurrentDirectionIndex }`

**内部实现**：
1. 计算两点差值 `DeltaX`, `DeltaY`
2. 使用 `Math.atan2` 计算当前绝对方向角度
3. 将角度映射到 6 个方向索引（0-5）
4. 计算相对转向：`CurrentDirectionIndex - PreviousDirectionIndex`
5. 归一化到 `-3` 到 `+3`
6. 映射到相对编码：

| 转向值 | 角度变化 | 编码 | 含义 |
|--------|----------|------|------|
| 0 | 0° | `w` | 直行 |
| +1 | +60° | `q` | 右转60° |
| +2 | +120° | `a` | 右转120° |
| +3 | 180° | `s` | 掉头 |
| -1 | -60° | `e` | 左转60° |
| -2 | -120° | `d` | 左转120° |

---

### CalculateAngleBetweenTwoSides(FirstPoint, CommonPoint, SecondPoint)

**作用**：计算两边夹角（弧度制）。

**参数**：
- `FirstPoint`：第一条边上的点
- `CommonPoint`：两边交点
- `SecondPoint`：第二条边上的点

**返回值**：夹角弧度值

**内部实现**：
1. 构造两个向量：`VectorA = FirstPoint - CommonPoint`
2. 计算点积和模长
3. 使用 `Math.acos` 计算夹角
4. 对余弦值做边界裁剪（防止浮点误差）

---

### IsAdjacentPoint(MouseMovePoint)

**作用**：判断鼠标点是否与路径最后一个点相邻。

**参数**：
- `MouseMovePoint`：鼠标当前点 `{x, y}`

**返回值**：若相邻返回 `true`

**内部实现**：
- 若路径为空，返回 `true`
- 判断两点在 X 和 Y 方向上的差值是否满足相邻条件

---

### TriggerRegistration()

**作用**：注册所有事件监听器。

**注册的事件**：
- `resize`：窗口大小变化
- `wheel`：鼠标滚轮
- `click`：鼠标点击
- `mousemove`：鼠标移动

---

## 使用流程

1. 页面加载后，`PatternCanvas()` 自动初始化
2. 用户在画布上移动鼠标，高亮最近的点
3. 点击开始绘制，移动鼠标记录路径
4. 再次点击结束绘制，图案被保存
5. 调用 `PatternCanvasVirtualToPatternList()` 获取编码

## 六边形网格坐标系

- 使用虚拟坐标 `(i, j)`
- 偶数行在 X 轴上偏移 `Spacing / 2`
- 六个方向角度：0°, 60°, 120°, 180°, 240°, 300°

## 具体内嵌方法

创建 id 为 PatternCanvas 的 canvas 元素并且加载脚本。

例子：

```html
<canvas id="PatternCanvas"></canvas>
<script src="/js/PatternCanvas.js"></script>
```

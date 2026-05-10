/**
 * PatternCanvas 构造函数
 * 创建一个图案绘制画布，支持在六边形网格上绘制图案
 * @param {HTMLElement} CanvasElement - 画布元素
 * @param {Object} Config - 配置对象，包含颜色、间距、大小等参数
 * @returns {Object} 返回包含函数、只读属性和可变属性的对象
 */
function PatternCanvas(CanvasElement, Config = {}) {
    let PatternCanvasElement = CanvasElement || document.getElementById("PatternCanvas");
    let PatternData = {
        Point: {
            InnerColor: "#1890ff",
            OuterColor: "#bae7ff",
            Size: 5,
            SelectedSize: 1
        },
        Grid: {
            Spacing: 80
        },
        Line: {
            Color: "#009dffff",
            Width: 4
        },
        Mouse: {
            Range: 1.5,
            FadeRate: 0.7
        },
        Mode: {
            FreePainting: false,
            ShowNearMouse: true,
            FadeWithDistance: true
        },
        Debug: false
    };
    Object.assign(PatternData, Config);
    Object.assign(PatternData.Point, Config.Point || {});
    Object.assign(PatternData.Grid, Config.Grid || {});
    Object.assign(PatternData.Line, Config.Line || {});
    Object.assign(PatternData.Mouse, Config.Mouse || {});
    Object.assign(PatternData.Mode, Config.Mode || {});
    
    let PatternCanvasVirtual = CreateVirtualPatternCanvas();
    let PatternCanvasState = {
        Messages: [],
        Path: [],
        MousePosition: undefined,
        HighlightPoint: undefined,
        DrawingStatus: false
    };

    function ResizeCanvas(width = window.innerWidth, height = window.innerHeight) {
        PatternCanvasElement.width = width;
        PatternCanvasElement.height = height;
    }

    /**
     * 计算网格绘制范围
     * @returns {Object} 包含 StartI, EndI, StartJ, EndJ 的范围对象
     */
    function GetGridRange() {
        let CanvasWidth = PatternCanvasElement.width;
        let CanvasHeight = PatternCanvasElement.height;
        return {
            StartI: Math.floor(-PatternCanvasVirtual.X / PatternData.Grid.Spacing) - 1,
            EndI: Math.ceil((CanvasWidth - PatternCanvasVirtual.X) / PatternData.Grid.Spacing) + 1,
            StartJ: Math.floor(-PatternCanvasVirtual.Y / PatternData.Grid.Spacing) - 1,
            EndJ: Math.ceil((CanvasHeight - PatternCanvasVirtual.Y) / PatternData.Grid.Spacing) + 1
        };
    }

    /**
     * 绘制单个网格点
     * @param {CanvasRenderingContext2D} Ctx - 画布上下文
     * @param {number} PointX - 点的X坐标
     * @param {number} PointY - 点的Y坐标
     * @param {number} Opacity - 透明度（0-1），可选，默认为1
     */
    function RenderSinglePoint(Ctx, PointX, PointY, Opacity = 1) {
        let Gradient = Ctx.createRadialGradient(PointX, PointY, 0, PointX, PointY, PatternData.Point.Size);
        let InnerColor = PatternData.Point.InnerColor;
        let OuterColor = PatternData.Point.OuterColor;
        if (Opacity < 1) {
            InnerColor = HexToRgba(InnerColor, Opacity);
            OuterColor = HexToRgba(OuterColor, Opacity);
        }
        Gradient.addColorStop(0, InnerColor);
        Gradient.addColorStop(1, OuterColor);
        Ctx.beginPath();
        Ctx.arc(PointX, PointY, PatternData.Point.Size / 2, 0, Math.PI * 2);
        Ctx.fillStyle = Gradient;
        Ctx.fill();
        Ctx.closePath();
    }

    /**
     * 将十六进制颜色转换为RGBA格式
     * @param {string} Hex - 十六进制颜色值
     * @param {number} Alpha - 透明度（0-1）
     * @returns {string} RGBA颜色字符串
     */
    function HexToRgba(Hex, Alpha) {
        let R = parseInt(Hex.slice(1, 3), 16);
        let G = parseInt(Hex.slice(3, 5), 16);
        let B = parseInt(Hex.slice(5, 7), 16);
        return `rgba(${R}, ${G}, ${B}, ${Alpha})`;
    }

    /**
     * 绘制网格点
     * 根据模式绘制可见范围内的所有网格点
     * @param {CanvasRenderingContext2D} Ctx - 画布上下文
     * @param {Object} Range - 网格范围对象
     */
    function RenderGridPoints(Ctx, Range) {
        let ShowNearMouse = PatternData.Mode.ShowNearMouse;
        let FadeWithDistance = PatternData.Mode.FadeWithDistance;
        let MousePosition = PatternCanvasState.MousePosition;
        
        if (ShowNearMouse && !MousePosition) return;
        
        let MaxDistance = PatternData.Grid.Spacing * PatternData.Mouse.Range;
        
        for (let i = Range.StartI; i < Range.EndI; i++) {
            for (let j = Range.StartJ; j < Range.EndJ; j++) {
                let OffsetX = (j % 2 === 0) ? 0 : PatternData.Grid.Spacing / 2;
                let PointX = i * PatternData.Grid.Spacing + OffsetX + PatternCanvasVirtual.X;
                let PointY = j * PatternData.Grid.Spacing + PatternCanvasVirtual.Y;
                
                let Distance = 0;
                if (MousePosition) {
                    Distance = Math.sqrt(Math.pow(PointX - MousePosition.x, 2) + Math.pow(PointY - MousePosition.y, 2));
                }
                
                if (ShowNearMouse && MousePosition) {
                    if (Distance > MaxDistance) continue;
                }
                
                let Opacity = 1;
                if (ShowNearMouse && FadeWithDistance && MousePosition) {
                    Opacity = 1 - (Distance / MaxDistance) * PatternData.Mouse.FadeRate;
                    Opacity = Math.max(0.1, Math.min(1, Opacity));
                }
                
                RenderSinglePoint(Ctx, PointX, PointY, Opacity);
                
                if (PatternData.Debug) {
                    Ctx.fillStyle = "#ff0000";
                    Ctx.font = "12px Arial";
                    Ctx.fillText(i + "," + j, PointX + 5, PointY - 5);
                }
            }
        }
    }

    /**
     * 绘制两点之间的线条
     * @param {CanvasRenderingContext2D} Ctx - 画布上下文
     * @param {Object} FromPoint - 起始点虚拟坐标
     * @param {Object} ToPoint - 结束点虚拟坐标
     */
    function RenderLine(Ctx, FromPoint, ToPoint) {
        let FromReal = VirtualToReal(FromPoint);
        let ToReal = VirtualToReal(ToPoint);
        Ctx.beginPath();
        Ctx.moveTo(FromReal.x, FromReal.y);
        Ctx.lineTo(ToReal.x, ToReal.y);
        Ctx.strokeStyle = PatternData.Line.Color;
        Ctx.lineWidth = PatternData.Line.Width;
        Ctx.stroke();
        Ctx.closePath();
    }

    /**
     * 绘制已完成的图案
     * @param {CanvasRenderingContext2D} Ctx - 画布上下文
     */
    function RenderPatterns(Ctx) {
        let Patterns = PatternCanvasVirtual.Patterns;
        for (let i = 0; i < Patterns.length; i++) {
            let Pattern = Patterns[i];
            for (let j = 1; j < Pattern.StrokeOrder.length; j++) {
                RenderLine(Ctx, Pattern.StrokeOrder[j - 1], Pattern.StrokeOrder[j]);
            }
        }
    }

    /**
     * 绘制当前正在绘制的路径
     * @param {CanvasRenderingContext2D} Ctx - 画布上下文
     * @param {Object} HighlightPoint - 高亮点坐标
     */
    function RenderCurrentPath(Ctx, HighlightPoint) {
        let Path = PatternCanvasState.Path;
        if (!PatternCanvasState.DrawingStatus || Path.length === 0) return;
        
        for (let i = 1; i < Path.length; i++) {
            RenderLine(Ctx, Path[i - 1], Path[i]);
        }
        
        if (HighlightPoint) {
            let LastPoint = Path[Path.length - 1];
            RenderLine(Ctx, LastPoint, HighlightPoint);
        }
    }

    /**
     * 绘制高亮点
     * @param {CanvasRenderingContext2D} Ctx - 画布上下文
     * @param {Object} HighlightPoint - 高亮点虚拟坐标
     */
    function RenderHighlightPoint(Ctx, HighlightPoint) {
        if (!HighlightPoint) return;
        
        let RealPoint = VirtualToReal(HighlightPoint);
        let Gradient = Ctx.createRadialGradient(RealPoint.x, RealPoint.y, 0, RealPoint.x, RealPoint.y, PatternData.Point.Size * 0.1);
        Gradient.addColorStop(0, PatternData.Point.InnerColor);
        Gradient.addColorStop(1, PatternData.Point.OuterColor);
        Ctx.beginPath();
        Ctx.arc(RealPoint.x, RealPoint.y, PatternData.Point.Size * PatternData.Point.SelectedSize, 0, Math.PI * 2);
        Ctx.fillStyle = Gradient;
        Ctx.fill();
        Ctx.closePath();
    }

    /**
     * 刷新画布显示
     * 重新绘制所有点、已完成的图案和当前正在绘制的路径
     * @param {Object} HighlightPoint - 高亮点坐标，可选
     */
    function RefreshPatternCanvas(HighlightPoint = PatternCanvasState.HighlightPoint) {
        let Ctx = PatternCanvasElement.getContext("2d");
        Ctx.clearRect(0, 0, PatternCanvasElement.width, PatternCanvasElement.height);
        
        let Range = GetGridRange();
        RenderGridPoints(Ctx, Range);
        RenderPatterns(Ctx);
        RenderCurrentPath(Ctx, HighlightPoint);
        RenderHighlightPoint(Ctx, HighlightPoint);
    }

    /**
     * 处理屏幕尺寸变化
     * 调整画布大小并刷新显示
     */
    function ScreenSizeChanges() {
        ResizeCanvas();
        RefreshPatternCanvas();
    }

    /**
     * 处理鼠标滚轮事件
     * 根据滚轮方向移动虚拟画布
     * @param {WheelEvent} e - 滚轮事件对象
     */
    function MouseScrollWheel(e) {
        e.preventDefault();
        PatternCanvasVirtual.X += (e.deltaX * (Math.abs(e.deltaY) < Math.abs(e.deltaX)));
        PatternCanvasVirtual.Y += (e.deltaY * (Math.abs(e.deltaX) < Math.abs(e.deltaY)));
        RefreshPatternCanvas();
    }

    /**
     * 判断鼠标是否悬停在某个网格点上
     * @param {MouseEvent} e - 鼠标事件对象
     * @returns {Object|undefined} 返回网格点坐标 {x, y} 或 undefined
     */
    function IsMouseOverPoint(e) {
        let ClickX = e.clientX - PatternCanvasElement.offsetLeft;
        let ClickY = e.clientY - PatternCanvasElement.offsetTop;
        let CanvasClickYInVirtual = Math.round((ClickY - PatternCanvasVirtual.Y) / PatternData.Grid.Spacing);
        let OffsetX = (CanvasClickYInVirtual % 2 === 0) ? 0 : PatternData.Grid.Spacing / 2;
        let CanvasClickXInVirtual = Math.round((ClickX - PatternCanvasVirtual.X - OffsetX) / PatternData.Grid.Spacing);
        let RealPointX = CanvasClickXInVirtual * PatternData.Grid.Spacing + OffsetX + PatternCanvasVirtual.X;
        let RealPointY = CanvasClickYInVirtual * PatternData.Grid.Spacing + PatternCanvasVirtual.Y;
        if (Math.abs(ClickX - RealPointX) <= PatternData.Grid.Spacing * 0.3 &&
            Math.abs(ClickY - RealPointY) <= PatternData.Grid.Spacing * 0.3) {
            return { x: CanvasClickXInVirtual, y: CanvasClickYInVirtual };
        }
    }

    /**
     * 计算相对方向代码
     * 根据两点之间的方向计算相对于前一方向的转向代码
     * @param {Object} FromPoint - 起始点坐标
     * @param {Object} ToPoint - 目标点坐标
     * @param {number} PreviousDirectionIndex - 前一方向索引
     * @returns {Object} 返回方向代码和当前方向索引
     */
    function CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) {
        let DeltaX = ToPoint.x - FromPoint.x;
        let DeltaY = ToPoint.y - FromPoint.y;
        if (Math.abs(DeltaX) < 0.001 && Math.abs(DeltaY) < 0.001) {
            return { DirectionCode: "", CurrentDirectionIndex: PreviousDirectionIndex };
        }
        let Angle = Math.atan2(-DeltaY, DeltaX);
        let CurrentDirectionIndex = Math.round(Angle / (Math.PI / 3));
        while (CurrentDirectionIndex < 0) {
            CurrentDirectionIndex += 6;
        }
        CurrentDirectionIndex = CurrentDirectionIndex % 6;
        let Turn = CurrentDirectionIndex - PreviousDirectionIndex;
        while (Turn > 3) {
            Turn -= 6;
        }
        while (Turn < -3) {
            Turn += 6;
        }
        let RelativeDirectionMap = { 0: "w", 1: "q", 2: "a", 3: "s", [-1]: "e", [-2]: "d" };
        let DirectionCode = RelativeDirectionMap[Turn];
        return { DirectionCode: DirectionCode, CurrentDirectionIndex: CurrentDirectionIndex };
    }

    /**
     * 预处理图案列表
     * 将图案坐标转换为标准格式，处理奇偶行的偏移
     * @param {Array} PatternListArray - 图案数组
     * @returns {Array} 预处理后的图案列表
     */
    function PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray) {
        let PreprocessedPatternList = [];
        for (let i = 0; i < PatternListArray.length; i++) {
            let PreprocessedStrokeOrder = [];
            for (let j = 0; j < PatternListArray[i].StrokeOrder.length; j++) {
                let Point = PatternListArray[i].StrokeOrder[j];
                let PreprocessedPoint = { x: Point.x, y: Point.y };
                if (PreprocessedPoint.y % 2 === 0) {
                    PreprocessedPoint.x -= 0.5;
                }
                PreprocessedStrokeOrder.push(PreprocessedPoint);
            }
            PreprocessedPatternList.push({
                StrokeOrder: PreprocessedStrokeOrder,
                StartingPointX: PreprocessedStrokeOrder[0].x,
                StartingPointY: PreprocessedStrokeOrder[0].y
            });
        }
        return PreprocessedPatternList;
    }

    /**
     * 将虚拟画布上的图案转换为图案字符串列表
     * @returns {Array} 返回图案字符串列表，每个元素包含 [起始X, 起始Y, 方向字符串]
     */
    function PatternCanvasVirtualToPatternList() {
        if (PatternCanvasVirtual.Patterns.length === 0) {
            return [];
        }
        let PatternList = PatternCanvasVirtualToPatternListPreprocessPatternList(PatternCanvasVirtual.Patterns);
        let PatternStringList = [];
        for (let i = 0; i < PatternList.length; i++) {
            const Pattern = PatternList[i];
            if (Pattern.StrokeOrder.length === 0) {
                continue;
            }
            let PatternString = "";
            let PreviousDirectionIndex = 0;
            for (let j = 1; j < Pattern.StrokeOrder.length; j++) {
                let PreviousPoint = Pattern.StrokeOrder[j - 1];
                let CurrentPoint = Pattern.StrokeOrder[j];
                let Result = CalculateRelativeDirectionCode(PreviousPoint, CurrentPoint, PreviousDirectionIndex);
                PatternString += Result.DirectionCode;
                PreviousDirectionIndex = Result.CurrentDirectionIndex;
            }
            PatternString = PatternString.slice(1);
            PatternStringList.push([Pattern.StartingPointX, Pattern.StartingPointY, PatternString]);
        }
        return PatternStringList;
    }

    /**
     * 计算两边之间的夹角
     * @param {Object} FirstPoint - 第一个点坐标
     * @param {Object} CommonPoint - 公共点坐标
     * @param {Object} SecondPoint - 第二个点坐标
     * @returns {number} 返回夹角（弧度）
     */
    function CalculateAngleBetweenTwoSides(FirstPoint, CommonPoint, SecondPoint) {
        let VectorA = { x: FirstPoint.x - CommonPoint.x, y: FirstPoint.y - CommonPoint.y };
        let VectorB = { x: SecondPoint.x - CommonPoint.x, y: SecondPoint.y - CommonPoint.y };
        let DotProduct = VectorA.x * VectorB.x + VectorA.y * VectorB.y;
        let MagnitudeA = Math.sqrt(VectorA.x * VectorA.x + VectorA.y * VectorA.y);
        let MagnitudeB = Math.sqrt(VectorB.x * VectorB.x + VectorB.y * VectorB.y);
        if (MagnitudeA === 0 || MagnitudeB === 0) {
            return 0;
        }
        let CosTheta = DotProduct / (MagnitudeA * MagnitudeB);
        CosTheta = Math.max(-1, Math.min(1, CosTheta));
        return Math.acos(CosTheta);
    }

    /**
     * 判断点是否与路径中最后一个点相邻
     * @param {Object} MouseMovePoint - 鼠标移动到的点坐标
     * @returns {boolean} 如果相邻返回 true
     */
    function IsAdjacentPoint(MouseMovePoint) {
        if (PatternCanvasState.Path.length === 0) {
            return true;
        }
        let Last = PatternCanvasState.Path[PatternCanvasState.Path.length - 1];
        let DeltaX = MouseMovePoint.x - Last.x;
        let DeltaY = MouseMovePoint.y - Last.y;
        if (Math.abs(DeltaX) === 1 && Math.abs(DeltaY) === 0) return true;
        if (Math.abs(DeltaX) === 0 && Math.abs(DeltaY) === 1) return true;
        if (Math.abs(DeltaX) === 1 && Math.abs(DeltaY) === 1) return true;
    }

    /**
     * 处理鼠标移动事件
     * 更新鼠标位置，判断是否悬停在点上，并触发相应消息
     * @param {MouseEvent} e - 鼠标事件对象
     */
    function HandleMouseMove(e) {
        let MouseX = e.clientX - PatternCanvasElement.offsetLeft;
        let MouseY = e.clientY - PatternCanvasElement.offsetTop;
        PatternCanvasState.MousePosition = { x: MouseX, y: MouseY };
        let MouseMovePoint = IsMouseOverPoint(e);
        if (MouseMovePoint !== undefined && PatternData.Mode.FreePainting) {
            PatternCanvasState.Messages.push({ Type: "PatternCanvasMouseMove", x: MouseMovePoint.x, y: MouseMovePoint.y });
            PatternCanvasState.HighlightPoint = MouseMovePoint;
            RefreshPatternCanvas();
        } else if (MouseMovePoint !== undefined && !PatternData.Mode.FreePainting) {
            if (IsAdjacentPoint(MouseMovePoint)) {
                PatternCanvasState.Messages.push({ Type: "PatternCanvasMouseMove", x: MouseMovePoint.x, y: MouseMovePoint.y });
                PatternCanvasState.HighlightPoint = MouseMovePoint;
                RefreshPatternCanvas();
            }
        } else {
            PatternCanvasState.HighlightPoint = undefined;
            RefreshPatternCanvas();
        }
    }

    /**
     * 处理画布点击事件
     * 判断点击位置是否在网格点上，并发送点击消息
     * @param {MouseEvent} e - 鼠标事件对象
     */
    function CanvasClickClick(e) {
        let ClickPoint = IsMouseOverPoint(e);
        if (ClickPoint !== undefined) {
            PatternCanvasState.Messages.push({ Type: "PatternCanvasClickPoint", x: ClickPoint.x, y: ClickPoint.y });
        }
    }

    /**
     * 处理鼠标移动消息
     * 在绘制状态下将点添加到路径中，处理回退检测
     * @param {Object} Message - 消息对象，包含点的坐标
     */
    function PatternCanvasMouseMoveHandler(Message) {
        let Last = PatternCanvasState.Path[PatternCanvasState.Path.length - 1];
        if (PatternCanvasState.DrawingStatus && !(Last && Last.x === Message.x && Last.y === Message.y)) {
            PatternCanvasState.Path.push({ x: Message.x, y: Message.y });
        }
        let ThirdLast = PatternCanvasState.Path[PatternCanvasState.Path.length - 3];
        if (PatternCanvasState.DrawingStatus &&
            PatternCanvasState.Path.length > 2 &&
            ThirdLast && Last &&
            ThirdLast.x === Last.x && ThirdLast.y === Last.y
        ) {
            PatternCanvasState.Path.pop();
            PatternCanvasState.Path.pop();
        }
    }

    /**
     * 处理点击点消息
     * 切换绘制状态，完成图案绘制并添加到虚拟画布
     * @param {Object} Message - 消息对象
     */
    function PatternCanvasClickPointHandler(Message) {
        PatternCanvasState.DrawingStatus = !PatternCanvasState.DrawingStatus;
        if (!PatternCanvasState.DrawingStatus) {
            let StrokeOrder = PatternCanvasState.Path;
            PatternCanvasVirtual.Patterns.push({ StrokeOrder: StrokeOrder, StartingPointX: StrokeOrder[0].x, StartingPointY: StrokeOrder[0].y });
            RefreshPatternCanvas();
            PatternCanvasState.Path = [];
        }
    }

    /**
     * 消息处理分发器
     * 根据消息类型调用相应的处理函数
     * @param {Object} Message - 消息对象
     */
    function MessageProcessing(Message) {
        switch (Message.Type) {
            case "PatternCanvasClickPoint":
                PatternCanvasClickPointHandler(Message);
                break;
            case "PatternCanvasMouseMove":
                PatternCanvasMouseMoveHandler(Message);
                break;
        }
    }

    function PatternCanvasClaw() {
        if (PatternCanvasState.Messages.length == 0) {
            return;
        }
        let Message = PatternCanvasState.Messages.shift();
        MessageProcessing(Message);
    }

    /**
     * 注册事件监听器
     * 绑定窗口大小变化、鼠标滚轮、点击、移动等事件
     */
    function TriggerRegistration() {
        const PatternBottomContainer = document.getElementById("PatternBottomContainer");
        PatternBottomContainer.addEventListener("click", function () {});
        window.addEventListener('resize', function (e) {
            ScreenSizeChanges();
        });
        PatternCanvasElement.addEventListener("wheel", function (e) {
            MouseScrollWheel(e);
        });
        PatternCanvasElement.addEventListener("click", function (e) {
            CanvasClickClick(e);
        });
        PatternCanvasElement.addEventListener("mousemove", function (e) {
            e.preventDefault();
            HandleMouseMove(e);
        });
        setInterval(PatternCanvasClaw, 10);
    }

    /**
     * 将虚拟坐标转换为实际像素坐标
     * @param {Object} Point - 虚拟坐标点 {x, y}
     * @returns {Object} 实际像素坐标 {x, y}
     */
    function VirtualToReal(Point) {
        let OffsetX = (Point.y % 2 === 0) ? 0 : PatternData.Grid.Spacing / 2;
        return {
            x: Point.x * PatternData.Grid.Spacing + OffsetX + PatternCanvasVirtual.X,
            y: Point.y * PatternData.Grid.Spacing + PatternCanvasVirtual.Y
        };
    }

    ResizeCanvas();
    RefreshPatternCanvas();
    TriggerRegistration();

    return {
        Functions: {
            VirtualToReal: VirtualToReal,
            ScreenSizeChanges: ScreenSizeChanges,
            IsMouseOverPoint: IsMouseOverPoint,
            CalculateRelativeDirectionCode: CalculateRelativeDirectionCode,
            PatternCanvasVirtualToPatternListPreprocessPatternList: PatternCanvasVirtualToPatternListPreprocessPatternList,
            PatternCanvasVirtualToPatternList: PatternCanvasVirtualToPatternList,
            IsAdjacentPoint: IsAdjacentPoint,
            CreateVirtualPatternCanvas: CreateVirtualPatternCanvas
        },
        ReadOnly: {
            get PatternCanvas() { return PatternCanvasElement; }
        },
        Mutable: {
            PatternCanvasVirtual: PatternCanvasVirtual,
            PatternData: PatternData,
            get Path() { return PatternCanvasState.Path; },
            set Path(value) { PatternCanvasState.Path = value; }
        }
    };
}

/**
 * 创建虚拟图案画布对象
 * 用于存储画布的偏移位置和已绘制的图案
 * @param {number} StartingX - 起始X偏移量
 * @param {number} StartingY - 起始Y偏移量
 * @returns {Object} 虚拟画布对象，包含X、Y偏移和Patterns数组
 */
function CreateVirtualPatternCanvas(StartingX = 0, StartingY = 0) {
    return { X: StartingX, Y: StartingY, Patterns: [] };
}
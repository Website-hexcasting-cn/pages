function PatternCanvas(CanvasElement, Config = {}) {
    let PatternCanvasElement = CanvasElement || document.getElementById("PatternCanvas");
    let PatternData = { PointWithinColor: "#1890ff", PointOutsideColor: "#bae7ff", Spacing: 80, Size: 5, PatternLineColor: "#009dffff", PatternLineWidth: 4, SelectPointSize: 1, MouseCloseToTheDisplayPointRange: 1.5, debug: false, Mode: ["NotFreePainting", 'MouseCloseToTheDisplayPoint'] };
    Object.assign(PatternData, Config);
    
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

    function RefreshPatternCanvas(HighlightPoint = PatternCanvasState.HighlightPoint) {
        let PatternCanvasCtx = PatternCanvasElement.getContext("2d");
        PatternCanvasCtx.clearRect(0, 0, PatternCanvasElement.width, PatternCanvasElement.height);
        
        let CanvasWidth = PatternCanvasElement.width;
        let CanvasHeight = PatternCanvasElement.height;
        let StartI = Math.floor(-PatternCanvasVirtual.X / PatternData.Spacing) - 1;
        let EndI = Math.ceil((CanvasWidth - PatternCanvasVirtual.X) / PatternData.Spacing) + 1;
        let StartJ = Math.floor(-PatternCanvasVirtual.Y / PatternData.Spacing) - 1;
        let EndJ = Math.ceil((CanvasHeight - PatternCanvasVirtual.Y) / PatternData.Spacing) + 1;
        let IsMouseCloseToTheDisplayPointMode = PatternData.Mode.includes("MouseCloseToTheDisplayPoint");
        let MousePosition = PatternCanvasState.MousePosition;
        
        if (!(IsMouseCloseToTheDisplayPointMode && !MousePosition)) {
            for (let i = StartI; i < EndI; i++) {
                for (let j = StartJ; j < EndJ; j++) {
                    let OffsetX = (j % 2 === 0) ? 0 : PatternData.Spacing / 2;
                    let PointX = i * PatternData.Spacing + OffsetX + PatternCanvasVirtual.X;
                    let PointY = j * PatternData.Spacing + PatternCanvasVirtual.Y;
                    
                    if (IsMouseCloseToTheDisplayPointMode && MousePosition) {
                        let Distance = Math.sqrt(Math.pow(PointX - MousePosition.x, 2) + Math.pow(PointY - MousePosition.y, 2));
                        if (Distance > PatternData.Spacing * PatternData.MouseCloseToTheDisplayPointRange) continue;
                    }
                    
                    let Gradient = PatternCanvasCtx.createRadialGradient(PointX, PointY, 0, PointX, PointY, PatternData.Size);
                    Gradient.addColorStop(0, PatternData.PointWithinColor);
                    Gradient.addColorStop(1, PatternData.PointOutsideColor);
                    PatternCanvasCtx.beginPath();
                    PatternCanvasCtx.arc(PointX, PointY, PatternData.Size / 2, 0, Math.PI * 2);
                    PatternCanvasCtx.fillStyle = Gradient;
                    PatternCanvasCtx.fill();
                    PatternCanvasCtx.closePath();
                    
                    if (PatternData.debug) {
                        PatternCanvasCtx.fillStyle = "#ff0000";
                        PatternCanvasCtx.font = "12px Arial";
                        PatternCanvasCtx.fillText(i + "," + j, PointX + 5, PointY - 5);
                    }
                }
            }
        }
        
        let Patterns = PatternCanvasVirtual.Patterns;
        for (let i = 0; i < Patterns.length; i++) {
            let Pattern = Patterns[i];
            for (let j = 1; j < Pattern.StrokeOrder.length; j++) {
                let FirstPoint = Pattern.StrokeOrder[j - 1];
                let SecondPoint = Pattern.StrokeOrder[j];
                let OffsetX1 = (FirstPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
                let RealX1 = FirstPoint.x * PatternData.Spacing + OffsetX1 + PatternCanvasVirtual.X;
                let RealY1 = FirstPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
                let OffsetX2 = (SecondPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
                let RealX2 = SecondPoint.x * PatternData.Spacing + OffsetX2 + PatternCanvasVirtual.X;
                let RealY2 = SecondPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
                PatternCanvasCtx.beginPath();
                PatternCanvasCtx.moveTo(RealX1, RealY1);
                PatternCanvasCtx.lineTo(RealX2, RealY2);
                PatternCanvasCtx.strokeStyle = PatternData.PatternLineColor;
                PatternCanvasCtx.lineWidth = PatternData.PatternLineWidth;
                PatternCanvasCtx.stroke();
                PatternCanvasCtx.closePath();
            }
        }
        
        let Path = PatternCanvasState.Path;
        if (PatternCanvasState.DrawingStatus && Path.length > 0) {
            for (let i = 1; i < Path.length; i++) {
                let FirstPoint = Path[i - 1];
                let SecondPoint = Path[i];
                let OffsetX1 = (FirstPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
                let RealX1 = FirstPoint.x * PatternData.Spacing + OffsetX1 + PatternCanvasVirtual.X;
                let RealY1 = FirstPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
                let OffsetX2 = (SecondPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
                let RealX2 = SecondPoint.x * PatternData.Spacing + OffsetX2 + PatternCanvasVirtual.X;
                let RealY2 = SecondPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
                PatternCanvasCtx.beginPath();
                PatternCanvasCtx.moveTo(RealX1, RealY1);
                PatternCanvasCtx.lineTo(RealX2, RealY2);
                PatternCanvasCtx.strokeStyle = PatternData.PatternLineColor;
                PatternCanvasCtx.lineWidth = PatternData.PatternLineWidth;
                PatternCanvasCtx.stroke();
                PatternCanvasCtx.closePath();
            }
            
            if (HighlightPoint) {
                let LastPoint = Path[Path.length - 1];
                let LastOffsetX = (LastPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
                let LastRealX = LastPoint.x * PatternData.Spacing + LastOffsetX + PatternCanvasVirtual.X;
                let LastRealY = LastPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
                let HighlightOffsetX = (HighlightPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
                let HighlightRealX = HighlightPoint.x * PatternData.Spacing + HighlightOffsetX + PatternCanvasVirtual.X;
                let HighlightRealY = HighlightPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
                PatternCanvasCtx.beginPath();
                PatternCanvasCtx.moveTo(LastRealX, LastRealY);
                PatternCanvasCtx.lineTo(HighlightRealX, HighlightRealY);
                PatternCanvasCtx.strokeStyle = PatternData.PatternLineColor;
                PatternCanvasCtx.lineWidth = PatternData.PatternLineWidth;
                PatternCanvasCtx.stroke();
                PatternCanvasCtx.closePath();
            }
        }
        
        if (HighlightPoint) {
            let OffsetX = (HighlightPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
            let PointX = HighlightPoint.x * PatternData.Spacing + OffsetX + PatternCanvasVirtual.X;
            let PointY = HighlightPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
            let Gradient = PatternCanvasCtx.createRadialGradient(PointX, PointY, 0, PointX, PointY, PatternData.Size * 0.1);
            Gradient.addColorStop(0, PatternData.PointWithinColor);
            Gradient.addColorStop(1, PatternData.PointOutsideColor);
            PatternCanvasCtx.beginPath();
            PatternCanvasCtx.arc(PointX, PointY, PatternData.Size * PatternData.SelectPointSize, 0, Math.PI * 2);
            PatternCanvasCtx.fillStyle = Gradient;
            PatternCanvasCtx.fill();
            PatternCanvasCtx.closePath();
        }
    }

    function ScreenSizeChanges() {
        ResizeCanvas();
        RefreshPatternCanvas();
    }

    function MouseScrollWheel(e) {
        e.preventDefault();
        PatternCanvasVirtual.X += (e.deltaX * (Math.abs(e.deltaY) < Math.abs(e.deltaX)));
        PatternCanvasVirtual.Y += (e.deltaY * (Math.abs(e.deltaX) < Math.abs(e.deltaY)));
        RefreshPatternCanvas();
    }

    function IsMouseOverPoint(e) {
        let ClickX = e.clientX - PatternCanvasElement.offsetLeft;
        let ClickY = e.clientY - PatternCanvasElement.offsetTop;
        let CanvasClickYInVirtual = Math.round((ClickY - PatternCanvasVirtual.Y) / PatternData.Spacing);
        let OffsetX = (CanvasClickYInVirtual % 2 === 0) ? 0 : PatternData.Spacing / 2;
        let CanvasClickXInVirtual = Math.round((ClickX - PatternCanvasVirtual.X - OffsetX) / PatternData.Spacing);
        let RealPointX = CanvasClickXInVirtual * PatternData.Spacing + OffsetX + PatternCanvasVirtual.X;
        let RealPointY = CanvasClickYInVirtual * PatternData.Spacing + PatternCanvasVirtual.Y;
        if (Math.abs(ClickX - RealPointX) <= PatternData.Spacing * 0.3 &&
            Math.abs(ClickY - RealPointY) <= PatternData.Spacing * 0.3) {
            return { x: CanvasClickXInVirtual, y: CanvasClickYInVirtual };
        }
    }

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

    function HandleMouseMove(e) {
        let MouseX = e.clientX - PatternCanvasElement.offsetLeft;
        let MouseY = e.clientY - PatternCanvasElement.offsetTop;
        PatternCanvasState.MousePosition = { x: MouseX, y: MouseY };
        let MouseMovePoint = IsMouseOverPoint(e);
        if (MouseMovePoint !== undefined && PatternData.Mode.includes("FreePainting")) {
            PatternCanvasState.Messages.push({ Type: "PatternCanvasMouseMove", x: MouseMovePoint.x, y: MouseMovePoint.y });
            PatternCanvasState.HighlightPoint = MouseMovePoint;
            RefreshPatternCanvas();
        } else if (MouseMovePoint !== undefined && PatternData.Mode.includes("NotFreePainting")) {
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

    function CanvasClickClick(e) {
        let ClickPoint = IsMouseOverPoint(e);
        if (ClickPoint !== undefined) {
            PatternCanvasState.Messages.push({ Type: "PatternCanvasClickPoint", x: ClickPoint.x, y: ClickPoint.y });
        }
    }

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

    function PatternCanvasClickPointHandler(Message) {
        PatternCanvasState.DrawingStatus = !PatternCanvasState.DrawingStatus;
        if (!PatternCanvasState.DrawingStatus) {
            let StrokeOrder = PatternCanvasState.Path;
            PatternCanvasVirtual.Patterns.push({ StrokeOrder: StrokeOrder, StartingPointX: StrokeOrder[0].x, StartingPointY: StrokeOrder[0].y });
            RefreshPatternCanvas();
            PatternCanvasState.Path = [];
        }
    }

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

    function VirtualToReal(Point) {
        let OffsetX = (Point.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
        return {
            x: Point.x * PatternData.Spacing + OffsetX + PatternCanvasVirtual.X,
            y: Point.y * PatternData.Spacing + PatternCanvasVirtual.Y
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

function CreateVirtualPatternCanvas(StartingX = 0, StartingY = 0) {
    return { X: StartingX, Y: StartingY, Patterns: [] };
}

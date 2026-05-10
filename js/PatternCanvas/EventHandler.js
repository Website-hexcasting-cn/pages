export function IsMouseOverPoint(e, PatternCanvasElement, PatternCanvasVirtual, PatternData) {
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

export function IsAdjacentPoint(MouseMovePoint, PatternCanvasState) {
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

export function HandleMouseMove(e, PatternCanvasElement, PatternCanvasState, PatternData, IsMouseOverPoint, IsAdjacentPoint, RefreshPatternCanvas) {
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

export function CanvasClickClick(e, PatternCanvasElement, PatternCanvasState, IsMouseOverPoint) {
    let ClickPoint = IsMouseOverPoint(e);
    if (ClickPoint !== undefined) {
        PatternCanvasState.Messages.push({ Type: "PatternCanvasClickPoint", x: ClickPoint.x, y: ClickPoint.y });
    }
}

export function MouseScrollWheel(e, PatternCanvasVirtual, RefreshPatternCanvas) {
    e.preventDefault();
    PatternCanvasVirtual.X += (e.deltaX * (Math.abs(e.deltaY) < Math.abs(e.deltaX)));
    PatternCanvasVirtual.Y += (e.deltaY * (Math.abs(e.deltaX) < Math.abs(e.deltaY)));
    RefreshPatternCanvas();
}

export function ScreenSizeChanges(ResizeCanvas, RefreshPatternCanvas) {
    ResizeCanvas();
    RefreshPatternCanvas();
}

export function TriggerRegistration(PatternCanvasElement, ScreenSizeChanges, MouseScrollWheel, CanvasClickClick, HandleMouseMove, PatternCanvasClaw) {
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

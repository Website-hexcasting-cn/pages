import { HexToRgba } from './Utils.js';

export function RenderSinglePoint(Ctx, PointX, PointY, PatternData, Opacity = 1) {
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

export function RenderGridPoints(Ctx, Range, PatternData, PatternCanvasState, PatternCanvasVirtual) {
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
            
            RenderSinglePoint(Ctx, PointX, PointY, PatternData, Opacity);
            
            if (PatternData.Debug) {
                Ctx.fillStyle = "#ff0000";
                Ctx.font = "12px Arial";
                Ctx.fillText(i + "," + j, PointX + 5, PointY - 5);
            }
        }
    }
}

export function RenderLine(Ctx, FromPoint, ToPoint, PatternData, VirtualToReal) {
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

export function RenderPatterns(Ctx, PatternCanvasVirtual, PatternData, VirtualToReal) {
    let Patterns = PatternCanvasVirtual.Patterns;
    for (let i = 0; i < Patterns.length; i++) {
        let Pattern = Patterns[i];
        for (let j = 1; j < Pattern.StrokeOrder.length; j++) {
            RenderLine(Ctx, Pattern.StrokeOrder[j - 1], Pattern.StrokeOrder[j], PatternData, VirtualToReal);
        }
    }
}

export function RenderCurrentPath(Ctx, PatternCanvasState, HighlightPoint, PatternData, VirtualToReal) {
    let Path = PatternCanvasState.Path;
    if (!PatternCanvasState.DrawingStatus || Path.length === 0) return;
    
    for (let i = 1; i < Path.length; i++) {
        RenderLine(Ctx, Path[i - 1], Path[i], PatternData, VirtualToReal);
    }
    
    if (HighlightPoint) {
        let LastPoint = Path[Path.length - 1];
        RenderLine(Ctx, LastPoint, HighlightPoint, PatternData, VirtualToReal);
    }
}

export function RenderHighlightPoint(Ctx, HighlightPoint, PatternData, VirtualToReal) {
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

export function RefreshPatternCanvas(PatternCanvasElement, PatternCanvasState, GetGridRange, RenderGridPoints, RenderPatterns, RenderCurrentPath, RenderHighlightPoint, HighlightPoint = PatternCanvasState.HighlightPoint) {
    let Ctx = PatternCanvasElement.getContext("2d");
    Ctx.clearRect(0, 0, PatternCanvasElement.width, PatternCanvasElement.height);
    
    let Range = GetGridRange();
    RenderGridPoints(Ctx, Range);
    RenderPatterns(Ctx);
    RenderCurrentPath(Ctx, HighlightPoint);
    RenderHighlightPoint(Ctx, HighlightPoint);
}

export function ResizeCanvas(PatternCanvasElement, width = window.innerWidth, height = window.innerHeight) {
    PatternCanvasElement.width = width;
    PatternCanvasElement.height = height;
}

export function GetGridRange(PatternCanvasElement, PatternCanvasVirtual, PatternData) {
    let CanvasWidth = PatternCanvasElement.width;
    let CanvasHeight = PatternCanvasElement.height;
    return {
        StartI: Math.floor(-PatternCanvasVirtual.X / PatternData.Grid.Spacing) - 1,
        EndI: Math.ceil((CanvasWidth - PatternCanvasVirtual.X) / PatternData.Grid.Spacing) + 1,
        StartJ: Math.floor(-PatternCanvasVirtual.Y / PatternData.Grid.Spacing) - 1,
        EndJ: Math.ceil((CanvasHeight - PatternCanvasVirtual.Y) / PatternData.Grid.Spacing) + 1
    };
}

export function VirtualToReal(Point, PatternData, PatternCanvasVirtual) {
    let OffsetX = (Point.y % 2 === 0) ? 0 : PatternData.Grid.Spacing / 2;
    return {
        x: Point.x * PatternData.Grid.Spacing + OffsetX + PatternCanvasVirtual.X,
        y: Point.y * PatternData.Grid.Spacing + PatternCanvasVirtual.Y
    };
}

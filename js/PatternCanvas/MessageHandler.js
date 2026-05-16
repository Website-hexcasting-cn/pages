export function PatternCanvasMouseMoveHandler(Message, PatternCanvasState) {
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

export function PatternCanvasClickPointHandler(Message, PatternCanvasState, PatternCanvasVirtual, RefreshPatternCanvas) {
    PatternCanvasState.DrawingStatus = !PatternCanvasState.DrawingStatus;
    if (!PatternCanvasState.DrawingStatus) {
        let StrokeOrder = PatternCanvasState.Path;
        PatternCanvasVirtual.Patterns.push({ StrokeOrder: StrokeOrder, StartingPointX: StrokeOrder[0].x, StartingPointY: StrokeOrder[0].y });
        RefreshPatternCanvas();
        PatternCanvasState.Path = [];
    }
}

export function MessageProcessing(Message, PatternCanvasClickPointHandler, PatternCanvasMouseMoveHandler) {
    switch (Message.Type) {
        case "PatternCanvasClickPoint":
            PatternCanvasClickPointHandler(Message);
            break;
        case "PatternCanvasMouseMove":
            PatternCanvasMouseMoveHandler(Message);
            break;
    }
}

export function PatternCanvasClaw(PatternCanvasState, MessageProcessing) {
    if (PatternCanvasState.Messages.length == 0) {
        return;
    }
    let Message = PatternCanvasState.Messages.shift();
    MessageProcessing(Message);
}

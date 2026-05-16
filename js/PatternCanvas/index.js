import { HexToRgba, CalculateAngleBetweenTwoSides } from './Utils.js';
import { CreateVirtualPatternCanvas } from './VirtualCanvas.js';
import { RenderSinglePoint, RenderGridPoints, RenderLine, RenderPatterns, RenderCurrentPath, RenderHighlightPoint, RefreshPatternCanvas } from './Renderer.js';
import { ResizeCanvas, GetGridRange, VirtualToReal } from './GridManager.js';
import { CalculateRelativeDirectionCode, PatternCanvasVirtualToPatternListPreprocessPatternList, PatternCanvasVirtualToPatternList } from './PatternProcessor.js';
import { PatternCanvasMouseMoveHandler, PatternCanvasClickPointHandler, MessageProcessing, PatternCanvasClaw } from './MessageHandler.js';
import { IsMouseOverPoint, IsAdjacentPoint, HandleMouseMove, CanvasClickClick, MouseScrollWheel, ScreenSizeChanges, TriggerRegistration } from './EventHandler.js';

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

    function VirtualToRealWrapper(Point) {
        return VirtualToReal(Point, PatternData, PatternCanvasVirtual);
    }

    function GetGridRangeWrapper() {
        return GetGridRange(PatternCanvasElement, PatternCanvasVirtual, PatternData);
    }

    function RenderGridPointsWrapper(Ctx, Range) {
        return RenderGridPoints(Ctx, Range, PatternData, PatternCanvasState, PatternCanvasVirtual);
    }

    function RenderLineWrapper(Ctx, FromPoint, ToPoint) {
        return RenderLine(Ctx, FromPoint, ToPoint, PatternData, VirtualToRealWrapper);
    }

    function RenderPatternsWrapper(Ctx) {
        return RenderPatterns(Ctx, PatternCanvasVirtual, PatternData, VirtualToRealWrapper);
    }

    function RenderCurrentPathWrapper(Ctx, HighlightPoint) {
        return RenderCurrentPath(Ctx, PatternCanvasState, HighlightPoint, PatternData, VirtualToRealWrapper);
    }

    function RenderHighlightPointWrapper(Ctx, HighlightPoint) {
        return RenderHighlightPoint(Ctx, HighlightPoint, PatternData, VirtualToRealWrapper);
    }

    function RefreshPatternCanvasWrapper(HighlightPoint = PatternCanvasState.HighlightPoint) {
        let Ctx = PatternCanvasElement.getContext("2d");
        Ctx.clearRect(0, 0, PatternCanvasElement.width, PatternCanvasElement.height);
        
        let Range = GetGridRangeWrapper();
        RenderGridPointsWrapper(Ctx, Range);
        RenderPatternsWrapper(Ctx);
        RenderCurrentPathWrapper(Ctx, HighlightPoint);
        RenderHighlightPointWrapper(Ctx, HighlightPoint);
    }

    function ResizeCanvasWrapper(width = window.innerWidth, height = window.innerHeight) {
        ResizeCanvas(PatternCanvasElement, width, height);
    }

    function ScreenSizeChangesWrapper() {
        ScreenSizeChanges(ResizeCanvasWrapper, RefreshPatternCanvasWrapper);
    }

    function MouseScrollWheelWrapper(e) {
        MouseScrollWheel(e, PatternCanvasVirtual, RefreshPatternCanvasWrapper);
    }

    function IsMouseOverPointWrapper(e) {
        return IsMouseOverPoint(e, PatternCanvasElement, PatternCanvasVirtual, PatternData);
    }

    function IsAdjacentPointWrapper(MouseMovePoint) {
        return IsAdjacentPoint(MouseMovePoint, PatternCanvasState);
    }

    function HandleMouseMoveWrapper(e) {
        HandleMouseMove(e, PatternCanvasElement, PatternCanvasState, PatternData, IsMouseOverPointWrapper, IsAdjacentPointWrapper, RefreshPatternCanvasWrapper);
    }

    function CanvasClickClickWrapper(e) {
        CanvasClickClick(e, PatternCanvasElement, PatternCanvasState, IsMouseOverPointWrapper);
    }

    function PatternCanvasMouseMoveHandlerWrapper(Message) {
        PatternCanvasMouseMoveHandler(Message, PatternCanvasState);
    }

    function PatternCanvasClickPointHandlerWrapper(Message) {
        PatternCanvasClickPointHandler(Message, PatternCanvasState, PatternCanvasVirtual, RefreshPatternCanvasWrapper);
    }

    function MessageProcessingWrapper(Message) {
        MessageProcessing(Message, PatternCanvasClickPointHandlerWrapper, PatternCanvasMouseMoveHandlerWrapper);
    }

    function PatternCanvasClawWrapper() {
        PatternCanvasClaw(PatternCanvasState, MessageProcessingWrapper);
    }

    function TriggerRegistrationWrapper() {
        TriggerRegistration(PatternCanvasElement, ScreenSizeChangesWrapper, MouseScrollWheelWrapper, CanvasClickClickWrapper, HandleMouseMoveWrapper, PatternCanvasClawWrapper);
    }

    ResizeCanvasWrapper();
    RefreshPatternCanvasWrapper();
    TriggerRegistrationWrapper();

    return {
        Functions: {
            VirtualToReal: VirtualToRealWrapper,
            ScreenSizeChanges: ScreenSizeChangesWrapper,
            IsMouseOverPoint: IsMouseOverPointWrapper,
            CalculateRelativeDirectionCode: CalculateRelativeDirectionCode,
            PatternCanvasVirtualToPatternListPreprocessPatternList: PatternCanvasVirtualToPatternListPreprocessPatternList,
            PatternCanvasVirtualToPatternList: () => PatternCanvasVirtualToPatternList(PatternCanvasVirtual),
            IsAdjacentPoint: IsAdjacentPointWrapper,
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

export { PatternCanvas, CreateVirtualPatternCanvas };

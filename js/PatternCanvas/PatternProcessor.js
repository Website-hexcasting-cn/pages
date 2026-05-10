export function CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) {
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

export function PatternCanvasVirtualToPatternListPreprocessPatternList(PatternListArray) {
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

export function PatternCanvasVirtualToPatternList(PatternCanvasVirtual) {
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

//Main Function
function PatternCanvas() {
    //初始化点阵数据
    globalThis.PatternData = {PointWithinColor: "#1890ff",PointOutsideColor: "#bae7ff",Spacing: 80,Size: 5,PatternLineColor: "#009dffff",PatternLineWidth: 4,SelectPointSize: 1,debug:false,Mode:"NotFreePainting"};
    //初始化变量
    globalThis.PatternCanvasVirtual = CreateVirtualPatternCanvas();
    globalThis.PatternCanvas.Messages = [];
    globalThis.PatternCanvas.Path = [];
    //初始化触发器
    TriggerRegistration(globalThis.PatternCanvasVirtual,globalThis.PatternData);
    //设置画布尺寸并刷新点阵
    resizeCanvas();
    RefreshPatternCanvas(globalThis.PatternCanvasVirtual,globalThis.PatternData);
}
//设置画布尺寸
function resizeCanvas() {
    let PatternCanvas = document.getElementById("PatternCanvas");
    PatternCanvas.width = window.innerWidth;
    PatternCanvas.height = window.innerHeight;
}
//刷新点阵
function RefreshPatternCanvas(PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData,HighlightPoint=globalThis.PatternCanvas.HighlightPoint) {
    //定义变量
    let PatternCanvas = document.getElementById("PatternCanvas");
    let PatternCanvasCtx = PatternCanvas.getContext("2d");
    //清空画布
    PatternCanvasCtx.clearRect(0, 0, PatternCanvas.width, PatternCanvas.height);
    //获取画布长宽
    let CanvasWidth = PatternCanvas.width;
    let CanvasHeight = PatternCanvas.height;
    //计算偏移后的循环范围，确保画布边缘也有点
    let StartI = Math.floor(-PatternCanvasVirtual.X / PatternData.Spacing) - 1;
    let EndI = Math.ceil((CanvasWidth - PatternCanvasVirtual.X) / PatternData.Spacing) + 1;
    let StartJ = Math.floor(-PatternCanvasVirtual.Y / PatternData.Spacing) - 1;
    let EndJ = Math.ceil((CanvasHeight - PatternCanvasVirtual.Y) / PatternData.Spacing) + 1;
    //绘制六边形点状矩阵
    for (let i = StartI; i < EndI; i++) {
        for (let j = StartJ; j < EndJ; j++) {
            //偶数行在x轴上偏移Spacing/2
            let OffsetX = (j % 2 === 0) ? 0 : PatternData.Spacing / 2;
            let PointX = i*PatternData.Spacing + OffsetX + PatternCanvasVirtual.X;
            let PointY = j*PatternData.Spacing + PatternCanvasVirtual.Y;
            //为每个点创建独立的渐变
            let Gradient = PatternCanvasCtx.createRadialGradient(
                PointX, PointY, 0,
                PointX, PointY, PatternData.Size
            );
            //添加渐变颜色
            Gradient.addColorStop(0,PatternData.PointWithinColor);
            Gradient.addColorStop(1,PatternData.PointOutsideColor);
            //绘制内部渐变的圆形
            PatternCanvasCtx.beginPath();
            PatternCanvasCtx.arc(PointX,PointY,PatternData.Size/2,0,Math.PI*2);
            PatternCanvasCtx.fillStyle = Gradient;
            PatternCanvasCtx.fill();
            PatternCanvasCtx.closePath();
            //debug模式下标注虚拟坐标
            if (PatternData.debug) {
                PatternCanvasCtx.fillStyle = "#ff0000";
                PatternCanvasCtx.font = "12px Arial";
                PatternCanvasCtx.fillText(i + "," + j, PointX + 5, PointY - 5);
            }
        }
    }
    //绘制图案
    let Patterns = PatternCanvasVirtual.Patterns;
    for (let i = 0; i < Patterns.length; i++){
        let Pattern = Patterns[i]
        for (let j = 1; j < Pattern.StrokeOrder.length; j++){
            let FirstPoint = Pattern.StrokeOrder[j-1];
            let SecondPoint = Pattern.StrokeOrder[j];
            //将虚拟坐标转换为真实像素坐标
            let OffsetX1 = (FirstPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
            let RealX1 = FirstPoint.x * PatternData.Spacing + OffsetX1 + PatternCanvasVirtual.X;
            let RealY1 = FirstPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
            let OffsetX2 = (SecondPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
            let RealX2 = SecondPoint.x * PatternData.Spacing + OffsetX2 + PatternCanvasVirtual.X;
            let RealY2 = SecondPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
            //绘制线段
            PatternCanvasCtx.beginPath();
            PatternCanvasCtx.moveTo(RealX1, RealY1);
            PatternCanvasCtx.lineTo(RealX2, RealY2);
            PatternCanvasCtx.strokeStyle = PatternData.PatternLineColor;
            PatternCanvasCtx.lineWidth = PatternData.PatternLineWidth;
            PatternCanvasCtx.stroke();
            PatternCanvasCtx.closePath();
        }
    }
    //绘制当前绘画过程中的图案预览
    let Path = globalThis.PatternCanvas.Path;
    if (globalThis.PatternCanvas.DrawingStatus && Path.length > 0) {
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
        //连接已记录路径的最后一个点到高亮点
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
    //放大碰到的点
    if (HighlightPoint) {
        let OffsetX = (HighlightPoint.y % 2 === 0) ? 0 : PatternData.Spacing / 2;
        let PointX = HighlightPoint.x * PatternData.Spacing + OffsetX + PatternCanvasVirtual.X;
        let PointY = HighlightPoint.y * PatternData.Spacing + PatternCanvasVirtual.Y;
        let Gradient = PatternCanvasCtx.createRadialGradient(
            PointX, PointY, 0,
            PointX, PointY, PatternData.Size * 0.1
        );
        Gradient.addColorStop(0, PatternData.PointWithinColor);
        Gradient.addColorStop(1, PatternData.PointOutsideColor);
        PatternCanvasCtx.beginPath();
        PatternCanvasCtx.arc(PointX, PointY, PatternData.Size * PatternData.SelectPointSize, 0, Math.PI * 2);
        PatternCanvasCtx.fillStyle = Gradient;
        PatternCanvasCtx.fill();
        PatternCanvasCtx.closePath();
    }
}
//创建虚拟点阵对象
function CreateVirtualPatternCanvas(StartingX=0,StartingY=0) {
    let PatternCanvasVirtual = {
        X: StartingX,
        Y: StartingY,
        Patterns: [
            //{StrokeOrder:[{x:number,y:number}],StartingPointX:number,StartingPointY:number}
        ],
    };
    return PatternCanvasVirtual;
}
//重新设置尺寸并刷新点阵
function ScreenSizeChanges(PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData=globalThis.PatternCanvas) {
    resizeCanvas();
    RefreshPatternCanvas(PatternCanvasVirtual,PatternData);
}
//鼠标滚轮事件
function MouseScrollWheel(e,PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData) {
    e.preventDefault();
    //根据滚动方向操作x,y
    //如果滚动方向是y轴，x轴不移动
    //如果滚动方向是x轴，y轴不移动
    PatternCanvasVirtual.X += (e.deltaX*(Math.abs(e.deltaY)<Math.abs(e.deltaX)));
    PatternCanvasVirtual.Y += (e.deltaY*(Math.abs(e.deltaX)<Math.abs(e.deltaY)));
    RefreshPatternCanvas(PatternCanvasVirtual,PatternData);
}
//检测鼠标是否碰到点
function IsMouseOverPoint(e,PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData) {
    let PatternCanvas = document.getElementById("PatternCanvas");
    let ClickX = e.clientX - PatternCanvas.offsetLeft;
    let ClickY = e.clientY - PatternCanvas.offsetTop;
    //判断点击点是否在点阵的每个点周围PatternData.Spacing/2范围内
    let CanvasClickYInVirtual = Math.round((ClickY - PatternCanvasVirtual.Y) / PatternData.Spacing);
    //偶数行在x轴上偏移Spacing/2，计算X时需要考虑行奇偶性
    let OffsetX = (CanvasClickYInVirtual % 2 === 0) ? 0 : PatternData.Spacing / 2;
    let CanvasClickXInVirtual = Math.round((ClickX - PatternCanvasVirtual.X - OffsetX) / PatternData.Spacing);
    //计算该虚拟坐标对应的真实像素位置
    let RealPointX = CanvasClickXInVirtual * PatternData.Spacing + OffsetX + PatternCanvasVirtual.X;
    let RealPointY = CanvasClickYInVirtual * PatternData.Spacing + PatternCanvasVirtual.Y;
    //如果点击点在点阵的每个点周围PatternData.Spacing*0.3范围内，记录点击点的虚拟点阵坐标
    if (Math.abs(ClickX - RealPointX) <= PatternData.Spacing*0.3 &&
        Math.abs(ClickY - RealPointY) <= PatternData.Spacing*0.3) {
        //记录点击点的虚拟点阵坐标
        return {x:CanvasClickXInVirtual,y:CanvasClickYInVirtual};
    }
}
//根据图案虚拟点阵坐标实现图案列表转换图案列表字符串
function PatternCanvasVirtualToPatternList(PatternCanvasVirtual=globalThis.PatternCanvasVirtual){
    if (PatternCanvasVirtual.Patterns.length === 0) {
        return [];
    }
    //预处理
    let PatternList = PatternCanvasVirtualToPatternListPreprocessPatternList(PatternCanvasVirtual.Patterns);
    let PatternStringList = [];
    for (let i = 0; i < PatternList.length; i++) {
        const Pattern = PatternList[i];
        if (Pattern.StrokeOrder.length === 0) {
            continue;
        }
        let PatternString = "";
        //遍历笔顺中的每一段，计算相对方向编码
        let PreviousDirectionIndex = 0;
        for (let j = 1; j < Pattern.StrokeOrder.length; j++) {
            let PreviousPoint = Pattern.StrokeOrder[j - 1];
            let CurrentPoint = Pattern.StrokeOrder[j];
            let Result = CalculateRelativeDirectionCode(PreviousPoint, CurrentPoint, PreviousDirectionIndex);
            PatternString += Result.DirectionCode;
            PreviousDirectionIndex = Result.CurrentDirectionIndex;
        }
        //图案字符串默认第一个是w，去掉第一个w
        PatternString = PatternString.slice(1);
        PatternStringList.push([Pattern.StartingPointX, Pattern.StartingPointY, PatternString]);
    }
    return PatternStringList;
}
//计算两点之间的相对方向编码
function CalculateRelativeDirectionCode(FromPoint, ToPoint, PreviousDirectionIndex) {
    let DeltaX = ToPoint.x - FromPoint.x;
    let DeltaY = ToPoint.y - FromPoint.y;
    if (Math.abs(DeltaX) < 0.001 && Math.abs(DeltaY) < 0.001) {
        return { DirectionCode: "", CurrentDirectionIndex: PreviousDirectionIndex };
    }
    //计算当前绝对方向索引 (0-5)
    let Angle = Math.atan2(-DeltaY, DeltaX);
    let CurrentDirectionIndex = Math.round(Angle / (Math.PI / 3));
    while (CurrentDirectionIndex < 0) {
        CurrentDirectionIndex += 6;
    }
    CurrentDirectionIndex = CurrentDirectionIndex % 6;
    //计算相对转向 (当前方向 - 上一方向)
    let Turn = CurrentDirectionIndex - PreviousDirectionIndex;
    //归一化到 -3 到 +3
    while (Turn > 3) {
        Turn -= 6;
    }
    while (Turn < -3) {
        Turn += 6;
    }
    //相对方向编码映射
    //+0(直行): d, +1(右转60°): e, +2(右转120°): x, +3(掉头): a, -1(左转60°): w, -2(左转120°): z
    let RelativeDirectionMap = {
        0: "w",
        1: "q",
        2: "a",
        3: "s",
        [-1]: "e",
        [-2]: "d"
    };
    let DirectionCode = RelativeDirectionMap[Turn];
    return { DirectionCode: DirectionCode, CurrentDirectionIndex: CurrentDirectionIndex };
}
//预处理
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
//计算两边夹角(弧度制)，已知两边相交于 CommonPoint
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
//鼠标移动处理函数
function HandleMouseMove(e,PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData) {
    let MouseMovePoint = IsMouseOverPoint(e,PatternCanvasVirtual,PatternData);
    if (MouseMovePoint !== undefined && PatternData.Mode === "FreePainting") {
        //记录鼠标移动点的虚拟点阵坐标
        globalThis.PatternCanvas.Messages.push({Type:"PatternCanvasMouseMove",x:MouseMovePoint.x,y:MouseMovePoint.y});
        //更新高亮点并触发重绘
        globalThis.PatternCanvas.HighlightPoint = MouseMovePoint;
        RefreshPatternCanvas();
    }else if (MouseMovePoint !== undefined && PatternData.Mode !== "FreePainting"){
        //如果不在自由绘制模式，判断是否相邻
        if (IsAdjacentPoint(MouseMovePoint)){
            //如果相邻，记录鼠标移动点的虚拟点阵坐标
            globalThis.PatternCanvas.Messages.push({Type:"PatternCanvasMouseMove",x:MouseMovePoint.x,y:MouseMovePoint.y});
            //更新高亮点并触发重绘
            globalThis.PatternCanvas.HighlightPoint = MouseMovePoint;
            RefreshPatternCanvas();
        }
    }
    else {
        globalThis.PatternCanvas.HighlightPoint = undefined;
        RefreshPatternCanvas();
    }
}
//判断鼠标移动点是否在相对于选中的上一点的虚拟坐标[1,0][-1,0][0,-1][0,1][1,1][1,-1]中的一点
function IsAdjacentPoint(MouseMovePoint){
    //如果Path为空，没有上一个点，直接返回false
    if (globalThis.PatternCanvas.Path.length === 0) {
        return true;
    }
    //计算选中点MouseMovePoint与globalThis.PatternCanvas.Path[globalThis.PatternCanvas.Path.length-1]的相对x,y坐标
    let Last = globalThis.PatternCanvas.Path[globalThis.PatternCanvas.Path.length-1];
    let DeltaX = MouseMovePoint.x - Last.x;
    let DeltaY = MouseMovePoint.y - Last.y;
    //判断是否在[1,0][-1,0][0,-1][0,1][1,1][1,-1]中的一点
    if (Math.abs(DeltaX) === 1 && Math.abs(DeltaY) === 0) {
        return true;
    }
    if (Math.abs(DeltaX) === 0 && Math.abs(DeltaY) === 1) {
        return true;
    }
    if (Math.abs(DeltaX) === 1 && Math.abs(DeltaY) === 1) {
        return true;
    }
}


//点击事件
function CanvasClickClick(e,PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData) {
    let ClickPoint = IsMouseOverPoint(e,PatternCanvasVirtual,PatternData);
    if (ClickPoint !== undefined) {
        //记录点击点的虚拟点阵坐标
        globalThis.PatternCanvas.Messages.push({Type:"PatternCanvasClickPoint",x:ClickPoint.x,y:ClickPoint.y});
    }
}
//处理PatternCanvasMouseMove消息
function PatternCanvasMouseMoveHandler(Message){
    let Last = globalThis.PatternCanvas.Path[globalThis.PatternCanvas.Path.length-1];
    if (globalThis.PatternCanvas.DrawingStatus && !(Last && Last.x === Message.x && Last.y === Message.y)) {
        //如果正在绘制，记录鼠标移动点的虚拟点阵坐标
        globalThis.PatternCanvas.Path.push({x:Message.x,y:Message.y});
    }
    //添加勿选点后悔机制
    let ThirdLast = globalThis.PatternCanvas.Path[globalThis.PatternCanvas.Path.length-3];
    if (globalThis.PatternCanvas.DrawingStatus && 
        globalThis.PatternCanvas.Path.length > 2 &&
        ThirdLast && Last &&
        ThirdLast.x === Last.x && ThirdLast.y === Last.y
    ) {
        //如果三个点都相同，删除最后一个点
        globalThis.PatternCanvas.Path.pop();
        globalThis.PatternCanvas.Path.pop();
    }
}
//处理PatternCanvasClickPoint消息
function PatternCanvasClickPointHandler(Message){
    globalThis.PatternCanvas.DrawingStatus = !globalThis.PatternCanvas.DrawingStatus;
    if (!globalThis.PatternCanvas.DrawingStatus) {
        //如果不在绘制，打包点击点的虚拟点阵坐标
        let StrokeOrder = globalThis.PatternCanvas.Path
        globalThis.PatternCanvasVirtual.Patterns.push({StrokeOrder:StrokeOrder,StartingPointX:StrokeOrder[0].x,StartingPointY:StrokeOrder[0].y});
        RefreshPatternCanvas();
        //清空绘制路径
        globalThis.PatternCanvas.Path = [];
    }
}
//消息处理函数
function MessageProcessing (Message){
    switch(Message.Type) {
        case "PatternCanvasClickPoint":
            PatternCanvasClickPointHandler(Message);
            break;
        case "PatternCanvasMouseMove":
            PatternCanvasMouseMoveHandler(Message);
            break;
    }
}
//定时函数
function PatternCanvasClaw() {
    if (globalThis.PatternCanvas.Messages.length == 0) {
        return;
    }
    
    //遍历消息列表处理消息
    let Message = globalThis.PatternCanvas.Messages.shift();
    MessageProcessing(Message);
}
//触发器注册
function TriggerRegistration(PatternCanvasVirtual=globalThis.PatternCanvasVirtual,PatternData=globalThis.PatternData) {
    //初始化变量
    let PatternCanvas = document.getElementById("PatternCanvas");
    //初始化复制按钮
    const PatternBottomContainer = document.getElementById("PatternBottomContainer");
    PatternBottomContainer.addEventListener("click", function () {
        //复制笔顺
    });
    //窗口大小变化时重新设置尺寸并刷新点阵
    window.addEventListener('resize', function(e) {
        ScreenSizeChanges(PatternCanvasVirtual,PatternData);
    });
    //当用户鼠标滚轮动画布时跟去滚动方向操作x,y并且刷新点阵
    PatternCanvas.addEventListener("wheel", function(e) {
        MouseScrollWheel(e,PatternCanvasVirtual,PatternData);
    });
    //当用户点击画布时，记录点击点的虚拟点阵坐标
    PatternCanvas.addEventListener("click", function(e) {
        CanvasClickClick(e,PatternCanvasVirtual,PatternData);
    });
    //当用户移动鼠标时，记录鼠标位置
    PatternCanvas.addEventListener("mousemove", function(e) {
        e.preventDefault();
        HandleMouseMove(e,PatternCanvasVirtual,PatternData);
    });
    //每50ms刷新一次点阵
    setInterval(PatternCanvasClaw,10);
}
//页面加载完成后初始化
window.addEventListener('DOMContentLoaded', PatternCanvas);

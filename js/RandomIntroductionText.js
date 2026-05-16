async function RandomIntroduction(){
    const data = await fetch(GetGlobalConstant('RandomIntroduction')).then(res=>res.json())
    const IntroductionTextList=data.Introduction
    const RandomIntroductionText = IntroductionTextList[GetRandom(0, IntroductionTextList.length-1)]
    document.getElementById("IntroductionText").innerHTML = RandomIntroductionText
}
function GetRandom(Min, Max){
    // 简易 xorshift32 随机数生成器
    let rngState = Date.now() ^ 0xf3b3d7025f;   // 默认种子
    
    //生成 [0, 2^32-1] 的随机整数
    function nextUint32() {
        let x = rngState;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        rngState = x >>> 0;
        return rngState;
    }
    
    // 生成 [min, max] 范围内的随机整数（包含两端）
    function randomRange(min, max) {
        const range = max - min + 1;
        const randVal = nextUint32() % range;
        return min + randVal;
    }
    
    return randomRange(Min, Max);
}
RandomIntroduction()

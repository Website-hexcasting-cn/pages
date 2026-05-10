export function HexToRgba(Hex, Alpha) {
    let R = parseInt(Hex.slice(1, 3), 16);
    let G = parseInt(Hex.slice(3, 5), 16);
    let B = parseInt(Hex.slice(5, 7), 16);
    return `rgba(${R}, ${G}, ${B}, ${Alpha})`;
}

export function CalculateAngleBetweenTwoSides(FirstPoint, CommonPoint, SecondPoint) {
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

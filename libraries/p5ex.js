/**
* An extension of p5.js.
* Including module: no-more-for-loops (Copyright 2018 FAL, licensed under MIT).
* GitHub repository: {@link https://github.com/fal-works/p5ex}
* @module p5ex
* @copyright 2018 FAL
* @author FAL <falworks.contact@gmail.com>
* @license MIT
* @version 0.5.3
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.p5ex = {})));
}(this, (function (exports) { 'use strict';

/**
 * Spatial region.
 */
class Region {
}
/**
 * Rectangle-shaped spatial region.
 */
class RectangleRegion extends Region {
    get width() { return this.rightPositionX - this.leftPositionX; }
    get height() { return this.bottomPositionY - this.topPositionY; }
    get area() { return this.width * this.height; }
    constructor(x1, y1, x2, y2, margin = 0) {
        super();
        this.leftPositionX = x1 - margin;
        this.topPositionY = y1 - margin;
        this.rightPositionX = x2 + margin;
        this.bottomPositionY = y2 + margin;
    }
    contains(position, margin = 0) {
        return (position.x >= this.leftPositionX - margin && position.x <= this.rightPositionX + margin &&
            position.y >= this.topPositionY - margin && position.y <= this.bottomPositionY + margin);
    }
    constrain(position, margin = 0) {
        if (position.x < this.leftPositionX - margin)
            position.x = this.leftPositionX - margin;
        else if (position.x > this.rightPositionX + margin)
            position.x = this.rightPositionX + margin;
        if (position.y < this.topPositionY - margin)
            position.y = this.topPositionY - margin;
        else if (position.y > this.bottomPositionY + margin)
            position.y = this.bottomPositionY + margin;
    }
}
// default region -> add

/**
 * (To be filled)
 * @hideConstructor
 */
class ScalableCanvas {
    constructor(p5Instance, parameter, node, rendererType) {
        this.p = p5Instance;
        this.canvasElement = p5Instance.createCanvas(parameter.scaledWidth, parameter.scaledHeight, rendererType);
        if (this.canvasElement && 'parent' in this.canvasElement) {
            this.canvasElement.parent(node);
        }
        this.region = new RectangleRegion(0, 0, 0, 0);
        this.nonScaledShortSideLength = parameter.nonScaledShortSideLength;
        this.updateSize();
    }

    /**
     * (To be filled)
     */
    get scaleFactor() {
        return this._scaleFactor;
    }
    /**
     * (To be filled)
     */
    get nonScaledWidth() {
        return this._nonScaledWidth;
    }
    /**
     * (To be filled)
     */
    get nonScaledHeight() {
        return this._nonScaledHeight;
    }
    /**
     * (To be filled)
     */
    get aspectRatio() {
        return this._aspectRatio;
    }
    /**
     * (To be filled)
     * @param parameter
     */
    resize(parameter) {
        this.p.resizeCanvas(parameter.scaledWidth, parameter.scaledHeight);
        this.nonScaledShortSideLength = parameter.nonScaledShortSideLength;
        this.updateSize();
    }
    /**
     * (To be filled)
     */
    updateSize() {
        const p = this.p;
        this._scaleFactor = Math.min(p.width, p.height) / this.nonScaledShortSideLength;
        this._inversedScaleFactor = 1 / this._scaleFactor;
        this._nonScaledWidth = p.width / this._scaleFactor;
        this._nonScaledHeight = p.height / this._scaleFactor;
        this._aspectRatio = p.width / p.height;
        this.region.rightPositionX = this._nonScaledWidth;
        this.region.bottomPositionY = this._nonScaledHeight;
    }
    /**
     * Runs scale() of the current p5 instance for fitting the sketch to the current canvas.
     * Should be called every frame before drawing objects on the canvas.
     */
    scale() {
        this.p.scale(this._scaleFactor);
    }
    /**
     * Runs scale() with the inversed scale factor.
     */
    cancelScale() {
        this.p.scale(this._inversedScaleFactor);
    }
    /**
     * Converts a length value on the scaled canvas to the non-scaled one.
     * Typically used for interpreting mouseX and mouseY.
     * @param {number} scaledLength - scaled length value
     */
    getNonScaledValueOf(scaledLength) {
        return scaledLength / this._scaleFactor;
    }
}
ScalableCanvas.DUMMY_PARAMETERS = {
    scaledWidth: 100,
    scaledHeight: 100,
    nonScaledShortSideLength: 100,
};

/**
 * (To be filled)
 * (This is not implemented as an enum because it is not supported by rollup)
 */
const ScalableCanvasTypes = {
    SQUARE640x640: 'SQUARE640x640',
    RECT640x480: 'RECT640x480',
    FULL: 'FULL',
    CUSTOM: 'CUSTOM',
};

class NormalColorUnit {
    constructor(p, p5Color) {
        this.p = p;
        this.p5Color = p5Color;
    }
    stroke() {
        this.p.currentRenderer.stroke(this.p5Color);
    }
    fill() {
        this.p.currentRenderer.fill(this.p5Color);
    }
}
class NoColorUnit {
    constructor(p) {
        this.p = p;
    }
    stroke() {
        this.p.currentRenderer.noStroke();
    }
    fill() {
        this.p.currentRenderer.noFill();
    }
}
class UndefinedColorUnit {
    stroke() {
    }
    fill() {
    }
}
class AlphaColorUnit {
    constructor(p, c, alphaResolution = 256) {
        this.p = p;
        const array = [];
        for (let alphaFactor = 0; alphaFactor < alphaResolution; alphaFactor += 1) {
            array.push(p.color(p.red(c), p.green(c), p.blue(c), p.alpha(c) * alphaFactor / (alphaResolution - 1)));
        }
        this.colorArray = array;
        this.maxIndex = alphaResolution - 1;
    }
    stroke(alphaValue) {
        this.p.currentRenderer.stroke(this.getColor(alphaValue));
    }
    fill(alphaValue) {
        this.p.currentRenderer.fill(this.getColor(alphaValue));
    }
    getColor(alphaValue) {
        return this.colorArray[alphaValue ? Math.floor(this.p.map(alphaValue, 0, 255, 0, this.maxIndex)) : this.maxIndex];
    }
}
function colorUnit(p, p5Color, alphaEnabled, alphaResolution) {
    if (!p || p5Color === undefined)
        return new UndefinedColorUnit();
    if (p5Color === null)
        return new NoColorUnit(p);
    if (alphaEnabled)
        return new AlphaColorUnit(p, p5Color, alphaResolution);
    return new NormalColorUnit(p, p5Color);
}
/**
 * Composition of two p5.Color instances. One for stroke(), one for fill().
 */
class ShapeColor {
    /**
     *
     * @param p - p5ex instance.
     * @param {p5.Color | null | undefined} strokeColor - Color for stroke(). Null means noStroke().
     * @param {p5.Color | null | undefined} fillColor - Color for fill(). Null means noFill().
     * @param {boolean} [alphaEnabled]
     * @param {number} [alphaResolution]
     */
    constructor(p, strokeColor, fillColor, alphaEnabled, alphaResolution) {
        this.strokeColor = colorUnit(p, strokeColor, alphaEnabled, alphaResolution);
        this.fillColor = colorUnit(p, fillColor, alphaEnabled, alphaResolution);
    }
    /**
     * Applies colors to the current p5 renderer.
     * @param {number} alphaValue - Alpha channel value (0 - 255)
     */
    applyColor(alphaValue) {
        this.strokeColor.stroke(alphaValue);
        this.fillColor.fill(alphaValue);
    }
}
/**
 * Undefined object of p5ex.ShapeColor.
 * @static
 */
ShapeColor.UNDEFINED = new ShapeColor(undefined, undefined, undefined);

/**
 * An empty function.
 */
const EMPTY_FUNCTION = () => { };
/**
 * 1.5 * PI
 */
const ONE_AND_HALF_PI = 1.5 * Math.PI;

const dummyP5 = new p5((p) => {
    p.setup = () => {
        p.noCanvas();
    };
});

/**
 * Calculates the squared value of the Euclidean distance between
 * two points (considering a point as a vector object).
 */
function distSq(v1, v2) {
    return Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2) + Math.pow(v2.z - v1.z, 2);
}
/**
 * Multiplies the given matrix and array.
 * The number of matrix columns and the array length must be identical.
 * @param {number[][]} matrix - Any matrix.
 * @param {number[]} array - Any one-dimensional array of numbers.
 * @param {number[]} [target] - Target array for receiving the result.
 * @returns Product of the given values as an array.
 */
function multiplyMatrixAndArray(matrix, array, target) {
    const matrixRowCount = matrix.length;
    const matrixColumnCount = matrix[0].length;

    const resultArray = target || new Array(matrixRowCount);

    for (let row = 0; row < matrixRowCount; row += 1) {
        resultArray[row] = 0;
        for (let col = 0; col < matrixColumnCount; col += 1) {
            resultArray[row] += matrix[row][col] * array[col];
        }
    }
    return resultArray;
}
const TWO_PI = 2 * Math.PI;
/**
 * Calculates the difference between two angles in range of -PI to PI.
 * @param angleA - the angle to subtract from
 * @param angleB - the angle to subtract
 */
function angleDifference(angleA, angleB) {
    let diff = (angleA - angleB) % TWO_PI;
    if (diff < -Math.PI)
        diff += TWO_PI;
    else if (diff > Math.PI)
        diff -= TWO_PI;
    return diff;
}
/**
 * Calculates the direction angle from one vector to another.
 * @param referencePosition
 * @param targetPosition
 */
function getDirectionAngle(referencePosition, targetPosition) {
    return Math.atan2(targetPosition.y - referencePosition.y, targetPosition.x - referencePosition.x);
}
// Temporal vectors for calculation use in getClosestPositionOnLineSegment()
const tmpVectorAP = dummyP5.createVector();
const tmpVectorAB = dummyP5.createVector();
/**
 * Returns the position on the line segment AB which is closest to the reference point P.
 * @param {p5.Vector} P - The position of the reference point.
 * @param {p5.Vector} A - The position of the line segment start point.
 * @param {p5.Vector} B - The position of the line segment end point.
 * @param {p5.Vector} target - The vector to receive the result.
 */

/**
 * Just lerp.
 * @param startValue - The start value.
 * @param endValue - The end value.
 * @param ratio - The ratio between 0 and 1.
 */
function lerp(startValue, endValue, ratio) {
    return startValue + ratio * (endValue - startValue);
}

/**
 * Returns random value from the min number up to (but not including) the max number.
 */
function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}
/**
 * Returns random integer from 0 up to (but not including) the max number.
 */
function randomInt(maxInt) {
    return Math.floor(Math.random() * maxInt);
}
/**
 * Returns random integer from the min number up to (but not including) the max number.
 */
function randomIntBetween(minInt, maxInt) {
    return minInt + randomInt(maxInt - minInt);
}
/**
 * Returns one of array elements randomly.
 * @param array
 */
function getRandom(array) {
    return array[randomInt(array.length)];
}
/**
 * Returns n or -n randomly. (n = provided number)
 * @param {number} n - any number
 */
function randomSign(n) {
    if (Math.random() < 0.5)
        return n;
    return -n;
}
/**
 * Returns and removes one array element randomly.
 * @param array
 */
function popRandom(array) {
    return array.splice(randomInt(array.length), 1)[0];
}

/**
 * Container class of number.
 */
class NumberContainer {
    /**
     * @constructor
     * @param {number} value
     */
    constructor(value = 0) {
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
}
/**
 * Null object of NumberContainer.
 * @static
 */
NumberContainer.NULL = new NumberContainer();

/**
 * (To be filled)
 */
class WeightedRandomSelector {
    constructor() {
        this.candidateList = [];
        this.candidateCount = 0;
        this.totalProbabiligyWeight = 0;
    }
    /**
     * Adds one element with provided weight of probability.
     * @param element
     * @param probabilityWeight
     * @chainable
     */
    push(element, probabilityWeight) {
        this.candidateList.push({
            element,
            threshold: this.totalProbabiligyWeight + probabilityWeight,
        });
        this.candidateCount += 1;
        this.totalProbabiligyWeight += probabilityWeight;
        return this;
    }
    /**
     * Clears all elements.
     * @chainable
     */
    clear() {
        this.candidateList.length = 0;
        this.candidateCount = 0;
        this.totalProbabiligyWeight = 0;
        return this;
    }
    /**
     * Returns one element randomly.
     * The probability for each element is:
     * (probability weight of the element) / (total probability weight)
     */
    get() {
        const rnd = Math.random() * this.totalProbabiligyWeight;
        for (let i = 0; i < this.candidateCount; i += 1) {
            if (rnd < this.candidateList[i].threshold)
                return this.candidateList[i].element;
        }
        return this.candidateList[this.candidateCount - 1].element; // unreachable
    }
}

/**
 * Linear easing function.
 * @param ratio
 */
function easeLinear(ratio) {
    return ratio;
}
/**
 * easeOutQuad.
 * @param ratio
 */
function easeOutQuad(ratio) {
    return -Math.pow(ratio - 1, 2) + 1;
}
/**
 * easeOutCubic.
 * @param ratio
 */
function easeOutCubic(ratio) {
    return Math.pow(ratio - 1, 3) + 1;
}
/**
 * easeOutQuart.
 * @param ratio
 */
function easeOutQuart(ratio) {
    return -Math.pow(ratio - 1, 4) + 1;
}
const EASE_OUT_BACK_DEFAULT_COEFFICIENT = 1.70158;
/**
 * easeOutBack.
 * @param ratio
 */
function easeOutBack(ratio) {
    const r = ratio - 1;
    return ((EASE_OUT_BACK_DEFAULT_COEFFICIENT + 1) * Math.pow(r, 3)
        + EASE_OUT_BACK_DEFAULT_COEFFICIENT * Math.pow(r, 2) + 1);
}
/**
 * Returns an easeOut function.
 * @param exponent - Integer from 1 to 4.
 */
function getEasingFunction(exponent) {
    switch (Math.floor(exponent)) {
        default:
        case 1:
            return easeLinear;
        case 2:
            return easeOutQuad;
        case 3:
            return easeOutCubic;
        case 4:
            return easeOutQuart;
    }
}

/**
 * (To be filled)
 */
class RandomShapeColor {
    constructor() {
        this.candidateArray = [];
    }
    /**
     * (To be filled)
     * @param createShapeColor - Any function which returns a p5ex.ShapeColor instance.
     * @param {number} candidateCount - Number of color candidates to push.
     */
    pushCandidateFromFunction(createShapeColor, candidateCount) {
        for (let i = 0; i < candidateCount; i += 1) {
            this.candidateArray.push(createShapeColor());
        }
        return this;
    }
    /**
     * (To be filled)
     * @param {p5.Color} shapeColor - Any p5.Color instance.
     * @param {number} candidateCount - Number of color candidates to push.
     */
    pushCandidate(shapeColor, candidateCount = 1) {
        for (let i = 0; i < candidateCount; i += 1) {
            this.candidateArray.push(shapeColor);
        }
        return this;
    }
    /**
     * Clears all color candidates.
     */
    clear() {
        this.candidateArray.length = 0;
        return this;
    }
    /**
     * Returns one of color candidates randomly.
     */
    get() {
        return getRandom(this.candidateArray);
    }
}

function createCielabToXyzFunc() {
    const delta = 6 / 29;
    const constantA = 16 / 116;
    const constantB = 3 * delta * delta;
    return (value) => {
        if (value > delta)
            return value * value * value;
        return (value - constantA) * constantB;
    };
}
const cielabToXyzFunc = createCielabToXyzFunc();
/**
 * Converts color values from CIELAB (D65) to XYZ.
 * @param {number[]} cielabValue - Value array of L*, a*, b* (D65).
 * @param {Illuminant} illuminant - Instance of Illuminant.
 * @param {number[]} [target] - Target array for receiving the result.
 * @returns {number[]} XYZ value array.
 */
function cielabValueToXyzValue(cielabValue, illuminant, target) {
    const yFactor = (cielabValue[0] + 16.0) / 116.0;
    const xFactor = yFactor + cielabValue[1] / 500.0;
    const zFactor = yFactor - cielabValue[2] / 200.0;
    if (target) {
        target[0] = illuminant.tristimulusValues[0] * cielabToXyzFunc(xFactor);
        target[1] = illuminant.tristimulusValues[1] * cielabToXyzFunc(yFactor);
        target[2] = illuminant.tristimulusValues[2] * cielabToXyzFunc(zFactor);
        return target;
    }
    return [
        illuminant.tristimulusValues[0] * cielabToXyzFunc(xFactor),
        illuminant.tristimulusValues[1] * cielabToXyzFunc(yFactor),
        illuminant.tristimulusValues[2] * cielabToXyzFunc(zFactor),
    ];
}

/**
 * Matrix for conversion color values from XYZ to linear RGB.
 * Values from "7. Conversion from XYZ (D65) to linear sRGB values" in
 * http://www.color.org/chardata/rgb/sRGB.pdf (April 2015)
 * @constant {number[][]} xyzToLinearRgbConversionMatrix
 * @ignore
 */
const xyzToLinearRgbConversionMatrix = [
    [3.2406255, -1.537208, -0.4986286],
    [-0.9689307, 1.8757561, 0.0415175],
    [0.0557101, -0.2040211, 1.0569959],
];
/**
 * Matrix for converting color values from linear RGB to XYZ.
 * This is an inversed matrix of xyzToLinearRgbConversionMatrix
 * which is pre-calculated by math.js.
 * @constant {number[][]} linearRgbToXyzConversionMatrix
 * @ignore
 */

/**
 * CIE standard illuminant.
 */
class Illuminant {
    constructor(name, tristimulusValues) {
        this.name = name;
        this.tristimulusValues = tristimulusValues;
    }
}

/**
 * Map of illuminants.
 */
const Illuminants = {
    D50: new Illuminant('D50', [0.9642, 1.0000, 0.8251]),
    D55: new Illuminant('D55', [0.9568, 1.0000, 0.9214]),
    D65: new Illuminant('D65', [0.95047, 1.00000, 1.08883]),
    E: new Illuminant('E', [1, 1, 1]),
};

/**
 * Applies display gamma correction to the given number.
 * @param value - any number in a linear color space (0 - 1).
 * @ignore
 */
function degamma(value) {
    if (value <= 0.0031308)
        return 12.92 * value;
    return 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055;
}
/**
 * Returns the difference of two colors. The alpha values of the original colors will be ignored.
 * @param {p5.Color} c1 - The color to subtract from
 * @param {p5.Color} c2 - The color to subtract
 * @param {number} [alphaValue] - Alpha value of the result color
 */
function subtractColor(c1, c2, alphaValue) {
    return dummyP5.color(dummyP5.red(c1) - dummyP5.red(c2), dummyP5.green(c1) - dummyP5.green(c2), dummyP5.blue(c1) - dummyP5.blue(c2), alphaValue);
}
/**
 * Creates a new p5.Color instance in HSB color mode and
 * immediately reset the color mode to default.
 * @param {number} h - Hue (0 - 360)
 * @param {number} s - Saturation (0 - 100)
 * @param {number} b - Brightness (0 - 100)
 * @param {number} [a] - Alpha (0 - 255)
 */
function hsbColor(h, s, b, a) {
    dummyP5.colorMode(dummyP5.HSB, 360, 100, 100, 255);
    const c = dummyP5.color(h, s, b);
    dummyP5.colorMode(dummyP5.RGB, 1, 1, 1, 255);
    const gammaCorrectedColor = dummyP5.color(degamma(dummyP5.red(c)), degamma(dummyP5.green(c)), degamma(dummyP5.blue(c)), a);
    dummyP5.colorMode(dummyP5.RGB, 255, 255, 255, 255);
    return gammaCorrectedColor;
}

let currentIlluminant = Illuminants.D50;
/**
 * Sets the current illuminant. (e.g. D50, D65 etc.)
 * @param illuminant - Any Illuminant.
 * @example setIlluminant(Illuminants.D65);
 */
function setIlluminant(illuminant) {
    currentIlluminant = illuminant;
}
const temporalArray1 = [0, 0, 0];
const temporalArray2 = [0, 0, 0];
const temporalArray3 = [0, 0, 0];
const temporalArray4 = [0, 0, 0];
function assignArray(array, v0, v1, v2) {
    array[0] = v0;
    array[1] = v1;
    array[2] = v2;
    return array;
}
/**
 * Clips the given linear RGB factor to the valid range (0 - 1)
 * and converts it to an sRGB value (0 - 255).
 * @param factor - Factor of either red, green or blue in the linear RGB color space.
 * @returns sRGB value.
 * @ignore
 */
function linearRgbFactorToSrgbValue(factor) {
    return degamma(Math.min(Math.max(factor, 0), 1)) * 255;
}
/**
 * Converts CIELAB values to an array of RGB values (0 - 255).
 * @param {number} lValue - L*: Lightness (0 - 100)
 * @param {number} aValue - a* (0 - ca. 100)
 * @param {number} bValue - b* (0 - ca. 100)
 * @param {number} [alphaValue] - Alhpa value (0 - 255)
 * @returns New Array of sRGB values.
 */
function cielabColor(lValue, aValue, bValue, alphaValue) {
    const labValue = assignArray(temporalArray1, lValue, aValue, bValue);
    const xyzValue = cielabValueToXyzValue(labValue, currentIlluminant, temporalArray2);
    const rgbFactor = multiplyMatrixAndArray(xyzToLinearRgbConversionMatrix, xyzValue, temporalArray3);
    const srgbValue = assignArray(temporalArray4, linearRgbFactorToSrgbValue(rgbFactor[0]), linearRgbFactorToSrgbValue(rgbFactor[1]), linearRgbFactorToSrgbValue(rgbFactor[2]));
    return alphaValue ? [
        srgbValue[0],
        srgbValue[1],
        srgbValue[2],
        alphaValue,
    ] : [
        srgbValue[0],
        srgbValue[1],
        srgbValue[2],
    ];
}
/**
 * Converts CIELCh values to an array of RGB values (0 - 255).
 * @param {number} lValue - L*: Lightness (0 - 100)
 * @param {number} cValue - C*: Chroma (0 - ca. 100)
 * @param {number} hValue - h*: Hue (0 - 2PI)
 * @param {number} [alphaValue] - Alhpa value (0 - 255)
 */
function cielchColor(lValue, cValue, hValue, alphaValue) {
    return cielabColor(lValue, cValue * Math.cos(hValue), cValue * Math.sin(hValue), alphaValue);
}

/**
 * (To be filled)
 */
class ScreenEffect {
    constructor(p) {
        this.p = p;
    }
}
/**
 * (To be filled)
 */
class ScreenShake extends ScreenEffect {
    constructor(p, dampingRatio = 0.95) {
        super(p);
        this.dampingRatio = dampingRatio;
        this.amplitude = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    apply() {
        if (this.amplitude === 0)
            return;
        this.offsetX = Math.random() * this.amplitude;
        this.offsetY = Math.random() * this.amplitude;
        this.p.currentRenderer.translate(this.offsetX, this.offsetY);
        this.amplitude = this.amplitude * this.dampingRatio;
        if (this.amplitude < 1)
            this.amplitude = 0;
    }
    set(amplitude) {
        this.amplitude = Math.max(this.amplitude, amplitude);
    }
    reset() {
        this.amplitude = 0;
    }
    cancel() {
        this.p.currentRenderer.translate(-this.offsetX, -this.offsetY);
    }
}
/**
 * (To be filled)
 */
class ScreenFlash extends ScreenEffect {
    constructor(p, flashColor = p.color(255)) {
        super(p);
        this.alphaValue = 0;
        this.valueChange = 0;
        this.flashColor = new ShapeColor(p, null, flashColor, true);
    }
    apply() {
        if (this.alphaValue === 0)
            return;
        this.flashColor.applyColor(this.alphaValue);
        this.p.currentRenderer.rect(0, 0, this.p.scalableCanvas.nonScaledWidth, this.p.scalableCanvas.nonScaledHeight);
        this.alphaValue -= this.valueChange;
        if (this.alphaValue < 1)
            this.alphaValue = 0;
    }
    set(initialAlphaValue, durationSeconds) {
        this.alphaValue = initialAlphaValue;
        this.valueChange = initialAlphaValue / (durationSeconds * this.p.idealFrameRate);
    }
    reset() {
        this.alphaValue = 0;
    }
}

/**
 * (To be filled)
 */
class AlphaBackground {
    /**
     *
     * @param p5exInstance
     * @param backgroundColor
     * @param drawIntervalFrameCount
     * @param blendModeString
     * @param defaultBlendModeString
     */
    constructor(p5exInstance, backgroundColor, drawIntervalFrameCount = 1, blendModeString, defaultBlendModeString) {
        this.p = p5exInstance;
        this.backgroundColor = backgroundColor;
        this.drawIntervalFrameCount = drawIntervalFrameCount;
        this.blendModeString = blendModeString;
        this.defaultBlendModeString = defaultBlendModeString;
    }
    /**
     * Draws the background.
     */
    draw() {
        if (this.p.frameCount % this.drawIntervalFrameCount !== 0)
            return;
        if (this.blendModeString)
            this.p.blendMode(this.blendModeString);
        this.p.noStroke();
        this.p.fill(this.backgroundColor);
        this.p.rect(0, 0, this.p.width, this.p.height);
        if (this.defaultBlendModeString)
            this.p.blendMode(this.defaultBlendModeString);
    }
}

/**
 * Returns true if the mouse is within the canvas.
 * @param p - The p5 instance.
 */
function mouseIsInCanvas(p) {
    if (p.mouseX < 0)
        return false;
    if (p.mouseX > p.width)
        return false;
    if (p.mouseY < 0)
        return false;
    if (p.mouseY > p.height)
        return false;
    return true;
}

function loopArrayLimited(array, callback, arrayLength) {
    let i = 0;
    while (i < arrayLength) {
        callback(array[i], i, array);
        i += 1;
    }
}
/**
 * Executes a provided function once for each array element.
 * @param {Array} array
 * @param {loopArrayCallBack} callback
 */
function loopArray(array, callback) {
    loopArrayLimited(array, callback, array.length);
}
function loopArrayBackwardsLimited(array, callback, arrayLength) {

    while (arrayLength--) {
        callback(array[arrayLength], arrayLength, array);
    }
}
/**
 * Executes a provided function once for each array element in descending order.
 * @param {Array} array
 * @param {loopArrayCallback} callback
 */
function loopArrayBackwards(array, callback) {
    loopArrayBackwardsLimited(array, callback, array.length);
}
/**
 * @callback loopArrayCallBack
 * @param {} currentValue
 * @param {number} [index]
 * @param {Array} [array]
 */

function roundRobinLimited(array, callback, arrayLength) {
    for (let i = 0, len = arrayLength - 1; i < len; i += 1) {
        for (let k = i + 1; k < arrayLength; k += 1) {
            callback(array[i], array[k]);
        }
    }
}
/**
 * Executes a provided function once for each pair within the array.
 * @param {Array} array
 * @param {roundRobinCallBack} callback
 */
function roundRobin(array, callback) {
    roundRobinLimited(array, callback, array.length);
}
/**
 * @callback roundRobinCallBack
 * @param {} element
 * @param {} otherElement
 */

function nestedLoopJoinLimited(array, otherArray, callback, arrayLength, otherArrayLength) {
    for (let i = 0; i < arrayLength; i += 1) {
        for (let k = 0; k < otherArrayLength; k += 1) {
            callback(array[i], otherArray[k]);
        }
    }
}
/**
 * Joins two arrays and executes a provided function once for each joined pair.
 * @param {Array} array
 * @param {Array} otherArray
 * @param {nestedLoopJoinCallBack} callback
 */
function nestedLoopJoin(array, otherArray, callback) {
    nestedLoopJoinLimited(array, otherArray, callback, array.length, otherArray.length);
}
/**
 * @callback nestedLoopJoinCallBack
 * @param {} element
 * @param {} otherElement
 */

/**
 * A class containing an array and several loop methods.
 */
class LoopableArray {
    /**
     * @param {number} initialCapacity
     */
    constructor(initialCapacity = 256) {

        this.array = new Array(initialCapacity);
        this.length = 0;
    }
    /**
     * Returns a specific element.
     * It is recommended to check that you are going to specify a valid index number
     * before calling this method.
     * @returns The specified element.
     */
    get(index) {
        return this.array[index];
    }
    /**
     * Returns the last element.
     * It is recommended to check that this array is not empty before calling this method.
     * @returns The last element.
     */
    getLast() {
        return this.array[this.length - 1];
    }
    /**
     * Adds one element to the end of the array and returns the new length of the array.
     * @param {} element - The element to add to the end of the array.
     */
    push(element) {
        this.array[this.length] = element;
        this.length += 1;
        return this.length;
    }
    /**
     * Adds elements to the end of the array and returns the new length of the array.
     * @param {Array} array - The elements to add to the end of the array.
     */
    pushRawArray(array, arrayLength = array.length) {
        for (let i = 0; i < arrayLength; i += 1) {
            this.array[this.length + i] = array[i];
        }
        this.length += arrayLength;
        return this.length;
    }
    /**
     * Adds all elements from another LoopableArray and returns the new length of the array.
     * @param {LoopableArray} otherLoopableArray
     */
    pushAll(otherLoopableArray) {
        return this.pushRawArray(otherLoopableArray.array, otherLoopableArray.length);
    }
    /**
     * Removes and returns the last element.
     * It is recommended to check that this array is not empty before calling this method.
     * @returns The last element.
     */
    pop() {
        this.length -= 1;
        return this.array[this.length];
    }
    /**
     * Clears the array.
     */
    clear() {
        this.length = 0;
    }
    /**
     * @callback loopArrayCallBack
     * @param {} currentValue
     * @param {number} [index]
     * @param {Array} [array]
     */
    /**
     * Executes a provided function once for each array element.
     * @param {loopArrayCallBack} callback
     */
    loop(callback) {
        loopArrayLimited(this.array, callback, this.length);
    }
    /**
     * Executes a provided function once for each array element in descending order.
     * @param {loopArrayCallBack} callback
     */
    loopBackwards(callback) {
        loopArrayBackwardsLimited(this.array, callback, this.length);
    }
    /**
     * @callback elementPairCallBack
     * @param {} element
     * @param {} otherElement
     */
    /**
     * Executes a provided function once for each pair within the array.
     * @param {elementPairCallback} callback
     */
    roundRobin(callback) {
        roundRobinLimited(this.array, callback, this.length);
    }
    /**
     * Joins two arrays and executes a provided function once for each joined pair.
     * @param {LoopableArray} otherArray
     * @param {elementPairCallback} callback
     */
    nestedLoopJoin(otherArray, callback) {
        nestedLoopJoinLimited(this.array, otherArray.array, callback, this.length, otherArray.length);
    }
}

/**
 * (To be filled)
 */
class TwoDimensionalArray extends LoopableArray {
    /**
     * (To be filled)
     * @param {number} xCount
     * @param {number} yCount
     * @param fillElement
     */
    constructor(xCount, yCount, fillElement) {
        super(xCount * yCount);
        this.xCount = xCount;
        this.yCount = yCount;
        if (fillElement) {
            for (let i = 0, len = xCount * yCount; i < len; i += 1) {
                this.push(fillElement);
            }
        }
    }
    /**
     * Returns the specified element.
     * @param x
     * @param y
     */
    get2D(x, y) {
        return this.array[x + this.xCount * y];
    }
    /**
     * (To be filled)
     * @param x
     * @param y
     * @param element
     */
    set2D(x, y, element) {
        this.array[x + this.xCount * y] = element;
    }
}

/**
 * A Naive implementation of an edge between two objects.
 */
class NaiveEdge {
    /**
     *
     * @param nodeA
     * @param nodeB
     */
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
    }
    /**
     * Returns true if the provided node is incident to this edge.
     * @param node
     */
    isIncidentTo(node) {
        return node === this.nodeA || node === this.nodeB;
    }
    /**
     * Returns the adjacent node of the given node via this edge.
     * If this edge is not incident to the given node, returns always the end point node.
     * @param {T} node - any node which is incident to this edge
     */
    getAdjacentNode(node) {
        if (node === this.nodeB)
            return this.nodeA;
        return this.nodeB;
    }
}

/**
 * (To be filled)
 */
class NullCell {
    getNeighborCell(relativeX, relativeY) {
        return this;
    }
    setNeighborCell(relativeX, relativeY, cell) { }
}
const NULL = new NullCell();
/**
 * (To be filled)
 */
class NaiveCell {
    /**
     *
     * @param neighborRange
     */
    constructor(neighborRange = 1) {
        this.neighborCells = new TwoDimensionalArray(2 * neighborRange + 1, 2 * neighborRange + 1, NULL);
    }
    /**
     * Returns the specified neighbor cell.
     * @param {number} relativeX
     * @param {number} relativeY
     */
    getNeighborCell(relativeX, relativeY) {
        const neighborRange = Math.floor(this.neighborCells.xCount / 2);
        if (relativeX < -neighborRange || relativeX > neighborRange ||
            relativeY < -neighborRange || relativeY > neighborRange)
            return NULL;
        return this.neighborCells.get2D(relativeX + neighborRange, relativeY + neighborRange);
    }
    /**
     * Sets the provided cell as a neighbor of this cell.
     * @param relativeX
     * @param relativeY
     * @param cell
     */
    setNeighborCell(relativeX, relativeY, cell) {
        const neighborRange = Math.floor(this.neighborCells.xCount / 2);
        this.neighborCells.set2D(relativeX + neighborRange, relativeY + neighborRange, cell);
    }
}
/**
 * (To be filled)
 */
class Grid {
    /**
     *
     * @param {number} xCount
     * @param {number} yCount
     * @param {number} neighborRange
     * @param {boolean} loopAtEndOfScreen
     */
    constructor(xCount, yCount, neighborRange, loopAtEndOfScreen, cellFactory, nullCell) {
        this.nullCell = nullCell;
        this.cell2DArray = new TwoDimensionalArray(xCount, yCount, nullCell);
        this.cellIndexMap = new Map();
        for (let yIndex = 0; yIndex < yCount; yIndex += 1) {
            for (let xIndex = 0; xIndex < xCount; xIndex += 1) {
                const cell = cellFactory(neighborRange);
                this.cell2DArray.set2D(xIndex, yIndex, cell);
                this.cellIndexMap.set(cell, { x: xIndex, y: yIndex });
            }
        }
        this.cell2DArray.loop((cell) => {
            this.setNeighborCells(cell, neighborRange, loopAtEndOfScreen);
        });
    }
    /**
     * Returns the specified cell.
     * @param {number} x - X index.
     * @param {number} y - Y index.
     */
    getCell(x, y) {
        return this.cell2DArray.get2D(x, y);
    }
    /**
     * Returns the x and y index of the given cell.
     * @param cell
     */
    getCellIndex(cell) {
        return this.cellIndexMap.get(cell) || { x: -1, y: -1 };
    }
    /**
     * (To be filled)
     * @param referenceCell
     * @param {number} relX
     * @param {number} relY
     * @param {boolean} loopAtEndOfScreen
     */
    getRelativePositionCell(referenceCell, relX, relY, loopAtEndOfScreen) {
        if (referenceCell === this.nullCell)
            return referenceCell;
        if (relX === 0 && relY === 0)
            return referenceCell;
        const referenceIndex = this.getCellIndex(referenceCell);
        const targetIndex = {
            x: referenceIndex.x + relX,
            y: referenceIndex.y + relY,
        };
        if (loopAtEndOfScreen) {
            if (targetIndex.x < 0)
                targetIndex.x += this.cell2DArray.xCount;
            else if (targetIndex.x >= this.cell2DArray.xCount)
                targetIndex.x -= this.cell2DArray.xCount;
            if (targetIndex.y < 0)
                targetIndex.y += this.cell2DArray.yCount;
            else if (targetIndex.y >= this.cell2DArray.yCount)
                targetIndex.y -= this.cell2DArray.yCount;
        }
        else {
            if (targetIndex.x < 0 || targetIndex.x >= this.cell2DArray.xCount ||
                targetIndex.y < 0 || targetIndex.y >= this.cell2DArray.yCount)
                return this.nullCell;
        }
        return this.cell2DArray.get2D(targetIndex.x, targetIndex.y);
    }
    setNeighborCells(referenceCell, neighborRange, loopAtEndOfScreen) {
        for (let relativeX = -neighborRange; relativeX <= neighborRange; relativeX += 1) {
            for (let relativeY = -neighborRange; relativeY <= neighborRange; relativeY += 1) {
                referenceCell.setNeighborCell(relativeX, relativeY, this.getRelativePositionCell(referenceCell, relativeX, relativeY, loopAtEndOfScreen));
            }
        }
    }
}

/**
 * (To be filled)
 */
class DrawableArray extends LoopableArray {
    static drawFunction(value) {
        value.draw();
    }
    /**
     * Draws all child elements.
     */
    draw() {
        this.loop(DrawableArray.drawFunction);
    }
}

/**
 * (To be filled)
 */
class SteppableArray extends LoopableArray {
    static stepFunction(value) {
        value.step();
    }
    /**
     * Steps all child elements.
     */
    step() {
        this.loop(SteppableArray.stepFunction);
    }
}

/**
 * (To be filled)
 */
class SpriteArray extends LoopableArray {
}
SpriteArray.prototype.step = SteppableArray.prototype.step;
SpriteArray.prototype.draw = DrawableArray.prototype.draw;

/**
 * (To be filled)
 */
class CleanableArray extends LoopableArray {
    /**
     *
     * @param initialCapacity
     */
    constructor(initialCapacity) {
        super(initialCapacity);
        this.recentRemovedElements = new LoopableArray(initialCapacity);
    }
    /**
     * Updates the variable 'isToBeRemoved'.
     * If it has cleanable child elements, calls clean() recursively and
     * removes the child elements which are to be removed.
     */
    clean() {
        this.recentRemovedElements.clear();
        let validElementCount = 0;
        for (let i = 0; i < this.length; i += 1) {
            this.array[i].clean();
            if (this.array[i].isToBeRemoved) {
                this.recentRemovedElements.push(this.array[i]);
                continue;
            }
            this.array[validElementCount] = this.array[i];
            validElementCount += 1;
        }
        this.length = validElementCount;
    }
}

/**
 * (To be filled)
 */
class CleanableSpriteArray extends CleanableArray {
}
CleanableSpriteArray.prototype.draw = SpriteArray.prototype.draw;
CleanableSpriteArray.prototype.step = SpriteArray.prototype.step;

/**
 * Object pool which calls the provided function for every element when using & recyling.
 * Intended to use with the library deePool, but can also be used with another implementation.
 */
class ObjectPool {
    /**
     *
     * @param naivePool - The pool object with use() and recycle(obj) methods.
     * @param useProcess - The callback function which will be called in use().
     * @param recycleProcess - The callback function which will be called in recycle().
     */
    constructor(naivePool, useProcess, recycleProcess) {
        this.naivePool = naivePool;
        this.useProcess = useProcess || ((object) => { });
        this.recycleProcess = recycleProcess || ((object) => { });
        this.recycle = (usedObject) => {
            this.recycleProcess(usedObject);
            this.naivePool.recycle(usedObject);
        };
    }
    /**
     * Returns an object which is currently not in use.
     */
    use() {
        const newObject = this.naivePool.use();
        this.useProcess(newObject);
        return newObject;
    }
    /**
     * Recycles all elements of the provided array.
     * @param array
     */
    recycleAll(array) {
        array.loop(this.recycle);
    }
}
/**
 * Array of pooled objects. Recycles every removing object when clean() has been called.
 */
class PoolableArray extends CleanableArray {
    constructor(pool, initialCapacity) {
        super(initialCapacity);
        this.pool = pool;
    }
    clean() {
        super.clean();
        this.recentRemovedElements.loop(this.pool.recycle);
        this.recentRemovedElements.clear();
    }
}

/**
 * (To be filled)
 */
class ScaleFactor {
    /**
     *
     * @param p - p5ex instance.
     * @param { number } [value = 1]
     */
    constructor(p, value = 1) {
        this.p = p;
        this.internalValue = value;
        this.internalReciprocalValue = 1 / value;
    }
    /**
     * The numeric value of the scale factor.
     */
    get value() {
        return this.internalValue;
    }
    set value(v) {
        if (v === 0) {
            this.internalValue = 0.0001;
            this.internalReciprocalValue = 10000;
            return;
        }
        this.internalValue = v;
        this.internalReciprocalValue = 1 / v;
    }
    /**
     * The reciprocal value of the scale factor.
     */
    get reciprocalValue() {
        return this.internalReciprocalValue;
    }
    /**
     * Calls scale().
     */
    applyScale() {
        this.p.currentRenderer.scale(this.internalValue);
    }
    /**
     * Calls scale() with the reciprocal value.
     */
    cancel() {
        this.p.currentRenderer.scale(this.internalReciprocalValue);
    }
}

/**
 * (To be filled)
 */
class DrawerBuilder {
    /**
     *
     * @param p
     */
    constructor(p) {
        /**
         * Parameter for drawing.
         */
        this.drawParam = {};
        this.p = p;
    }
    /**
     * @param element
     * @chainable
     */
    setElement(element) {
        this.element = element;
        return this;
    }
    /**
     * @param positionRef
     * @chainable
     */
    setPositionRef(positionRef) {
        this.drawParam.positionRef = positionRef;
        return this;
    }
    /**
     * @param offsetPositionRef
     * @chainable
     */
    setOffsetPositionRef(offsetPositionRef) {
        this.drawParam.offsetPositionRef = offsetPositionRef;
        return this;
    }
    /**
     * @param rotationAngleRef
     * @chainable
     */
    setRotationAngleRef(rotationAngleRef) {
        this.drawParam.rotationAngleRef = rotationAngleRef;
        return this;
    }
    /**
     * @param scaleFactorRef
     * @chainable
     */
    setScaleFactorRef(scaleFactorRef) {
        this.drawParam.scaleFactorRef = scaleFactorRef;
        return this;
    }
    /**
     * @param shapeColorRef
     * @chainable
     */
    setShapeColorRef(shapeColorRef) {
        this.drawParam.shapeColorRef = shapeColorRef;
        return this;
    }
    /**
     * @param alphaChannelRef
     * @chainable
     */
    setAlphaChannelRef(alphaChannelRef) {
        this.drawParam.alphaChannelRef = alphaChannelRef;
        return this;
    }
    /**
     * @param strokeWeightRef
     * @chainable
     */
    setStrokeWeightRef(strokeWeightRef) {
        this.drawParam.strokeWeightRef = strokeWeightRef;
        return this;
    }
    /**
     * @param textSizeRef
     * @chainable
     */
    setTextSizeRef(textSizeRef) {
        this.drawParam.textSizeRef = textSizeRef;
        return this;
    }
    /**
     * Builds a p5ex.Drawer instance.
     */
    build() {
        return new Drawer(this.p, this.element, this.drawParam);
    }
}
/**
 * (To be filled)
 */
class Drawer {
    /**
     *
     * @param p
     * @param element
     * @param drawParam
     */
    constructor(p, element, drawParam) {
        this.p = p;
        this.set(element, drawParam);
    }
    /**
     * (To be filled)
     * @param element
     * @param drawParam
     */
    set(element, drawParam) {
        this.element = element;
        this.position = drawParam.positionRef || this.p.createVector();
        this.offsetPosition = drawParam.offsetPositionRef || this.p.createVector();
        this.rotation = drawParam.rotationAngleRef || NumberContainer.NULL;
        this.scaleFactor = drawParam.scaleFactorRef || new ScaleFactor(this.p);
        this.shapeColor = drawParam.shapeColorRef || ShapeColor.UNDEFINED;
        this.alphaChannel = drawParam.alphaChannelRef || NumberContainer.NULL;
        this.strokeWeight = drawParam.strokeWeightRef || NumberContainer.NULL;
        this.textSize = drawParam.textSizeRef || NumberContainer.NULL;
        this.procedureList = this.createProcedureList(drawParam);
        this.procedureListLength = this.procedureList.length;
    }
    /**
     * Draws the content.
     */
    draw() {
        for (let i = 0, len = this.procedureListLength; i < len; i += 1) {
            this.procedureList[i](this);
        }
    }
    drawElement(drawer) {
        drawer.element.draw();
    }
    createProcedureList(drawParam) {
        const procedureList = [];
        if (drawParam.shapeColorRef) {
            if (drawParam.alphaChannelRef)
                procedureList.push(this.alphaColor);
            else
                procedureList.push(this.color);
        }
        if (drawParam.textSizeRef)
            procedureList.push(this.applyTextSize);
        if (drawParam.strokeWeightRef)
            procedureList.push(this.applyStrokeWeight);
        if (drawParam.positionRef) {
            if (drawParam.offsetPositionRef)
                procedureList.push(this.translateWithOffset);
            else
                procedureList.push(this.translate);
        }
        else if (drawParam.offsetPositionRef)
            procedureList.push(this.translateOnlyOffset);
        if (drawParam.scaleFactorRef)
            procedureList.push(this.scale);
        if (drawParam.rotationAngleRef)
            procedureList.push(this.rotate);
        procedureList.push(this.drawElement);
        if (drawParam.rotationAngleRef)
            procedureList.push(this.cancelRotate);
        if (drawParam.scaleFactorRef)
            procedureList.push(this.cancelScale);
        if (drawParam.positionRef) {
            if (drawParam.offsetPositionRef)
                procedureList.push(this.cancelTranslateWithOffset);
            else
                procedureList.push(this.cancelTranslate);
        }
        else if (drawParam.offsetPositionRef)
            procedureList.push(this.cancelTranslateOnlyOffset);
        return procedureList;
    }
    translate(drawer) {
        drawer.p.currentRenderer.translate(drawer.position.x, drawer.position.y);
    }
    cancelTranslate(drawer) {
        drawer.p.currentRenderer.translate(-drawer.position.x, -drawer.position.y);
    }
    translateOnlyOffset(drawer) {
        drawer.p.currentRenderer.translate(drawer.offsetPosition.x, drawer.offsetPosition.y);
    }
    cancelTranslateOnlyOffset(drawer) {
        drawer.p.currentRenderer.translate(-drawer.offsetPosition.x, -drawer.offsetPosition.y);
    }
    translateWithOffset(drawer) {
        drawer.p.currentRenderer.translate(drawer.position.x + drawer.offsetPosition.x, drawer.position.y + drawer.offsetPosition.y);
    }
    cancelTranslateWithOffset(drawer) {
        drawer.p.currentRenderer.translate(-(drawer.position.x + drawer.offsetPosition.x), -(drawer.position.y + drawer.offsetPosition.y));
    }
    rotate(drawer) {
        drawer.p.currentRenderer.rotate(drawer.rotation.value);
    }
    cancelRotate(drawer) {
        drawer.p.currentRenderer.rotate(-drawer.rotation.value);
    }
    scale(drawer) {
        if (drawer.scaleFactor.value === 1)
            return;
        drawer.scaleFactor.applyScale();
    }
    cancelScale(drawer) {
        if (drawer.scaleFactor.value === 1)
            return;
        drawer.scaleFactor.cancel();
    }
    color(drawer) {
        drawer.shapeColor.applyColor();
    }
    alphaColor(drawer) {
        drawer.shapeColor.applyColor(drawer.alphaChannel.value);
    }
    applyStrokeWeight(drawer) {
        drawer.p.currentRenderer.strokeWeight(drawer.strokeWeight.value);
    }
    applyTextSize(drawer) {
        drawer.p.currentRenderer.textSize(drawer.textSize.value);
    }
}

/**
 * (To be filled)
 */
class ShapeType {
    /**
     * @param drawShape
     */
    constructor(drawShape) {
        this.drawShape = drawShape;
    }
}
const COS60 = 1 / 2;
const SIN60 = Math.sqrt(3) / 2;

/**
 * Set of shape types.
 */
const ShapeTypes = {
    CIRCLE: new ShapeType((renderer, size) => { renderer.ellipse(0, 0, size, size); }),
    SQUARE: new ShapeType((renderer, size) => { renderer.rect(0, 0, size, size); }),
    REGULAR_TRIANGLE: new ShapeType((renderer, size) => {
        const radius = 0.5 * size;
        renderer.triangle(radius, 0, -COS60 * radius, -SIN60 * radius, -COS60 * radius, +SIN60 * radius);
    }),
    REGULAR_TRIANGLE_UPWARD: new ShapeType((renderer, size) => {
        const radius = 0.5 * size;
        renderer.triangle(0, radius, -SIN60 * radius, -COS60 * radius, +SIN60 * radius, -COS60 * radius);
    }),
};

/**
 * (To be filled)
 */
class ScalableShape {
    /**
     *
     * @param p5exInstance
     * @param shapeType - type chosen from p5ex.ShapeTypes
     * @param {number} baseShapeSize
     * @param {NumberContainer} [scaleFactorRef]
     */
    constructor(p5exInstance, shapeType, baseShapeSize, scaleFactorRef = new NumberContainer(1)) {
        this.p = p5exInstance;
        this.shapeType = shapeType;
        this.baseShapeSize = baseShapeSize;
        this.scaleFactorRef = scaleFactorRef;
    }
    /**
     * Draws the shape.
     */
    draw() {
        this.shapeType.drawShape(this.p, this.scaleFactorRef.value * this.baseShapeSize);
    }
}

/**
 * (To be filled)
 */
class LineSegment {
    constructor(p, x1, y1, x2, y2) {
        this.p = p;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    draw() {
        this.p.currentRenderer.line(this.x1, this.y1, this.x2, this.y2);
    }
}

/**
 * (To be filled)
 */
class CircularArc {
    constructor(p, centerPosition, diameter, startAngle, endAngle, isClockwise, startRatio, endRatio) {
        this.p = p;
        this.centerPosition = centerPosition;
        this.diameter = diameter;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.startRatio = startRatio;
        this.endRatio = endRatio;
        this.isClockwise = isClockwise;
    }
    get isClockwise() { return this._isClockwise; }
    set isClockwise(flag) {
        this._isClockwise = flag;
        this.validate = flag ? validateClockwise : validateAntiClockwise;
        this.drawTrimmedArc = flag ? drawClockwise : drawAntiClockwise;
    }
    draw() {
        this.validate(this);
        const angleDifference = this.endAngle.value - this.startAngle.value;
        const start = this.startAngle.value +
            this.startRatio.value * angleDifference;
        const end = this.startAngle.value +
            this.endRatio.value * angleDifference;
        this.drawTrimmedArc(this.p, this.centerPosition, this.diameter.value, start, end);
    }
}
function validateClockwise(arc) {
    if (arc.startAngle.value > arc.endAngle.value)
        arc.endAngle.value += arc.p.TWO_PI;
}
function validateAntiClockwise(arc) {
    if (arc.startAngle.value < arc.endAngle.value)
        arc.endAngle.value -= arc.p.TWO_PI;
}
function drawClockwise(p, centerPosition, diameter, trimmedStartAngle, trimmedEndAngle) {
    p.currentRenderer.arc(centerPosition.x, centerPosition.y, diameter, diameter, trimmedStartAngle, trimmedEndAngle);
}
function drawAntiClockwise(p, centerPosition, diameter, trimmedStartAngle, trimmedEndAngle) {
    p.currentRenderer.arc(centerPosition.x, centerPosition.y, diameter, diameter, trimmedEndAngle, trimmedStartAngle);
}

// temporal vectors for use in QuadraticBezierCurve.
const tmpMidPoint1 = dummyP5.createVector();
const tmpMidPoint2 = dummyP5.createVector();
/**
 * Trimmable quadratic bezier curve.
 */
class QuadraticBezierCurve {
    /**
     *
     * @param p
     * @param startPoint
     * @param controlPoint
     * @param endPoint
     * @param resolution
     * @param startRatioRef
     * @param endRatioRef
     */
    constructor(p, startPoint, controlPoint, endPoint, resolution, startRatioRef, endRatioRef) {

        this.pointList = new Array(resolution + 1);
        this.resolution = resolution;
        this.startRatio = startRatioRef;
        this.endRatio = endRatioRef;
        this.p = p;
        for (let i = 0; i <= resolution; i += 1) {
            const ratio2 = i / resolution;
            const ratio1 = 1 - ratio2;
            tmpMidPoint1.set(ratio1 * startPoint.x + ratio2 * controlPoint.x, ratio1 * startPoint.y + ratio2 * controlPoint.y);
            tmpMidPoint2.set(ratio1 * controlPoint.x + ratio2 * endPoint.x, ratio1 * controlPoint.y + ratio2 * endPoint.y);
            this.pointList[i] = p.createVector(ratio1 * tmpMidPoint1.x + ratio2 * tmpMidPoint2.x, ratio1 * tmpMidPoint1.y + ratio2 * tmpMidPoint2.y);
        }
    }
    /**
     * Returns true if the provided control point candidate is valid.
     * @param controlPoint - The control point candidate to be checked.
     * @param startPoint - The start point of the bezier curve.
     * @param endPoint - The start point of the bezier curve.
     * @param minDistance - Minimum distance between the control point and the start/end point.
     * @param minAngle - Minimum angle of the control point.
     * @param maxAngle - Maximum angle of the control point.
     * @static
     */
    static checkControlPoint(controlPoint, startPoint, endPoint, minDistance, minAngle, maxAngle) {
        const minDistanceSquared = minDistance * minDistance;
        if (distSq(controlPoint, startPoint) < minDistanceSquared)
            return false;
        if (distSq(controlPoint, endPoint) < minDistanceSquared)
            return false;
        const angle = Math.abs(angleDifference(getDirectionAngle(controlPoint, startPoint), getDirectionAngle(controlPoint, endPoint)));
        if (angle < minAngle)
            return false;
        if (angle > maxAngle)
            return false;
        return true;
    }
    draw() {
        const startIndex = Math.floor(this.startRatio.value * this.resolution);
        const endIndex = Math.floor(this.endRatio.value * this.resolution);
        const indexRemainder = this.endRatio.value * this.resolution - endIndex;
        const renderer = this.p.currentRenderer;
        const points = this.pointList;
        renderer.beginShape();
        for (let i = startIndex; i <= endIndex; i += 1) {
            renderer.vertex(points[i].x, points[i].y);
        }
        if (indexRemainder > 0) {
            renderer.vertex(points[endIndex].x + indexRemainder * (points[endIndex + 1].x - points[endIndex].x), points[endIndex].y + indexRemainder * (points[endIndex + 1].y - points[endIndex].y));
        }
        renderer.endShape();
    }
}

/**
 * Draws a sine wave.
 * @param p
 * @param drawingLength
 * @param peakToPeakAmplitude
 * @param waveLength
 */
function drawSineWave(p, drawingLength, peakToPeakAmplitude, waveLength) {
    const renderer = p.currentRenderer;
    const peakAmplitude = 0.5 * peakToPeakAmplitude;
    let reachedEnd = false;
    renderer.beginShape();
    for (let x = 0; x <= drawingLength; x += 1) {
        if (x > drawingLength)
            reachedEnd = true;
        renderer.vertex(reachedEnd ? drawingLength : x, -peakAmplitude * Math.sin(p.TWO_PI * x / waveLength));
        if (reachedEnd)
            break;
    }
    renderer.endShape();
}
/**
 * Set color to the specified pixel.
 * @param renderer - Instance of either p5 or p5.Graphics.
 * @param x - The x index of the pixel.
 * @param y - The y index of the pixel.
 * @param red - The red value (0 - 255).
 * @param green - The green value (0 - 255).
 * @param blue - The blue value (0 - 255).
 * @param pixelDensity - If not specified, renderer.pixelDensity() will be called.
 */
function setPixel(renderer, x, y, red, green, blue, alpha, pixelDensity) {
    const g = renderer;
    const d = pixelDensity || g.pixelDensity();
    for (let i = 0; i < d; i += 1) {
        for (let j = 0; j < d; j += 1) {
            const idx = 4 * ((y * d + j) * g.width * d + (x * d + i));
            g.pixels[idx] = red;
            g.pixels[idx + 1] = green;
            g.pixels[idx + 2] = blue;
            g.pixels[idx + 3] = alpha;
        }
    }
}
/**
 * Lerp color to the specified pixel. The alpha channel remains unchanged.
 * @param renderer - Instance of either p5 or p5.Graphics.
 * @param x - The x index of the pixel.
 * @param y - The y index of the pixel.
 * @param red - The red value (0 - 255).
 * @param green - The green value (0 - 255).
 * @param blue - The blue value (0 - 255).
 * @param pixelDensity - If not specified, renderer.pixelDensity() will be called.
 * @param lerpRatio - The lerp ratio (0 - 1). If 1, the color will be replaced.
 */
function lerpPixel(renderer, x, y, red, green, blue, pixelDensity, lerpRatio = 1) {
    const g = renderer;
    const d = pixelDensity || g.pixelDensity();
    for (let i = 0; i < d; i += 1) {
        for (let j = 0; j < d; j += 1) {
            const idx = 4 * ((y * d + j) * g.width * d + (x * d + i));
            g.pixels[idx] = lerp(g.pixels[idx], red, lerpRatio);
            g.pixels[idx + 1] = lerp(g.pixels[idx + 1], green, lerpRatio);
            g.pixels[idx + 2] = lerp(g.pixels[idx + 2], blue, lerpRatio);
            // g.pixels[idx + 3] = 255;
        }
    }
}

/**
 * Font class.
 */
class FontUnit {
    /**
     *
     * @param p - p5ex instance.
     * @param {string} name - The font name.
     * @param {string} [filePath] - The file path of the font.
     *     Not required if the font is already loaded (e.g. as a web font).
     */
    constructor(p, name, filePath) {
        this.p = p;
        this.filePath = filePath || null;
        this.textFontArgument = name;
    }
    /**
     * Loads the font file if the file path has been specified.
     */
    loadFile() {
        if (this.filePath)
            this.textFontArgument = this.p.loadFont(this.filePath);
    }
    /**
     * Applies the font to the current renderer.
     */
    applyFont() {
        this.p.currentRenderer.textFont(this.textFontArgument);
    }
}
/**
 * Manager class of FontUnit.
 */
class FontManager {
    /**
     *
     * @param p - p5ex instance.
     */
    constructor(p) {
        this.p = p;
        this.fontMap = new Map();
    }
    /**
     * Registers a new font.
     * @param p
     * @param name
     * @param filePath
     * @chainable
     */
    register(name, filePath) {
        this.fontMap.set(name, new FontUnit(this.p, name, filePath));
        return this;
    }
    /**
     * Calls loadFile() for each registered font. Should be called in preload().
     */
    loadAll() {
        for (const font of this.fontMap.values()) {
            font.loadFile();
        }
    }
    /**
     * Applies the specified font to the current renderer.
     * @param {string} name - The font name.
     */
    applyFont(name) {
        const font = this.fontMap.get(name);
        if (font)
            font.applyFont();
    }
}

/**
 * (To be filled)
 */
class AngleQuantity {
    /**
     * Null object of AngleQuantity.
     * @static
     */
    static get NULL() { return NULL$1; }
    /**
     *
     * @param angle
     * @param angleVelocity
     */
    constructor(angle = 0, angleVelocity = 0) {
        this.angleReference = new NumberContainer(angle);
        this.angleVelocityReference = new NumberContainer(angleVelocity);
    }
    /**
     * Current angle value.
     */
    get angle() { return this.angleReference.value; }
    set angle(v) { this.angleReference.value = v; }
    /**
     * Current anglular velocity value.
     */
    get angleVelocity() { return this.angleVelocityReference.value; }
    set angleVelocity(v) { this.angleVelocityReference.value = v; }
    /**
     * Updates the angle.
     */
    step() {
        this.angle += this.angleVelocity;
    }
}
class NullAngleQuantity extends AngleQuantity {
    get angle() { return 0; }
    set angle(v) { }
    get angleVelocity() { return 0; }
    set angleVelocity(v) { }
    step() { }
}
const NULL$1 = new NullAngleQuantity();

/**
 * (To be filled)
 */
class KinematicQuantity {
    constructor() {
        this.position = new p5.Vector();
        this.velocity = new p5.Vector();
    }
    /**
     * Updates the position.
     */
    step() {
        this.position.add(this.velocity);
    }
    /**
     * Returns the current speed.
     */
    getSpeed() {
        return this.velocity.mag();
    }
    /**
     * Returns the current direction angle.
     */
    getDirection() {
        return this.velocity.heading();
    }
    /**
     * Adds the given value to the current speed.
     * @param speedChange
     */
    addSpeed(speedChange) {
        this.velocity.setMag(Math.max(0, this.velocity.mag() + speedChange));
    }
}

const temporalVector = dummyP5.createVector();
/**
 * (To be filled)
 */
class PhysicsBody {
    constructor() {
        this.kinematicQuantity = new KinematicQuantity();
        this.position = this.kinematicQuantity.position;
        this.velocity = this.kinematicQuantity.velocity;
        this.mass = 1;
        this.collisionRadius = 0;
        this.hasFriction = false;
        this.decelerationFactor = 1;
    }
    /**
     * X position.
     */
    get x() {
        return this.position.x;
    }
    /**
     * Y position.
     */
    get y() {
        return this.position.y;
    }
    /**
     * Z position.
     */
    get z() {
        return this.position.z;
    }
    /**
     * X velocity.
     */
    get vx() {
        return this.velocity.x;
    }
    /**
     * Y velocity.
     */
    get vy() {
        return this.velocity.y;
    }
    /**
     * Z velocity.
     */
    get vz() {
        return this.velocity.z;
    }
    /**
     * Returns the current speed.
     */
    getSpeed() {
        return this.kinematicQuantity.getSpeed();
    }
    /**
     * Returns the current direction angle.
     */
    getDirection() {
        return this.kinematicQuantity.getDirection();
    }
    /**
     * Sets the friction of the body.
     * @param constant
     */
    setFriction(constant) {
        if (constant === 0) {
            this.hasFriction = false;
            return;
        }
        this.hasFriction = true;
        this.decelerationFactor = 1 - constant;
    }
    /**
     * Constrains the current speed. Should be called every time if needed.
     * @param maxSpeed
     */
    constrainSpeed(maxSpeed) {
        if (this.velocity.magSq() > maxSpeed * maxSpeed)
            this.velocity.setMag(maxSpeed);
    }
    /**
     * Updates the body.
     */
    step() {
        this.kinematicQuantity.step();
        if (this.hasFriction) {
            this.kinematicQuantity.velocity.mult(this.decelerationFactor);
        }
    }
    /**
     * Accelerates the body.
     * @param x
     * @param y
     * @param z
     */
    accelerate(x, y, z) {
        this.kinematicQuantity.velocity.add(x, y, z);
    }
    /**
     * Apply the provided force to the body.
     * @param force
     */
    applyForce(force) {
        this.accelerate(force.x / this.mass, force.y / this.mass, force.z / this.mass);
    }
    /**
     * Add the provided value to the speed of the body.
     * @param speedChange
     */
    addSpeed(speedChange) {
        this.kinematicQuantity.addSpeed(speedChange);
    }
    /**
     * Returns true if the body collides the provided body.
     * @param other
     */
    collides(other) {
        return (distSq(this.position, other.position) <
            this.collisionRadius * this.collisionRadius + other.collisionRadius * other.collisionRadius);
    }
    /**
     * (To be filled)
     * @param normalUnitVector
     * @param restitution
     */
    bounce(normalUnitVector, restitution = 1) {
        this.velocity.add(p5.Vector.mult(normalUnitVector, (1 + restitution) * p5.Vector.dot(this.velocity, p5.Vector.mult(normalUnitVector, -1))));
    }
    /**
     * Applies attraction force to both this and the target body.
     * @param {PhysicsBody} other - the other body to interact with
     * @param {number} magnitudeFactor - the factor of magnitude other than the distance
     * @param {number} minMag - the minimum magnitude
     * @param {number} maxMag - the maximum magnitude
     * @param {number} cutoffMag - does not apply force if magnitude is smaller than this
     */
    attractEachOther(other, magnitudeFactor, minMag = 0, maxMag, cutoffMag) {
        const force = this.calculateAttractionForce(other.position, magnitudeFactor, minMag, maxMag, cutoffMag);
        if (!force)
            return;
        this.applyForce(force);
        force.mult(-1);
        other.applyForce(force);
    }
    /**
     * Applies attraction force to this body.
     * @param {p5.Vector} targetPosition - the target position
     * @param {number} magnitudeFactor - the factor of magnitude other than the distance
     * @param {number} minMag - the minimum magnitude
     * @param {number} maxMag - the maximum magnitude
     * @param {number} cutoffMag - does not apply force if magnitude is smaller than this
     */
    attractToPoint(targetPosition, magnitudeFactor, minMag = 0, maxMag, cutoffMag) {
        const force = this.calculateAttractionForce(targetPosition, magnitudeFactor, minMag, maxMag, cutoffMag);
        if (!force)
            return;
        this.applyForce(force);
    }
    calculateAttractionForce(targetPosition, magnitudeFactor, minMag = 0, maxMag, cutoffMag) {
        const tmpVec = temporalVector;
        p5.Vector.sub(targetPosition, this.position, tmpVec); // set relative position
        const distanceSquared = tmpVec.magSq();
        let magnitude = Math.abs(magnitudeFactor) / distanceSquared;
        if (cutoffMag && magnitude < cutoffMag)
            return null;
        if (maxMag)
            magnitude = Math.min(Math.max(magnitude, minMag), maxMag);
        else
            magnitude = Math.max(magnitude, minMag);
        tmpVec.setMag(magnitude); // set force
        if (magnitudeFactor < 0)
            tmpVec.mult(-1);
        return tmpVec;
    }
}

/**
 * Returns the 2D force vector which is to be applied to the load.
 * @param loadDirectionAngle - the direction angle from the fulcrum to the load
 * @param loadDistance - the distance between the fulcrum and the load
 * @param effortDistance - the distance between the fulcrum and the effort
 * @param effortForceMagnitude - the effort force magnitude
 * @param rotateClockwise - true if the load is to be rotated clockwise, otherwise false
 * @param target - the vector to receive the result. Will be newly created if not specified
 */
function calculateLeverageForce(loadDirectionAngle, loadDistance, effortDistance, effortForceMagnitude, rotateClockwise, target) {
    const force = target || dummyP5.createVector();
    const forceDirectionAngle = loadDirectionAngle + (rotateClockwise ? -dummyP5.HALF_PI : dummyP5.HALF_PI);
    force.set(Math.cos(forceDirectionAngle), Math.sin(forceDirectionAngle));
    force.setMag(effortForceMagnitude * effortDistance / loadDistance); // load force
    return force;
}

/**
 * (To be filled)
 */
class FrameCounter {
    constructor() {
        this.count = 0;
    }
    /**
     * Resets the counter.
     * @param count
     */
    resetCount(count = 0) {
        this.count = count;
        return this;
    }
    /**
     * Increments the frame count.
     */
    step() {
        this.count += 1;
    }
    /**
     * Returns the mod.
     * @param divisor
     */
    mod(divisor) {
        return this.count % divisor;
    }
}

/**
 * (To be filled)
 */
class TimedFrameCounter extends FrameCounter {
    /**
     * True if this counter is activated.
     */
    get isOn() { return this._isOn; }

    /**
     *
     * @param durationFrameCount
     * @param completeBehavior
     */
    constructor(durationFrameCount, completeBehavior = EMPTY_FUNCTION) {
        super();
        this._isOn = true;
        this.completeBehavior = completeBehavior;
        this.durationFrameCount = durationFrameCount;
    }
    /**
     * Activate this counter.
     * @param duration
     * @chainable
     */
    on(duration) {
        this._isOn = true;
        if (duration)
            this.durationFrameCount = duration;
        return this;
    }
    /**
     * Deactivate this counter.
     * @chainable
     */
    off() {
        this._isOn = false;
        return this;
    }
    /**
     * @override
     */
    step() {
        if (!this._isOn)
            return;
        this.count += 1;
        if (this.count > this.durationFrameCount) {
            this.completeCycle();
        }
    }
}

/**
 * (To be filled)
 */
class LoopedFrameCounter extends TimedFrameCounter {
    /**
     *
     * @param duration
     * @param cycleCompleteBehavior
     */
    constructor(duration, cycleCompleteBehavior) {
        super(duration, cycleCompleteBehavior);
    }
    /**
     * @override
     * @chainable
     */
    on(duration) {
        super.on(duration);
        return this;
    }
    /**
     * @override
     * @chainable
     */
    off() {
        super.off();
        return this;
    }
    /**
     * @override
     */
    getProgressRatio() {
        return this.count / this.durationFrameCount;
    }
    /**
     * @override
     */
    completeCycle() {
        this.completeBehavior();
        this.count = 0;
    }
}

/**
 * (To be filled)
 */
class NonLoopedFrameCounter extends TimedFrameCounter {
    /**
     * True if the given frame count duration has ellapsed already.
     */
    get isCompleted() { return this._isCompleted; }

    /**
     *
     * @param durationFrameCount
     * @param completeBehavior
     */
    constructor(durationFrameCount, completeBehavior) {
        super(durationFrameCount, completeBehavior);
        this._isCompleted = false;
    }
    /**
     * @override
     * @chainable
     */
    on(duration) {
        super.on(duration);
        return this;
    }
    /**
     * @override
     * @chainable
     */
    off() {
        super.off();
        return this;
    }
    /**
     * @override
     */
    resetCount() {
        super.resetCount();
        this._isCompleted = false;
        return this;
    }
    /**
     * @override
     */
    getProgressRatio() {
        return this._isCompleted ? 1 : this.count / this.durationFrameCount;
    }
    /**
     * @override
     */
    completeCycle() {
        this._isCompleted = true;
        this._isOn = false;
        this.completeBehavior();
    }
}

/**
 * Holds a boolean value for each key which indicates if the key is currently down.
 */
const keyDown = new Map();
/**
 * Begins to listen key events. Default behaviors for arrow keys will be prevented.
 */
function listenKey() {
    window.addEventListener('keydown', (event) => {
        keyDown.set(event.key, true);
        keyDown.set(event.code, true);
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'ArrowRight':
                return false;
            default:
                return;
        }
    });
    window.addEventListener('keyup', (event) => {
        keyDown.set(event.key, false);
        keyDown.set(event.code, false);
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'ArrowRight':
                return false;
            default:
                return;
        }
    });
}

/**
 * Returns true if the mouse cursor is on the canvas.
 * @param p - p5ex instance.
 */
function mouseOnCanvas(p) {
    if (p.mouseX < 0)
        return false;
    if (p.mouseX > p.width)
        return false;
    if (p.mouseY < 0)
        return false;
    if (p.mouseY > p.height)
        return false;
    return true;
}

/**
 * Extension of p5 class.
 */
class p5exClass extends p5 {
    /**
     * Sets the current renderer object.
     * @param renderer
     */
    setCurrentRenderer(renderer) {
        this.currentRenderer = renderer;
    }
    /**
      * The non-scaled width of the canvas.
      */
    get nonScaledWidth() {
        return this.scalableCanvas.nonScaledWidth;
    }
    /**
     * The non-scaled height of the canvas.
     */
    get nonScaledHeight() {
        return this.scalableCanvas.nonScaledHeight;
    }

    /**
     * The ideal frame rate which was set by setFrameRate().
     */
    get idealFrameRate() { return this._idealFrameRate; }
    /**
     * Anglular displacement in radians per frame which corresponds to 1 cycle per second.
     * Set by setFrameRate().
     */
    get unitAngleSpeed() { return this._unitAngleSpeed; }
    /**
     * Positional displacement per frame which corresponds to 1 unit length per second.
     * Set by setFrameRate().
     */
    get unitSpeed() { return this._unitSpeed; }
    /**
     * Change of speed per frame which corresponds to 1 unit speed per second.
     * Set by setFrameRate().
     */
    get unitAccelerationMagnitude() { return this._unitAccelerationMagnitude; }
    /**
     * Constructor of class p5ex.
     * @param sketch
     * @param node
     * @param sync
     */
    constructor(sketch, node, sync) {
        super(sketch, typeof node === 'string' ? document.getElementById(node) || undefined : node, sync);
        if (!node || typeof node === 'boolean') {
            this.node = document.body;
        }
        else {
            this.node = typeof node === 'string' ? document.getElementById(node) || document.body : node;
        }
        this.currentRenderer = this;
        this.maxCanvasRegion = {
            width: 0,
            height: 0,
            getShortSideLength() { return Math.min(this.width, this.height); },
        };
        this.updateMaxCanvasRegion();
        this.setFrameRate();
    }
    /**
     * Calls frameRate() and sets variables related to the frame rate.
     * @param {number} [fps=60] - The ideal frame rate per second.
     */
    setFrameRate(fps = 60) {
        this.frameRate(fps);
        if (fps) {
            this._idealFrameRate = fps;
            this._unitAngleSpeed = 2 * Math.PI / this._idealFrameRate;
            this._unitSpeed = 1 / this._idealFrameRate;
            this._unitAccelerationMagnitude = this._unitSpeed / this._idealFrameRate;
        }
        return this;
    }
    /**
     * Updates the value of the variable maxCanvasRegion.
     */
    updateMaxCanvasRegion() {
        this.maxCanvasRegion.width = this.windowWidth;
        this.maxCanvasRegion.height = this.windowHeight;
        if (this.node === document.body)
            return;
        const containerRect = this.node.getBoundingClientRect();
        this.maxCanvasRegion.width = containerRect.width;
        this.maxCanvasRegion.height = containerRect.height;
    }
    /**
     * Create an instance of ScalableCanvas. This includes calling of createCanvas().
     * @param {ScalableCanvasType} type - Type chosen from p5ex.ScalableCanvasTypes.
     * @param {ScalableCanvasParameters} [parameters] - Parameters for type CUSTOM.
     * @param {string} [rendererType] - Either P2D or WEBGL.
     */
    createScalableCanvas(type, parameters, rendererType) {
        this.scalableCanvasType = type;
        this.scalableCanvas = new ScalableCanvas(this, this.createScalableCanvasParameter(type, parameters), this.node, rendererType);
    }
    /**
     * Resizes the ScalableCanvas. Does not work on OpenProcessing.
     * @param {ScalableCanvasType} [type] - Type chosen from p5ex.ScalableCanvasTypes.
     *     If undefined, the last used type will be used again.
     * @param {ScalableCanvasParameters} [parameters] - Parameters for type CUSTOM.
     */
    resizeScalableCanvas(type, parameters) {
        this.scalableCanvas.resize(this.createScalableCanvasParameter(type || this.scalableCanvasType, parameters));
    }
    createScalableCanvasParameter(type, parameters) {
        this.updateMaxCanvasRegion();
        const maxShortSide = this.maxCanvasRegion.getShortSideLength();
        switch (type) {
            case ScalableCanvasTypes.SQUARE640x640:
                return {
                    scaledWidth: maxShortSide,
                    scaledHeight: maxShortSide,
                    nonScaledShortSideLength: 640,
                };
            case ScalableCanvasTypes.RECT640x480:
                return {
                    scaledWidth: maxShortSide,
                    scaledHeight: 0.75 * maxShortSide,
                    nonScaledShortSideLength: 480,
                };
            case ScalableCanvasTypes.FULL:
                return {
                    scaledWidth: this.maxCanvasRegion.width,
                    scaledHeight: this.maxCanvasRegion.height,
                    nonScaledShortSideLength: 640,
                };
            default:
                return parameters || ScalableCanvas.DUMMY_PARAMETERS;
        }
    }
}

exports.p5exClass = p5exClass;
exports.loopArray = loopArray;
exports.loopArrayBackwards = loopArrayBackwards;
exports.roundRobin = roundRobin;
exports.nestedLoopJoin = nestedLoopJoin;
exports.LoopableArray = LoopableArray;
exports.EMPTY_FUNCTION = EMPTY_FUNCTION;
exports.distSq = distSq;
exports.multiplyMatrixAndArray = multiplyMatrixAndArray;
exports.angleDifference = angleDifference;
exports.getDirectionAngle = getDirectionAngle;
exports.lerp = lerp;
exports.randomBetween = randomBetween;
exports.randomInt = randomInt;
exports.randomIntBetween = randomIntBetween;
exports.getRandom = getRandom;
exports.popRandom = popRandom;
exports.randomSign = randomSign;
exports.NumberContainer = NumberContainer;
exports.WeightedRandomSelector = WeightedRandomSelector;
exports.easeLinear = easeLinear;
exports.easeOutQuad = easeOutQuad;
exports.easeOutCubic = easeOutCubic;
exports.easeOutQuart = easeOutQuart;
exports.easeOutBack = easeOutBack;
exports.getEasingFunction = getEasingFunction;
exports.dummyP5 = dummyP5;
exports.Region = Region;
exports.RectangleRegion = RectangleRegion;
exports.ScalableCanvas = ScalableCanvas;
exports.ScalableCanvasTypes = ScalableCanvasTypes;
exports.ScreenEffect = ScreenEffect;
exports.ScreenShake = ScreenShake;
exports.ScreenFlash = ScreenFlash;
exports.AlphaBackground = AlphaBackground;
exports.mouseIsInCanvas = mouseIsInCanvas;
exports.TwoDimensionalArray = TwoDimensionalArray;
exports.NaiveEdge = NaiveEdge;
exports.NaiveCell = NaiveCell;
exports.NullCell = NullCell;
exports.Grid = Grid;
exports.DrawableArray = DrawableArray;
exports.SteppableArray = SteppableArray;
exports.SpriteArray = SpriteArray;
exports.CleanableArray = CleanableArray;
exports.CleanableSpriteArray = CleanableSpriteArray;
exports.ObjectPool = ObjectPool;
exports.PoolableArray = PoolableArray;
exports.ShapeColor = ShapeColor;
exports.RandomShapeColor = RandomShapeColor;
exports.setIlluminant = setIlluminant;
exports.cielabColor = cielabColor;
exports.cielchColor = cielchColor;
exports.Illuminants = Illuminants;
exports.degamma = degamma;
exports.subtractColor = subtractColor;
exports.hsbColor = hsbColor;
exports.Drawer = Drawer;
exports.DrawerBuilder = DrawerBuilder;
exports.ShapeType = ShapeType;
exports.ShapeTypes = ShapeTypes;
exports.ScalableShape = ScalableShape;
exports.LineSegment = LineSegment;
exports.CircularArc = CircularArc;
exports.QuadraticBezierCurve = QuadraticBezierCurve;
exports.drawSineWave = drawSineWave;
exports.setPixel = setPixel;
exports.lerpPixel = lerpPixel;
exports.FontUnit = FontUnit;
exports.FontManager = FontManager;
exports.ScaleFactor = ScaleFactor;
exports.AngleQuantity = AngleQuantity;
exports.KinematicQuantity = KinematicQuantity;
exports.PhysicsBody = PhysicsBody;
exports.calculateLeverageForce = calculateLeverageForce;
exports.FrameCounter = FrameCounter;
exports.LoopedFrameCounter = LoopedFrameCounter;
exports.NonLoopedFrameCounter = NonLoopedFrameCounter;
exports.keyDown = keyDown;
exports.listenKey = listenKey;
exports.mouseOnCanvas = mouseOnCanvas;

Object.defineProperty(exports, '__esModule', { value: true });

})));

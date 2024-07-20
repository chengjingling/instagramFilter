/*
Extra features implemented:
1. Implemented 5 more filters: invert filter, grayscale filter, threshold filter, edge detection filter, sharpen filter
2. Default focus on the boy's face in the early bird filter (as supposed to the whole image being blur)
3. Mouse click only works when the early bird filter is displayed (it will not switch to the early bird filter if I am currently viewing another filter)
*/

var imgIn;
var defaultFocus = true;
var thresholdSlider;

// matrix for radial blur filter
var blurMatrix = [
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64]
];

// matrix X for edge detection filter (detect vertical lines)
var edgeMatrixX = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
];

// matrix Y for edge detection filter (detect horizontal lines)
var edgeMatrixY = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
]

// matrix for sharpen filter
var sharpenMatrix = [
    [-1, -1, -1],
    [-1, 9, -1],
    [-1, -1, -1]
]

function preload() {
    imgIn = loadImage("assets/husky.jpg");
}

function setup() {
    createCanvas(imgIn.width * 2, imgIn.height * 1.5);
    
    // create slider for threshold filter
    thresholdSlider = createSlider(0, 255, 125);
    thresholdSlider.position(imgIn.width * 2 - 150, 20);
    
    // update threshold filter when slider value is changed
    thresholdSlider.input(updateThresholdFilter);
    
    // hide slider by default
    thresholdSlider.hide();
}

function draw() {
    // display original image on the left
    image(imgIn, 0, 0);
    
    // display early bird filter when sketch is loaded
    image(earlyBirdFilter(imgIn), imgIn.width, 0);
    
    // written instructions
    textSize(25);
    text("Filters available:", 20, 750);
    text("Press '1' for the early bird filter (click anywhere on the colour image to see the radial blur effect)", 20, 785);
    text("Press '2' for the invert filter", 20, 820);
    text("Press '3' for the grayscale filter", 20, 855);
    text("Press '4' for the threshold filter (use slider to adjust threshold)", 20, 890);
    text("Press '5' for the edge detection filter", 20, 925);
    text("Press '6' for the sharpen filter", 20, 960);
    
    noLoop();
}

// update radial blur effect on early bird filter when mouse is clicked
function mousePressed() {
    // mouse click only applicable when early bird filter is displayed
    if (key == "" || key == "1") {
        defaultFocus = false;
        loop();
    }
}

// switch between filters based on key pressed
function keyTyped() {
    if (key == "" || key == "1") {
        // default focus on the boy's face when switched to early bird filter
        defaultFocus = true;
        
        image(earlyBirdFilter(imgIn), imgIn.width, 0);
    }
    
    if (key == "2") {
        image(invertFilter(imgIn), imgIn.width, 0);
    }
    
    if (key == "3") {
        image(grayscaleFilter(imgIn), imgIn.width, 0);
    }
    
    if (key == "4") {
        image(thresholdFilter(imgIn), imgIn.width, 0);
    }
    
    if (key == "5") {
        image(edgeDetectionFilter(imgIn), imgIn.width, 0);
    }
    
    if (key == "6") {
        image(sharpenFilter(imgIn), imgIn.width, 0);
    }
}

// early bird filter
function earlyBirdFilter(img) {
    thresholdSlider.hide();
    var resultImg = createImage(imgIn.width, imgIn.height);
    resultImg = sepiaFilter(imgIn);
    resultImg = darkCorners(resultImg);
    resultImg = radialBlurFilter(resultImg);
    resultImg = borderFilter(resultImg)
    return resultImg;
}

// sepia filter
function sepiaFilter(img) {
    var imgOut = createImage(img.width, img.height);
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            
            var oldRed = img.pixels[index + 0];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];
            
            var newRed = (oldRed * .393) + (oldGreen *.769) + (oldBlue * .189);
            var newGreen = (oldRed * .349) + (oldGreen *.686) + (oldBlue * .168);
            var newBlue = (oldRed * .272) + (oldGreen *.534) + (oldBlue * .131);
            
            imgOut.pixels[index + 0] = newRed;
            imgOut.pixels[index + 1] = newGreen;
            imgOut.pixels[index + 2] = newBlue;
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// dark corners filter
function darkCorners(img) {
    var imgOut = createImage(img.width, img.height);
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var distance = dist(x, y, img.width / 2, img.height / 2);
            var dynLum;
            
            if (distance <= 300) {
                dynLum = 1;
            }
            
            else if (distance >= 300 && distance <= 450) {
                dynLum = map(constrain(distance, 300, 450), 300, 450, 1, 0.4);
            }
            
            else {
                var maxDist = Math.sqrt(Math.pow(img.width / 2, 2) + Math.pow(img.height / 2, 2));
                dynLum = map(constrain(distance, 450, maxDist), 450, maxDist, 0.4, 0);
            }
            
            var index = (img.width * y + x) * 4;
            
            var oldRed = img.pixels[index + 0];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];
            
            imgOut.pixels[index + 0] = oldRed * dynLum;
            imgOut.pixels[index + 1] = oldGreen * dynLum;
            imgOut.pixels[index + 2] = oldBlue * dynLum;
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// radial blur filter
function radialBlurFilter(img) {
    var imgOut = createImage(img.width, img.height);
    var matrixSize = blurMatrix.length;
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            var c = convolution(x, y, blurMatrix, matrixSize, img);
            var distance;
            
            if (defaultFocus == true) {
                distance = dist(x, y, 420, 220);
            }
            
            else {
                distance = dist(x, y, mouseX, mouseY);
            }
            
            var dynBlur = constrain(map(distance, 100, 300, 0, 1), 0, 1);
            
            var oldRed = img.pixels[index + 0];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];
            
            imgOut.pixels[index + 0] = c[0] * dynBlur + oldRed * (1 - dynBlur);
            imgOut.pixels[index + 1] = c[1] * dynBlur + oldGreen * (1 - dynBlur);
            imgOut.pixels[index + 2] = c[2] * dynBlur + oldBlue * (1 - dynBlur);
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// border filter
function borderFilter(img) {
    var buffer = createGraphics(img.width, img.height);
    buffer.image(img, 0, 0);
    buffer.noFill();
    buffer.stroke(255);
    buffer.strokeWeight(20);
    buffer.rect(10, 10, img.width - 20, img.height - 20, 50);
    buffer.rect(10, 10, img.width - 20, img.height - 20);
    
    return buffer;
}

// invert filter
function invertFilter(img) {
    thresholdSlider.hide();
    
    var imgOut = createImage(img.width, img.height);
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            
            var newRed = 255 - img.pixels[index + 0];
            var newGreen = 255 - img.pixels[index + 1];
            var newBlue = 255 - img.pixels[index + 2];
            
            imgOut.pixels[index + 0] = newRed;
            imgOut.pixels[index + 1] = newGreen;
            imgOut.pixels[index + 2] = newBlue;
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// grayscale filter
function grayscaleFilter(img) {
    thresholdSlider.hide();
    
    var imgOut = createImage(img.width, img.height);
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            
            var oldRed = img.pixels[index + 0];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];
            
            var gray = oldRed * 0.299 + oldGreen * 0.587 + oldBlue * 0.114;
            
            imgOut.pixels[index + 0] = gray;
            imgOut.pixels[index + 1] = gray;
            imgOut.pixels[index + 2] = gray;
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// threshold filter
function thresholdFilter(img) {
    thresholdSlider.show();
    
    var imgOut = createImage(img.width, img.height);
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            
            var oldRed = img.pixels[index + 0];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];
            
            var gray = (oldRed + oldGreen + oldBlue) / 3;
            
            if (gray > thresholdSlider.value()) {
                gray = 255;
            }
            
            else {
                gray = 0;
            }
            
            imgOut.pixels[index + 0] = gray;
            imgOut.pixels[index + 1] = gray;
            imgOut.pixels[index + 2] = gray;
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// function to update threshold filter when slider value is changed
function updateThresholdFilter() {
    image(thresholdFilter(imgIn), imgIn.width, 0);
}

// edge detection filter
function edgeDetectionFilter(img) {
    thresholdSlider.hide();
    
    var imgOut = createImage(img.width, img.height);
    var matrixSize = edgeMatrixX.length;
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            
            var cX = convolution(x, y, edgeMatrixX, matrixSize, img);
            cX = map(abs(cX[0]), 0, 1020, 0, 255); // (1 + 2 + 1) * 255 = 1020
            
            var cY = convolution(x, y, edgeMatrixY, matrixSize, img);
            cY = map(abs(cY[0]), 0, 1020, 0, 255); // (1 + 2 + 1) * 255 = 1020
            
            var combo = cX + cY;
            
            imgOut.pixels[index + 0] = combo;
            imgOut.pixels[index + 1] = combo;
            imgOut.pixels[index + 2] = combo;
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// sharpen filter
function sharpenFilter(img) {
    thresholdSlider.hide();
    
    var imgOut = createImage(img.width, img.height);
    var matrixSize = sharpenMatrix.length;
    
    img.loadPixels();
    imgOut.loadPixels();
    
    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (img.width * y + x) * 4;
            var c = convolution(x, y, sharpenMatrix, matrixSize, img);
            
            imgOut.pixels[index + 0] = c[0];
            imgOut.pixels[index + 1] = c[1];
            imgOut.pixels[index + 2] = c[2];
            imgOut.pixels[index + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    
    return imgOut;
}

// convolution function used for radial blur filter, edge detection filter and sharpen filter
function convolution(x, y, matrix, matrixSize, img) {
    var totalRed = 0;
    var totalGreen = 0;
    var totalBlue = 0;
    
    var offset = floor(matrixSize / 2);
    
    for (var i = 0; i < matrixSize; i++) {
        for (var j = 0; j < matrixSize; j++) {
            var xLoc = x + i - offset;
            var yLoc = y + j - offset;
            
            var index = (img.width * yLoc + xLoc) * 4;
            
            var oldRed = img.pixels[index + 0];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];
            
            totalRed += oldRed * matrix[i][j];
            totalGreen += oldGreen * matrix[i][j];
            totalBlue += oldBlue * matrix[i][j];
        }
    }
    
    return [totalRed, totalGreen, totalBlue];
}
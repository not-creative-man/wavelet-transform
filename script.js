function createCanvas(canvas, width, height) {canvas.width = width; canvas.height = height;}

function chooseImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

document.getElementById("button").onchange = function() { chooseImage(this); }


let canvas_original = document.getElementById("orig"),
    ctx = canvas_original.getContext("2d");
let canvas_1 = document.getElementById("first"),
    ctx_1 = canvas_1.getContext("2d");
let image_1 = document.getElementById("f_im"),
    ctx_im_1 = image_1.getContext("2d");
let canvas_2 = document.getElementById("second"),
    ctx_2 = canvas_2.getContext("2d");
let image_2 = document.getElementById("s_im"),
    ctx_im_2 = image_2.getContext("2d");
let canvas_3 = document.getElementById("third"),
    ctx_3 = canvas_3.getContext("2d");
let image_3 = document.getElementById("t_im"),
    ctx_im_3 = image_3.getContext("2d");
let image = new Image();
image.src = "Lenna.png";
let imageData;
image.onload = function() {
    createCanvas(canvas_original, image.width, image.height);
    createCanvas(canvas_1, image.width, image.height);
    createCanvas(image_1, image.width, image.height);
    createCanvas(canvas_2, image.width, image.height);
    createCanvas(image_2, image_1.width, image_1.height);
    createCanvas(canvas_3, image.width, image.height);
    createCanvas(image_3, image_2.width, image_2.height);
    ctx.drawImage(image, 0, 0);
    image.style.display = "none";
    imageData = ctx.getImageData(0, 0, canvas_original.width, canvas_original.height);
    ctx_1.putImageData(haarTransform(imageData, 0), 0, 0);
    ctx_im_1.putImageData(haarTransformBack(ctx_1.getImageData(0, 0, canvas_1.width, canvas_1.height)), 0, 0);
    ctx_2.putImageData(haarTransform(imageData, 50), 0, 0);
    ctx_im_2.putImageData(haarTransformBack(ctx_2.getImageData(0, 0, canvas_1.width, canvas_1.height)), 0, 0);
    ctx_3.putImageData(haarTransform(imageData, 100), 0, 0);
    ctx_im_3.putImageData(haarTransformBack(ctx_3.getImageData(0, 0, canvas_1.width, canvas_1.height)), 0, 0);
}

function haarTransform(imageData, limit = 0) {
    let imageDataNew = new ImageData(canvas_1.width, canvas_1.height);
    let num_gs = 0;
    let num_color = 0;
    let str = 0;
    let red = 0, blue = 0, green = 0;
    let array = [];
    for (let i = 0; i < imageDataNew.data.length; i += 4) {
        if (str < canvas_1.width / 2) {
            red = (imageData.data[num_gs] - imageData.data[num_gs + 4]) / 2;
            blue = (imageData.data[num_gs + 1] - imageData.data[num_gs + 5]) / 2;
            green = (imageData.data[num_gs + 2] - imageData.data[num_gs + 6]) / 2;
            if (Math.abs(red) > limit && Math.abs(blue) > limit && Math.abs(green) > limit) {
                array[i] = red;
                array[i + 1] = blue;
                array[i + 2] = green;
                array[i + 3] = 255;
            } else {
                array[i] = 0;
                array[i + 1] = 0;
                array[i + 2] = 0;
                array[i + 3] = 255;
            }
            str++;
            num_gs += 8;
        } else {
            array[i] = (imageData.data[num_color] + imageData.data[num_color + 4]) / 2;
            array[i + 1] = (imageData.data[num_color + 1] + imageData.data[num_color + 5]) / 2;
            array[i + 2] = (imageData.data[num_color + 2] + imageData.data[num_color + 6]) / 2;
            array[i + 3] = 255;
            str++;
            num_color += 8;
            if (str == canvas_1.width) {
                str = 0;
            }
        }
    }

    for (let i = 0; i < imageData.data.length; i++) { imageDataNew.data[i] = array[i]; }
    return imageDataNew;
}

function haarTransformBack(imageData) {
    let imageDataNew = new ImageData(canvas_1.width, canvas_1.height);
    let num_color = 0, num_gs = 0;
    let str = 0;
    let arrayGS = [];
    let arrayCol = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (str < canvas_1.width / 2) {
            arrayGS[num_gs] = {
                red: imageData.data[i],
                green: imageData.data[i + 1],
                blue: imageData.data[i + 2],
                alpha: imageData.data[i + 3]
            }
            str++;
            num_gs++;
        } else {
            arrayCol[num_color] = {
                red: imageData.data[i],
                green: imageData.data[i + 1],
                blue: imageData.data[i + 2],
                alpha: imageData.data[i + 3]
            }
            str++;
            num_color++;
            if (str == canvas_1.width) str = 0;
        }
    }

    num_color = 0;
    num_gs = 0;
    for (let i = 0; i < imageData.data.length; i += 8) {
        imageDataNew.data[i] = arrayCol[num_color].red + arrayGS[num_color].red;
        imageDataNew.data[i + 1] = arrayCol[num_color].green + arrayGS[num_color].green;
        imageDataNew.data[i + 2] = arrayCol[num_color].blue + arrayGS[num_color].blue;
        imageDataNew.data[i + 3] = 255;
        imageDataNew.data[i + 4] = arrayCol[num_color].red - arrayGS[num_color].red;
        imageDataNew.data[i + 5] = arrayCol[num_color].green - arrayGS[num_color].green;
        imageDataNew.data[i + 6] = arrayCol[num_color].blue - arrayGS[num_color].blue;
        imageDataNew.data[i + 7] = 255;
        num_color++;
    }
    return imageDataNew;
}
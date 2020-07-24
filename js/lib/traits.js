const {width, height} = require('./_variable');
// require('./glfx.js'); not work
const grafi= require('./grafi.js');

exports.recognize = function () {
    // # remove noise val
    var fxCanvas = fx.canvas();
    let texture = fxCanvas.texture(snapshotCanvas);
    fxCanvas.draw(texture)
    // .hueSaturation(-1, -1)//grayscale
    //.unsharpMask(20, 2)
    //.brightnessContrast(0.4, 0.9)
    .noise(0)
    .update();

    if (document.querySelector('[name=unsharp]').checked) {
        fxCanvas.draw(texture)
        .unsharpMask(20, 2)
        .update();
    }

    if (document.querySelector('[name=bright]').checked) {
        fxCanvas.draw(texture)
        .brightnessContrast(0.4, 0.9)
        .update();          
    }

    let step1 = document.getElementById('step1');
    let step1Ctx = step1.getContext('2d');
    step1Ctx.clearRect(0, 0, width, height);
    step1Ctx.beginPath();
    step1Ctx.drawImage(fxCanvas, 0, 0);

    // #  grayscale
    let step2 = document.getElementById('step2');
    let step2Ctx = step2.getContext('2d');
    step2Ctx.clearRect(0, 0, width, height);
    step2Ctx.beginPath();
    
    let imageData = step1Ctx.getImageData(0, 0, width, height);
    step2Ctx.putImageData(grafi.grayscale(imageData), 0, 0);

    // # blue component
    let step3 = document.getElementById('step3');
    let step3Ctx = step3.getContext('2d');
    step3Ctx.clearRect(0, 0, width, height);
    step3Ctx.beginPath();

    if (document.getElementById('blueComp').checked == true) {
        
        imageData = step2Ctx.getImageData(0,0, width, height);
        let data = imageData.data;
        for (var i = 0; i < data.length; i+= 4) {
            data[i] =  0;
            data[i+1] = 0;
            data[i+2] = data[i+2] ^ 255;
        }
        step3Ctx.putImageData(imageData, 0, 0);
    } else {
        step3Ctx.drawImage(step2, 0, 0);
    }

    // # brightness
    let step4 = document.getElementById('step4');
    let step4Ctx = step4.getContext('2d');
    step4Ctx.clearRect(0, 0, width, height);
    step4Ctx.beginPath();
    // step4Ctx.drawImage(step3, 0, 0);

    imageData = step3Ctx.getImageData(0,0, width, height);
    step4Ctx.putImageData(grafi.brightness(imageData, {level: 0}), 0, 0);

    // # threshold
    let step5 = document.getElementById('step5');
    let step5Ctx = step5.getContext('2d');
    step5Ctx.clearRect(0, 0, width, height);
    step5Ctx.beginPath();
    // step5Ctx.globalAlpha = 1.0;

    if (document.getElementById('isThreshold').checked == true) {
        imageData = step4Ctx.getImageData(0, 0, width, height);
        step5Ctx.putImageData(grafi.threshold(imageData, {level: document.querySelector('input[type=range]').value}), 0, 0);
    } else {
        step5Ctx.drawImage(step4, 0, 0);    
    }     

    // create new canvas ready background and draw step before
    let output = document.getElementById('output');
    let outputCtx = output.getContext('2d');
    outputCtx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
    outputCtx.beginPath();
    outputCtx.fillStyle = 'rgb(255, 255, 255)';
    outputCtx.fillRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
    outputCtx.drawImage(step5, 0, 0);

    var optional = {
        lang: 'eng',
    };

    if (document.getElementById('number').checked == true) {
        optional['tessedit_char_whitelist'] = '0123456789';
    }

    Tesseract.recognize(outputCtx, optional).then(function(d){ 

        document.getElementById('result').innerHTML = d.text;

        wait();
        document.querySelector('button[name=take]').click();

        async function wait () {
            await sleep(200)
        }
    });
}

exports.requestFrame = requestFrame;

exports.drawSegments = function (segments, image){ 

    snapshotContext.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
    snapshotContext.beginPath();

    for(var i in segments){ 
        var seg = segments[i];
        // Skip segments that are too small
        if(seg.height >= 5){ 
            image.drawRect(seg.x1, seg.y1-10, seg.width, seg.height+15, 0xFFFF0000); 
            // image.drawRect(seg.x1+1, seg.y1-4, seg.width-2, seg.height+8, 0xFFFF0000); 

            // c4Context.drawImage(videoCanvas, seg.x1, seg.y1-10, seg.width, seg.height+15, seg.x1, seg.y1-5, seg.width, seg.height+10);
        } 
    }

    let segment = segments.filter(seg => seg.height >= 5);
    boundingBox.style.display = 'none';
    if (segment.length) {
        boundingBox.style.display = 'block';
        boundingBox.style.left = segment[0].x1 + 'px';
        boundingBox.style.top = (segment[0].y1 - 10) + 'px';
        boundingBox.style.width = segment[0].width + 'px';
        let sumHeight = (segment[segment.length -1].height + segment[segment.length -1].y1 - segment[0].y1);
        boundingBox.style.height = (sumHeight + 15) + 'px';

        snapshotContext.drawImage(videoCanvas, 
            segment[0].x1, 
            segment[0].y1 - 10, 
            segment[0].width, 
            sumHeight+15, 
            0, 
            0, 
            segment[0].width * 3, 
            (sumHeight+15) * 3);
    }

} 

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function requestFrame () {
    window.requestAnimationFrame(function() {
    	videoContext.clearRect(0, 0, width, height);
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            try {

                videoContext.drawImage(video, 0, 0, width, height);
            	// Caman(videoCanvas, function () {
				// 	this.reloadCanvasData();
				// 	// # remove noise
				// 	this.noise(0);
				// 	this.render();
				// });
            } catch (err) {}
        }
        requestFrame();
    });
}
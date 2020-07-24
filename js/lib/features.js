const config = require('./_variable');
//const Tesseract = require('./tesseract.min');
require('../../bower_components/tracking/build/tracking');
// require('http://evanw.github.io/glfx.js/glfx.js');
// const grafi = require('https://raw.githubusercontent.com/grafijs/grafi/master/grafi.js');
// require('./marvinj-1.0.min');
const traits = require('./traits');

exports.slider = function () {
    // var slider = document.querySelector('input[type=range]');
    // var output = document.getElementById("value");
    output.innerHTML = slider_.value;

    slider_.oninput = function() {
      output.innerHTML = this.value;
    }    
}

exports.boundBox = function () {
    videoCanvas.addEventListener('mousedown', function(event) {
        initialPoint = [event.pageX, event.pageY];
        capturing = true;
    });

    videoCanvas.addEventListener('mousemove', function(event) {
        if (capturing) {
            let left = Math.min(initialPoint[0], event.pageX);
            let top = Math.min(initialPoint[1], event.pageY);
            let width = Math.max(initialPoint[0], event.pageX) - left;
            let height = Math.max(initialPoint[1], event.pageY) - top;

            boundingBox.style.display = 'block';
            boundingBox.style.left = left + 'px';
            boundingBox.style.top = top + 'px';
            boundingBox.style.width = width + 'px';
            boundingBox.style.height = height + 'px';

            boundingBox.setAttribute('dx', left);
            boundingBox.setAttribute('dy', top);
            boundingBox.setAttribute('dWidth', width);
            boundingBox.setAttribute('dHeight', height);
        }
    });

    document.addEventListener('mouseup', () => capturing = false);    
}

exports.webcamera = function (callback) {
    var mediaConfig =  { video: true };
    var errBack = function(e) {
        console.log('An error has occurred!', e)
    };
    window.addEventListener("DOMContentLoaded", function(){
        // Put video listeners into place
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(mediaConfig).then(function(stream) {
                //video.src = window.URL.createObjectURL(stream);
                video.srcObject = stream;
                video.play();
            });
        }
    
        /* Legacy code below! */
        else if(navigator.getUserMedia) { // Standard
            navigator.getUserMedia(mediaConfig, function(stream) {
                video.src = stream;
                video.play();
            }, errBack);
        } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
            navigator.webkitGetUserMedia(mediaConfig, function(stream){
                video.src = window.webkitURL.createObjectURL(stream);
                video.play();
            }, errBack);
        } else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
            navigator.mozGetUserMedia(mediaConfig, function(stream){
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        }
    
        traits.requestFrame();
        
    
    }, false);   
}

exports.track = function () {
    tracking.ColorTracker.registerColor('black', function(r, g, b) {
        if (r < 60 && g < 60 && b < 60) { //r < 60 && g < 60 && b < 60
            return true
        }
        return false;
    });
    
    tracker = new tracking.ColorTracker(config.color);
    trackerTask = tracking.track(video, tracker, { camera: true });
    trackerTask.on('track', onTrack);
}

exports.action = function () {
    document.querySelector('input[name=reset]').addEventListener('click', event => {
        setColor(color);
        bool = false;
    });

    document.querySelector('select').addEventListener('change', event => {
        boundingBox.style.display = 'none';
        if (event.target.value == 0 || event.target.value == 3) {
            if (!trackerTask.running_) {
                let c = colorDetect ? colorDetect : color;
                tracker = new tracking.ColorTracker(c);
                trackerTask = tracking.track(video, tracker, { camera: true });
                tracker.on('track', onTrack);     
            }

        } else {
            trackerTask.stop();
        }
        
    });

    document.querySelector('button[name=take]').addEventListener('click', event => {
        if (!trackerTask.running_) {
            snapshotContext.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
            snapshotContext.beginPath();
            if (document.querySelector('select').value == 2 && initialPoint) {
                let dx = boundingBox.getAttribute('dx');
                let dy = boundingBox.getAttribute('dy');
                let dWidth = boundingBox.getAttribute('dWidth');
                let dHeight = boundingBox.getAttribute('dHeight');

                snapshotContext.drawImage(
                    videoCanvas, 
                    dx , 
                    dy , 
                    dWidth, dHeight, 
                    0 , 
                    0, 
                    dWidth * 3, 
                    dHeight * 3);

            } else {
                snapshotContext.drawImage(videoCanvas, 0, 0);
            }
        }

        traits.recognize();
    });
}

function onTrack (event) {
    if (document.querySelector('select').value == '3') {
        var imageRoad = new MarvinImage();
        let output = document.getElementById('findTextRegions');

        imageRoad.load(videoCanvas.toDataURL("image/png"), function () {

            var segments = Marvin.findTextRegions(imageRoad, 15, 8, 30, 150); 
            traits.drawSegments(segments, imageRoad); 
            imageRoad.draw(output);

        });

    } 
    else {
        boundingBox.style.display = 'none';
        snapshotContext.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
        snapshotContext.beginPath();
        // snapshotContext.fillRect(0, 0, snapshotCanvas.width, snapshotCanvas.height)

        if (event.data.length <= 0) return;

        let data = event.data.sort((a, b) => a.y < b.y ? -1 : 1); //order by y asc
        let minY = data.slice(0, 2);
        let min = minY.sort((a, b) => a.x < b.x ? -1 : 1); //order by x asc

        min.forEach(function(rect, indx) {
            if (indx == 0 ) {
                boundingBox.style.display = 'block';
                boundingBox.style.left = rect.x + 'px';
                boundingBox.style.top = rect.y + 'px';  
                boundingBox.style.height = rect.height + 'px';

                if (document.getElementById('twoObject').checked == true) {//two Objecr
                    let width = (minY[minY.length -1].width + minY[minY.length -1].x - rect.x);
                    boundingBox.style.width = width + 'px';
                                            
                    snapshotContext.drawImage(
                        videoCanvas, 
                        rect.x, 
                        rect.y, 
                        width, 
                        rect.height, 
                        0, 
                        0, 
                        width * 3, 
                        rect.height * 3);
                } else {
                    boundingBox.style.width = rect.width + 'px';
                    snapshotContext.drawImage(
                        videoCanvas, 
                        rect.x + (rect.width * 0.1), 
                        rect.y + (rect.height * 0.02), 
                        rect.width - (rect.width * 0.15), 
                        rect.height - (rect.height * 0.25), 
                        0, 
                        0, 
                        rect.width * 2, 
                        rect.height * 2);  
                }
                
                let num = count.hasOwnProperty(rect.color) ? count[rect.color] + 1 : 1;
                count[rect.color] = num;
                let max = Object.values(count).sort((prev, next) => next - prev)[0];
                
                if (max > 100 && bool == false) {
                    let key = Object.keys(count).filter(function(key) {return count[key] === max})[0];
            
                    setTimeout(() => setColor([key]), 1000);
                    bool = true;
                    count = {};
                }
            
                //reset counter
                if ((count.hasOwnProperty(rect.color)) && count[rect.color] > 100) count[rect.color] = 0;                       
            }
        });
    }
}

function setColor (color) {
    trackerTask.stop();
    tracker = new tracking.ColorTracker(config.color);
    trackerTask = tracking.track(video, tracker, { camera: true });
    tracker.on('track', onTrack);
    colorDetect = color;
}
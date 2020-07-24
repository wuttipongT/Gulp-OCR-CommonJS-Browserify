'use strict';

window.slider_ = document.querySelector('input[type=range]');
window.output = document.getElementById("value");
window.video = document.getElementById('video');

window.videoCanvas = document.getElementById('video-canvas');
window.videoContext = videoCanvas.getContext('2d');
window.canvasRect = videoCanvas.getBoundingClientRect();

window.snapshotCanvas = document.getElementById('snapshotCanvas');
window.snapshotContext = snapshotCanvas.getContext('2d');
window.boundingBox = document.getElementById('boundingBox');

window.count = {};
window.bool = false;
window.colorDetect = undefined;
window.capturing = false;
window.initialPoint = [];
window.tracker = undefined;
window.trackerTask = undefined;

var config = {};
config.width = 320;
config.height = 240;
config.color = ['black','magenta', 'cyan', 'yellow'];
//config.path = './lib/';

module.exports = config;
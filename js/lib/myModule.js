var text = require('./text.js');
var features = require('./features.js');

exports.print = function(message) {
    message = text.capitalize(message);
    console.log(message);
};

exports.initialize = function (callback) {

    features.slider();
    features.boundBox();
    features.webcamera();
    features.track();
    features.action();
    
    document.querySelector('button[name=take]').click();

    callback();
}
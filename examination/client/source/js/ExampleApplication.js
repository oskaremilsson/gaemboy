"use strict";
var BasicWindow = require("./BasicWindow");

function ExampleApplication(id, x, y, width, height) {
    BasicWindow.call(this, id, x, y, width, height);
}

ExampleApplication.prototype = Object.create(BasicWindow.prototype);
ExampleApplication.prototype.constructor =  ExampleApplication;

ExampleApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing example");
};

module.exports = ExampleApplication;
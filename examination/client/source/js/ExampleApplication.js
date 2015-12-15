"use strict";
var BasicWindow = require("./BasicWindow");

function ExampleApplication() {
    BasicWindow.call(this);
}

ExampleApplication.prototype = Object.create(BasicWindow.prototype);
ExampleApplication.prototype.constructor =  ExampleApplication;

module.exports = ExampleApplication;
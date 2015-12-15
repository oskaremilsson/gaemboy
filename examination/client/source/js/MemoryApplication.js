"use strict";
var BasicWindow = require("./BasicWindow");
var MemoryGame = require("./memory/Game");

function MemoryApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

MemoryApplication.prototype = Object.create(BasicWindow.prototype);
MemoryApplication.prototype.constructor =  MemoryApplication;

MemoryApplication.prototype.init = function() {
    console.log(this.element);
    var g = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    g.init();
};

MemoryApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing memory");
    document.querySelector("#" + this.id).classList.add("memory-app");
};

module.exports = MemoryApplication;
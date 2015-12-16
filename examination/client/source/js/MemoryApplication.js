"use strict";
var BasicWindow = require("./BasicWindow");
var MemoryGame = require("./memory/Game");

function MemoryApplication(options) {
    BasicWindow.call(this, options);
    /*this.title = title;
    this.icon = icon;*/
}

MemoryApplication.prototype = Object.create(BasicWindow.prototype);
MemoryApplication.prototype.constructor =  MemoryApplication;

MemoryApplication.prototype.init = function() {
    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
    var g = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    g.init();
};

MemoryApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing memory");
    this.element.classList.add("memory-app");

    var menu = this.element.querySelector(".window-menu");
    var template = document.querySelector("#template-window-menu-alternative").content.cloneNode(true);
    template.querySelector(".menu-alternative").appendChild(document.createTextNode("Settings"));
    menu.appendChild(template);
};

MemoryApplication.prototype.menuClicked = function(event) {
    if (event.target.tagName.toLowerCase() === "a") {
        // open settings-window
        console.log("should open settings-window");
    }
};

module.exports = MemoryApplication;
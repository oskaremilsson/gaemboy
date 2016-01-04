"use strict";

var BasicWindow = require("./BasicWindow");

function AboutApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

AboutApplication.prototype = Object.create(BasicWindow.prototype);
AboutApplication.prototype.constructor =  AboutApplication;

/**
 * Print the about app
 */
AboutApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    //document.querySelector("#" + this.id).classList.add("about-app");
    this.element.classList.add("about-app");

    var template = document.querySelector("#template-about-application").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

};

module.exports = AboutApplication;

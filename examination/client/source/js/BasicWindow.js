"use strict";

function BasicWindow(id, x, y) {
    this.id = id || "" + new Date().getTime();
    this.element = undefined;
    this.x = x || 10;
    this.y = y || 10;
}

BasicWindow.prototype.destroy = function() {
    // TODO: implement destroy
    console.log(this.element);
    document.querySelector("#main-frame").removeChild(this.element);
};

BasicWindow.prototype.print = function () {
    // TODO: implement this
    console.log("printing");
    var template  = document.querySelector("#template-window").content.cloneNode(true);
    console.log(template);
    var templateWindow = template.querySelector("div");
    templateWindow.setAttribute("id", this.id);
    templateWindow.style.left = this.x + "px";
    templateWindow.style.top = this.y + "px";

    var element = document.querySelector("#main-frame");
    element.appendChild(template);
    this.element = document.querySelector("#" + this.id);
};

module.exports = BasicWindow;
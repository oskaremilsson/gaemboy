"use strict";

//var ExA = require("./ExampleApplication");
var Launcher = require("./Launcher");

function Desktop() {
    this.activeWindow = false;
    this.mouseMoveFunc = this.mouseMove.bind(this);
    this.mouseUpFunc = this.mouseUp.bind(this);
    this.windows = [];
    this.clickX = 0;
    this.clickY = 0;

    //variables to handle the "focused" window
    this.lastFocusedWindow = undefined;
    this.zIndex = 1;

    this.init();
}

Desktop.prototype.init = function() {
    var l = new Launcher(this);

    document.addEventListener("mousedown", this.mouseDown.bind(this));
};

Desktop.prototype.mouseUp = function() {
    console.log("removing move-listener");

    window.removeEventListener("mousemove", this.mouseMoveFunc);
    window.removeEventListener("mouseup", this.mouseUpFunc);
    this.activeWindow = undefined;
};

Desktop.prototype.mouseDown = function(event) {
    var element = event.target;
    //get the clicked-windows "main-div"
    if (element.parentNode.id) {
        while (element.parentNode.id !== "main-frame") {
            element = element.parentNode;
        }
    }

    if (element.classList.contains("window")) {
        //clicked DOM is a window - do stuff

        //make sure the last active window is on top
        if (this.lastFocusedWindow !== element.id) {
            element.style.zIndex = this.zIndex;
            this.zIndex += 1;
            this.lastFocusedWindow = element.id;
        }

        //find the window in window-array
        for (var i = 0; i < this.windows.length; i += 1) {
            if (this.windows[i].id === element.id) {
                this.activeWindow = this.windows[i];
            }
        }

        //add the listeners to check for movement if click were in the window-top of window
        if (event.target.classList.contains("window-top")) {
            this.clickX = event.clientX - this.activeWindow.x;
            this.clickY = event.clientY - this.activeWindow.y;

            console.log("adding mousemove-listener");
            window.addEventListener("mousemove", this.mouseMoveFunc);
            window.addEventListener("mouseup", this.mouseUpFunc);
        }
    }

};

Desktop.prototype.mouseMove = function(event) {
    console.log("trying to move window");
    this.activeWindow.x = event.clientX - this.clickX;
    this.activeWindow.y = event.clientY - this.clickY;

    document.querySelector("#" + this.activeWindow.id).style.left = this.activeWindow.x + "px";
    document.querySelector("#" + this.activeWindow.id).style.top = this.activeWindow.y + "px";
};

module.exports = Desktop;
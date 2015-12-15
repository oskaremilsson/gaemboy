"use strict";

var ExA = require("./ExampleApplication");

function Desktop() {
    this.activeWindow = false;
    this.mouseMoveFunc = this.mouseMove.bind(this);
    this.mouseUpFunc = this.mouseUp.bind(this);
    this.init();
}

Desktop.prototype.init = function() {
    var ex = new ExA();
    ex.print();

    document.addEventListener("mousedown", this.mouseDown.bind(this));
};

Desktop.prototype.mouseUp = function() {
    console.log("removing move-listener");
    this.activeWindow.removeEventListener("mousemove", this.mouseMoveFunc);
    window.removeEventListener("mouseup", this.mouseUpFunc);
    //this.activeWindow = false;
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
        console.log(element);
        this.activeWindow = element;
        console.log("adding mousemove-listener");
        this.activeWindow.addEventListener("mousemove", this.mouseMoveFunc);
        window.addEventListener("mouseup", this.mouseUpFunc);
    }

};

Desktop.prototype.mouseMove = function(event) {
    console.log("trying to move window");
};

module.exports = Desktop;
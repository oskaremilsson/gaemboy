(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
"use strict";

var ExA = require("./ExampleApplication");

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
    this.windows.push(new ExA("example", 10 * (this.windows.length +1 ), 10 * (this.windows.length +1 )));
    this.windows.push(new ExA("example2", 10 * (this.windows.length +1 ), 10 * (this.windows.length +1 )));
    this.windows.push(new ExA("example3", 10 * (this.windows.length +1 ), 10 * (this.windows.length +1 )));

    this.windows[0].print();
    this.windows[1].print();
    this.windows[2].print();

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
},{"./ExampleApplication":3}],3:[function(require,module,exports){
"use strict";
var BasicWindow = require("./BasicWindow");

function ExampleApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

ExampleApplication.prototype = Object.create(BasicWindow.prototype);
ExampleApplication.prototype.constructor =  ExampleApplication;

ExampleApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing example");
    document.querySelector("#" + this.id).classList.add("memory-app");

    var exitButton = document.querySelector("#" + this.id + " .exit-button ");
    exitButton.addEventListener("click", this.destroy.bind(this));

};

module.exports = ExampleApplication;
},{"./BasicWindow":1}],4:[function(require,module,exports){
"use strict";
var Desktop = require("./Desktop");

var d = new Desktop();
},{"./Desktop":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3coaWQsIHgsIHkpIHtcclxuICAgIHRoaXMuaWQgPSBpZCB8fCBcIlwiICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnggPSB4IHx8IDEwO1xyXG4gICAgdGhpcy55ID0geSB8fCAxMDtcclxufVxyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCBkZXN0cm95XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmVsZW1lbnQpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhpc1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZ1wiKTtcclxuICAgIHZhciB0ZW1wbGF0ZSAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvd1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcclxuICAgIHZhciB0ZW1wbGF0ZVdpbmRvdyA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0aGlzLmlkKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIik7XHJcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNXaW5kb3c7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRXhBID0gcmVxdWlyZShcIi4vRXhhbXBsZUFwcGxpY2F0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gRGVza3RvcCgpIHtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdXNlTW92ZUZ1bmMgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5tb3VzZVVwRnVuYyA9IHRoaXMubW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLmNsaWNrWCA9IDA7XHJcbiAgICB0aGlzLmNsaWNrWSA9IDA7XHJcblxyXG4gICAgLy92YXJpYWJsZXMgdG8gaGFuZGxlIHRoZSBcImZvY3VzZWRcIiB3aW5kb3dcclxuICAgIHRoaXMubGFzdEZvY3VzZWRXaW5kb3cgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnpJbmRleCA9IDE7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMud2luZG93cy5wdXNoKG5ldyBFeEEoXCJleGFtcGxlXCIsIDEwICogKHRoaXMud2luZG93cy5sZW5ndGggKzEgKSwgMTAgKiAodGhpcy53aW5kb3dzLmxlbmd0aCArMSApKSk7XHJcbiAgICB0aGlzLndpbmRvd3MucHVzaChuZXcgRXhBKFwiZXhhbXBsZTJcIiwgMTAgKiAodGhpcy53aW5kb3dzLmxlbmd0aCArMSApLCAxMCAqICh0aGlzLndpbmRvd3MubGVuZ3RoICsxICkpKTtcclxuICAgIHRoaXMud2luZG93cy5wdXNoKG5ldyBFeEEoXCJleGFtcGxlM1wiLCAxMCAqICh0aGlzLndpbmRvd3MubGVuZ3RoICsxICksIDEwICogKHRoaXMud2luZG93cy5sZW5ndGggKzEgKSkpO1xyXG5cclxuICAgIHRoaXMud2luZG93c1swXS5wcmludCgpO1xyXG4gICAgdGhpcy53aW5kb3dzWzFdLnByaW50KCk7XHJcbiAgICB0aGlzLndpbmRvd3NbMl0ucHJpbnQoKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmluZyBtb3ZlLWxpc3RlbmVyXCIpO1xyXG5cclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IHVuZGVmaW5lZDtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlRG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIC8vZ2V0IHRoZSBjbGlja2VkLXdpbmRvd3MgXCJtYWluLWRpdlwiXHJcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgd2hpbGUgKGVsZW1lbnQucGFyZW50Tm9kZS5pZCAhPT0gXCJtYWluLWZyYW1lXCIpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93XCIpKSB7XHJcbiAgICAgICAgLy9jbGlja2VkIERPTSBpcyBhIHdpbmRvdyAtIGRvIHN0dWZmXHJcblxyXG4gICAgICAgIC8vbWFrZSBzdXJlIHRoZSBsYXN0IGFjdGl2ZSB3aW5kb3cgaXMgb24gdG9wXHJcbiAgICAgICAgaWYgKHRoaXMubGFzdEZvY3VzZWRXaW5kb3cgIT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLnpJbmRleDtcclxuICAgICAgICAgICAgdGhpcy56SW5kZXggKz0gMTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0Rm9jdXNlZFdpbmRvdyA9IGVsZW1lbnQuaWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2ZpbmQgdGhlIHdpbmRvdyBpbiB3aW5kb3ctYXJyYXlcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IHRoaXMud2luZG93c1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9hZGQgdGhlIGxpc3RlbmVycyB0byBjaGVjayBmb3IgbW92ZW1lbnQgaWYgY2xpY2sgd2VyZSBpbiB0aGUgd2luZG93LXRvcCBvZiB3aW5kb3dcclxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvdy10b3BcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGlja1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5hY3RpdmVXaW5kb3cueDtcclxuICAgICAgICAgICAgdGhpcy5jbGlja1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5hY3RpdmVXaW5kb3cueTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkaW5nIG1vdXNlbW92ZS1saXN0ZW5lclwiKTtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ0cnlpbmcgdG8gbW92ZSB3aW5kb3dcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5hY3RpdmVXaW5kb3cuaWQpLnN0eWxlLmxlZnQgPSB0aGlzLmFjdGl2ZVdpbmRvdy54ICsgXCJweFwiO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuYWN0aXZlV2luZG93LmlkKS5zdHlsZS50b3AgPSB0aGlzLmFjdGl2ZVdpbmRvdy55ICsgXCJweFwiO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi9CYXNpY1dpbmRvd1wiKTtcclxuXHJcbmZ1bmN0aW9uIEV4YW1wbGVBcHBsaWNhdGlvbihpZCwgeCwgeSkge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCwgeCwgeSk7XHJcbn1cclxuXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgRXhhbXBsZUFwcGxpY2F0aW9uO1xyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nIGV4YW1wbGVcIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCkuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XHJcblxyXG4gICAgdmFyIGV4aXRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCArIFwiIC5leGl0LWJ1dHRvbiBcIik7XHJcbiAgICBleGl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlc3Ryb3kuYmluZCh0aGlzKSk7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEZXNrdG9wID0gcmVxdWlyZShcIi4vRGVza3RvcFwiKTtcclxuXHJcbnZhciBkID0gbmV3IERlc2t0b3AoKTsiXX0=

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function BasicWindow(id, x, y, width, height) {
    this.id = id || "" + new Date().getTime();
    this.x = x || 10;
    this.y = y || 10;
    this.width = width;
    this.height = height;
}

BasicWindow.prototype.destroy = function() {
    // TODO: implement destroy
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
},{"./BasicWindow":1}],4:[function(require,module,exports){
"use strict";
var Desktop = require("./Desktop");

var d = new Desktop();
},{"./Desktop":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3coaWQsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgIHRoaXMuaWQgPSBpZCB8fCBcIlwiICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLnggPSB4IHx8IDEwO1xyXG4gICAgdGhpcy55ID0geSB8fCAxMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG59XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IGRlc3Ryb3lcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGlzXHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nXCIpO1xyXG4gICAgdmFyIHRlbXBsYXRlICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xyXG4gICAgdmFyIHRlbXBsYXRlV2luZG93ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImRpdlwiKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXMuaWQpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKTtcclxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcblxyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2VNb3ZlRnVuYyA9IHRoaXMubW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm1vdXNlVXBGdW5jID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuY2xpY2tYID0gMDtcclxuICAgIHRoaXMuY2xpY2tZID0gMDtcclxuXHJcbiAgICAvL3ZhcmlhYmxlcyB0byBoYW5kbGUgdGhlIFwiZm9jdXNlZFwiIHdpbmRvd1xyXG4gICAgdGhpcy5sYXN0Rm9jdXNlZFdpbmRvdyA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuekluZGV4ID0gMTtcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxufVxyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy53aW5kb3dzLnB1c2gobmV3IEV4QShcImV4YW1wbGVcIiwgMTAgKiAodGhpcy53aW5kb3dzLmxlbmd0aCArMSApLCAxMCAqICh0aGlzLndpbmRvd3MubGVuZ3RoICsxICkpKTtcclxuICAgIHRoaXMud2luZG93cy5wdXNoKG5ldyBFeEEoXCJleGFtcGxlMlwiLCAxMCAqICh0aGlzLndpbmRvd3MubGVuZ3RoICsxICksIDEwICogKHRoaXMud2luZG93cy5sZW5ndGggKzEgKSkpO1xyXG4gICAgdGhpcy53aW5kb3dzLnB1c2gobmV3IEV4QShcImV4YW1wbGUzXCIsIDEwICogKHRoaXMud2luZG93cy5sZW5ndGggKzEgKSwgMTAgKiAodGhpcy53aW5kb3dzLmxlbmd0aCArMSApKSk7XHJcblxyXG4gICAgdGhpcy53aW5kb3dzWzBdLnByaW50KCk7XHJcbiAgICB0aGlzLndpbmRvd3NbMV0ucHJpbnQoKTtcclxuICAgIHRoaXMud2luZG93c1syXS5wcmludCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlbW92aW5nIG1vdmUtbGlzdGVuZXJcIik7XHJcblxyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgLy9nZXQgdGhlIGNsaWNrZWQtd2luZG93cyBcIm1haW4tZGl2XCJcclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUuaWQpIHtcclxuICAgICAgICB3aGlsZSAoZWxlbWVudC5wYXJlbnROb2RlLmlkICE9PSBcIm1haW4tZnJhbWVcIikge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3dcIikpIHtcclxuICAgICAgICAvL2NsaWNrZWQgRE9NIGlzIGEgd2luZG93IC0gZG8gc3R1ZmZcclxuXHJcbiAgICAgICAgLy9tYWtlIHN1cmUgdGhlIGxhc3QgYWN0aXZlIHdpbmRvdyBpcyBvbiB0b3BcclxuICAgICAgICBpZiAodGhpcy5sYXN0Rm9jdXNlZFdpbmRvdyAhPT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCArPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RGb2N1c2VkV2luZG93ID0gZWxlbWVudC5pZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vZmluZCB0aGUgd2luZG93IGluIHdpbmRvdy1hcnJheVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdGhpcy53aW5kb3dzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FkZCB0aGUgbGlzdGVuZXJzIHRvIGNoZWNrIGZvciBtb3ZlbWVudCBpZiBjbGljayB3ZXJlIGluIHRoZSB3aW5kb3ctdG9wIG9mIHdpbmRvd1xyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LXRvcFwiKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmFjdGl2ZVdpbmRvdy54O1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrWSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmFjdGl2ZVdpbmRvdy55O1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhZGRpbmcgbW91c2Vtb3ZlLWxpc3RlbmVyXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInRyeWluZyB0byBtb3ZlIHdpbmRvd1wiKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LnggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy55ID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuY2xpY2tZO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmFjdGl2ZVdpbmRvdy5pZCkuc3R5bGUubGVmdCA9IHRoaXMuYWN0aXZlV2luZG93LnggKyBcInB4XCI7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5hY3RpdmVXaW5kb3cuaWQpLnN0eWxlLnRvcCA9IHRoaXMuYWN0aXZlV2luZG93LnkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgZXhhbXBsZVwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhhbXBsZUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7Il19

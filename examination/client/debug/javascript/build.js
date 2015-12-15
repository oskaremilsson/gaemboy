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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBCYXNpY1dpbmRvdyhpZCwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgdGhpcy5pZCA9IGlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMueCA9IHggfHwgMTA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDEwO1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbn1cclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgZGVzdHJveVxyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IHRoaXNcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmdcIik7XHJcbiAgICB2YXIgdGVtcGxhdGUgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3dcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XHJcbiAgICB2YXIgdGVtcGxhdGVXaW5kb3cgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiZGl2XCIpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwiaWRcIiwgdGhpcy5pZCk7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljV2luZG93OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxuXHJcbmZ1bmN0aW9uIERlc2t0b3AoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb3VzZU1vdmVGdW5jID0gdGhpcy5tb3VzZU1vdmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMubW91c2VVcEZ1bmMgPSB0aGlzLm1vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZXggPSBuZXcgRXhBKCk7XHJcbiAgICBleC5wcmludCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlbW92aW5nIG1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICAvL3RoaXMuYWN0aXZlV2luZG93ID0gZmFsc2U7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAvL2dldCB0aGUgY2xpY2tlZC13aW5kb3dzIFwibWFpbi1kaXZcIlxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgIHdoaWxlIChlbGVtZW50LnBhcmVudE5vZGUuaWQgIT09IFwibWFpbi1mcmFtZVwiKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvd1wiKSkge1xyXG4gICAgICAgIC8vY2xpY2tlZCBET00gaXMgYSB3aW5kb3cgLSBkbyBzdHVmZlxyXG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gZWxlbWVudDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImFkZGluZyBtb3VzZW1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ0cnlpbmcgdG8gbW92ZSB3aW5kb3dcIik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgZXhhbXBsZVwiKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhhbXBsZUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7Il19

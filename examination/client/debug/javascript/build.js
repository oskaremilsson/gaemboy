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
    this.init();
}

Desktop.prototype.init = function() {
    var ex = new ExA();
    ex.print();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3coaWQsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgIHRoaXMuaWQgPSBpZCB8fCBcIlwiICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLnggPSB4IHx8IDEwO1xyXG4gICAgdGhpcy55ID0geSB8fCAxMDtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG59XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IGRlc3Ryb3lcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGlzXHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nXCIpO1xyXG4gICAgdmFyIHRlbXBsYXRlICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xyXG4gICAgdmFyIHRlbXBsYXRlV2luZG93ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImRpdlwiKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXMuaWQpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKTtcclxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcblxyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBleCA9IG5ldyBFeEEoKTtcclxuICAgIGV4LnByaW50KCk7XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi9CYXNpY1dpbmRvd1wiKTtcclxuXHJcbmZ1bmN0aW9uIEV4YW1wbGVBcHBsaWNhdGlvbihpZCwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbn1cclxuXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgRXhhbXBsZUFwcGxpY2F0aW9uO1xyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nIGV4YW1wbGVcIik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEV4YW1wbGVBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERlc2t0b3AgPSByZXF1aXJlKFwiLi9EZXNrdG9wXCIpO1xyXG5cclxudmFyIGQgPSBuZXcgRGVza3RvcCgpOyJdfQ==

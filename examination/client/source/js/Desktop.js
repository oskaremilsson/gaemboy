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
"use strict";
var BasicWindow = require("../BasicWindow");
var TetrisGame = require("./TetrisGame");

function TetrisApplication(options) {
    BasicWindow.call(this, options);

    this.game = undefined;
}

TetrisApplication.prototype = Object.create(BasicWindow.prototype);
TetrisApplication.prototype.constructor =  TetrisApplication;

TetrisApplication.prototype.init = function() {
    this.print();

    this.game = new TetrisGame(this.element);
    this.game.init();
};

TetrisApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing Tetris");
    this.element.classList.add("tetris-app");
    this.element.querySelector("i").classList.add("tetris-icon");

};

TetrisApplication.prototype.keyInput = function(key) {
    console.log(key);
};

module.exports = TetrisApplication;
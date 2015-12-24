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
    if (this.game.alive) {
        if (key === 37) {
            //left
            this.game.moveFallingBlock(-1);
        }
        else if (key === 39) {
            //right
            this.game.moveFallingBlock(1);
        }
        else if (key === 38) {
            //up
            this.game.rotateFallingBlock(1);
        }
        else if (key === 40) {
            //down
            this.game.fallBlock();
        }
        else if (key === 32) {
            this.game.fallBlockToBottom();
        }
    }
    else {
        if (key === 13) {
            this.game.start();
        }
    }
};

TetrisApplication.prototype.destroy = function() {
    if (this.game.fallingBlockInterval) {
        window.clearInterval(this.game.fallingBlockInterval);
    }
    document.querySelector("#main-frame").removeChild(this.element);
};

module.exports = TetrisApplication;
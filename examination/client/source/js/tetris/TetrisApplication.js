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

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
};

TetrisApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing Tetris");
    this.element.classList.add("tetris-app");
    this.element.querySelector("i").classList.add("tetris-icon");

    //add the menu
    var menu = this.element.querySelector(".window-menu");
    var alt = document.querySelector("#template-window-menu-alternative").content;
    var alt1 = alt.cloneNode(true);
    alt1.querySelector(".menu-alternative").appendChild(document.createTextNode("New Game"));

    menu.appendChild(alt1);
};

TetrisApplication.prototype.menuClicked = function(event) {
    var target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "new game": {
                if (this.game) {
                    this.game.start();
                }

                break;
            }
        }
    }
};

TetrisApplication.prototype.keyInput = function(key) {
    if (this.game.alive) {
        if (!this.game.paused) {
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
            else if (key === 13) {
                //enter: play/pause
                this.game.pauseGame();
            }
        }
        else {
            if (key === 13) {
                this.game.resumeGame();
            }
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
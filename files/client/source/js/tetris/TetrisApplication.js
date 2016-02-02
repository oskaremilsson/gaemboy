"use strict";

var TetrisGame = require("./TetrisGame");

/**
 * Constructor function for the tetris-app
 * @constructor
 */
function TetrisApplication() {
    this.game = undefined;
}

/**
 * Init the basics
 */
TetrisApplication.prototype.init = function() {
    //this.print();
    //create new game
    var elem = document.querySelector(".front-screen");
    this.game = new TetrisGame(elem);
    this.game.init();

    //add eventlistener
    document.addEventListener("keydown", this.keyInput.bind(this));
    document.addEventListener("mousedown", this.click.bind(this));
};

/**
 * Function to handle clicks
 */
TetrisApplication.prototype.click = function(event) {
    console.log(event.target.classList[0]);
    var key = event.target.classList[0];

    //If game is "alive" and not paused, call the correct functions in game
    if (this.game.alive && !this.game.paused) {
        this.inputToGameHandler(key);
    }
    else {
        if (key === "start") {
            if (this.game.paused) {
                this.game.resumeGame();
            }
            else {
                this.game.start();
            }
        }
    }
};

/**
 * Function to handle the key-inputs
 */
TetrisApplication.prototype.keyInput = function(event) {
    var key = event.keyCode;

    //If game is "alive" and not paused, call the correct functions in game
    if (this.game.alive && !this.game.paused) {
        this.inputToGameHandler(key);
    }
    else {
        if (key === 13) {
            if (this.game.paused) {
                this.game.resumeGame();
            }
            else {
                this.game.start();
            }
        }
    }
};

TetrisApplication.prototype.inputToGameHandler = function(key) {
    switch (key) {
        case 37:
        case "arrow-left": {
            //left
            this.game.moveFallingBlock(-1);
            break;
        }

        case 39:
        case "arrow-right": {
            //right
            this.game.moveFallingBlock(1);
            break;
        }

        case 38:
        case "arrow-up":
        case "a-button-label": {
            //up
            this.game.rotateFallingBlock(1);
            break;
        }

        case 40:
        case "arrow-down": {
            //down
            this.game.fallBlock();
            break;
        }

        case 32:
        case "b-button-label": {
            //space
            this.game.fallBlockToBottom();
            break;
        }

        case 13:
        case "start": {
            //enter
            this.game.pauseGame();
            break;
        }
        /* for dev-showcase
        case 68: {
            //d
            this.game.demoGame();
            break;
        }*/
    }
};

/**
 * Function to destroy the app
 */
TetrisApplication.prototype.destroy = function() {
    if (this.game.fallingBlockInterval) {
        window.clearInterval(this.game.fallingBlockInterval);
    }

    if (this.game.bgMusic) {
        //stop background music
        this.game.bgMusic.pause();
    }
};

module.exports = TetrisApplication;

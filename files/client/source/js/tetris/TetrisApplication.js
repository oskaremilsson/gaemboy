"use strict";

var TetrisGame = require("./TetrisGame");

/**
 * Constructor function for the tetris-app
 * @constructor
 */
function TetrisApplication() {
    this.game = undefined;
    this.leftTouch = false;
    this.rightTouch = false;
    this.moveSpeed = 80;
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
    document.addEventListener("click", this.click.bind(this));
    document.addEventListener("touchstart", this.click.bind(this));
    document.addEventListener("touchend", this.resetTouch.bind(this));
};

TetrisApplication.prototype.resetTouch = function() {
    if (this.leftTouch) {
        clearInterval(this.leftTouch);
    }

    if (this.rightTouch) {
        clearInterval(this.rightTouch);
    }
};

/**
 * Function to handle clicks
 */
TetrisApplication.prototype.click = function(event) {
    event.preventDefault();
    console.log(event.target.classList[0]);
    var key = event.target.classList[0];
    /*
    var currX = 0;
    var currY = 0;
    var cachedX = 0;
    var cachedY = 0;

    var pointer = getPointerEvent(event);

    // caching the current x
    cachedX = currX = pointer.pageX;

    // caching the current y
    cachedY = currY = pointer.pageY;

    // a touch event is detected
    var touchStarted = true;

    // detecting if after 200ms the finger is still in the same position
    setTimeout(function() {
        if ((cachedX === currX) && !touchStarted && (cachedY === currY)) {
            // Here you get the Tap event
            console.log("tap that!");
        }
    }, 200);*/

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
    var _this = this;
    switch (key) {
        case 37: {
            //left
            this.game.moveFallingBlock(-1);
            break;
        }

        case "arrow-left": {
            //left
            this.game.moveFallingBlock(-1);
            this.leftTouch = setInterval(function() {
                _this.game.moveFallingBlock(-1);
            }, this.moveSpeed);
            break;
        }

        case 39: {
            //right
            this.game.moveFallingBlock(1);
            break;
        }

        case "arrow-right": {
            //right
            this.game.moveFallingBlock(1);
            this.rightTouch = setInterval(function() {
                _this.game.moveFallingBlock(1);
            }, this.moveSpeed);
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

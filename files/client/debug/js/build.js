(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Tetris = require("./tetris/TetrisApplication");

var t = new Tetris();
t.init();

},{"./tetris/TetrisApplication":8}],2:[function(require,module,exports){
"use strict";

function IBlockShape() {
    this.shapes = [
        [
            [6],
            [6],
            [6],
            [6]
        ],
        [
            [6, 6, 6, 6]
        ],
        [
            [6],
            [6],
            [6],
            [6]
        ],
        [
            [6, 6, 6, 6]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -4,
        col: 4
    };
}

module.exports = IBlockShape;

},{}],3:[function(require,module,exports){
"use strict";

function JBlockShape() {
    this.shapes = [
        [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        [
            [1, 0, 0],
            [1, 1, 1]
        ],
        [
            [1, 1],
            [1, 0],
            [1, 0]
        ],
        [
            [1, 1, 1],
            [0, 0, 1]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -3,
        col: 4
    };
}

module.exports = JBlockShape;

},{}],4:[function(require,module,exports){
"use strict";

function LBlockShape() {
    this.shapes = [
        [
            [2, 0],
            [2, 0],
            [2, 2]
        ],
        [
            [0, 0, 2],
            [2, 2, 2]
        ],
        [
            [2, 2],
            [0, 2],
            [0, 2]
        ],
        [
            [2, 2, 2],
            [2, 0, 0]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -3,
        col: 4
    };
}

module.exports = LBlockShape;

},{}],5:[function(require,module,exports){
"use strict";

function SBlockShape() {
    this.shapes = [
        [
            [0, 4, 4],
            [4, 4, 0]
        ],
        [
            [4, 0],
            [4, 4],
            [0, 4]
        ],
        [
            [0, 4, 4],
            [4, 4, 0]
        ],
        [
            [4, 0],
            [4, 4],
            [0, 4]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -2,
        col: 4
    };
}

module.exports = SBlockShape;

},{}],6:[function(require,module,exports){
"use strict";

function SquareBlockShape() {
    this.shapes = [
        [
            [7, 7],
            [7, 7]
        ],
        [
            [7, 7],
            [7, 7]
        ],
        [
            [7, 7],
            [7, 7]
        ],
        [
            [7, 7],
            [7, 7]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -2,
        col: 4
    };
}

module.exports = SquareBlockShape;

},{}],7:[function(require,module,exports){
"use strict";

function TBlockShape() {
    this.shapes = [
        [
            [0, 3, 0],
            [3, 3, 3]
        ],
        [
            [3, 0],
            [3, 3],
            [3, 0]
        ],
        [
            [3, 3, 3],
            [0, 3, 0]
        ],
        [
            [0, 3],
            [3, 3],
            [0, 3]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -2,
        col: 4
    };
}

module.exports = TBlockShape;

},{}],8:[function(require,module,exports){
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
    var elem = document.querySelector("#screen");
    this.game = new TetrisGame(elem);
    this.game.init();

    //add eventlistener
    document.addEventListener("keydown", this.keyInput.bind(this));
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
        case 37: {
            //left
            this.game.moveFallingBlock(-1);
            break;
        }

        case 39: {
            //right
            this.game.moveFallingBlock(1);
            break;
        }

        case 38: {
            //up
            this.game.rotateFallingBlock(1);
            break;
        }

        case 40: {
            //down
            this.game.fallBlock();
            break;
        }

        case 32: {
            //space
            this.game.fallBlockToBottom();
            break;
        }

        case 13: {
            //enter
            this.game.pauseGame();
            break;
        }

        case 68: {
            //d
            this.game.demoGame();
            break;
        }
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

},{"./TetrisGame":9}],9:[function(require,module,exports){
"use strict";
var JBlockShape = require("./JBlockShape");
var LBlockShape = require("./LBlockShape");
var SBlockShape = require("./SBlockShape");
var ZBlockShape = require("./ZBlockShape");
var IBlockShape = require("./IBlockShape");
var SquareBlockShape = require("./SquareBlockShape");
var TBlockShape = require("./TBlockShape");
/**
 * To create this module I have read the following guide:
 * http://gamedevelopment.tutsplus.com/tutorials/implementing-tetris-collision-detection--gamedev-852
 */

/**
 * Contructor function for the tetris game
 * @param element - the dom-element to be printed to
 * @constructor
 */
function TetrisGame(element) {
    this.element = element;
    this.fallingBlock = undefined;
    this.field = [];
    this.alive = false;
    this.fullRows = [];
    this.basePoints = 100;
    this.fallSpeed = 600;
    this.level = 1;
    this.rowCount = 0;
    this.points = 0;
    this.highScore = 0;
    this.nextBlock = undefined;
    this.paused = false;
    this.FXsounds = false;
    this.BGsounds = false;
    this.bgMusic = new Audio("//root.oskaremilsson.se/tetris-sounds/tetris.mp3");
    this.rotateSound = new Audio("//root.oskaremilsson.se/tetris-sounds/rotate-block.mp3");
    this.landSound = new Audio("//root.oskaremilsson.se/tetris-sounds/land-block.mp3");
    this.lineSound = new Audio("//root.oskaremilsson.se/tetris-sounds/line-remove.mp3");
    this.moveSound = new Audio("//root.oskaremilsson.se/tetris-sounds/move-block.mp3");
    this.gameoverSound = new Audio("//root.oskaremilsson.se/tetris-sounds/game-over.mp3");
    this.fourRowSound = new Audio("//root.oskaremilsson.se/tetris-sounds/four-rows.mp3");

    this.fallingBlockInterval = undefined;
}

/**
 * Initialized the basics of the module
 */
TetrisGame.prototype.init = function() {
    this.initField();
    this.print();

    //add listener to pause if focus is lost
    this.element.addEventListener("blur", this.pauseGame.bind(this));

    //add listener for the sounds toggle
    this.element.querySelector(".tetris-side-info").addEventListener("click", this.soundToggle.bind(this));

    //read sound-settings from local
    if (localStorage.getItem("FXsounds")) {
        var FXsounds = localStorage.getItem("FXsounds");
        if (FXsounds === "true") {
            this.FXsounds = true;
            this.element.querySelector("#tetris-sound-toggle").classList.add("sounds");
        }
    }

    if (localStorage.getItem("BGsounds")) {
        var BGsounds = localStorage.getItem("BGsounds");
        if (BGsounds === "true") {
            this.BGsounds = true;
            this.element.querySelector("#tetris-music-toggle").classList.add("sounds");
        }
    }
};

/**
 * Function to pause the game
 */
TetrisGame.prototype.pauseGame = function() {
    if (this.BGsounds) {
        //play background music
        this.bgMusic.pause();
    }

    //pause the game
    if (this.fallingBlockInterval && this.alive) {
        window.clearInterval(this.fallingBlockInterval);
        this.paused = true;
        this.element.querySelector(".tetris-paused").classList.remove("hide");
    }
};

/**
 * Function to resume the game
 */
TetrisGame.prototype.resumeGame = function() {
    if (this.BGsounds) {
        //play background music
        this.bgMusic.play();
    }

    //start the drop-interval again
    this.fallingBlockInterval = window.setInterval(this.fallBlock.bind(this), this.fallSpeed);
    this.paused = false;
    this.element.querySelector(".tetris-paused").classList.add("hide");
};

/**
 * Start the game
 */
TetrisGame.prototype.start = function() {
    if (this.fallingBlockInterval) {
        window.clearInterval(this.fallingBlockInterval);
    }

    //set all the variables to the start-state
    this.alive = true;
    this.level = 1;
    this.points = 0;
    this.fallSpeed = 600;
    this.rowCount = 0;
    this.readHighScore();

    //make sure the classes is resetted
    this.element.querySelector(".tetris-grid-body").classList.remove("game-over");
    this.element.querySelector(".tetris-points").classList.remove("new-highscore");
    this.element.querySelector(".tetris-paused").classList.add("hide");
    this.element.querySelector(".tetris-splash-screen").classList.add("hide");

    //run all the functions to make the magic happen
    this.paused = false;
    this.initField();
    this.clearField();
    this.renderPoints();
    this.newNextBlock();
    this.dropNewBlock();
    this.render();

    if (this.BGsounds) {
        //play background music
        this.bgMusic.play();
        this.bgMusic.addEventListener("ended", this.playBackgroundMusic.bind(this), false);
    }
};

TetrisGame.prototype.playBackgroundMusic = function() {
    this.bgMusic.currentTime = 0;
    this.bgMusic.play();
};

/**
 * Function to read the high score from local storage
 */
TetrisGame.prototype.readHighScore = function() {
    if (localStorage.getItem("tetris-hs")) {
        this.highScore = localStorage.getItem("tetris-hs");
    }
};

/**
 * Function to save the high score to local storage
 */
TetrisGame.prototype.saveHighScore = function() {
    if (this.points > this.highScore) {
        localStorage.setItem("tetris-hs", this.points);
    }
};

/**
 * Function to fall the block one row down
 */
TetrisGame.prototype.fallBlock = function() {
    if (this.isFallable()) {
        this.fallingBlock.topLeft.row += 1;
    }
    else {
        //block has collided, land the block and drop new
        window.clearInterval(this.fallingBlockInterval);
        this.landFallingBlock();
        this.dropNewBlock();
    }

    //render the change
    this.render();
};

/**
 * Function to fall block to bottom directly
 */
TetrisGame.prototype.fallBlockToBottom = function() {
    while (this.isFallable()) {
        this.fallingBlock.topLeft.row += 1;
    }

    //render the change
    this.render();
};

/**
 * Function to randomize a new block
 */
TetrisGame.prototype.newNextBlock = function() {
    var shape = Math.floor(Math.random() * 7);

    //create new block from the random number
    switch (shape) {
        case 0: {
            this.nextBlock = new JBlockShape();
            break;
        }

        case 1: {
            this.nextBlock = new LBlockShape();
            break;
        }

        case 2: {
            this.nextBlock = new SBlockShape();
            break;
        }

        case 3: {
            this.nextBlock = new ZBlockShape();
            break;
        }

        case 4: {
            this.nextBlock = new IBlockShape();
            break;
        }

        case 5: {
            this.nextBlock = new SquareBlockShape();
            break;
        }

        case 6: {
            this.nextBlock = new TBlockShape();
            break;
        }
    }
};

/**
 * Function to drop new block
 */
TetrisGame.prototype.dropNewBlock = function() {
    //get the block from next-block
    this.fallingBlock = this.nextBlock;

    //get a new next block
    this.clearNextBlock();
    this.newNextBlock();

    //add fallinterval with current speed
    this.fallingBlockInterval = window.setInterval(this.fallBlock.bind(this), this.fallSpeed);

    if (!this.isFallable()) {
        //the new block collided at launch, game over
        this.saveHighScore();
        this.element.querySelector(".tetris-grid-body").classList.add("game-over");
        this.alive = false;
        window.clearInterval(this.fallingBlockInterval);

        if (this.BGsounds) {
            //stop background music
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }

        window.setTimeout(this.playGameOverSound.bind(this), 500);
    }
};

TetrisGame.prototype.playGameOverSound = function() {
    if (this.FXsounds) {
        //play gameover sound
        this.gameoverSound.currentTime = 0;
        this.gameoverSound.play();
    }
};

/**
 * Function to land the falling block to the field
 */
TetrisGame.prototype.landFallingBlock = function() {
    if (this.FXsounds) {
        //play sound
        this.landSound.currentTime = 0;
        this.landSound.play();
    }

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                if (row + this.fallingBlock.topLeft.row >= 0) {
                    this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] = shape[row][col];
                }
            }
        }
    }

    //reset the fullRows array
    this.fullRows = [];

    //check if there are full rows after landing
    this.findFullRows();

    if (this.fullRows.length > 0) {
        //call function to make animations
        this.animateFullRows();

        //erase the animation
        window.setTimeout(this.clearAnimation.bind(this), 600);

        //erase the rows
        window.setTimeout(this.eraseFullRows.bind(this), 350);

        //count points
        this.points += this.countRowPoints();

        //if new HS add class to show it to the user
        if (this.points > this.highScore) {
            this.element.querySelector(".tetris-points").classList.add("new-highscore");
        }

        //reset the fullRows array
        //this.fullRows = [];

        //render the points
        this.renderPoints();
    }
};

/**
 * Function to erase animation-classes
 */
TetrisGame.prototype.clearAnimation = function() {
    var trs = this.element.querySelectorAll(".tetris-grid-body tr");

    for (var i = 0; i < trs.length; i += 1) {
        trs[i].classList.remove("full-row");
    }
};

/**
 * Function to render the game
 */
TetrisGame.prototype.render = function() {
    this.clearField();

    // Change the classes to render the blocks to user
    var trs = this.element.querySelectorAll(".tetris-grid tr");
    var tds;
    for (var row = 0; row < this.field.length; row += 1) {
        tds = trs[row].querySelectorAll(".tetris-grid td");
        for (var col = 0; col < this.field[row].length; col += 1) {
            if (this.field[row][col] !== 0) {
                //add the class to show block-part
                tds[col].classList.add("tetris-block-part");
            }
        }
    }

    //render the falling block and nextblock
    this.renderFallingBlock();
    this.renderNextBlock();
};

/**
 * Function to render the points
 */
TetrisGame.prototype.renderPoints = function() {
    var pointsElem = this.element.querySelector(".tetris-points");
    var levelElem = this.element.querySelector(".tetris-level");
    var pointNode = document.createTextNode(this.points.toString());
    var levelNode = document.createTextNode(this.level.toString());

    //replace the textnodes to the new ones
    pointsElem.replaceChild(pointNode, pointsElem.firstChild);
    levelElem.replaceChild(levelNode, levelElem.firstChild);

    this.animateNewPoints();
};

/**
 * Function to render the falling block
 */
TetrisGame.prototype.renderFallingBlock = function() {
    var row;
    var col;

    //get the nodes
    var trs = this.element.querySelectorAll(".tetris-grid tr");
    var tds = [];
    for (row = 0; row < this.field.length; row += 1) {
        tds.push(trs[row].querySelectorAll(".tetris-grid td"));
    }

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];
    for (row = 0; row < shape.length; row += 1) {
        for (col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                //draw block at position corresponding to the shapes position
                var y = row + this.fallingBlock.topLeft.row;
                var x = col + this.fallingBlock.topLeft.col;

                //add class to the correct block-part
                if (row + this.fallingBlock.topLeft.row >= 0) {
                    tds[y][x].classList.add("tetris-falling-block-part", "color-" + shape[row][col]);
                }
            }
        }
    }
};

/**
 * Render the next block
 */
TetrisGame.prototype.renderNextBlock = function() {
    var row;
    var col;

    //get the nodes
    var trs = this.element.querySelectorAll(".tetris-next-block tbody tr");
    var tds = [];
    for (row = 0; row < trs.length; row += 1) {
        tds.push(trs[row].querySelectorAll("td"));
    }

    var shape = this.nextBlock.shapes[this.nextBlock.rotation];
    for (row = 0; row < shape.length; row += 1) {
        for (col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                //draw block at position corresponding to the shapes position
                tds[row][col].classList.add("tetris-falling-block-part", "color-" + shape[row][col]);
            }
        }
    }
};

/**
 * Function to clear the next-block-container
 */
TetrisGame.prototype.clearNextBlock = function() {
    //clear next-block
    var trs = this.element.querySelectorAll(".tetris-next-block tbody tr");
    var tds;
    for (var row = 0; row < trs.length; row += 1) {
        tds = trs[row].querySelectorAll("td");
        for (var col = 0; col < tds.length; col += 1) {
            //clear the column
            tds[col].setAttribute("class", "");
        }
    }
};

/**
 * Function to check if the block is fallable
 * @returns {boolean} - fallable or not
 */
TetrisGame.prototype.isFallable = function() {
    var fallable = true;

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];
    var potentialTopLeft = {
        row: this.fallingBlock.topLeft.row + 1,
        col: this.fallingBlock.topLeft.col
    };

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                //check that the shape is not above the field
                if (row + potentialTopLeft.row >= 0) {
                    if (row + potentialTopLeft.row >= this.field.length) {
                        //this block would be below the playing field
                        fallable = false;
                    }
                    else if (this.field[row + potentialTopLeft.row][col + potentialTopLeft.col] !== 0) {
                        //the space is taken
                        fallable = false;
                    }
                }
            }
        }
    }

    return fallable;
};

/**
 * Function to move the falling block
 * @param dir
 */
TetrisGame.prototype.moveFallingBlock = function(dir) {
    if (this.isMovable(dir)) {
        if (this.FXsounds) {
            //play sound
            this.moveSound.currentTime = 0;
            this.moveSound.play();
        }

        this.fallingBlock.topLeft.col += dir;
    }

    this.render();
};

/**
 * Function to check if block is movable
 * @param dir - negative or positive number
 * @returns {boolean} - movable or not
 */
TetrisGame.prototype.isMovable = function(dir) {
    var movable = true;
    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];
    var potentialTopLeft = {
            row: this.fallingBlock.topLeft.row,
            col: this.fallingBlock.topLeft.col + dir
        };

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (col + potentialTopLeft.col < 0) {
                //this block would be to the left of the playing field
                movable = false;
            }

            if (col + potentialTopLeft.col >= this.field[0].length) {
                //this block would be to the right of the playing field
                movable = false;
            }

            //check that the shape is not above the field
            if (row + potentialTopLeft.row >= 0) {
                if (shape[row][col] !== 0) {
                    if (this.field[row + potentialTopLeft.row][col + potentialTopLeft.col] !== 0) {
                        //the space is taken
                        movable = false;
                    }
                }
            }
        }
    }

    return movable;
};

/**
 * Function to rotate falling block
 * @param dir - positive or negative number to handle left/Right
 */
TetrisGame.prototype.rotateFallingBlock = function(dir) {
    if (this.isRotatable(dir)) {
        if (this.FXsounds) {
            //play sound
            this.rotateSound.currentTime = 0;
            this.rotateSound.play();
        }

        var newRotation = this.fallingBlock.rotation + dir;
        if (newRotation > 3) {
            newRotation = 0;
        }
        else if (newRotation < 0) {
            newRotation = 3;
        }

        this.fallingBlock.rotation = newRotation;

        this.render();
    }

};

/**
 * Function to check if the block is rotatable
 * @param dir - neg or pos number
 * @returns {boolean} - rotatable or not
 */
TetrisGame.prototype.isRotatable = function(dir) {
    var rotatable = true;

    var potentialRotation = this.fallingBlock.rotation + dir;
    if (potentialRotation > 3) {
        potentialRotation = 0;
    }
    else if (potentialRotation < 0) {
        potentialRotation = 3;
    }

    //create potential shape
    var potentialShape = this.fallingBlock.shapes[potentialRotation];

    for (var row = 0; row < potentialShape.length; row += 1) {
        for (var col = 0; col < potentialShape[row].length; col += 1) {
            //check that the shape is not above the field
            if (col + this.fallingBlock.topLeft.col < 0) {
                //this block would be to the left of the playing field
                rotatable = false;
            }

            if (col + this.fallingBlock.topLeft.col >= this.field[0].length) {
                //this block would be to the right of the playing field
                rotatable = false;
            }

            if (row + this.fallingBlock.topLeft.row >= 0) {
                if (potentialShape[row][col] !== 0) {
                    if (this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] !== 0) {
                        //the space is taken
                        rotatable = false;
                    }
                }
            }
        }
    }

    return rotatable;
};

/**
 * Function to clear all the tablerows in game
 */
TetrisGame.prototype.clearField = function() {
    //clear field
    var trs = this.element.querySelectorAll("tr");
    var tds;
    for (var row = 0; row < this.field.length; row += 1) {
        tds = trs[row].querySelectorAll("td");
        for (var col = 0; col < this.field[row].length; col += 1) {
            //reset the classes
            tds[col].setAttribute("class", "");
        }
    }
};

/**
 * Function to find the fullrows on the field
 */
TetrisGame.prototype.findFullRows = function() {
    //find full rows
    var full = false;
    for (var row = 0; row < this.field.length; row += 1) {
        for (var col = 0; col < this.field[row].length - 1; col += 1) {
            if (this.field[row].indexOf(0) === -1) {
                //row is full
                full = true;
            }
        }

        if (full) {
            //add them to the array os full rows
            this.fullRows.push(row);
            this.rowCount += 1;

            if (this.rowCount % 5 === 0 && this.fallSpeed > 150) {
                //speed up the game
                this.fallSpeed -= 35;
                this.level += 1;
            }

            full = false;
        }
    }
};

/**
 * Function to aminate the full rows
 */
TetrisGame.prototype.animateFullRows = function() {
    var trs = this.element.querySelectorAll(".tetris-grid-body tr");

    for (var i = 0; i < this.fullRows.length; i += 1) {
        trs[this.fullRows[i]].classList.add("full-row");
    }
};

/**
 * Function to erase the full rows from field
 */
TetrisGame.prototype.eraseFullRows = function() {
    if (this.FXsounds) {
        //play sound
        if (this.fullRows.length === 4) {
            this.fourRowSound.currentTime = 0;
            this.fourRowSound.play();
        }
        else {
            this.lineSound.currentTime = 0;
            this.lineSound.play();
        }
    }

    for (var i = 0; i < this.fullRows.length; i += 1) {
        //remove the full row from field
        this.field.splice(this.fullRows[i], 1);

        //add a new empty on top of field
        var newRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        //add it to the beginning of array
        this.field.unshift(newRow);
    }
};

/**
 * Function to count the points
 * @returns {number} - the new points
 */
TetrisGame.prototype.countRowPoints = function() {
    //100p for one row, add additional 20% per extra row
    return this.basePoints + ((this.fullRows.length - 1) * this.basePoints) * 1.2;
};

/**
 * Function to print the gameboard
 */
TetrisGame.prototype.print = function() {
    var frag = document.createDocumentFragment();
    var tr;
    var td;

    for (var row = 0; row < this.field.length; row += 1) {
        tr = document.createElement("tr");

        for (var col = 0; col < this.field[row].length; col += 1) {
            td = document.createElement("td");
            tr.appendChild(td);
        }

        frag.appendChild(tr);
    }

    this.element.querySelector(".tetris-grid-body").appendChild(frag);
};

/**
 * Function to initialize the field-array
 */
TetrisGame.prototype.initField = function() {
    this.field = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
};

/**
 * Function to animate new points
 */
TetrisGame.prototype.animateNewPoints = function() {
    var elem = this.element.querySelector(".tetris-points");

    elem.classList.add("tetris-new-points");

    window.setTimeout(this.clearNewPointsAnimation.bind(this), 550);
};

/**
 * Function to remove the class set by the animate new points
 */
TetrisGame.prototype.clearNewPointsAnimation = function() {
    var elem = this.element.querySelector(".tetris-points");

    elem.classList.remove("tetris-new-points");
};

/**
 * Function to toggle the sounds
 */
TetrisGame.prototype.soundToggle = function(event) {
    if (event.target.id === "tetris-music-toggle") {
        event.target.classList.toggle("sounds");
        this.BGsounds = !this.BGsounds;

        //dave to local storage
        localStorage.setItem("BGsounds", this.BGsounds);

        if (this.BGsounds && this.alive) {
            this.bgMusic.play();
        }
        else {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }
    else if (event.target.id === "tetris-sound-toggle") {
        event.target.classList.toggle("sounds");
        this.FXsounds = !this.FXsounds;

        //save to local storage
        localStorage.setItem("FXsounds", this.FXsounds);
    }
};

/**
 * Function to create a demo-game for presentation
 *
 */
TetrisGame.prototype.demoGame = function() {
    this.field = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
    ];

    this.nextBlock = new IBlockShape();
    this.clearNextBlock();
    this.render();
};

module.exports = TetrisGame;

},{"./IBlockShape":2,"./JBlockShape":3,"./LBlockShape":4,"./SBlockShape":5,"./SquareBlockShape":6,"./TBlockShape":7,"./ZBlockShape":10}],10:[function(require,module,exports){
"use strict";

function SBlockShape() {
    this.shapes = [
        [
            [5, 5, 0],
            [0, 5, 5]
        ],
        [
            [0, 5],
            [5, 5],
            [5, 0]
        ],
        [
            [5, 5, 0],
            [0, 5, 5]
        ],
        [
            [0, 5],
            [5, 5],
            [5, 0]
        ]
    ];
    this.rotation = 0;
    this.topLeft = {
        row: -2,
        col: 4
    };
}

module.exports = SBlockShape;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSUJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9KQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0xCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU0Jsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9TcXVhcmVCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVEJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RldHJpc0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9aQmxvY2tTaGFwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzMEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUZXRyaXMgPSByZXF1aXJlKFwiLi90ZXRyaXMvVGV0cmlzQXBwbGljYXRpb25cIik7XG5cbnZhciB0ID0gbmV3IFRldHJpcygpO1xudC5pbml0KCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIElCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzYsIDYsIDYsIDZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNiwgNiwgNiwgNl1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtNCxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSUJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gSkJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAxXSxcclxuICAgICAgICAgICAgWzAsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDAsIDBdLFxyXG4gICAgICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMF0sXHJcbiAgICAgICAgICAgIFsxLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMSwgMV0sXHJcbiAgICAgICAgICAgIFswLCAwLCAxXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0zLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIExCbG9ja1NoYXBlKCkge1xuICAgIHRoaXMuc2hhcGVzID0gW1xuICAgICAgICBbXG4gICAgICAgICAgICBbMiwgMF0sXG4gICAgICAgICAgICBbMiwgMF0sXG4gICAgICAgICAgICBbMiwgMl1cbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgWzAsIDAsIDJdLFxuICAgICAgICAgICAgWzIsIDIsIDJdXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsyLCAyXSxcbiAgICAgICAgICAgIFswLCAyXSxcbiAgICAgICAgICAgIFswLCAyXVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBbMiwgMiwgMl0sXG4gICAgICAgICAgICBbMiwgMCwgMF1cbiAgICAgICAgXVxuICAgIF07XG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XG4gICAgdGhpcy50b3BMZWZ0ID0ge1xuICAgICAgICByb3c6IC0zLFxuICAgICAgICBjb2w6IDRcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExCbG9ja1NoYXBlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBTQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDQsIDRdLFxyXG4gICAgICAgICAgICBbNCwgNCwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzQsIDBdLFxyXG4gICAgICAgICAgICBbNCwgNF0sXHJcbiAgICAgICAgICAgIFswLCA0XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNCwgNF0sXHJcbiAgICAgICAgICAgIFs0LCA0LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNCwgMF0sXHJcbiAgICAgICAgICAgIFs0LCA0XSxcclxuICAgICAgICAgICAgWzAsIDRdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNxdWFyZUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNxdWFyZUJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gVEJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAzLCAwXSxcclxuICAgICAgICAgICAgWzMsIDMsIDNdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFszLCAwXSxcclxuICAgICAgICAgICAgWzMsIDNdLFxyXG4gICAgICAgICAgICBbMywgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDMsIDNdLFxyXG4gICAgICAgICAgICBbMCwgMywgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDNdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0yLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUZXRyaXNHYW1lID0gcmVxdWlyZShcIi4vVGV0cmlzR2FtZVwiKTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHRldHJpcy1hcHBcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUZXRyaXNBcHBsaWNhdGlvbigpIHtcbiAgICB0aGlzLmdhbWUgPSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogSW5pdCB0aGUgYmFzaWNzXG4gKi9cblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy90aGlzLnByaW50KCk7XG5cbiAgICAvL2NyZWF0ZSBuZXcgZ2FtZVxuICAgIHZhciBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY3JlZW5cIik7XG4gICAgdGhpcy5nYW1lID0gbmV3IFRldHJpc0dhbWUoZWxlbSk7XG4gICAgdGhpcy5nYW1lLmluaXQoKTtcblxuICAgIC8vYWRkIGV2ZW50bGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUlucHV0LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGtleS1pbnB1dHNcbiAqL1xuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIga2V5ID0gZXZlbnQua2V5Q29kZTtcblxuICAgIC8vSWYgZ2FtZSBpcyBcImFsaXZlXCIgYW5kIG5vdCBwYXVzZWQsIGNhbGwgdGhlIGNvcnJlY3QgZnVuY3Rpb25zIGluIGdhbWVcbiAgICBpZiAodGhpcy5nYW1lLmFsaXZlICYmICF0aGlzLmdhbWUucGF1c2VkKSB7XG4gICAgICAgIHRoaXMuaW5wdXRUb0dhbWVIYW5kbGVyKGtleSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoa2V5ID09PSAxMykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2FtZS5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lR2FtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5wdXRUb0dhbWVIYW5kbGVyID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAzNzoge1xuICAgICAgICAgICAgLy9sZWZ0XG4gICAgICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygtMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMzk6IHtcbiAgICAgICAgICAgIC8vcmlnaHRcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5tb3ZlRmFsbGluZ0Jsb2NrKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDM4OiB7XG4gICAgICAgICAgICAvL3VwXG4gICAgICAgICAgICB0aGlzLmdhbWUucm90YXRlRmFsbGluZ0Jsb2NrKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDQwOiB7XG4gICAgICAgICAgICAvL2Rvd25cbiAgICAgICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2soKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAzMjoge1xuICAgICAgICAgICAgLy9zcGFjZVxuICAgICAgICAgICAgdGhpcy5nYW1lLmZhbGxCbG9ja1RvQm90dG9tKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMTM6IHtcbiAgICAgICAgICAgIC8vZW50ZXJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZUdhbWUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSA2ODoge1xuICAgICAgICAgICAgLy9kXG4gICAgICAgICAgICB0aGlzLmdhbWUuZGVtb0dhbWUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkZXN0cm95IHRoZSBhcHBcbiAqL1xuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5nYW1lLmZhbGxpbmdCbG9ja0ludGVydmFsKSB7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZ2FtZS5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2FtZS5iZ011c2ljKSB7XG4gICAgICAgIC8vc3RvcCBiYWNrZ3JvdW5kIG11c2ljXG4gICAgICAgIHRoaXMuZ2FtZS5iZ011c2ljLnBhdXNlKCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXRyaXNBcHBsaWNhdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEpCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vSkJsb2NrU2hhcGVcIik7XG52YXIgTEJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9MQmxvY2tTaGFwZVwiKTtcbnZhciBTQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1NCbG9ja1NoYXBlXCIpO1xudmFyIFpCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vWkJsb2NrU2hhcGVcIik7XG52YXIgSUJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9JQmxvY2tTaGFwZVwiKTtcbnZhciBTcXVhcmVCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vU3F1YXJlQmxvY2tTaGFwZVwiKTtcbnZhciBUQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1RCbG9ja1NoYXBlXCIpO1xuLyoqXG4gKiBUbyBjcmVhdGUgdGhpcyBtb2R1bGUgSSBoYXZlIHJlYWQgdGhlIGZvbGxvd2luZyBndWlkZTpcbiAqIGh0dHA6Ly9nYW1lZGV2ZWxvcG1lbnQudHV0c3BsdXMuY29tL3R1dG9yaWFscy9pbXBsZW1lbnRpbmctdGV0cmlzLWNvbGxpc2lvbi1kZXRlY3Rpb24tLWdhbWVkZXYtODUyXG4gKi9cblxuLyoqXG4gKiBDb250cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgdGV0cmlzIGdhbWVcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGRvbS1lbGVtZW50IHRvIGJlIHByaW50ZWQgdG9cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUZXRyaXNHYW1lKGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuZmFsbGluZ0Jsb2NrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZmllbGQgPSBbXTtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgdGhpcy5mdWxsUm93cyA9IFtdO1xuICAgIHRoaXMuYmFzZVBvaW50cyA9IDEwMDtcbiAgICB0aGlzLmZhbGxTcGVlZCA9IDYwMDtcbiAgICB0aGlzLmxldmVsID0gMTtcbiAgICB0aGlzLnJvd0NvdW50ID0gMDtcbiAgICB0aGlzLnBvaW50cyA9IDA7XG4gICAgdGhpcy5oaWdoU2NvcmUgPSAwO1xuICAgIHRoaXMubmV4dEJsb2NrID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5GWHNvdW5kcyA9IGZhbHNlO1xuICAgIHRoaXMuQkdzb3VuZHMgPSBmYWxzZTtcbiAgICB0aGlzLmJnTXVzaWMgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL3RldHJpcy5tcDNcIik7XG4gICAgdGhpcy5yb3RhdGVTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvcm90YXRlLWJsb2NrLm1wM1wiKTtcbiAgICB0aGlzLmxhbmRTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvbGFuZC1ibG9jay5tcDNcIik7XG4gICAgdGhpcy5saW5lU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL2xpbmUtcmVtb3ZlLm1wM1wiKTtcbiAgICB0aGlzLm1vdmVTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvbW92ZS1ibG9jay5tcDNcIik7XG4gICAgdGhpcy5nYW1lb3ZlclNvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9nYW1lLW92ZXIubXAzXCIpO1xuICAgIHRoaXMuZm91clJvd1NvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9mb3VyLXJvd3MubXAzXCIpO1xuXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplZCB0aGUgYmFzaWNzIG9mIHRoZSBtb2R1bGVcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5pdEZpZWxkKCk7XG4gICAgdGhpcy5wcmludCgpO1xuXG4gICAgLy9hZGQgbGlzdGVuZXIgdG8gcGF1c2UgaWYgZm9jdXMgaXMgbG9zdFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCB0aGlzLnBhdXNlR2FtZS5iaW5kKHRoaXMpKTtcblxuICAgIC8vYWRkIGxpc3RlbmVyIGZvciB0aGUgc291bmRzIHRvZ2dsZVxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1zaWRlLWluZm9cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc291bmRUb2dnbGUuYmluZCh0aGlzKSk7XG5cbiAgICAvL3JlYWQgc291bmQtc2V0dGluZ3MgZnJvbSBsb2NhbFxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkZYc291bmRzXCIpKSB7XG4gICAgICAgIHZhciBGWHNvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiRlhzb3VuZHNcIik7XG4gICAgICAgIGlmIChGWHNvdW5kcyA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIHRoaXMuRlhzb3VuZHMgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV0cmlzLXNvdW5kLXRvZ2dsZVwiKS5jbGFzc0xpc3QuYWRkKFwic291bmRzXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiQkdzb3VuZHNcIikpIHtcbiAgICAgICAgdmFyIEJHc291bmRzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJCR3NvdW5kc1wiKTtcbiAgICAgICAgaWYgKEJHc291bmRzID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgdGhpcy5CR3NvdW5kcyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXRyaXMtbXVzaWMtdG9nZ2xlXCIpLmNsYXNzTGlzdC5hZGQoXCJzb3VuZHNcIik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHBhdXNlIHRoZSBnYW1lXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnBhdXNlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLkJHc291bmRzKSB7XG4gICAgICAgIC8vcGxheSBiYWNrZ3JvdW5kIG11c2ljXG4gICAgICAgIHRoaXMuYmdNdXNpYy5wYXVzZSgpO1xuICAgIH1cblxuICAgIC8vcGF1c2UgdGhlIGdhbWVcbiAgICBpZiAodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCAmJiB0aGlzLmFsaXZlKSB7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wYXVzZWRcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXN1bWUgdGhlIGdhbWVcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVzdW1lR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLkJHc291bmRzKSB7XG4gICAgICAgIC8vcGxheSBiYWNrZ3JvdW5kIG11c2ljXG4gICAgICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLy9zdGFydCB0aGUgZHJvcC1pbnRlcnZhbCBhZ2FpblxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5mYWxsQmxvY2suYmluZCh0aGlzKSwgdGhpcy5mYWxsU3BlZWQpO1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcbn07XG5cbi8qKlxuICogU3RhcnQgdGhlIGdhbWVcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcbiAgICB9XG5cbiAgICAvL3NldCBhbGwgdGhlIHZhcmlhYmxlcyB0byB0aGUgc3RhcnQtc3RhdGVcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcbiAgICB0aGlzLmxldmVsID0gMTtcbiAgICB0aGlzLnBvaW50cyA9IDA7XG4gICAgdGhpcy5mYWxsU3BlZWQgPSA2MDA7XG4gICAgdGhpcy5yb3dDb3VudCA9IDA7XG4gICAgdGhpcy5yZWFkSGlnaFNjb3JlKCk7XG5cbiAgICAvL21ha2Ugc3VyZSB0aGUgY2xhc3NlcyBpcyByZXNldHRlZFxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuY2xhc3NMaXN0LnJlbW92ZShcImdhbWUtb3ZlclwiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJuZXctaGlnaHNjb3JlXCIpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wYXVzZWRcIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXNwbGFzaC1zY3JlZW5cIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG5cbiAgICAvL3J1biBhbGwgdGhlIGZ1bmN0aW9ucyB0byBtYWtlIHRoZSBtYWdpYyBoYXBwZW5cbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdEZpZWxkKCk7XG4gICAgdGhpcy5jbGVhckZpZWxkKCk7XG4gICAgdGhpcy5yZW5kZXJQb2ludHMoKTtcbiAgICB0aGlzLm5ld05leHRCbG9jaygpO1xuICAgIHRoaXMuZHJvcE5ld0Jsb2NrKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcblxuICAgIGlmICh0aGlzLkJHc291bmRzKSB7XG4gICAgICAgIC8vcGxheSBiYWNrZ3JvdW5kIG11c2ljXG4gICAgICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XG4gICAgICAgIHRoaXMuYmdNdXNpYy5hZGRFdmVudExpc3RlbmVyKFwiZW5kZWRcIiwgdGhpcy5wbGF5QmFja2dyb3VuZE11c2ljLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB9XG59O1xuXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5wbGF5QmFja2dyb3VuZE11c2ljID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZ011c2ljLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLmJnTXVzaWMucGxheSgpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZWFkIHRoZSBoaWdoIHNjb3JlIGZyb20gbG9jYWwgc3RvcmFnZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZWFkSGlnaFNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidGV0cmlzLWhzXCIpKSB7XG4gICAgICAgIHRoaXMuaGlnaFNjb3JlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0ZXRyaXMtaHNcIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBzYXZlIHRoZSBoaWdoIHNjb3JlIHRvIGxvY2FsIHN0b3JhZ2VcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuc2F2ZUhpZ2hTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnBvaW50cyA+IHRoaXMuaGlnaFNjb3JlKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGV0cmlzLWhzXCIsIHRoaXMucG9pbnRzKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZhbGwgdGhlIGJsb2NrIG9uZSByb3cgZG93blxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5mYWxsQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc0ZhbGxhYmxlKCkpIHtcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vYmxvY2sgaGFzIGNvbGxpZGVkLCBsYW5kIHRoZSBibG9jayBhbmQgZHJvcCBuZXdcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XG4gICAgICAgIHRoaXMubGFuZEZhbGxpbmdCbG9jaygpO1xuICAgICAgICB0aGlzLmRyb3BOZXdCbG9jaygpO1xuICAgIH1cblxuICAgIC8vcmVuZGVyIHRoZSBjaGFuZ2VcbiAgICB0aGlzLnJlbmRlcigpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmYWxsIGJsb2NrIHRvIGJvdHRvbSBkaXJlY3RseVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5mYWxsQmxvY2tUb0JvdHRvbSA9IGZ1bmN0aW9uKCkge1xuICAgIHdoaWxlICh0aGlzLmlzRmFsbGFibGUoKSkge1xuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArPSAxO1xuICAgIH1cblxuICAgIC8vcmVuZGVyIHRoZSBjaGFuZ2VcbiAgICB0aGlzLnJlbmRlcigpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByYW5kb21pemUgYSBuZXcgYmxvY2tcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUubmV3TmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNoYXBlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyk7XG5cbiAgICAvL2NyZWF0ZSBuZXcgYmxvY2sgZnJvbSB0aGUgcmFuZG9tIG51bWJlclxuICAgIHN3aXRjaCAoc2hhcGUpIHtcbiAgICAgICAgY2FzZSAwOiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBKQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDE6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IExCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMjoge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgU0Jsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAzOiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBaQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDQ6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IElCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgNToge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgU3F1YXJlQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDY6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFRCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZHJvcCBuZXcgYmxvY2tcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuZHJvcE5ld0Jsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgLy9nZXQgdGhlIGJsb2NrIGZyb20gbmV4dC1ibG9ja1xuICAgIHRoaXMuZmFsbGluZ0Jsb2NrID0gdGhpcy5uZXh0QmxvY2s7XG5cbiAgICAvL2dldCBhIG5ldyBuZXh0IGJsb2NrXG4gICAgdGhpcy5jbGVhck5leHRCbG9jaygpO1xuICAgIHRoaXMubmV3TmV4dEJsb2NrKCk7XG5cbiAgICAvL2FkZCBmYWxsaW50ZXJ2YWwgd2l0aCBjdXJyZW50IHNwZWVkXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmZhbGxCbG9jay5iaW5kKHRoaXMpLCB0aGlzLmZhbGxTcGVlZCk7XG5cbiAgICBpZiAoIXRoaXMuaXNGYWxsYWJsZSgpKSB7XG4gICAgICAgIC8vdGhlIG5ldyBibG9jayBjb2xsaWRlZCBhdCBsYXVuY2gsIGdhbWUgb3ZlclxuICAgICAgICB0aGlzLnNhdmVIaWdoU2NvcmUoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5jbGFzc0xpc3QuYWRkKFwiZ2FtZS1vdmVyXCIpO1xuICAgICAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xuXG4gICAgICAgIGlmICh0aGlzLkJHc291bmRzKSB7XG4gICAgICAgICAgICAvL3N0b3AgYmFja2dyb3VuZCBtdXNpY1xuICAgICAgICAgICAgdGhpcy5iZ011c2ljLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5wbGF5R2FtZU92ZXJTb3VuZC5iaW5kKHRoaXMpLCA1MDApO1xuICAgIH1cbn07XG5cblRldHJpc0dhbWUucHJvdG90eXBlLnBsYXlHYW1lT3ZlclNvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgLy9wbGF5IGdhbWVvdmVyIHNvdW5kXG4gICAgICAgIHRoaXMuZ2FtZW92ZXJTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIHRoaXMuZ2FtZW92ZXJTb3VuZC5wbGF5KCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBsYW5kIHRoZSBmYWxsaW5nIGJsb2NrIHRvIHRoZSBmaWVsZFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5sYW5kRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgLy9wbGF5IHNvdW5kXG4gICAgICAgIHRoaXMubGFuZFNvdW5kLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgdGhpcy5sYW5kU291bmQucGxheSgpO1xuICAgIH1cblxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XG5cbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGRbcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3ddW2NvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXSA9IHNoYXBlW3Jvd11bY29sXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL3Jlc2V0IHRoZSBmdWxsUm93cyBhcnJheVxuICAgIHRoaXMuZnVsbFJvd3MgPSBbXTtcblxuICAgIC8vY2hlY2sgaWYgdGhlcmUgYXJlIGZ1bGwgcm93cyBhZnRlciBsYW5kaW5nXG4gICAgdGhpcy5maW5kRnVsbFJvd3MoKTtcblxuICAgIGlmICh0aGlzLmZ1bGxSb3dzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy9jYWxsIGZ1bmN0aW9uIHRvIG1ha2UgYW5pbWF0aW9uc1xuICAgICAgICB0aGlzLmFuaW1hdGVGdWxsUm93cygpO1xuXG4gICAgICAgIC8vZXJhc2UgdGhlIGFuaW1hdGlvblxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLmNsZWFyQW5pbWF0aW9uLmJpbmQodGhpcyksIDYwMCk7XG5cbiAgICAgICAgLy9lcmFzZSB0aGUgcm93c1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLmVyYXNlRnVsbFJvd3MuYmluZCh0aGlzKSwgMzUwKTtcblxuICAgICAgICAvL2NvdW50IHBvaW50c1xuICAgICAgICB0aGlzLnBvaW50cyArPSB0aGlzLmNvdW50Um93UG9pbnRzKCk7XG5cbiAgICAgICAgLy9pZiBuZXcgSFMgYWRkIGNsYXNzIHRvIHNob3cgaXQgdG8gdGhlIHVzZXJcbiAgICAgICAgaWYgKHRoaXMucG9pbnRzID4gdGhpcy5oaWdoU2NvcmUpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIikuY2xhc3NMaXN0LmFkZChcIm5ldy1oaWdoc2NvcmVcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3Jlc2V0IHRoZSBmdWxsUm93cyBhcnJheVxuICAgICAgICAvL3RoaXMuZnVsbFJvd3MgPSBbXTtcblxuICAgICAgICAvL3JlbmRlciB0aGUgcG9pbnRzXG4gICAgICAgIHRoaXMucmVuZGVyUG9pbnRzKCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBlcmFzZSBhbmltYXRpb24tY2xhc3Nlc1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5jbGVhckFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZC1ib2R5IHRyXCIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdHJzW2ldLmNsYXNzTGlzdC5yZW1vdmUoXCJmdWxsLXJvd1wiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgZ2FtZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsZWFyRmllbGQoKTtcblxuICAgIC8vIENoYW5nZSB0aGUgY2xhc3NlcyB0byByZW5kZXIgdGhlIGJsb2NrcyB0byB1c2VyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkIHRyXCIpO1xuICAgIHZhciB0ZHM7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdGRcIik7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAvL2FkZCB0aGUgY2xhc3MgdG8gc2hvdyBibG9jay1wYXJ0XG4gICAgICAgICAgICAgICAgdGRzW2NvbF0uY2xhc3NMaXN0LmFkZChcInRldHJpcy1ibG9jay1wYXJ0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9yZW5kZXIgdGhlIGZhbGxpbmcgYmxvY2sgYW5kIG5leHRibG9ja1xuICAgIHRoaXMucmVuZGVyRmFsbGluZ0Jsb2NrKCk7XG4gICAgdGhpcy5yZW5kZXJOZXh0QmxvY2soKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyUG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50c0VsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xuICAgIHZhciBsZXZlbEVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtbGV2ZWxcIik7XG4gICAgdmFyIHBvaW50Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMucG9pbnRzLnRvU3RyaW5nKCkpO1xuICAgIHZhciBsZXZlbE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmxldmVsLnRvU3RyaW5nKCkpO1xuXG4gICAgLy9yZXBsYWNlIHRoZSB0ZXh0bm9kZXMgdG8gdGhlIG5ldyBvbmVzXG4gICAgcG9pbnRzRWxlbS5yZXBsYWNlQ2hpbGQocG9pbnROb2RlLCBwb2ludHNFbGVtLmZpcnN0Q2hpbGQpO1xuICAgIGxldmVsRWxlbS5yZXBsYWNlQ2hpbGQobGV2ZWxOb2RlLCBsZXZlbEVsZW0uZmlyc3RDaGlsZCk7XG5cbiAgICB0aGlzLmFuaW1hdGVOZXdQb2ludHMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBmYWxsaW5nIGJsb2NrXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlckZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByb3c7XG4gICAgdmFyIGNvbDtcblxuICAgIC8vZ2V0IHRoZSBub2Rlc1xuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0clwiKTtcbiAgICB2YXIgdGRzID0gW107XG4gICAgZm9yIChyb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKSk7XG4gICAgfVxuXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgdmFyIHkgPSByb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdztcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sO1xuXG4gICAgICAgICAgICAgICAgLy9hZGQgY2xhc3MgdG8gdGhlIGNvcnJlY3QgYmxvY2stcGFydFxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRkc1t5XVt4XS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWZhbGxpbmctYmxvY2stcGFydFwiLCBcImNvbG9yLVwiICsgc2hhcGVbcm93XVtjb2xdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgbmV4dCBibG9ja1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm93O1xuICAgIHZhciBjb2w7XG5cbiAgICAvL2dldCB0aGUgbm9kZXNcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLW5leHQtYmxvY2sgdGJvZHkgdHJcIik7XG4gICAgdmFyIHRkcyA9IFtdO1xuICAgIGZvciAocm93ID0gMDsgcm93IDwgdHJzLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpKTtcbiAgICB9XG5cbiAgICB2YXIgc2hhcGUgPSB0aGlzLm5leHRCbG9jay5zaGFwZXNbdGhpcy5uZXh0QmxvY2sucm90YXRpb25dO1xuICAgIGZvciAocm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vZHJhdyBibG9jayBhdCBwb3NpdGlvbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBzaGFwZXMgcG9zaXRpb25cbiAgICAgICAgICAgICAgICB0ZHNbcm93XVtjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjbGVhciB0aGUgbmV4dC1ibG9jay1jb250YWluZXJcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAvL2NsZWFyIG5leHQtYmxvY2tcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLW5leHQtYmxvY2sgdGJvZHkgdHJcIik7XG4gICAgdmFyIHRkcztcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0cnMubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICB0ZHMgPSB0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIik7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRkcy5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICAvL2NsZWFyIHRoZSBjb2x1bW5cbiAgICAgICAgICAgIHRkc1tjb2xdLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgYmxvY2sgaXMgZmFsbGFibGVcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIGZhbGxhYmxlIG9yIG5vdFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc0ZhbGxhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZhbGxhYmxlID0gdHJ1ZTtcblxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XG4gICAgdmFyIHBvdGVudGlhbFRvcExlZnQgPSB7XG4gICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKyAxLFxuICAgICAgICBjb2w6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXG4gICAgfTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgYmVsb3cgdGhlIHBsYXlpbmcgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxsYWJsZTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbW92ZSB0aGUgZmFsbGluZyBibG9ja1xuICogQHBhcmFtIGRpclxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5tb3ZlRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oZGlyKSB7XG4gICAgaWYgKHRoaXMuaXNNb3ZhYmxlKGRpcikpIHtcbiAgICAgICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgICAgIC8vcGxheSBzb3VuZFxuICAgICAgICAgICAgdGhpcy5tb3ZlU291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5tb3ZlU291bmQucGxheSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKz0gZGlyO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGJsb2NrIGlzIG1vdmFibGVcbiAqIEBwYXJhbSBkaXIgLSBuZWdhdGl2ZSBvciBwb3NpdGl2ZSBudW1iZXJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIG1vdmFibGUgb3Igbm90XG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmlzTW92YWJsZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIHZhciBtb3ZhYmxlID0gdHJ1ZTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xuICAgICAgICAgICAgcm93OiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyxcbiAgICAgICAgICAgIGNvbDogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKyBkaXJcbiAgICAgICAgfTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2wgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXG4gICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2wgPj0gdGhpcy5maWVsZFswXS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXG4gICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcbiAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxuICAgICAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vdmFibGU7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJvdGF0ZSBmYWxsaW5nIGJsb2NrXG4gKiBAcGFyYW0gZGlyIC0gcG9zaXRpdmUgb3IgbmVnYXRpdmUgbnVtYmVyIHRvIGhhbmRsZSBsZWZ0L1JpZ2h0XG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJvdGF0ZUZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKGRpcikge1xuICAgIGlmICh0aGlzLmlzUm90YXRhYmxlKGRpcikpIHtcbiAgICAgICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgICAgIC8vcGxheSBzb3VuZFxuICAgICAgICAgICAgdGhpcy5yb3RhdGVTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0ZVNvdW5kLnBsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdSb3RhdGlvbiA9IHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uICsgZGlyO1xuICAgICAgICBpZiAobmV3Um90YXRpb24gPiAzKSB7XG4gICAgICAgICAgICBuZXdSb3RhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3Um90YXRpb24gPCAwKSB7XG4gICAgICAgICAgICBuZXdSb3RhdGlvbiA9IDM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiA9IG5ld1JvdGF0aW9uO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyByb3RhdGFibGVcbiAqIEBwYXJhbSBkaXIgLSBuZWcgb3IgcG9zIG51bWJlclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gcm90YXRhYmxlIG9yIG5vdFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc1JvdGF0YWJsZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIHZhciByb3RhdGFibGUgPSB0cnVlO1xuXG4gICAgdmFyIHBvdGVudGlhbFJvdGF0aW9uID0gdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb24gKyBkaXI7XG4gICAgaWYgKHBvdGVudGlhbFJvdGF0aW9uID4gMykge1xuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDA7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBvdGVudGlhbFJvdGF0aW9uIDwgMCkge1xuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDM7XG4gICAgfVxuXG4gICAgLy9jcmVhdGUgcG90ZW50aWFsIHNoYXBlXG4gICAgdmFyIHBvdGVudGlhbFNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3BvdGVudGlhbFJvdGF0aW9uXTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHBvdGVudGlhbFNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgcG90ZW50aWFsU2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcbiAgICAgICAgICAgIGlmIChjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCA8IDApIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIGxlZnQgb2YgdGhlIHBsYXlpbmcgZmllbGRcbiAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sID49IHRoaXMuZmllbGRbMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxuICAgICAgICAgICAgICAgIHJvdGF0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChwb3RlbnRpYWxTaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3ddW2NvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvdGF0YWJsZTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2xlYXIgYWxsIHRoZSB0YWJsZXJvd3MgaW4gZ2FtZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5jbGVhckZpZWxkID0gZnVuY3Rpb24oKSB7XG4gICAgLy9jbGVhciBmaWVsZFxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRyXCIpO1xuICAgIHZhciB0ZHM7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKTtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGNsYXNzZXNcbiAgICAgICAgICAgIHRkc1tjb2xdLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmaW5kIHRoZSBmdWxscm93cyBvbiB0aGUgZmllbGRcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmluZEZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XG4gICAgLy9maW5kIGZ1bGwgcm93c1xuICAgIHZhciBmdWxsID0gZmFsc2U7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGggLSAxOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93XS5pbmRleE9mKDApID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vcm93IGlzIGZ1bGxcbiAgICAgICAgICAgICAgICBmdWxsID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmdWxsKSB7XG4gICAgICAgICAgICAvL2FkZCB0aGVtIHRvIHRoZSBhcnJheSBvcyBmdWxsIHJvd3NcbiAgICAgICAgICAgIHRoaXMuZnVsbFJvd3MucHVzaChyb3cpO1xuICAgICAgICAgICAgdGhpcy5yb3dDb3VudCArPSAxO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5yb3dDb3VudCAlIDUgPT09IDAgJiYgdGhpcy5mYWxsU3BlZWQgPiAxNTApIHtcbiAgICAgICAgICAgICAgICAvL3NwZWVkIHVwIHRoZSBnYW1lXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsU3BlZWQgLT0gMzU7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXZlbCArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGFtaW5hdGUgdGhlIGZ1bGwgcm93c1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5hbmltYXRlRnVsbFJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQtYm9keSB0clwiKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mdWxsUm93cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0cnNbdGhpcy5mdWxsUm93c1tpXV0uY2xhc3NMaXN0LmFkZChcImZ1bGwtcm93XCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZXJhc2UgdGhlIGZ1bGwgcm93cyBmcm9tIGZpZWxkXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmVyYXNlRnVsbFJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5GWHNvdW5kcykge1xuICAgICAgICAvL3BsYXkgc291bmRcbiAgICAgICAgaWYgKHRoaXMuZnVsbFJvd3MubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICB0aGlzLmZvdXJSb3dTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmZvdXJSb3dTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbmVTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnVsbFJvd3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgLy9yZW1vdmUgdGhlIGZ1bGwgcm93IGZyb20gZmllbGRcbiAgICAgICAgdGhpcy5maWVsZC5zcGxpY2UodGhpcy5mdWxsUm93c1tpXSwgMSk7XG5cbiAgICAgICAgLy9hZGQgYSBuZXcgZW1wdHkgb24gdG9wIG9mIGZpZWxkXG4gICAgICAgIHZhciBuZXdSb3cgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG5cbiAgICAgICAgLy9hZGQgaXQgdG8gdGhlIGJlZ2lubmluZyBvZiBhcnJheVxuICAgICAgICB0aGlzLmZpZWxkLnVuc2hpZnQobmV3Um93KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNvdW50IHRoZSBwb2ludHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdGhlIG5ldyBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY291bnRSb3dQb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLzEwMHAgZm9yIG9uZSByb3csIGFkZCBhZGRpdGlvbmFsIDIwJSBwZXIgZXh0cmEgcm93XG4gICAgcmV0dXJuIHRoaXMuYmFzZVBvaW50cyArICgodGhpcy5mdWxsUm93cy5sZW5ndGggLSAxKSAqIHRoaXMuYmFzZVBvaW50cykgKiAxLjI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBnYW1lYm9hcmRcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgdHI7XG4gICAgdmFyIHRkO1xuXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpO1xuXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodHIpO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGluaXRpYWxpemUgdGhlIGZpZWxkLWFycmF5XG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmluaXRGaWVsZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZmllbGQgPSBbXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF07XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGFuaW1hdGUgbmV3IHBvaW50c1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5hbmltYXRlTmV3UG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xuXG4gICAgZWxlbS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLW5ldy1wb2ludHNcIik7XG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLmNsZWFyTmV3UG9pbnRzQW5pbWF0aW9uLmJpbmQodGhpcyksIDU1MCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgY2xhc3Mgc2V0IGJ5IHRoZSBhbmltYXRlIG5ldyBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXdQb2ludHNBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWxlbSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIik7XG5cbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJ0ZXRyaXMtbmV3LXBvaW50c1wiKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdG9nZ2xlIHRoZSBzb3VuZHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuc291bmRUb2dnbGUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT09IFwidGV0cmlzLW11c2ljLXRvZ2dsZVwiKSB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKFwic291bmRzXCIpO1xuICAgICAgICB0aGlzLkJHc291bmRzID0gIXRoaXMuQkdzb3VuZHM7XG5cbiAgICAgICAgLy9kYXZlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJCR3NvdW5kc1wiLCB0aGlzLkJHc291bmRzKTtcblxuICAgICAgICBpZiAodGhpcy5CR3NvdW5kcyAmJiB0aGlzLmFsaXZlKSB7XG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iZ011c2ljLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PT0gXCJ0ZXRyaXMtc291bmQtdG9nZ2xlXCIpIHtcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoXCJzb3VuZHNcIik7XG4gICAgICAgIHRoaXMuRlhzb3VuZHMgPSAhdGhpcy5GWHNvdW5kcztcblxuICAgICAgICAvL3NhdmUgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkZYc291bmRzXCIsIHRoaXMuRlhzb3VuZHMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgZGVtby1nYW1lIGZvciBwcmVzZW50YXRpb25cbiAqXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmRlbW9HYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5maWVsZCA9IFtcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgICBbMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMF0sXG4gICAgICAgIFsxLCAxLCAxLCAwLCAxLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDBdXG4gICAgXTtcblxuICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IElCbG9ja1NoYXBlKCk7XG4gICAgdGhpcy5jbGVhck5leHRCbG9jaygpO1xuICAgIHRoaXMucmVuZGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0dhbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNSwgNSwgMF0sXHJcbiAgICAgICAgICAgIFswLCA1LCA1XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNV0sXHJcbiAgICAgICAgICAgIFs1LCA1XSxcclxuICAgICAgICAgICAgWzUsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs1LCA1LCAwXSxcclxuICAgICAgICAgICAgWzAsIDUsIDVdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA1XSxcclxuICAgICAgICAgICAgWzUsIDVdLFxyXG4gICAgICAgICAgICBbNSwgMF1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU0Jsb2NrU2hhcGU7XHJcbiJdfQ==

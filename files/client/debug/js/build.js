(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var buttonClick = require("./buttonclick");
var gameboyResize = require("./gameboyResize");
var powerOn = require("./poweron");

buttonClick.aandb();
gameboyResize.sizer();
powerOn.startUp();

var Tetris = require("./tetris/TetrisApplication");

var t = new Tetris();
t.init();

},{"./buttonclick":2,"./gameboyResize":3,"./poweron":4,"./tetris/TetrisApplication":11}],2:[function(require,module,exports){
function aandb() {
  var abutton = document.querySelector(".a-button");
  var bbutton = document.querySelector(".b-button");
  var start = document.querySelector(".start");
  var updown = document.querySelector(".up-down-btn");
  var left = document.querySelector(".left-part");
  var right = document.querySelector(".right-part");
  var up = document.querySelector(".up-part");
  var down = document.querySelector(".down-part");
  var leftright = document.querySelector(".left-right-btn");
  var shadowDown = "0px 0px 0px 0px rgba(160, 0, 20, 1)";

  function buttonColor(upordown) {
    return "10px solid rgba(87, 71, 71, " + upordown + ")";
  }

  function abColor(upordown) {
    return "rgba(87, 71, 71, " + upordown + ")";
  }

  function shadowColor(up) {
    return "" + up + "px 3px 0px 0px rgba(160, 0, 20, 1)";
  }


  window.addEventListener("keydown", function(event) {

    switch (event.keyCode) {
      case 40:
        down.style.boxShadow = shadowDown;
        updown.children[2].style.borderTop = buttonColor(0.85);
        break;

      case 38:
        up.style.boxShadow = shadowDown;
        updown.children[0].style.borderBottom = buttonColor(0.85);
        break;

      case 39:
        right.style.boxShadow = shadowDown;
        leftright.children[1].style.borderLeft = buttonColor(0.85);
        break;

      case 37:
        left.style.boxShadow = shadowDown;
        leftright.children[0].style.borderRight = buttonColor(0.85);
        break;

      case 13:
        start.classList.add("start-button-no-shadow");
        break;

      case 66:
        bbutton.classList.add("b-button-no-shadow");
        bbutton.firstElementChild.style.color = abColor(0.85);
        break;

      case 65:
        abutton.classList.add("a-button-no-shadow");
        abutton.firstElementChild.style.color = abColor(0.85);
        break;
    }

  });

  window.addEventListener("keyup", function(event) {

    switch (event.keyCode) {
      case 40:
        down.style.boxShadow = shadowColor(2);
        updown.children[2].style.borderTop = buttonColor(0.55);
        break;

      case 38:
        up.style.boxShadow = shadowColor(4);
        updown.children[0].style.borderBottom = buttonColor(0.55);
        break;

      case 39:
        right.style.boxShadow = shadowColor(2);
        leftright.children[1].style.borderLeft = buttonColor(0.55);
        break;

      case 37:
        left.style.boxShadow = shadowColor(3);
        leftright.children[0].style.borderRight = buttonColor(0.55);
        break;

      case 13:
        start.classList.remove("start-button-no-shadow");
        break;

      case 66:
        bbutton.classList.remove("b-button-no-shadow");
        bbutton.firstElementChild.style.color = abColor(0.55);
        break;

      case 65:
        abutton.classList.remove("a-button-no-shadow");
        abutton.firstElementChild.style.color = abColor(0.55);
        break;
    }

  });

}

module.exports.aandb = aandb;

},{}],3:[function(require,module,exports){
function setGameboySize() {
  var windowHeight = window.innerHeight;
  var gameboy = document.querySelector(".gameboy-main");

  var calculateZoom = windowHeight/(gameboy.clientHeight + 35);
  gameboy.style.transform = "scale(" + calculateZoom + ")";

}

function sizer() {
    window.addEventListener("load", setGameboySize);
    window.addEventListener("resize", setGameboySize);
}

module.exports.sizer = sizer;

},{}],4:[function(require,module,exports){
function startUp() {
  var redled = document.querySelector(".power-led");

  window.addEventListener("load", function() {
    redled.style.opacity = "1";
  });
}

module.exports.startUp = startUp;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./TetrisGame":12}],12:[function(require,module,exports){
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
                tds[col].classList.add("tetris-block-part", "color-" + this.field[row][col]);
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
    var div;

    for (var row = 0; row < this.field.length; row += 1) {
        tr = document.createElement("tr");

        for (var col = 0; col < this.field[row].length; col += 1) {
            div = document.createElement("div");
            td = document.createElement("td");
            td.appendChild(div);
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

},{"./IBlockShape":5,"./JBlockShape":6,"./LBlockShape":7,"./SBlockShape":8,"./SquareBlockShape":9,"./TBlockShape":10,"./ZBlockShape":13}],13:[function(require,module,exports){
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
            [5, 5],
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9idXR0b25jbGljay5qcyIsImNsaWVudC9zb3VyY2UvanMvZ2FtZWJveVJlc2l6ZS5qcyIsImNsaWVudC9zb3VyY2UvanMvcG93ZXJvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0lCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSkJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9MQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1NCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU3F1YXJlQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVGV0cmlzQXBwbGljYXRpb24uanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNHYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvWkJsb2NrU2hhcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy8wQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGJ1dHRvbkNsaWNrID0gcmVxdWlyZShcIi4vYnV0dG9uY2xpY2tcIik7XG52YXIgZ2FtZWJveVJlc2l6ZSA9IHJlcXVpcmUoXCIuL2dhbWVib3lSZXNpemVcIik7XG52YXIgcG93ZXJPbiA9IHJlcXVpcmUoXCIuL3Bvd2Vyb25cIik7XG5cbmJ1dHRvbkNsaWNrLmFhbmRiKCk7XG5nYW1lYm95UmVzaXplLnNpemVyKCk7XG5wb3dlck9uLnN0YXJ0VXAoKTtcblxudmFyIFRldHJpcyA9IHJlcXVpcmUoXCIuL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvblwiKTtcblxudmFyIHQgPSBuZXcgVGV0cmlzKCk7XG50LmluaXQoKTtcbiIsImZ1bmN0aW9uIGFhbmRiKCkge1xuICB2YXIgYWJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYS1idXR0b25cIik7XG4gIHZhciBiYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5iLWJ1dHRvblwiKTtcbiAgdmFyIHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zdGFydFwiKTtcbiAgdmFyIHVwZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXAtZG93bi1idG5cIik7XG4gIHZhciBsZWZ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sZWZ0LXBhcnRcIik7XG4gIHZhciByaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmlnaHQtcGFydFwiKTtcbiAgdmFyIHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi51cC1wYXJ0XCIpO1xuICB2YXIgZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG93bi1wYXJ0XCIpO1xuICB2YXIgbGVmdHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sZWZ0LXJpZ2h0LWJ0blwiKTtcbiAgdmFyIHNoYWRvd0Rvd24gPSBcIjBweCAwcHggMHB4IDBweCByZ2JhKDE2MCwgMCwgMjAsIDEpXCI7XG5cbiAgZnVuY3Rpb24gYnV0dG9uQ29sb3IodXBvcmRvd24pIHtcbiAgICByZXR1cm4gXCIxMHB4IHNvbGlkIHJnYmEoODcsIDcxLCA3MSwgXCIgKyB1cG9yZG93biArIFwiKVwiO1xuICB9XG5cbiAgZnVuY3Rpb24gYWJDb2xvcih1cG9yZG93bikge1xuICAgIHJldHVybiBcInJnYmEoODcsIDcxLCA3MSwgXCIgKyB1cG9yZG93biArIFwiKVwiO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhZG93Q29sb3IodXApIHtcbiAgICByZXR1cm4gXCJcIiArIHVwICsgXCJweCAzcHggMHB4IDBweCByZ2JhKDE2MCwgMCwgMjAsIDEpXCI7XG4gIH1cblxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIDQwOlxuICAgICAgICBkb3duLnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0Rvd247XG4gICAgICAgIHVwZG93bi5jaGlsZHJlblsyXS5zdHlsZS5ib3JkZXJUb3AgPSBidXR0b25Db2xvcigwLjg1KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzg6XG4gICAgICAgIHVwLnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0Rvd247XG4gICAgICAgIHVwZG93bi5jaGlsZHJlblswXS5zdHlsZS5ib3JkZXJCb3R0b20gPSBidXR0b25Db2xvcigwLjg1KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzk6XG4gICAgICAgIHJpZ2h0LnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0Rvd247XG4gICAgICAgIGxlZnRyaWdodC5jaGlsZHJlblsxXS5zdHlsZS5ib3JkZXJMZWZ0ID0gYnV0dG9uQ29sb3IoMC44NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM3OlxuICAgICAgICBsZWZ0LnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0Rvd247XG4gICAgICAgIGxlZnRyaWdodC5jaGlsZHJlblswXS5zdHlsZS5ib3JkZXJSaWdodCA9IGJ1dHRvbkNvbG9yKDAuODUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAxMzpcbiAgICAgICAgc3RhcnQuY2xhc3NMaXN0LmFkZChcInN0YXJ0LWJ1dHRvbi1uby1zaGFkb3dcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDY2OlxuICAgICAgICBiYnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJiLWJ1dHRvbi1uby1zaGFkb3dcIik7XG4gICAgICAgIGJidXR0b24uZmlyc3RFbGVtZW50Q2hpbGQuc3R5bGUuY29sb3IgPSBhYkNvbG9yKDAuODUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA2NTpcbiAgICAgICAgYWJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiYS1idXR0b24tbm8tc2hhZG93XCIpO1xuICAgICAgICBhYnV0dG9uLmZpcnN0RWxlbWVudENoaWxkLnN0eWxlLmNvbG9yID0gYWJDb2xvcigwLjg1KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIH0pO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSA0MDpcbiAgICAgICAgZG93bi5zdHlsZS5ib3hTaGFkb3cgPSBzaGFkb3dDb2xvcigyKTtcbiAgICAgICAgdXBkb3duLmNoaWxkcmVuWzJdLnN0eWxlLmJvcmRlclRvcCA9IGJ1dHRvbkNvbG9yKDAuNTUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzODpcbiAgICAgICAgdXAuc3R5bGUuYm94U2hhZG93ID0gc2hhZG93Q29sb3IoNCk7XG4gICAgICAgIHVwZG93bi5jaGlsZHJlblswXS5zdHlsZS5ib3JkZXJCb3R0b20gPSBidXR0b25Db2xvcigwLjU1KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzk6XG4gICAgICAgIHJpZ2h0LnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0NvbG9yKDIpO1xuICAgICAgICBsZWZ0cmlnaHQuY2hpbGRyZW5bMV0uc3R5bGUuYm9yZGVyTGVmdCA9IGJ1dHRvbkNvbG9yKDAuNTUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzNzpcbiAgICAgICAgbGVmdC5zdHlsZS5ib3hTaGFkb3cgPSBzaGFkb3dDb2xvcigzKTtcbiAgICAgICAgbGVmdHJpZ2h0LmNoaWxkcmVuWzBdLnN0eWxlLmJvcmRlclJpZ2h0ID0gYnV0dG9uQ29sb3IoMC41NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDEzOlxuICAgICAgICBzdGFydC5jbGFzc0xpc3QucmVtb3ZlKFwic3RhcnQtYnV0dG9uLW5vLXNoYWRvd1wiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNjY6XG4gICAgICAgIGJidXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImItYnV0dG9uLW5vLXNoYWRvd1wiKTtcbiAgICAgICAgYmJ1dHRvbi5maXJzdEVsZW1lbnRDaGlsZC5zdHlsZS5jb2xvciA9IGFiQ29sb3IoMC41NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDY1OlxuICAgICAgICBhYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhLWJ1dHRvbi1uby1zaGFkb3dcIik7XG4gICAgICAgIGFidXR0b24uZmlyc3RFbGVtZW50Q2hpbGQuc3R5bGUuY29sb3IgPSBhYkNvbG9yKDAuNTUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgfSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMuYWFuZGIgPSBhYW5kYjtcbiIsImZ1bmN0aW9uIHNldEdhbWVib3lTaXplKCkge1xuICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICB2YXIgZ2FtZWJveSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJveS1tYWluXCIpO1xuXG4gIHZhciBjYWxjdWxhdGVab29tID0gd2luZG93SGVpZ2h0LyhnYW1lYm95LmNsaWVudEhlaWdodCArIDM1KTtcbiAgZ2FtZWJveS5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKFwiICsgY2FsY3VsYXRlWm9vbSArIFwiKVwiO1xuXG59XG5cbmZ1bmN0aW9uIHNpemVyKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBzZXRHYW1lYm95U2l6ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgc2V0R2FtZWJveVNpemUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zaXplciA9IHNpemVyO1xuIiwiZnVuY3Rpb24gc3RhcnRVcCgpIHtcbiAgdmFyIHJlZGxlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucG93ZXItbGVkXCIpO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICByZWRsZWQuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMuc3RhcnRVcCA9IHN0YXJ0VXA7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIElCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzYsIDYsIDYsIDZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNiwgNiwgNiwgNl1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtNCxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSUJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gSkJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAxXSxcclxuICAgICAgICAgICAgWzAsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDAsIDBdLFxyXG4gICAgICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMF0sXHJcbiAgICAgICAgICAgIFsxLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMSwgMV0sXHJcbiAgICAgICAgICAgIFswLCAwLCAxXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0zLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIExCbG9ja1NoYXBlKCkge1xuICAgIHRoaXMuc2hhcGVzID0gW1xuICAgICAgICBbXG4gICAgICAgICAgICBbMiwgMF0sXG4gICAgICAgICAgICBbMiwgMF0sXG4gICAgICAgICAgICBbMiwgMl1cbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgWzAsIDAsIDJdLFxuICAgICAgICAgICAgWzIsIDIsIDJdXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsyLCAyXSxcbiAgICAgICAgICAgIFswLCAyXSxcbiAgICAgICAgICAgIFswLCAyXVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBbMiwgMiwgMl0sXG4gICAgICAgICAgICBbMiwgMCwgMF1cbiAgICAgICAgXVxuICAgIF07XG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XG4gICAgdGhpcy50b3BMZWZ0ID0ge1xuICAgICAgICByb3c6IC0zLFxuICAgICAgICBjb2w6IDRcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExCbG9ja1NoYXBlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBTQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDQsIDRdLFxyXG4gICAgICAgICAgICBbNCwgNCwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzQsIDBdLFxyXG4gICAgICAgICAgICBbNCwgNF0sXHJcbiAgICAgICAgICAgIFswLCA0XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNCwgNF0sXHJcbiAgICAgICAgICAgIFs0LCA0LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNCwgMF0sXHJcbiAgICAgICAgICAgIFs0LCA0XSxcclxuICAgICAgICAgICAgWzAsIDRdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNxdWFyZUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNxdWFyZUJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gVEJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAzLCAwXSxcclxuICAgICAgICAgICAgWzMsIDMsIDNdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFszLCAwXSxcclxuICAgICAgICAgICAgWzMsIDNdLFxyXG4gICAgICAgICAgICBbMywgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDMsIDNdLFxyXG4gICAgICAgICAgICBbMCwgMywgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDNdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0yLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUZXRyaXNHYW1lID0gcmVxdWlyZShcIi4vVGV0cmlzR2FtZVwiKTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHRldHJpcy1hcHBcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUZXRyaXNBcHBsaWNhdGlvbigpIHtcbiAgICB0aGlzLmdhbWUgPSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogSW5pdCB0aGUgYmFzaWNzXG4gKi9cblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy90aGlzLnByaW50KCk7XG4gICAgLy9jcmVhdGUgbmV3IGdhbWVcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZnJvbnQtc2NyZWVuXCIpO1xuICAgIHRoaXMuZ2FtZSA9IG5ldyBUZXRyaXNHYW1lKGVsZW0pO1xuICAgIHRoaXMuZ2FtZS5pbml0KCk7XG5cbiAgICAvL2FkZCBldmVudGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlJbnB1dC5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBjbGlja3NcbiAqL1xuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQuY2xhc3NMaXN0WzBdKTtcbiAgICB2YXIga2V5ID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdFswXTtcblxuICAgIC8vSWYgZ2FtZSBpcyBcImFsaXZlXCIgYW5kIG5vdCBwYXVzZWQsIGNhbGwgdGhlIGNvcnJlY3QgZnVuY3Rpb25zIGluIGdhbWVcbiAgICBpZiAodGhpcy5nYW1lLmFsaXZlICYmICF0aGlzLmdhbWUucGF1c2VkKSB7XG4gICAgICAgIHRoaXMuaW5wdXRUb0dhbWVIYW5kbGVyKGtleSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoa2V5ID09PSBcInN0YXJ0XCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWUucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJlc3VtZUdhbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGtleS1pbnB1dHNcbiAqL1xuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIga2V5ID0gZXZlbnQua2V5Q29kZTtcblxuICAgIC8vSWYgZ2FtZSBpcyBcImFsaXZlXCIgYW5kIG5vdCBwYXVzZWQsIGNhbGwgdGhlIGNvcnJlY3QgZnVuY3Rpb25zIGluIGdhbWVcbiAgICBpZiAodGhpcy5nYW1lLmFsaXZlICYmICF0aGlzLmdhbWUucGF1c2VkKSB7XG4gICAgICAgIHRoaXMuaW5wdXRUb0dhbWVIYW5kbGVyKGtleSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoa2V5ID09PSAxMykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2FtZS5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lR2FtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5wdXRUb0dhbWVIYW5kbGVyID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgY2FzZSBcImFycm93LWxlZnRcIjoge1xuICAgICAgICAgICAgLy9sZWZ0XG4gICAgICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygtMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMzk6XG4gICAgICAgIGNhc2UgXCJhcnJvdy1yaWdodFwiOiB7XG4gICAgICAgICAgICAvL3JpZ2h0XG4gICAgICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAzODpcbiAgICAgICAgY2FzZSBcImFycm93LXVwXCI6XG4gICAgICAgIGNhc2UgXCJhLWJ1dHRvbi1sYWJlbFwiOiB7XG4gICAgICAgICAgICAvL3VwXG4gICAgICAgICAgICB0aGlzLmdhbWUucm90YXRlRmFsbGluZ0Jsb2NrKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDQwOlxuICAgICAgICBjYXNlIFwiYXJyb3ctZG93blwiOiB7XG4gICAgICAgICAgICAvL2Rvd25cbiAgICAgICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2soKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgY2FzZSBcImItYnV0dG9uLWxhYmVsXCI6IHtcbiAgICAgICAgICAgIC8vc3BhY2VcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2tUb0JvdHRvbSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDEzOlxuICAgICAgICBjYXNlIFwic3RhcnRcIjoge1xuICAgICAgICAgICAgLy9lbnRlclxuICAgICAgICAgICAgdGhpcy5nYW1lLnBhdXNlR2FtZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLyogZm9yIGRldi1zaG93Y2FzZVxuICAgICAgICBjYXNlIDY4OiB7XG4gICAgICAgICAgICAvL2RcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5kZW1vR2FtZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0qL1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZGVzdHJveSB0aGUgYXBwXG4gKi9cblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZ2FtZS5mYWxsaW5nQmxvY2tJbnRlcnZhbCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmdhbWUuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdhbWUuYmdNdXNpYykge1xuICAgICAgICAvL3N0b3AgYmFja2dyb3VuZCBtdXNpY1xuICAgICAgICB0aGlzLmdhbWUuYmdNdXNpYy5wYXVzZSgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGV0cmlzQXBwbGljYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBKQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL0pCbG9ja1NoYXBlXCIpO1xudmFyIExCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vTEJsb2NrU2hhcGVcIik7XG52YXIgU0Jsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9TQmxvY2tTaGFwZVwiKTtcbnZhciBaQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1pCbG9ja1NoYXBlXCIpO1xudmFyIElCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vSUJsb2NrU2hhcGVcIik7XG52YXIgU3F1YXJlQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1NxdWFyZUJsb2NrU2hhcGVcIik7XG52YXIgVEJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9UQmxvY2tTaGFwZVwiKTtcbi8qKlxuICogVG8gY3JlYXRlIHRoaXMgbW9kdWxlIEkgaGF2ZSByZWFkIHRoZSBmb2xsb3dpbmcgZ3VpZGU6XG4gKiBodHRwOi8vZ2FtZWRldmVsb3BtZW50LnR1dHNwbHVzLmNvbS90dXRvcmlhbHMvaW1wbGVtZW50aW5nLXRldHJpcy1jb2xsaXNpb24tZGV0ZWN0aW9uLS1nYW1lZGV2LTg1MlxuICovXG5cbi8qKlxuICogQ29udHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHRldHJpcyBnYW1lXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBkb20tZWxlbWVudCB0byBiZSBwcmludGVkIHRvXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGV0cmlzR2FtZShlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmZhbGxpbmdCbG9jayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmZpZWxkID0gW107XG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuZnVsbFJvd3MgPSBbXTtcbiAgICB0aGlzLmJhc2VQb2ludHMgPSAxMDA7XG4gICAgdGhpcy5mYWxsU3BlZWQgPSA2MDA7XG4gICAgdGhpcy5sZXZlbCA9IDE7XG4gICAgdGhpcy5yb3dDb3VudCA9IDA7XG4gICAgdGhpcy5wb2ludHMgPSAwO1xuICAgIHRoaXMuaGlnaFNjb3JlID0gMDtcbiAgICB0aGlzLm5leHRCbG9jayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuRlhzb3VuZHMgPSBmYWxzZTtcbiAgICB0aGlzLkJHc291bmRzID0gZmFsc2U7XG4gICAgdGhpcy5iZ011c2ljID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy90ZXRyaXMubXAzXCIpO1xuICAgIHRoaXMucm90YXRlU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL3JvdGF0ZS1ibG9jay5tcDNcIik7XG4gICAgdGhpcy5sYW5kU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL2xhbmQtYmxvY2subXAzXCIpO1xuICAgIHRoaXMubGluZVNvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9saW5lLXJlbW92ZS5tcDNcIik7XG4gICAgdGhpcy5tb3ZlU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL21vdmUtYmxvY2subXAzXCIpO1xuICAgIHRoaXMuZ2FtZW92ZXJTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvZ2FtZS1vdmVyLm1wM1wiKTtcbiAgICB0aGlzLmZvdXJSb3dTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvZm91ci1yb3dzLm1wM1wiKTtcblxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZWQgdGhlIGJhc2ljcyBvZiB0aGUgbW9kdWxlXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmluaXRGaWVsZCgpO1xuICAgIHRoaXMucHJpbnQoKTtcblxuICAgIC8vYWRkIGxpc3RlbmVyIHRvIHBhdXNlIGlmIGZvY3VzIGlzIGxvc3RcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgdGhpcy5wYXVzZUdhbWUuYmluZCh0aGlzKSk7XG5cbiAgICAvL2FkZCBsaXN0ZW5lciBmb3IgdGhlIHNvdW5kcyB0b2dnbGVcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtc2lkZS1pbmZvXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNvdW5kVG9nZ2xlLmJpbmQodGhpcykpO1xuXG4gICAgLy9yZWFkIHNvdW5kLXNldHRpbmdzIGZyb20gbG9jYWxcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJGWHNvdW5kc1wiKSkge1xuICAgICAgICB2YXIgRlhzb3VuZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkZYc291bmRzXCIpO1xuICAgICAgICBpZiAoRlhzb3VuZHMgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICB0aGlzLkZYc291bmRzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI3RldHJpcy1zb3VuZC10b2dnbGVcIikuY2xhc3NMaXN0LmFkZChcInNvdW5kc1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkJHc291bmRzXCIpKSB7XG4gICAgICAgIHZhciBCR3NvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiQkdzb3VuZHNcIik7XG4gICAgICAgIGlmIChCR3NvdW5kcyA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIHRoaXMuQkdzb3VuZHMgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV0cmlzLW11c2ljLXRvZ2dsZVwiKS5jbGFzc0xpc3QuYWRkKFwic291bmRzXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwYXVzZSB0aGUgZ2FtZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5wYXVzZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5CR3NvdW5kcykge1xuICAgICAgICAvL3BsYXkgYmFja2dyb3VuZCBtdXNpY1xuICAgICAgICB0aGlzLmJnTXVzaWMucGF1c2UoKTtcbiAgICB9XG5cbiAgICAvL3BhdXNlIHRoZSBnYW1lXG4gICAgaWYgKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgJiYgdGhpcy5hbGl2ZSkge1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVzdW1lIHRoZSBnYW1lXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJlc3VtZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5CR3NvdW5kcykge1xuICAgICAgICAvL3BsYXkgYmFja2dyb3VuZCBtdXNpY1xuICAgICAgICB0aGlzLmJnTXVzaWMucGxheSgpO1xuICAgIH1cblxuICAgIC8vc3RhcnQgdGhlIGRyb3AtaW50ZXJ2YWwgYWdhaW5cbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuZmFsbEJsb2NrLmJpbmQodGhpcyksIHRoaXMuZmFsbFNwZWVkKTtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wYXVzZWRcIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG59O1xuXG4vKipcbiAqIFN0YXJ0IHRoZSBnYW1lXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpIHtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgLy9zZXQgYWxsIHRoZSB2YXJpYWJsZXMgdG8gdGhlIHN0YXJ0LXN0YXRlXG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XG4gICAgdGhpcy5sZXZlbCA9IDE7XG4gICAgdGhpcy5wb2ludHMgPSAwO1xuICAgIHRoaXMuZmFsbFNwZWVkID0gNjAwO1xuICAgIHRoaXMucm93Q291bnQgPSAwO1xuICAgIHRoaXMucmVhZEhpZ2hTY29yZSgpO1xuXG4gICAgLy9tYWtlIHN1cmUgdGhlIGNsYXNzZXMgaXMgcmVzZXR0ZWRcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJnYW1lLW92ZXJcIik7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwibmV3LWhpZ2hzY29yZVwiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1zcGxhc2gtc2NyZWVuXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXG4gICAgLy9ydW4gYWxsIHRoZSBmdW5jdGlvbnMgdG8gbWFrZSB0aGUgbWFnaWMgaGFwcGVuXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLmluaXRGaWVsZCgpO1xuICAgIHRoaXMuY2xlYXJGaWVsZCgpO1xuICAgIHRoaXMucmVuZGVyUG9pbnRzKCk7XG4gICAgdGhpcy5uZXdOZXh0QmxvY2soKTtcbiAgICB0aGlzLmRyb3BOZXdCbG9jaygpO1xuICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICBpZiAodGhpcy5CR3NvdW5kcykge1xuICAgICAgICAvL3BsYXkgYmFja2dyb3VuZCBtdXNpY1xuICAgICAgICB0aGlzLmJnTXVzaWMucGxheSgpO1xuICAgICAgICB0aGlzLmJnTXVzaWMuYWRkRXZlbnRMaXN0ZW5lcihcImVuZGVkXCIsIHRoaXMucGxheUJhY2tncm91bmRNdXNpYy5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxufTtcblxuVGV0cmlzR2FtZS5wcm90b3R5cGUucGxheUJhY2tncm91bmRNdXNpYyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmdNdXNpYy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy5iZ011c2ljLnBsYXkoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVhZCB0aGUgaGlnaCBzY29yZSBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVhZEhpZ2hTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRldHJpcy1oc1wiKSkge1xuICAgICAgICB0aGlzLmhpZ2hTY29yZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidGV0cmlzLWhzXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gc2F2ZSB0aGUgaGlnaCBzY29yZSB0byBsb2NhbCBzdG9yYWdlXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnNhdmVIaWdoU2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wb2ludHMgPiB0aGlzLmhpZ2hTY29yZSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRldHJpcy1oc1wiLCB0aGlzLnBvaW50cyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmYWxsIHRoZSBibG9jayBvbmUgcm93IGRvd25cbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmFsbEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuaXNGYWxsYWJsZSgpKSB7XG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ICs9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvL2Jsb2NrIGhhcyBjb2xsaWRlZCwgbGFuZCB0aGUgYmxvY2sgYW5kIGRyb3AgbmV3XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLmxhbmRGYWxsaW5nQmxvY2soKTtcbiAgICAgICAgdGhpcy5kcm9wTmV3QmxvY2soKTtcbiAgICB9XG5cbiAgICAvL3JlbmRlciB0aGUgY2hhbmdlXG4gICAgdGhpcy5yZW5kZXIoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZmFsbCBibG9jayB0byBib3R0b20gZGlyZWN0bHlcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmFsbEJsb2NrVG9Cb3R0b20gPSBmdW5jdGlvbigpIHtcbiAgICB3aGlsZSAodGhpcy5pc0ZhbGxhYmxlKCkpIHtcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKz0gMTtcbiAgICB9XG5cbiAgICAvL3JlbmRlciB0aGUgY2hhbmdlXG4gICAgdGhpcy5yZW5kZXIoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmFuZG9taXplIGEgbmV3IGJsb2NrXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLm5ld05leHRCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaGFwZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xuXG4gICAgLy9jcmVhdGUgbmV3IGJsb2NrIGZyb20gdGhlIHJhbmRvbSBudW1iZXJcbiAgICBzd2l0Y2ggKHNoYXBlKSB7XG4gICAgICAgIGNhc2UgMDoge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgSkJsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAxOiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBMQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDI6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFNCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMzoge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgWkJsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSA0OiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBJQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDU6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFNxdWFyZUJsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSA2OiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBUQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRyb3AgbmV3IGJsb2NrXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmRyb3BOZXdCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZ2V0IHRoZSBibG9jayBmcm9tIG5leHQtYmxvY2tcbiAgICB0aGlzLmZhbGxpbmdCbG9jayA9IHRoaXMubmV4dEJsb2NrO1xuXG4gICAgLy9nZXQgYSBuZXcgbmV4dCBibG9ja1xuICAgIHRoaXMuY2xlYXJOZXh0QmxvY2soKTtcbiAgICB0aGlzLm5ld05leHRCbG9jaygpO1xuXG4gICAgLy9hZGQgZmFsbGludGVydmFsIHdpdGggY3VycmVudCBzcGVlZFxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5mYWxsQmxvY2suYmluZCh0aGlzKSwgdGhpcy5mYWxsU3BlZWQpO1xuXG4gICAgaWYgKCF0aGlzLmlzRmFsbGFibGUoKSkge1xuICAgICAgICAvL3RoZSBuZXcgYmxvY2sgY29sbGlkZWQgYXQgbGF1bmNoLCBnYW1lIG92ZXJcbiAgICAgICAgdGhpcy5zYXZlSGlnaFNjb3JlKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuY2xhc3NMaXN0LmFkZChcImdhbWUtb3ZlclwiKTtcbiAgICAgICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcblxuICAgICAgICBpZiAodGhpcy5CR3NvdW5kcykge1xuICAgICAgICAgICAgLy9zdG9wIGJhY2tncm91bmQgbXVzaWNcbiAgICAgICAgICAgIHRoaXMuYmdNdXNpYy5wYXVzZSgpO1xuICAgICAgICAgICAgdGhpcy5iZ011c2ljLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMucGxheUdhbWVPdmVyU291bmQuYmluZCh0aGlzKSwgNTAwKTtcbiAgICB9XG59O1xuXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5wbGF5R2FtZU92ZXJTb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLkZYc291bmRzKSB7XG4gICAgICAgIC8vcGxheSBnYW1lb3ZlciBzb3VuZFxuICAgICAgICB0aGlzLmdhbWVvdmVyU291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB0aGlzLmdhbWVvdmVyU291bmQucGxheSgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbGFuZCB0aGUgZmFsbGluZyBibG9jayB0byB0aGUgZmllbGRcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUubGFuZEZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLkZYc291bmRzKSB7XG4gICAgICAgIC8vcGxheSBzb3VuZFxuICAgICAgICB0aGlzLmxhbmRTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIHRoaXMubGFuZFNvdW5kLnBsYXkoKTtcbiAgICB9XG5cbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xuXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAocm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gPSBzaGFwZVtyb3ddW2NvbF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9yZXNldCB0aGUgZnVsbFJvd3MgYXJyYXlcbiAgICB0aGlzLmZ1bGxSb3dzID0gW107XG5cbiAgICAvL2NoZWNrIGlmIHRoZXJlIGFyZSBmdWxsIHJvd3MgYWZ0ZXIgbGFuZGluZ1xuICAgIHRoaXMuZmluZEZ1bGxSb3dzKCk7XG5cbiAgICBpZiAodGhpcy5mdWxsUm93cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vY2FsbCBmdW5jdGlvbiB0byBtYWtlIGFuaW1hdGlvbnNcbiAgICAgICAgdGhpcy5hbmltYXRlRnVsbFJvd3MoKTtcblxuICAgICAgICAvL2VyYXNlIHRoZSBhbmltYXRpb25cbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5jbGVhckFuaW1hdGlvbi5iaW5kKHRoaXMpLCA2MDApO1xuXG4gICAgICAgIC8vZXJhc2UgdGhlIHJvd3NcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5lcmFzZUZ1bGxSb3dzLmJpbmQodGhpcyksIDM1MCk7XG5cbiAgICAgICAgLy9jb3VudCBwb2ludHNcbiAgICAgICAgdGhpcy5wb2ludHMgKz0gdGhpcy5jb3VudFJvd1BvaW50cygpO1xuXG4gICAgICAgIC8vaWYgbmV3IEhTIGFkZCBjbGFzcyB0byBzaG93IGl0IHRvIHRoZSB1c2VyXG4gICAgICAgIGlmICh0aGlzLnBvaW50cyA+IHRoaXMuaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpLmNsYXNzTGlzdC5hZGQoXCJuZXctaGlnaHNjb3JlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9yZXNldCB0aGUgZnVsbFJvd3MgYXJyYXlcbiAgICAgICAgLy90aGlzLmZ1bGxSb3dzID0gW107XG5cbiAgICAgICAgLy9yZW5kZXIgdGhlIHBvaW50c1xuICAgICAgICB0aGlzLnJlbmRlclBvaW50cygpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZXJhc2UgYW5pbWF0aW9uLWNsYXNzZXNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQtYm9keSB0clwiKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRyc1tpXS5jbGFzc0xpc3QucmVtb3ZlKFwiZnVsbC1yb3dcIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZW5kZXIgdGhlIGdhbWVcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jbGVhckZpZWxkKCk7XG5cbiAgICAvLyBDaGFuZ2UgdGhlIGNsYXNzZXMgdG8gcmVuZGVyIHRoZSBibG9ja3MgdG8gdXNlclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0clwiKTtcbiAgICB2YXIgdGRzO1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICB0ZHMgPSB0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkIHRkXCIpO1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93XVtjb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy9hZGQgdGhlIGNsYXNzIHRvIHNob3cgYmxvY2stcGFydFxuICAgICAgICAgICAgICAgIHRkc1tjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtYmxvY2stcGFydFwiLCBcImNvbG9yLVwiICsgdGhpcy5maWVsZFtyb3ddW2NvbF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9yZW5kZXIgdGhlIGZhbGxpbmcgYmxvY2sgYW5kIG5leHRibG9ja1xuICAgIHRoaXMucmVuZGVyRmFsbGluZ0Jsb2NrKCk7XG4gICAgdGhpcy5yZW5kZXJOZXh0QmxvY2soKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyUG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50c0VsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xuICAgIHZhciBsZXZlbEVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtbGV2ZWxcIik7XG4gICAgdmFyIHBvaW50Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMucG9pbnRzLnRvU3RyaW5nKCkpO1xuICAgIHZhciBsZXZlbE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmxldmVsLnRvU3RyaW5nKCkpO1xuXG4gICAgLy9yZXBsYWNlIHRoZSB0ZXh0bm9kZXMgdG8gdGhlIG5ldyBvbmVzXG4gICAgcG9pbnRzRWxlbS5yZXBsYWNlQ2hpbGQocG9pbnROb2RlLCBwb2ludHNFbGVtLmZpcnN0Q2hpbGQpO1xuICAgIGxldmVsRWxlbS5yZXBsYWNlQ2hpbGQobGV2ZWxOb2RlLCBsZXZlbEVsZW0uZmlyc3RDaGlsZCk7XG5cbiAgICB0aGlzLmFuaW1hdGVOZXdQb2ludHMoKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBmYWxsaW5nIGJsb2NrXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlckZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByb3c7XG4gICAgdmFyIGNvbDtcblxuICAgIC8vZ2V0IHRoZSBub2Rlc1xuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0clwiKTtcbiAgICB2YXIgdGRzID0gW107XG4gICAgZm9yIChyb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKSk7XG4gICAgfVxuXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgdmFyIHkgPSByb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdztcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sO1xuXG4gICAgICAgICAgICAgICAgLy9hZGQgY2xhc3MgdG8gdGhlIGNvcnJlY3QgYmxvY2stcGFydFxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRkc1t5XVt4XS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWZhbGxpbmctYmxvY2stcGFydFwiLCBcImNvbG9yLVwiICsgc2hhcGVbcm93XVtjb2xdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgbmV4dCBibG9ja1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm93O1xuICAgIHZhciBjb2w7XG5cbiAgICAvL2dldCB0aGUgbm9kZXNcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLW5leHQtYmxvY2sgdGJvZHkgdHJcIik7XG4gICAgdmFyIHRkcyA9IFtdO1xuICAgIGZvciAocm93ID0gMDsgcm93IDwgdHJzLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpKTtcbiAgICB9XG5cbiAgICB2YXIgc2hhcGUgPSB0aGlzLm5leHRCbG9jay5zaGFwZXNbdGhpcy5uZXh0QmxvY2sucm90YXRpb25dO1xuICAgIGZvciAocm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vZHJhdyBibG9jayBhdCBwb3NpdGlvbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBzaGFwZXMgcG9zaXRpb25cbiAgICAgICAgICAgICAgICB0ZHNbcm93XVtjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjbGVhciB0aGUgbmV4dC1ibG9jay1jb250YWluZXJcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAvL2NsZWFyIG5leHQtYmxvY2tcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLW5leHQtYmxvY2sgdGJvZHkgdHJcIik7XG4gICAgdmFyIHRkcztcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0cnMubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICB0ZHMgPSB0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIik7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRkcy5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICAvL2NsZWFyIHRoZSBjb2x1bW5cbiAgICAgICAgICAgIHRkc1tjb2xdLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgYmxvY2sgaXMgZmFsbGFibGVcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIGZhbGxhYmxlIG9yIG5vdFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc0ZhbGxhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZhbGxhYmxlID0gdHJ1ZTtcblxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XG4gICAgdmFyIHBvdGVudGlhbFRvcExlZnQgPSB7XG4gICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKyAxLFxuICAgICAgICBjb2w6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXG4gICAgfTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgYmVsb3cgdGhlIHBsYXlpbmcgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxsYWJsZTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gbW92ZSB0aGUgZmFsbGluZyBibG9ja1xuICogQHBhcmFtIGRpclxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5tb3ZlRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oZGlyKSB7XG4gICAgaWYgKHRoaXMuaXNNb3ZhYmxlKGRpcikpIHtcbiAgICAgICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgICAgIC8vcGxheSBzb3VuZFxuICAgICAgICAgICAgdGhpcy5tb3ZlU291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5tb3ZlU291bmQucGxheSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKz0gZGlyO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGJsb2NrIGlzIG1vdmFibGVcbiAqIEBwYXJhbSBkaXIgLSBuZWdhdGl2ZSBvciBwb3NpdGl2ZSBudW1iZXJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIG1vdmFibGUgb3Igbm90XG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmlzTW92YWJsZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIHZhciBtb3ZhYmxlID0gdHJ1ZTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xuICAgICAgICAgICAgcm93OiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyxcbiAgICAgICAgICAgIGNvbDogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKyBkaXJcbiAgICAgICAgfTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2wgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXG4gICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2wgPj0gdGhpcy5maWVsZFswXS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXG4gICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcbiAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxuICAgICAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vdmFibGU7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJvdGF0ZSBmYWxsaW5nIGJsb2NrXG4gKiBAcGFyYW0gZGlyIC0gcG9zaXRpdmUgb3IgbmVnYXRpdmUgbnVtYmVyIHRvIGhhbmRsZSBsZWZ0L1JpZ2h0XG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJvdGF0ZUZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKGRpcikge1xuICAgIGlmICh0aGlzLmlzUm90YXRhYmxlKGRpcikpIHtcbiAgICAgICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgICAgIC8vcGxheSBzb3VuZFxuICAgICAgICAgICAgdGhpcy5yb3RhdGVTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLnJvdGF0ZVNvdW5kLnBsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdSb3RhdGlvbiA9IHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uICsgZGlyO1xuICAgICAgICBpZiAobmV3Um90YXRpb24gPiAzKSB7XG4gICAgICAgICAgICBuZXdSb3RhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3Um90YXRpb24gPCAwKSB7XG4gICAgICAgICAgICBuZXdSb3RhdGlvbiA9IDM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiA9IG5ld1JvdGF0aW9uO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyByb3RhdGFibGVcbiAqIEBwYXJhbSBkaXIgLSBuZWcgb3IgcG9zIG51bWJlclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gcm90YXRhYmxlIG9yIG5vdFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc1JvdGF0YWJsZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIHZhciByb3RhdGFibGUgPSB0cnVlO1xuXG4gICAgdmFyIHBvdGVudGlhbFJvdGF0aW9uID0gdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb24gKyBkaXI7XG4gICAgaWYgKHBvdGVudGlhbFJvdGF0aW9uID4gMykge1xuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDA7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBvdGVudGlhbFJvdGF0aW9uIDwgMCkge1xuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDM7XG4gICAgfVxuXG4gICAgLy9jcmVhdGUgcG90ZW50aWFsIHNoYXBlXG4gICAgdmFyIHBvdGVudGlhbFNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3BvdGVudGlhbFJvdGF0aW9uXTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHBvdGVudGlhbFNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgcG90ZW50aWFsU2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcbiAgICAgICAgICAgIGlmIChjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCA8IDApIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIGxlZnQgb2YgdGhlIHBsYXlpbmcgZmllbGRcbiAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sID49IHRoaXMuZmllbGRbMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxuICAgICAgICAgICAgICAgIHJvdGF0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChwb3RlbnRpYWxTaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3ddW2NvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvdGF0YWJsZTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2xlYXIgYWxsIHRoZSB0YWJsZXJvd3MgaW4gZ2FtZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5jbGVhckZpZWxkID0gZnVuY3Rpb24oKSB7XG4gICAgLy9jbGVhciBmaWVsZFxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRyXCIpO1xuICAgIHZhciB0ZHM7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKTtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGNsYXNzZXNcbiAgICAgICAgICAgIHRkc1tjb2xdLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmaW5kIHRoZSBmdWxscm93cyBvbiB0aGUgZmllbGRcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmluZEZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XG4gICAgLy9maW5kIGZ1bGwgcm93c1xuICAgIHZhciBmdWxsID0gZmFsc2U7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGggLSAxOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93XS5pbmRleE9mKDApID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vcm93IGlzIGZ1bGxcbiAgICAgICAgICAgICAgICBmdWxsID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmdWxsKSB7XG4gICAgICAgICAgICAvL2FkZCB0aGVtIHRvIHRoZSBhcnJheSBvcyBmdWxsIHJvd3NcbiAgICAgICAgICAgIHRoaXMuZnVsbFJvd3MucHVzaChyb3cpO1xuICAgICAgICAgICAgdGhpcy5yb3dDb3VudCArPSAxO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5yb3dDb3VudCAlIDUgPT09IDAgJiYgdGhpcy5mYWxsU3BlZWQgPiAxNTApIHtcbiAgICAgICAgICAgICAgICAvL3NwZWVkIHVwIHRoZSBnYW1lXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsU3BlZWQgLT0gMzU7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXZlbCArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGFtaW5hdGUgdGhlIGZ1bGwgcm93c1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5hbmltYXRlRnVsbFJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQtYm9keSB0clwiKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mdWxsUm93cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0cnNbdGhpcy5mdWxsUm93c1tpXV0uY2xhc3NMaXN0LmFkZChcImZ1bGwtcm93XCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZXJhc2UgdGhlIGZ1bGwgcm93cyBmcm9tIGZpZWxkXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmVyYXNlRnVsbFJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5GWHNvdW5kcykge1xuICAgICAgICAvL3BsYXkgc291bmRcbiAgICAgICAgaWYgKHRoaXMuZnVsbFJvd3MubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICB0aGlzLmZvdXJSb3dTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmZvdXJSb3dTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVTb3VuZC5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbmVTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnVsbFJvd3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgLy9yZW1vdmUgdGhlIGZ1bGwgcm93IGZyb20gZmllbGRcbiAgICAgICAgdGhpcy5maWVsZC5zcGxpY2UodGhpcy5mdWxsUm93c1tpXSwgMSk7XG5cbiAgICAgICAgLy9hZGQgYSBuZXcgZW1wdHkgb24gdG9wIG9mIGZpZWxkXG4gICAgICAgIHZhciBuZXdSb3cgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG5cbiAgICAgICAgLy9hZGQgaXQgdG8gdGhlIGJlZ2lubmluZyBvZiBhcnJheVxuICAgICAgICB0aGlzLmZpZWxkLnVuc2hpZnQobmV3Um93KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNvdW50IHRoZSBwb2ludHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gdGhlIG5ldyBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY291bnRSb3dQb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICAvLzEwMHAgZm9yIG9uZSByb3csIGFkZCBhZGRpdGlvbmFsIDIwJSBwZXIgZXh0cmEgcm93XG4gICAgcmV0dXJuIHRoaXMuYmFzZVBvaW50cyArICgodGhpcy5mdWxsUm93cy5sZW5ndGggLSAxKSAqIHRoaXMuYmFzZVBvaW50cykgKiAxLjI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBnYW1lYm9hcmRcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgdHI7XG4gICAgdmFyIHRkO1xuICAgIHZhciBkaXY7XG5cbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XG5cbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XG4gICAgICAgIH1cblxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRyKTtcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmFwcGVuZENoaWxkKGZyYWcpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBpbml0aWFsaXplIHRoZSBmaWVsZC1hcnJheVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pbml0RmllbGQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmZpZWxkID0gW1xuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF07XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGFuaW1hdGUgbmV3IHBvaW50c1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5hbmltYXRlTmV3UG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xuXG4gICAgZWxlbS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLW5ldy1wb2ludHNcIik7XG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLmNsZWFyTmV3UG9pbnRzQW5pbWF0aW9uLmJpbmQodGhpcyksIDU1MCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgY2xhc3Mgc2V0IGJ5IHRoZSBhbmltYXRlIG5ldyBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXdQb2ludHNBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWxlbSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIik7XG5cbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJ0ZXRyaXMtbmV3LXBvaW50c1wiKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdG9nZ2xlIHRoZSBzb3VuZHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuc291bmRUb2dnbGUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQuaWQgPT09IFwidGV0cmlzLW11c2ljLXRvZ2dsZVwiKSB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKFwic291bmRzXCIpO1xuICAgICAgICB0aGlzLkJHc291bmRzID0gIXRoaXMuQkdzb3VuZHM7XG5cbiAgICAgICAgLy9kYXZlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJCR3NvdW5kc1wiLCB0aGlzLkJHc291bmRzKTtcblxuICAgICAgICBpZiAodGhpcy5CR3NvdW5kcyAmJiB0aGlzLmFsaXZlKSB7XG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iZ011c2ljLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldC5pZCA9PT0gXCJ0ZXRyaXMtc291bmQtdG9nZ2xlXCIpIHtcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoXCJzb3VuZHNcIik7XG4gICAgICAgIHRoaXMuRlhzb3VuZHMgPSAhdGhpcy5GWHNvdW5kcztcblxuICAgICAgICAvL3NhdmUgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkZYc291bmRzXCIsIHRoaXMuRlhzb3VuZHMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgZGVtby1nYW1lIGZvciBwcmVzZW50YXRpb25cbiAqXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmRlbW9HYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5maWVsZCA9IFtcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgICBbMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMF0sXG4gICAgICAgIFsxLCAxLCAxLCAwLCAxLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDBdXG4gICAgXTtcblxuICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IElCbG9ja1NoYXBlKCk7XG4gICAgdGhpcy5jbGVhck5leHRCbG9jaygpO1xuICAgIHRoaXMucmVuZGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0dhbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gU0Jsb2NrU2hhcGUoKSB7XG4gICAgdGhpcy5zaGFwZXMgPSBbXG4gICAgICAgIFtcbiAgICAgICAgICAgIFs1LCA1LCAwXSxcbiAgICAgICAgICAgIFswLCA1LCA1XVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBbMCwgNV0sXG4gICAgICAgICAgICBbNSwgNV0sXG4gICAgICAgICAgICBbNSwgMF1cbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgWzUsIDVdLFxuICAgICAgICAgICAgWzAsIDUsIDVdXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFswLCA1XSxcbiAgICAgICAgICAgIFs1LCA1XSxcbiAgICAgICAgICAgIFs1LCAwXVxuICAgICAgICBdXG4gICAgXTtcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcbiAgICB0aGlzLnRvcExlZnQgPSB7XG4gICAgICAgIHJvdzogLTIsXG4gICAgICAgIGNvbDogNFxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU0Jsb2NrU2hhcGU7XG4iXX0=

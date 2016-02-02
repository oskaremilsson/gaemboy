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
    document.addEventListener("touchstart", this.click.bind(this));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuNC4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9idXR0b25jbGljay5qcyIsImNsaWVudC9zb3VyY2UvanMvZ2FtZWJveVJlc2l6ZS5qcyIsImNsaWVudC9zb3VyY2UvanMvcG93ZXJvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0lCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSkJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9MQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1NCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU3F1YXJlQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVGV0cmlzQXBwbGljYXRpb24uanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNHYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvWkJsb2NrU2hhcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDLzBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgYnV0dG9uQ2xpY2sgPSByZXF1aXJlKFwiLi9idXR0b25jbGlja1wiKTtcbnZhciBnYW1lYm95UmVzaXplID0gcmVxdWlyZShcIi4vZ2FtZWJveVJlc2l6ZVwiKTtcbnZhciBwb3dlck9uID0gcmVxdWlyZShcIi4vcG93ZXJvblwiKTtcblxuYnV0dG9uQ2xpY2suYWFuZGIoKTtcbmdhbWVib3lSZXNpemUuc2l6ZXIoKTtcbnBvd2VyT24uc3RhcnRVcCgpO1xuXG52YXIgVGV0cmlzID0gcmVxdWlyZShcIi4vdGV0cmlzL1RldHJpc0FwcGxpY2F0aW9uXCIpO1xuXG52YXIgdCA9IG5ldyBUZXRyaXMoKTtcbnQuaW5pdCgpO1xuIiwiZnVuY3Rpb24gYWFuZGIoKSB7XG4gIHZhciBhYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hLWJ1dHRvblwiKTtcbiAgdmFyIGJidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmItYnV0dG9uXCIpO1xuICB2YXIgc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN0YXJ0XCIpO1xuICB2YXIgdXBkb3duID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi51cC1kb3duLWJ0blwiKTtcbiAgdmFyIGxlZnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxlZnQtcGFydFwiKTtcbiAgdmFyIHJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yaWdodC1wYXJ0XCIpO1xuICB2YXIgdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnVwLXBhcnRcIik7XG4gIHZhciBkb3duID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kb3duLXBhcnRcIik7XG4gIHZhciBsZWZ0cmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxlZnQtcmlnaHQtYnRuXCIpO1xuICB2YXIgc2hhZG93RG93biA9IFwiMHB4IDBweCAwcHggMHB4IHJnYmEoMTYwLCAwLCAyMCwgMSlcIjtcblxuICBmdW5jdGlvbiBidXR0b25Db2xvcih1cG9yZG93bikge1xuICAgIHJldHVybiBcIjEwcHggc29saWQgcmdiYSg4NywgNzEsIDcxLCBcIiArIHVwb3Jkb3duICsgXCIpXCI7XG4gIH1cblxuICBmdW5jdGlvbiBhYkNvbG9yKHVwb3Jkb3duKSB7XG4gICAgcmV0dXJuIFwicmdiYSg4NywgNzEsIDcxLCBcIiArIHVwb3Jkb3duICsgXCIpXCI7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFkb3dDb2xvcih1cCkge1xuICAgIHJldHVybiBcIlwiICsgdXAgKyBcInB4IDNweCAwcHggMHB4IHJnYmEoMTYwLCAwLCAyMCwgMSlcIjtcbiAgfVxuXG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgNDA6XG4gICAgICAgIGRvd24uc3R5bGUuYm94U2hhZG93ID0gc2hhZG93RG93bjtcbiAgICAgICAgdXBkb3duLmNoaWxkcmVuWzJdLnN0eWxlLmJvcmRlclRvcCA9IGJ1dHRvbkNvbG9yKDAuODUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzODpcbiAgICAgICAgdXAuc3R5bGUuYm94U2hhZG93ID0gc2hhZG93RG93bjtcbiAgICAgICAgdXBkb3duLmNoaWxkcmVuWzBdLnN0eWxlLmJvcmRlckJvdHRvbSA9IGJ1dHRvbkNvbG9yKDAuODUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzOTpcbiAgICAgICAgcmlnaHQuc3R5bGUuYm94U2hhZG93ID0gc2hhZG93RG93bjtcbiAgICAgICAgbGVmdHJpZ2h0LmNoaWxkcmVuWzFdLnN0eWxlLmJvcmRlckxlZnQgPSBidXR0b25Db2xvcigwLjg1KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMzc6XG4gICAgICAgIGxlZnQuc3R5bGUuYm94U2hhZG93ID0gc2hhZG93RG93bjtcbiAgICAgICAgbGVmdHJpZ2h0LmNoaWxkcmVuWzBdLnN0eWxlLmJvcmRlclJpZ2h0ID0gYnV0dG9uQ29sb3IoMC44NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDEzOlxuICAgICAgICBzdGFydC5jbGFzc0xpc3QuYWRkKFwic3RhcnQtYnV0dG9uLW5vLXNoYWRvd1wiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNjY6XG4gICAgICAgIGJidXR0b24uY2xhc3NMaXN0LmFkZChcImItYnV0dG9uLW5vLXNoYWRvd1wiKTtcbiAgICAgICAgYmJ1dHRvbi5maXJzdEVsZW1lbnRDaGlsZC5zdHlsZS5jb2xvciA9IGFiQ29sb3IoMC44NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDY1OlxuICAgICAgICBhYnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJhLWJ1dHRvbi1uby1zaGFkb3dcIik7XG4gICAgICAgIGFidXR0b24uZmlyc3RFbGVtZW50Q2hpbGQuc3R5bGUuY29sb3IgPSBhYkNvbG9yKDAuODUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbihldmVudCkge1xuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIDQwOlxuICAgICAgICBkb3duLnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0NvbG9yKDIpO1xuICAgICAgICB1cGRvd24uY2hpbGRyZW5bMl0uc3R5bGUuYm9yZGVyVG9wID0gYnV0dG9uQ29sb3IoMC41NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM4OlxuICAgICAgICB1cC5zdHlsZS5ib3hTaGFkb3cgPSBzaGFkb3dDb2xvcig0KTtcbiAgICAgICAgdXBkb3duLmNoaWxkcmVuWzBdLnN0eWxlLmJvcmRlckJvdHRvbSA9IGJ1dHRvbkNvbG9yKDAuNTUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAzOTpcbiAgICAgICAgcmlnaHQuc3R5bGUuYm94U2hhZG93ID0gc2hhZG93Q29sb3IoMik7XG4gICAgICAgIGxlZnRyaWdodC5jaGlsZHJlblsxXS5zdHlsZS5ib3JkZXJMZWZ0ID0gYnV0dG9uQ29sb3IoMC41NSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM3OlxuICAgICAgICBsZWZ0LnN0eWxlLmJveFNoYWRvdyA9IHNoYWRvd0NvbG9yKDMpO1xuICAgICAgICBsZWZ0cmlnaHQuY2hpbGRyZW5bMF0uc3R5bGUuYm9yZGVyUmlnaHQgPSBidXR0b25Db2xvcigwLjU1KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMTM6XG4gICAgICAgIHN0YXJ0LmNsYXNzTGlzdC5yZW1vdmUoXCJzdGFydC1idXR0b24tbm8tc2hhZG93XCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA2NjpcbiAgICAgICAgYmJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiYi1idXR0b24tbm8tc2hhZG93XCIpO1xuICAgICAgICBiYnV0dG9uLmZpcnN0RWxlbWVudENoaWxkLnN0eWxlLmNvbG9yID0gYWJDb2xvcigwLjU1KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNjU6XG4gICAgICAgIGFidXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImEtYnV0dG9uLW5vLXNoYWRvd1wiKTtcbiAgICAgICAgYWJ1dHRvbi5maXJzdEVsZW1lbnRDaGlsZC5zdHlsZS5jb2xvciA9IGFiQ29sb3IoMC41NSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9KTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cy5hYW5kYiA9IGFhbmRiO1xuIiwiZnVuY3Rpb24gc2V0R2FtZWJveVNpemUoKSB7XG4gIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBnYW1lYm95ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm95LW1haW5cIik7XG5cbiAgdmFyIGNhbGN1bGF0ZVpvb20gPSB3aW5kb3dIZWlnaHQvKGdhbWVib3kuY2xpZW50SGVpZ2h0ICsgMzUpO1xuICBnYW1lYm95LnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGUoXCIgKyBjYWxjdWxhdGVab29tICsgXCIpXCI7XG5cbn1cblxuZnVuY3Rpb24gc2l6ZXIoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHNldEdhbWVib3lTaXplKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzZXRHYW1lYm95U2l6ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnNpemVyID0gc2l6ZXI7XG4iLCJmdW5jdGlvbiBzdGFydFVwKCkge1xuICB2YXIgcmVkbGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wb3dlci1sZWRcIik7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJlZGxlZC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zdGFydFVwID0gc3RhcnRVcDtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gSUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNiwgNiwgNiwgNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2LCA2LCA2LCA2XVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC00LFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBKQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDFdLFxyXG4gICAgICAgICAgICBbMCwgMV0sXHJcbiAgICAgICAgICAgIFsxLCAxXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMCwgMF0sXHJcbiAgICAgICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMV0sXHJcbiAgICAgICAgICAgIFsxLCAwXSxcclxuICAgICAgICAgICAgWzEsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsxLCAxLCAxXSxcclxuICAgICAgICAgICAgWzAsIDAsIDFdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTMsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEpCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gTEJsb2NrU2hhcGUoKSB7XG4gICAgdGhpcy5zaGFwZXMgPSBbXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsyLCAwXSxcbiAgICAgICAgICAgIFsyLCAwXSxcbiAgICAgICAgICAgIFsyLCAyXVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBbMCwgMCwgMl0sXG4gICAgICAgICAgICBbMiwgMiwgMl1cbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgWzIsIDJdLFxuICAgICAgICAgICAgWzAsIDJdLFxuICAgICAgICAgICAgWzAsIDJdXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsyLCAyLCAyXSxcbiAgICAgICAgICAgIFsyLCAwLCAwXVxuICAgICAgICBdXG4gICAgXTtcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcbiAgICB0aGlzLnRvcExlZnQgPSB7XG4gICAgICAgIHJvdzogLTMsXG4gICAgICAgIGNvbDogNFxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTEJsb2NrU2hhcGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNCwgNF0sXHJcbiAgICAgICAgICAgIFs0LCA0LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNCwgMF0sXHJcbiAgICAgICAgICAgIFs0LCA0XSxcclxuICAgICAgICAgICAgWzAsIDRdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA0LCA0XSxcclxuICAgICAgICAgICAgWzQsIDQsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs0LCAwXSxcclxuICAgICAgICAgICAgWzQsIDRdLFxyXG4gICAgICAgICAgICBbMCwgNF1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU0Jsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gU3F1YXJlQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3F1YXJlQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDMsIDBdLFxyXG4gICAgICAgICAgICBbMywgMywgM11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDBdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFszLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMywgMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgM10sXHJcbiAgICAgICAgICAgIFszLCAzXSxcclxuICAgICAgICAgICAgWzAsIDNdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFRldHJpc0dhbWUgPSByZXF1aXJlKFwiLi9UZXRyaXNHYW1lXCIpO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgdGV0cmlzLWFwcFxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRldHJpc0FwcGxpY2F0aW9uKCkge1xuICAgIHRoaXMuZ2FtZSA9IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBJbml0IHRoZSBiYXNpY3NcbiAqL1xuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAvL3RoaXMucHJpbnQoKTtcbiAgICAvL2NyZWF0ZSBuZXcgZ2FtZVxuICAgIHZhciBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mcm9udC1zY3JlZW5cIik7XG4gICAgdGhpcy5nYW1lID0gbmV3IFRldHJpc0dhbWUoZWxlbSk7XG4gICAgdGhpcy5nYW1lLmluaXQoKTtcblxuICAgIC8vYWRkIGV2ZW50bGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUlucHV0LmJpbmQodGhpcykpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5jbGljay5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgY2xpY2tzXG4gKi9cblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0LmNsYXNzTGlzdFswXSk7XG4gICAgdmFyIGtleSA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3RbMF07XG5cbiAgICAvL0lmIGdhbWUgaXMgXCJhbGl2ZVwiIGFuZCBub3QgcGF1c2VkLCBjYWxsIHRoZSBjb3JyZWN0IGZ1bmN0aW9ucyBpbiBnYW1lXG4gICAgaWYgKHRoaXMuZ2FtZS5hbGl2ZSAmJiAhdGhpcy5nYW1lLnBhdXNlZCkge1xuICAgICAgICB0aGlzLmlucHV0VG9HYW1lSGFuZGxlcihrZXkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJzdGFydFwiKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5yZXN1bWVHYW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBrZXktaW5wdXRzXG4gKi9cblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGV2ZW50LmtleUNvZGU7XG5cbiAgICAvL0lmIGdhbWUgaXMgXCJhbGl2ZVwiIGFuZCBub3QgcGF1c2VkLCBjYWxsIHRoZSBjb3JyZWN0IGZ1bmN0aW9ucyBpbiBnYW1lXG4gICAgaWYgKHRoaXMuZ2FtZS5hbGl2ZSAmJiAhdGhpcy5nYW1lLnBhdXNlZCkge1xuICAgICAgICB0aGlzLmlucHV0VG9HYW1lSGFuZGxlcihrZXkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGtleSA9PT0gMTMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdhbWUucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJlc3VtZUdhbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmlucHV0VG9HYW1lSGFuZGxlciA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgMzc6XG4gICAgICAgIGNhc2UgXCJhcnJvdy1sZWZ0XCI6IHtcbiAgICAgICAgICAgIC8vbGVmdFxuICAgICAgICAgICAgdGhpcy5nYW1lLm1vdmVGYWxsaW5nQmxvY2soLTEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDM5OlxuICAgICAgICBjYXNlIFwiYXJyb3ctcmlnaHRcIjoge1xuICAgICAgICAgICAgLy9yaWdodFxuICAgICAgICAgICAgdGhpcy5nYW1lLm1vdmVGYWxsaW5nQmxvY2soMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMzg6XG4gICAgICAgIGNhc2UgXCJhcnJvdy11cFwiOlxuICAgICAgICBjYXNlIFwiYS1idXR0b24tbGFiZWxcIjoge1xuICAgICAgICAgICAgLy91cFxuICAgICAgICAgICAgdGhpcy5nYW1lLnJvdGF0ZUZhbGxpbmdCbG9jaygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgY2FzZSBcImFycm93LWRvd25cIjoge1xuICAgICAgICAgICAgLy9kb3duXG4gICAgICAgICAgICB0aGlzLmdhbWUuZmFsbEJsb2NrKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMzI6XG4gICAgICAgIGNhc2UgXCJiLWJ1dHRvbi1sYWJlbFwiOiB7XG4gICAgICAgICAgICAvL3NwYWNlXG4gICAgICAgICAgICB0aGlzLmdhbWUuZmFsbEJsb2NrVG9Cb3R0b20oKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgY2FzZSBcInN0YXJ0XCI6IHtcbiAgICAgICAgICAgIC8vZW50ZXJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZUdhbWUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8qIGZvciBkZXYtc2hvd2Nhc2VcbiAgICAgICAgY2FzZSA2ODoge1xuICAgICAgICAgICAgLy9kXG4gICAgICAgICAgICB0aGlzLmdhbWUuZGVtb0dhbWUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9Ki9cbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGRlc3Ryb3kgdGhlIGFwcFxuICovXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmdhbWUuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpIHtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5nYW1lLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nYW1lLmJnTXVzaWMpIHtcbiAgICAgICAgLy9zdG9wIGJhY2tncm91bmQgbXVzaWNcbiAgICAgICAgdGhpcy5nYW1lLmJnTXVzaWMucGF1c2UoKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0FwcGxpY2F0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgSkJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9KQmxvY2tTaGFwZVwiKTtcbnZhciBMQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL0xCbG9ja1NoYXBlXCIpO1xudmFyIFNCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vU0Jsb2NrU2hhcGVcIik7XG52YXIgWkJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9aQmxvY2tTaGFwZVwiKTtcbnZhciBJQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL0lCbG9ja1NoYXBlXCIpO1xudmFyIFNxdWFyZUJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9TcXVhcmVCbG9ja1NoYXBlXCIpO1xudmFyIFRCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vVEJsb2NrU2hhcGVcIik7XG4vKipcbiAqIFRvIGNyZWF0ZSB0aGlzIG1vZHVsZSBJIGhhdmUgcmVhZCB0aGUgZm9sbG93aW5nIGd1aWRlOlxuICogaHR0cDovL2dhbWVkZXZlbG9wbWVudC50dXRzcGx1cy5jb20vdHV0b3JpYWxzL2ltcGxlbWVudGluZy10ZXRyaXMtY29sbGlzaW9uLWRldGVjdGlvbi0tZ2FtZWRldi04NTJcbiAqL1xuXG4vKipcbiAqIENvbnRydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSB0ZXRyaXMgZ2FtZVxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZG9tLWVsZW1lbnQgdG8gYmUgcHJpbnRlZCB0b1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRldHJpc0dhbWUoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5mYWxsaW5nQmxvY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5maWVsZCA9IFtdO1xuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmZ1bGxSb3dzID0gW107XG4gICAgdGhpcy5iYXNlUG9pbnRzID0gMTAwO1xuICAgIHRoaXMuZmFsbFNwZWVkID0gNjAwO1xuICAgIHRoaXMubGV2ZWwgPSAxO1xuICAgIHRoaXMucm93Q291bnQgPSAwO1xuICAgIHRoaXMucG9pbnRzID0gMDtcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XG4gICAgdGhpcy5uZXh0QmxvY2sgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLkZYc291bmRzID0gZmFsc2U7XG4gICAgdGhpcy5CR3NvdW5kcyA9IGZhbHNlO1xuICAgIHRoaXMuYmdNdXNpYyA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvdGV0cmlzLm1wM1wiKTtcbiAgICB0aGlzLnJvdGF0ZVNvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9yb3RhdGUtYmxvY2subXAzXCIpO1xuICAgIHRoaXMubGFuZFNvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9sYW5kLWJsb2NrLm1wM1wiKTtcbiAgICB0aGlzLmxpbmVTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvbGluZS1yZW1vdmUubXAzXCIpO1xuICAgIHRoaXMubW92ZVNvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9tb3ZlLWJsb2NrLm1wM1wiKTtcbiAgICB0aGlzLmdhbWVvdmVyU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL2dhbWUtb3Zlci5tcDNcIik7XG4gICAgdGhpcy5mb3VyUm93U291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL2ZvdXItcm93cy5tcDNcIik7XG5cbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemVkIHRoZSBiYXNpY3Mgb2YgdGhlIG1vZHVsZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbml0RmllbGQoKTtcbiAgICB0aGlzLnByaW50KCk7XG5cbiAgICAvL2FkZCBsaXN0ZW5lciB0byBwYXVzZSBpZiBmb2N1cyBpcyBsb3N0XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIHRoaXMucGF1c2VHYW1lLmJpbmQodGhpcykpO1xuXG4gICAgLy9hZGQgbGlzdGVuZXIgZm9yIHRoZSBzb3VuZHMgdG9nZ2xlXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXNpZGUtaW5mb1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zb3VuZFRvZ2dsZS5iaW5kKHRoaXMpKTtcblxuICAgIC8vcmVhZCBzb3VuZC1zZXR0aW5ncyBmcm9tIGxvY2FsXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiRlhzb3VuZHNcIikpIHtcbiAgICAgICAgdmFyIEZYc291bmRzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJGWHNvdW5kc1wiKTtcbiAgICAgICAgaWYgKEZYc291bmRzID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgdGhpcy5GWHNvdW5kcyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXRyaXMtc291bmQtdG9nZ2xlXCIpLmNsYXNzTGlzdC5hZGQoXCJzb3VuZHNcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJCR3NvdW5kc1wiKSkge1xuICAgICAgICB2YXIgQkdzb3VuZHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkJHc291bmRzXCIpO1xuICAgICAgICBpZiAoQkdzb3VuZHMgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICB0aGlzLkJHc291bmRzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI3RldHJpcy1tdXNpYy10b2dnbGVcIikuY2xhc3NMaXN0LmFkZChcInNvdW5kc1wiKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcGF1c2UgdGhlIGdhbWVcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucGF1c2VHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcbiAgICAgICAgLy9wbGF5IGJhY2tncm91bmQgbXVzaWNcbiAgICAgICAgdGhpcy5iZ011c2ljLnBhdXNlKCk7XG4gICAgfVxuXG4gICAgLy9wYXVzZSB0aGUgZ2FtZVxuICAgIGlmICh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsICYmIHRoaXMuYWxpdmUpIHtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlc3VtZSB0aGUgZ2FtZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZXN1bWVHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcbiAgICAgICAgLy9wbGF5IGJhY2tncm91bmQgbXVzaWNcbiAgICAgICAgdGhpcy5iZ011c2ljLnBsYXkoKTtcbiAgICB9XG5cbiAgICAvL3N0YXJ0IHRoZSBkcm9wLWludGVydmFsIGFnYWluXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmZhbGxCbG9jay5iaW5kKHRoaXMpLCB0aGlzLmZhbGxTcGVlZCk7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xufTtcblxuLyoqXG4gKiBTdGFydCB0aGUgZ2FtZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKSB7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIC8vc2V0IGFsbCB0aGUgdmFyaWFibGVzIHRvIHRoZSBzdGFydC1zdGF0ZVxuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xuICAgIHRoaXMubGV2ZWwgPSAxO1xuICAgIHRoaXMucG9pbnRzID0gMDtcbiAgICB0aGlzLmZhbGxTcGVlZCA9IDYwMDtcbiAgICB0aGlzLnJvd0NvdW50ID0gMDtcbiAgICB0aGlzLnJlYWRIaWdoU2NvcmUoKTtcblxuICAgIC8vbWFrZSBzdXJlIHRoZSBjbGFzc2VzIGlzIHJlc2V0dGVkXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ2FtZS1vdmVyXCIpO1xuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIikuY2xhc3NMaXN0LnJlbW92ZShcIm5ldy1oaWdoc2NvcmVcIik7XG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtc3BsYXNoLXNjcmVlblwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblxuICAgIC8vcnVuIGFsbCB0aGUgZnVuY3Rpb25zIHRvIG1ha2UgdGhlIG1hZ2ljIGhhcHBlblxuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5pbml0RmllbGQoKTtcbiAgICB0aGlzLmNsZWFyRmllbGQoKTtcbiAgICB0aGlzLnJlbmRlclBvaW50cygpO1xuICAgIHRoaXMubmV3TmV4dEJsb2NrKCk7XG4gICAgdGhpcy5kcm9wTmV3QmxvY2soKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuXG4gICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcbiAgICAgICAgLy9wbGF5IGJhY2tncm91bmQgbXVzaWNcbiAgICAgICAgdGhpcy5iZ011c2ljLnBsYXkoKTtcbiAgICAgICAgdGhpcy5iZ011c2ljLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCB0aGlzLnBsYXlCYWNrZ3JvdW5kTXVzaWMuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cbn07XG5cblRldHJpc0dhbWUucHJvdG90eXBlLnBsYXlCYWNrZ3JvdW5kTXVzaWMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJnTXVzaWMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlYWQgdGhlIGhpZ2ggc2NvcmUgZnJvbSBsb2NhbCBzdG9yYWdlXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJlYWRIaWdoU2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0ZXRyaXMtaHNcIikpIHtcbiAgICAgICAgdGhpcy5oaWdoU2NvcmUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRldHJpcy1oc1wiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIGhpZ2ggc2NvcmUgdG8gbG9jYWwgc3RvcmFnZVxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5zYXZlSGlnaFNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucG9pbnRzID4gdGhpcy5oaWdoU2NvcmUpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0ZXRyaXMtaHNcIiwgdGhpcy5wb2ludHMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZmFsbCB0aGUgYmxvY2sgb25lIHJvdyBkb3duXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmZhbGxCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmlzRmFsbGFibGUoKSkge1xuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy9ibG9jayBoYXMgY29sbGlkZWQsIGxhbmQgdGhlIGJsb2NrIGFuZCBkcm9wIG5ld1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcbiAgICAgICAgdGhpcy5sYW5kRmFsbGluZ0Jsb2NrKCk7XG4gICAgICAgIHRoaXMuZHJvcE5ld0Jsb2NrKCk7XG4gICAgfVxuXG4gICAgLy9yZW5kZXIgdGhlIGNoYW5nZVxuICAgIHRoaXMucmVuZGVyKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZhbGwgYmxvY2sgdG8gYm90dG9tIGRpcmVjdGx5XG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmZhbGxCbG9ja1RvQm90dG9tID0gZnVuY3Rpb24oKSB7XG4gICAgd2hpbGUgKHRoaXMuaXNGYWxsYWJsZSgpKSB7XG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ICs9IDE7XG4gICAgfVxuXG4gICAgLy9yZW5kZXIgdGhlIGNoYW5nZVxuICAgIHRoaXMucmVuZGVyKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJhbmRvbWl6ZSBhIG5ldyBibG9ja1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5uZXdOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2hhcGUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KTtcblxuICAgIC8vY3JlYXRlIG5ldyBibG9jayBmcm9tIHRoZSByYW5kb20gbnVtYmVyXG4gICAgc3dpdGNoIChzaGFwZSkge1xuICAgICAgICBjYXNlIDA6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IEpCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgMToge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgTEJsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAyOiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBTQmxvY2tTaGFwZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIDM6IHtcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFpCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgNDoge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgSUJsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSA1OiB7XG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBTcXVhcmVCbG9ja1NoYXBlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgNjoge1xuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgVEJsb2NrU2hhcGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBkcm9wIG5ldyBibG9ja1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5kcm9wTmV3QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAvL2dldCB0aGUgYmxvY2sgZnJvbSBuZXh0LWJsb2NrXG4gICAgdGhpcy5mYWxsaW5nQmxvY2sgPSB0aGlzLm5leHRCbG9jaztcblxuICAgIC8vZ2V0IGEgbmV3IG5leHQgYmxvY2tcbiAgICB0aGlzLmNsZWFyTmV4dEJsb2NrKCk7XG4gICAgdGhpcy5uZXdOZXh0QmxvY2soKTtcblxuICAgIC8vYWRkIGZhbGxpbnRlcnZhbCB3aXRoIGN1cnJlbnQgc3BlZWRcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuZmFsbEJsb2NrLmJpbmQodGhpcyksIHRoaXMuZmFsbFNwZWVkKTtcblxuICAgIGlmICghdGhpcy5pc0ZhbGxhYmxlKCkpIHtcbiAgICAgICAgLy90aGUgbmV3IGJsb2NrIGNvbGxpZGVkIGF0IGxhdW5jaCwgZ2FtZSBvdmVyXG4gICAgICAgIHRoaXMuc2F2ZUhpZ2hTY29yZSgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmNsYXNzTGlzdC5hZGQoXCJnYW1lLW92ZXJcIik7XG4gICAgICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XG5cbiAgICAgICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcbiAgICAgICAgICAgIC8vc3RvcCBiYWNrZ3JvdW5kIG11c2ljXG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMucGF1c2UoKTtcbiAgICAgICAgICAgIHRoaXMuYmdNdXNpYy5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnBsYXlHYW1lT3ZlclNvdW5kLmJpbmQodGhpcyksIDUwMCk7XG4gICAgfVxufTtcblxuVGV0cmlzR2FtZS5wcm90b3R5cGUucGxheUdhbWVPdmVyU291bmQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5GWHNvdW5kcykge1xuICAgICAgICAvL3BsYXkgZ2FtZW92ZXIgc291bmRcbiAgICAgICAgdGhpcy5nYW1lb3ZlclNvdW5kLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgdGhpcy5nYW1lb3ZlclNvdW5kLnBsYXkoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGxhbmQgdGhlIGZhbGxpbmcgYmxvY2sgdG8gdGhlIGZpZWxkXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmxhbmRGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5GWHNvdW5kcykge1xuICAgICAgICAvL3BsYXkgc291bmRcbiAgICAgICAgdGhpcy5sYW5kU291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB0aGlzLmxhbmRTb3VuZC5wbGF5KCk7XG4gICAgfVxuXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcblxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWVsZFtyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvd11bY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xdID0gc2hhcGVbcm93XVtjb2xdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vcmVzZXQgdGhlIGZ1bGxSb3dzIGFycmF5XG4gICAgdGhpcy5mdWxsUm93cyA9IFtdO1xuXG4gICAgLy9jaGVjayBpZiB0aGVyZSBhcmUgZnVsbCByb3dzIGFmdGVyIGxhbmRpbmdcbiAgICB0aGlzLmZpbmRGdWxsUm93cygpO1xuXG4gICAgaWYgKHRoaXMuZnVsbFJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAvL2NhbGwgZnVuY3Rpb24gdG8gbWFrZSBhbmltYXRpb25zXG4gICAgICAgIHRoaXMuYW5pbWF0ZUZ1bGxSb3dzKCk7XG5cbiAgICAgICAgLy9lcmFzZSB0aGUgYW5pbWF0aW9uXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuY2xlYXJBbmltYXRpb24uYmluZCh0aGlzKSwgNjAwKTtcblxuICAgICAgICAvL2VyYXNlIHRoZSByb3dzXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuZXJhc2VGdWxsUm93cy5iaW5kKHRoaXMpLCAzNTApO1xuXG4gICAgICAgIC8vY291bnQgcG9pbnRzXG4gICAgICAgIHRoaXMucG9pbnRzICs9IHRoaXMuY291bnRSb3dQb2ludHMoKTtcblxuICAgICAgICAvL2lmIG5ldyBIUyBhZGQgY2xhc3MgdG8gc2hvdyBpdCB0byB0aGUgdXNlclxuICAgICAgICBpZiAodGhpcy5wb2ludHMgPiB0aGlzLmhpZ2hTY29yZSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKS5jbGFzc0xpc3QuYWRkKFwibmV3LWhpZ2hzY29yZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcmVzZXQgdGhlIGZ1bGxSb3dzIGFycmF5XG4gICAgICAgIC8vdGhpcy5mdWxsUm93cyA9IFtdO1xuXG4gICAgICAgIC8vcmVuZGVyIHRoZSBwb2ludHNcbiAgICAgICAgdGhpcy5yZW5kZXJQb2ludHMoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGVyYXNlIGFuaW1hdGlvbi1jbGFzc2VzXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyQW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkLWJvZHkgdHJcIik7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0cnNbaV0uY2xhc3NMaXN0LnJlbW92ZShcImZ1bGwtcm93XCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBnYW1lXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xlYXJGaWVsZCgpO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBjbGFzc2VzIHRvIHJlbmRlciB0aGUgYmxvY2tzIHRvIHVzZXJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdHJcIik7XG4gICAgdmFyIHRkcztcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKTtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjbGFzcyB0byBzaG93IGJsb2NrLXBhcnRcbiAgICAgICAgICAgICAgICB0ZHNbY29sXS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWJsb2NrLXBhcnRcIiwgXCJjb2xvci1cIiArIHRoaXMuZmllbGRbcm93XVtjb2xdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vcmVuZGVyIHRoZSBmYWxsaW5nIGJsb2NrIGFuZCBuZXh0YmxvY2tcbiAgICB0aGlzLnJlbmRlckZhbGxpbmdCbG9jaygpO1xuICAgIHRoaXMucmVuZGVyTmV4dEJsb2NrKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgcG9pbnRzXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlclBvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHNFbGVtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKTtcbiAgICB2YXIgbGV2ZWxFbGVtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWxldmVsXCIpO1xuICAgIHZhciBwb2ludE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnBvaW50cy50b1N0cmluZygpKTtcbiAgICB2YXIgbGV2ZWxOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5sZXZlbC50b1N0cmluZygpKTtcblxuICAgIC8vcmVwbGFjZSB0aGUgdGV4dG5vZGVzIHRvIHRoZSBuZXcgb25lc1xuICAgIHBvaW50c0VsZW0ucmVwbGFjZUNoaWxkKHBvaW50Tm9kZSwgcG9pbnRzRWxlbS5maXJzdENoaWxkKTtcbiAgICBsZXZlbEVsZW0ucmVwbGFjZUNoaWxkKGxldmVsTm9kZSwgbGV2ZWxFbGVtLmZpcnN0Q2hpbGQpO1xuXG4gICAgdGhpcy5hbmltYXRlTmV3UG9pbnRzKCk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgZmFsbGluZyBibG9ja1xuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXJGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcm93O1xuICAgIHZhciBjb2w7XG5cbiAgICAvL2dldCB0aGUgbm9kZXNcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdHJcIik7XG4gICAgdmFyIHRkcyA9IFtdO1xuICAgIGZvciAocm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRkcy5wdXNoKHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdGRcIikpO1xuICAgIH1cblxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XG4gICAgZm9yIChyb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy9kcmF3IGJsb2NrIGF0IHBvc2l0aW9uIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNoYXBlcyBwb3NpdGlvblxuICAgICAgICAgICAgICAgIHZhciB5ID0gcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3c7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbDtcblxuICAgICAgICAgICAgICAgIC8vYWRkIGNsYXNzIHRvIHRoZSBjb3JyZWN0IGJsb2NrLXBhcnRcbiAgICAgICAgICAgICAgICBpZiAocm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0ZHNbeV1beF0uY2xhc3NMaXN0LmFkZChcInRldHJpcy1mYWxsaW5nLWJsb2NrLXBhcnRcIiwgXCJjb2xvci1cIiArIHNoYXBlW3Jvd11bY29sXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIG5leHQgYmxvY2tcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyTmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJvdztcbiAgICB2YXIgY29sO1xuXG4gICAgLy9nZXQgdGhlIG5vZGVzXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1uZXh0LWJsb2NrIHRib2R5IHRyXCIpO1xuICAgIHZhciB0ZHMgPSBbXTtcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHRycy5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRkcy5wdXNoKHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKSk7XG4gICAgfVxuXG4gICAgdmFyIHNoYXBlID0gdGhpcy5uZXh0QmxvY2suc2hhcGVzW3RoaXMubmV4dEJsb2NrLnJvdGF0aW9uXTtcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgdGRzW3Jvd11bY29sXS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWZhbGxpbmctYmxvY2stcGFydFwiLCBcImNvbG9yLVwiICsgc2hhcGVbcm93XVtjb2xdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2xlYXIgdGhlIG5leHQtYmxvY2stY29udGFpbmVyXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyTmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgLy9jbGVhciBuZXh0LWJsb2NrXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1uZXh0LWJsb2NrIHRib2R5IHRyXCIpO1xuICAgIHZhciB0ZHM7XG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdHJzLmxlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpO1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0ZHMubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgLy9jbGVhciB0aGUgY29sdW1uXG4gICAgICAgICAgICB0ZHNbY29sXS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIlwiKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGJsb2NrIGlzIGZhbGxhYmxlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBmYWxsYWJsZSBvciBub3RcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNGYWxsYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmYWxsYWJsZSA9IHRydWU7XG5cbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xuICAgICAgICByb3c6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ICsgMSxcbiAgICAgICAgY29sOiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbFxuICAgIH07XG5cbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vY2hlY2sgdGhhdCB0aGUgc2hhcGUgaXMgbm90IGFib3ZlIHRoZSBmaWVsZFxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSB0aGlzLmZpZWxkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIGJlbG93IHRoZSBwbGF5aW5nIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxsYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmllbGRbcm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3ddW2NvbCArIHBvdGVudGlhbFRvcExlZnQuY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsbGFibGU7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIG1vdmUgdGhlIGZhbGxpbmcgYmxvY2tcbiAqIEBwYXJhbSBkaXJcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUubW92ZUZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKGRpcikge1xuICAgIGlmICh0aGlzLmlzTW92YWJsZShkaXIpKSB7XG4gICAgICAgIGlmICh0aGlzLkZYc291bmRzKSB7XG4gICAgICAgICAgICAvL3BsYXkgc291bmRcbiAgICAgICAgICAgIHRoaXMubW92ZVNvdW5kLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMubW92ZVNvdW5kLnBsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sICs9IGRpcjtcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlcigpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiBibG9jayBpcyBtb3ZhYmxlXG4gKiBAcGFyYW0gZGlyIC0gbmVnYXRpdmUgb3IgcG9zaXRpdmUgbnVtYmVyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBtb3ZhYmxlIG9yIG5vdFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc01vdmFibGUgPSBmdW5jdGlvbihkaXIpIHtcbiAgICB2YXIgbW92YWJsZSA9IHRydWU7XG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcbiAgICB2YXIgcG90ZW50aWFsVG9wTGVmdCA9IHtcbiAgICAgICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3csXG4gICAgICAgICAgICBjb2w6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sICsgZGlyXG4gICAgICAgIH07XG5cbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgaWYgKGNvbCArIHBvdGVudGlhbFRvcExlZnQuY29sIDwgMCkge1xuICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSB0byB0aGUgbGVmdCBvZiB0aGUgcGxheWluZyBmaWVsZFxuICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbCArIHBvdGVudGlhbFRvcExlZnQuY29sID49IHRoaXMuZmllbGRbMF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxuICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXG4gICAgICAgICAgICBpZiAocm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3cgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3ddW2NvbCArIHBvdGVudGlhbFRvcExlZnQuY29sXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtb3ZhYmxlO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByb3RhdGUgZmFsbGluZyBibG9ja1xuICogQHBhcmFtIGRpciAtIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIG51bWJlciB0byBoYW5kbGUgbGVmdC9SaWdodFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yb3RhdGVGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbihkaXIpIHtcbiAgICBpZiAodGhpcy5pc1JvdGF0YWJsZShkaXIpKSB7XG4gICAgICAgIGlmICh0aGlzLkZYc291bmRzKSB7XG4gICAgICAgICAgICAvL3BsYXkgc291bmRcbiAgICAgICAgICAgIHRoaXMucm90YXRlU291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGVTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3Um90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcbiAgICAgICAgaWYgKG5ld1JvdGF0aW9uID4gMykge1xuICAgICAgICAgICAgbmV3Um90YXRpb24gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1JvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgbmV3Um90YXRpb24gPSAzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb24gPSBuZXdSb3RhdGlvbjtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgYmxvY2sgaXMgcm90YXRhYmxlXG4gKiBAcGFyYW0gZGlyIC0gbmVnIG9yIHBvcyBudW1iZXJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIHJvdGF0YWJsZSBvciBub3RcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNSb3RhdGFibGUgPSBmdW5jdGlvbihkaXIpIHtcbiAgICB2YXIgcm90YXRhYmxlID0gdHJ1ZTtcblxuICAgIHZhciBwb3RlbnRpYWxSb3RhdGlvbiA9IHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uICsgZGlyO1xuICAgIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA+IDMpIHtcbiAgICAgICAgcG90ZW50aWFsUm90YXRpb24gPSAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA8IDApIHtcbiAgICAgICAgcG90ZW50aWFsUm90YXRpb24gPSAzO1xuICAgIH1cblxuICAgIC8vY3JlYXRlIHBvdGVudGlhbCBzaGFwZVxuICAgIHZhciBwb3RlbnRpYWxTaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1twb3RlbnRpYWxSb3RhdGlvbl07XG5cbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBwb3RlbnRpYWxTaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHBvdGVudGlhbFNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXG4gICAgICAgICAgICBpZiAoY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXG4gICAgICAgICAgICAgICAgcm90YXRhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCA+PSB0aGlzLmZpZWxkWzBdLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSB0byB0aGUgcmlnaHQgb2YgdGhlIHBsYXlpbmcgZmllbGRcbiAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAocG90ZW50aWFsU2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlIHNwYWNlIGlzIHRha2VuXG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByb3RhdGFibGU7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIGFsbCB0aGUgdGFibGVyb3dzIGluIGdhbWVcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJGaWVsZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vY2xlYXIgZmllbGRcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0clwiKTtcbiAgICB2YXIgdGRzO1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICB0ZHMgPSB0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIik7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICAvL3Jlc2V0IHRoZSBjbGFzc2VzXG4gICAgICAgICAgICB0ZHNbY29sXS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIlwiKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZmluZCB0aGUgZnVsbHJvd3Mgb24gdGhlIGZpZWxkXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmZpbmRGdWxsUm93cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZmluZCBmdWxsIHJvd3NcbiAgICB2YXIgZnVsbCA9IGZhbHNlO1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoIC0gMTsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3Jvd10uaW5kZXhPZigwKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvL3JvdyBpcyBmdWxsXG4gICAgICAgICAgICAgICAgZnVsbCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnVsbCkge1xuICAgICAgICAgICAgLy9hZGQgdGhlbSB0byB0aGUgYXJyYXkgb3MgZnVsbCByb3dzXG4gICAgICAgICAgICB0aGlzLmZ1bGxSb3dzLnB1c2gocm93KTtcbiAgICAgICAgICAgIHRoaXMucm93Q291bnQgKz0gMTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucm93Q291bnQgJSA1ID09PSAwICYmIHRoaXMuZmFsbFNwZWVkID4gMTUwKSB7XG4gICAgICAgICAgICAgICAgLy9zcGVlZCB1cCB0aGUgZ2FtZVxuICAgICAgICAgICAgICAgIHRoaXMuZmFsbFNwZWVkIC09IDM1O1xuICAgICAgICAgICAgICAgIHRoaXMubGV2ZWwgKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVsbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhbWluYXRlIHRoZSBmdWxsIHJvd3NcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuYW5pbWF0ZUZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkLWJvZHkgdHJcIik7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnVsbFJvd3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdHJzW3RoaXMuZnVsbFJvd3NbaV1dLmNsYXNzTGlzdC5hZGQoXCJmdWxsLXJvd1wiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGVyYXNlIHRoZSBmdWxsIHJvd3MgZnJvbSBmaWVsZFxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5lcmFzZUZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcbiAgICAgICAgLy9wbGF5IHNvdW5kXG4gICAgICAgIGlmICh0aGlzLmZ1bGxSb3dzLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgdGhpcy5mb3VyUm93U291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5mb3VyUm93U291bmQucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5saW5lU291bmQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW5lU291bmQucGxheSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZ1bGxSb3dzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIC8vcmVtb3ZlIHRoZSBmdWxsIHJvdyBmcm9tIGZpZWxkXG4gICAgICAgIHRoaXMuZmllbGQuc3BsaWNlKHRoaXMuZnVsbFJvd3NbaV0sIDEpO1xuXG4gICAgICAgIC8vYWRkIGEgbmV3IGVtcHR5IG9uIHRvcCBvZiBmaWVsZFxuICAgICAgICB2YXIgbmV3Um93ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuXG4gICAgICAgIC8vYWRkIGl0IHRvIHRoZSBiZWdpbm5pbmcgb2YgYXJyYXlcbiAgICAgICAgdGhpcy5maWVsZC51bnNoaWZ0KG5ld1Jvdyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjb3VudCB0aGUgcG9pbnRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIHRoZSBuZXcgcG9pbnRzXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmNvdW50Um93UG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgLy8xMDBwIGZvciBvbmUgcm93LCBhZGQgYWRkaXRpb25hbCAyMCUgcGVyIGV4dHJhIHJvd1xuICAgIHJldHVybiB0aGlzLmJhc2VQb2ludHMgKyAoKHRoaXMuZnVsbFJvd3MubGVuZ3RoIC0gMSkgKiB0aGlzLmJhc2VQb2ludHMpICogMS4yO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgZ2FtZWJvYXJkXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdmFyIHRyO1xuICAgIHZhciB0ZDtcbiAgICB2YXIgZGl2O1xuXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XG4gICAgICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpO1xuXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIik7XG4gICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0cik7XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5hcHBlbmRDaGlsZChmcmFnKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgZmllbGQtYXJyYXlcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuaW5pdEZpZWxkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5maWVsZCA9IFtcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBhbmltYXRlIG5ldyBwb2ludHNcbiAqL1xuVGV0cmlzR2FtZS5wcm90b3R5cGUuYW5pbWF0ZU5ld1BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbGVtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKTtcblxuICAgIGVsZW0uY2xhc3NMaXN0LmFkZChcInRldHJpcy1uZXctcG9pbnRzXCIpO1xuXG4gICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5jbGVhck5ld1BvaW50c0FuaW1hdGlvbi5iaW5kKHRoaXMpLCA1NTApO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZW1vdmUgdGhlIGNsYXNzIHNldCBieSB0aGUgYW5pbWF0ZSBuZXcgcG9pbnRzXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyTmV3UG9pbnRzQW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xuXG4gICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKFwidGV0cmlzLW5ldy1wb2ludHNcIik7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHRvZ2dsZSB0aGUgc291bmRzXG4gKi9cblRldHJpc0dhbWUucHJvdG90eXBlLnNvdW5kVG9nZ2xlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09PSBcInRldHJpcy1tdXNpYy10b2dnbGVcIikge1xuICAgICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZShcInNvdW5kc1wiKTtcbiAgICAgICAgdGhpcy5CR3NvdW5kcyA9ICF0aGlzLkJHc291bmRzO1xuXG4gICAgICAgIC8vZGF2ZSB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiQkdzb3VuZHNcIiwgdGhpcy5CR3NvdW5kcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuQkdzb3VuZHMgJiYgdGhpcy5hbGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5iZ011c2ljLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmdNdXNpYy5wYXVzZSgpO1xuICAgICAgICAgICAgdGhpcy5iZ011c2ljLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT09IFwidGV0cmlzLXNvdW5kLXRvZ2dsZVwiKSB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKFwic291bmRzXCIpO1xuICAgICAgICB0aGlzLkZYc291bmRzID0gIXRoaXMuRlhzb3VuZHM7XG5cbiAgICAgICAgLy9zYXZlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJGWHNvdW5kc1wiLCB0aGlzLkZYc291bmRzKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGRlbW8tZ2FtZSBmb3IgcHJlc2VudGF0aW9uXG4gKlxuICovXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5kZW1vR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZmllbGQgPSBbXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICAgIFsxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgICBbMSwgMSwgMSwgMCwgMSwgMSwgMSwgMSwgMSwgMF0sXG4gICAgICAgIFsxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAwXVxuICAgIF07XG5cbiAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBJQmxvY2tTaGFwZSgpO1xuICAgIHRoaXMuY2xlYXJOZXh0QmxvY2soKTtcbiAgICB0aGlzLnJlbmRlcigpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXRyaXNHYW1lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIFNCbG9ja1NoYXBlKCkge1xuICAgIHRoaXMuc2hhcGVzID0gW1xuICAgICAgICBbXG4gICAgICAgICAgICBbNSwgNSwgMF0sXG4gICAgICAgICAgICBbMCwgNSwgNV1cbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgWzAsIDVdLFxuICAgICAgICAgICAgWzUsIDVdLFxuICAgICAgICAgICAgWzUsIDBdXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFs1LCA1XSxcbiAgICAgICAgICAgIFswLCA1LCA1XVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBbMCwgNV0sXG4gICAgICAgICAgICBbNSwgNV0sXG4gICAgICAgICAgICBbNSwgMF1cbiAgICAgICAgXVxuICAgIF07XG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XG4gICAgdGhpcy50b3BMZWZ0ID0ge1xuICAgICAgICByb3c6IC0yLFxuICAgICAgICBjb2w6IDRcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNCbG9ja1NoYXBlO1xuIl19

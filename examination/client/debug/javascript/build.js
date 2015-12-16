(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function BasicWindow(options) {
    this.id = options.id || "" + new Date().getTime();
    this.element = undefined;
    this.x = options.x || 10;
    this.y = options.y || 10;
    this.zIndex = options.zIndex || 0;
    this.title = options.title || this.id;
    this.icon = options.icon || "bug_report";
}

BasicWindow.prototype.destroy = function() {
    // TODO: implement destroy
    document.querySelector("#main-frame").removeChild(this.element);
};

BasicWindow.prototype.print = function() {
    // TODO: implement this
    console.log("printing");
    var template  = document.querySelector("#template-window").content.cloneNode(true);
    console.log(template);
    var templateWindow = template.querySelector("div");
    templateWindow.setAttribute("id", this.id);
    templateWindow.style.left = this.x + "px";
    templateWindow.style.top = this.y + "px";
    templateWindow.style.zIndex = this.zIndex;

    var element = document.querySelector("#main-frame");
    var launcher = document.querySelector(".launcher");
    element.insertBefore(template, launcher);
    this.element = document.querySelector("#" + this.id);
    this.element.querySelector(".window-title").appendChild(document.createTextNode(this.title));
    this.element.querySelector(".window-icon").appendChild(document.createTextNode(this.icon));
};

BasicWindow.prototype.minimize = function() {
    this.element.classList.add("minimized");
};

module.exports = BasicWindow;
},{}],2:[function(require,module,exports){
"use strict";

//var ExA = require("./ExampleApplication");
var Launcher = require("./Launcher");

function Desktop() {
    this.activeWindow = false;
    this.mouseMoveFunc = this.mouseMove.bind(this);
    this.mouseUpFunc = this.mouseUp.bind(this);
    this.windows = [];
    this.clickX = 0;
    this.clickY = 0;
    this.serialNumber = 0;

    //variables to handle the "focused" window
    this.lastFocusedWindow = undefined;
    this.zIndex = 0;

    //this.init();
}

Desktop.prototype.init = function() {
    var launch = new Launcher(this);
    launch.init();

    document.addEventListener("mousedown", this.mouseDown.bind(this));
};

Desktop.prototype.mouseUp = function() {
    console.log("removing move-listener");
    window.removeEventListener("mousemove", this.mouseMoveFunc);
    window.removeEventListener("mouseup", this.mouseUpFunc);
    this.activeWindow.element.classList.remove("moving");
    this.activeWindow = undefined;
};

Desktop.prototype.mouseDown = function(event) {
    var element = event.target;
    //get the clicked-windows "main-div"
    if (element.parentNode.id) {
        while (element.parentNode.id !== "main-frame") {
            element = element.parentNode;
        }
    }

    if (element.classList.contains("window")) {
        //clicked DOM is a window - do stuff

        //make sure the last active window is on top
        if (this.lastFocusedWindow !== element.id) {
            this.zIndex += 1;
            element.style.zIndex = this.zIndex;
            this.lastFocusedWindow = element.id;
        }

        //find the window in window-array
        for (var i = 0; i < this.windows.length; i += 1) {
            if (this.windows[i].id === element.id) {
                this.activeWindow = this.windows[i];
            }
        }

        //add the listeners to check for movement if click were in the window-top of window
        if (event.target.classList.contains("window-top")) {
            this.clickX = event.clientX - this.activeWindow.x;
            this.clickY = event.clientY - this.activeWindow.y;
            element.classList.add("moving");

            console.log("adding mousemove-listener");
            window.addEventListener("mousemove", this.mouseMoveFunc);
            window.addEventListener("mouseup", this.mouseUpFunc);
        }
    }

};

Desktop.prototype.mouseMove = function(event) {
    console.log("trying to move window");
    this.activeWindow.x = event.clientX - this.clickX;
    this.activeWindow.y = event.clientY - this.clickY;

    this.activeWindow.element.style.left = this.activeWindow.x + "px";
    this.activeWindow.element.style.top = this.activeWindow.y + "px";
};

Desktop.prototype.windowButtonClick = function(event) {
    console.log("clicked window-button");
    var action = event.target.classList;

    var element = event.target;

    if (element.parentNode) {
        while (!element.parentNode.id) {
            element = element.parentNode;
        }
        element = element.parentNode;
    }

    //find what window got clicked
    var index = -1;
    for (var i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            index = i;
        }
    }

    if (index !== -1) {
        if (action.contains("exit-button")) {
            //close the app
            this.windows[index].destroy();
            this.windows.splice(index, 1);
        }
        else if (action.contains("minimize-button")) {
            //minimize the app
            this.windows[index].minimize();
            console.log("minmize");
        }
    }
};

module.exports = Desktop;
},{"./Launcher":4}],3:[function(require,module,exports){
"use strict";
var BasicWindow = require("./BasicWindow");

function ExampleApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

ExampleApplication.prototype = Object.create(BasicWindow.prototype);
ExampleApplication.prototype.constructor =  ExampleApplication;

ExampleApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing example");
    document.querySelector("#" + this.id).classList.add("example-app");

};

module.exports = ExampleApplication;
},{"./BasicWindow":1}],4:[function(require,module,exports){
"use strict";
var ExA = require("./ExampleApplication");
var MemoryApplication = require("./MemoryApplication");

function Launcher(desktop) {
    this.desktop = desktop;
    //this.startApplication("memory");
}

Launcher.prototype.init = function() {
    var iTag;
    var appList = document.querySelectorAll(".launcher li");
    console.log(appList);
    for (var i = 0; i < appList.length; i += 1) {
        iTag = appList[i].querySelector("i");
        //iTag.addEventListener("click", this.startApplication.bind(this));
        appList[i].addEventListener("click", this.startApplication.bind(this), true);
    }

};

Launcher.prototype.startApplication = function(event) {
    var newApp = false;

    var margin = 10 * (this.desktop.serialNumber + 1);
    var appOptions = {
        id: "win-" + this.desktop.serialNumber,
        x: margin,
        y: margin,
        zIndex: this.desktop.zIndex
    };

    //var newID = "win-" + this.desktop.serialNumber;
    this.desktop.serialNumber += 1;

    console.log(event.target);
    var value;
    if (event.target.attributes["value"]) {
        value = event.target.attributes["value"].value;
    }
    else if (event.target.parentNode.attributes["value"]) {
        value = event.target.parentNode.attributes["value"].value;
    }

    switch (value) {
        case "example": {
            newApp = new ExA(appOptions);
            newApp.print();

            break;
        }
        case "memory": {
            appOptions.title = "Memory";
            appOptions.icon = "memory";
            newApp = new MemoryApplication(appOptions);
            newApp.print();
            newApp.init();

            break;
        }
    }

    if (newApp) {
        var buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.windowButtonClick.bind(this.desktop));
        this.desktop.windows.push(newApp);
    }
};

module.exports = Launcher;
},{"./ExampleApplication":3,"./MemoryApplication":5}],5:[function(require,module,exports){
"use strict";
var BasicWindow = require("./BasicWindow");
var MemoryGame = require("./memory/Game");

function MemoryApplication(options) {
    BasicWindow.call(this, options);
    /*this.title = title;
    this.icon = icon;*/
}

MemoryApplication.prototype = Object.create(BasicWindow.prototype);
MemoryApplication.prototype.constructor =  MemoryApplication;

MemoryApplication.prototype.init = function() {
    console.log(this.element);
    var g = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    g.init();
};

MemoryApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing memory");
    //document.querySelector("#" + this.id).classList.add("memory-app");
    this.element.classList.add("memory-app");

    /*this.element.querySelector(".window-title").appendChild(document.createTextNode(this.title));
    this.element.querySelector(".window-icon").appendChild(document.createTextNode(this.icon));*/
};

module.exports = MemoryApplication;
},{"./BasicWindow":1,"./memory/Game":7}],6:[function(require,module,exports){
"use strict";
var Desktop = require("./Desktop");

var d = new Desktop();
d.init();
},{"./Desktop":2}],7:[function(require,module,exports){
/**
 * Created by Oskar on 2015-11-23.
 */
var MemoryBoard = require("./MemoryBoard");
var MemoryCard = require("./MemoryCard");
var Timer = require("./Timer");

function Game(element, x, y) {
    var i = 0;
    this.element = element;

    this.x = x;
    this.y = y;
    this.layout = new MemoryBoard(element, this.x, this.y);
    this.board = [];
    for(i = 0; i < this.x; i += 1) {
        this.board.push(new Array(y));
    }
    this.visibleCards = [];
    this.turns = 0;
    this.correctCount = 0;
    this.images = [0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7];
    //this.foundPile = document.querySelector("#found-pile");

    //this.timer = new Timer(document.querySelector("h3"));
    //this.timer.start();

    this.totalTime = 0;

    this.shuffleImages();
    this.addEvents();
}

Game.prototype.init = function() {
    //document.querySelector("body").removeChild(document.querySelector("#start"));
    console.log(this.images);
    for(var i = 0; i < this.y; i += 1) {
        for(var j = 0; j < this.x - 1; j += 2) {
            this.board[i][j] = new MemoryCard("" + i + j, this.images.pop());
            this.board[i][j+1] = new MemoryCard("" + i + (j + 1), this.images.pop());
        }
    }
    console.log(this.images);
    console.log(this.board);
};

Game.prototype.shuffleImages = function() {
    var temp;
    var rand;
    for (var i = 0; i < this.images.length; i += 1) {
        temp = this.images[i];
        rand = Math.floor(Math.random() * this.images.length);
        this.images[i] = this.images[rand];
        this.images[rand] = temp;
    }
};

Game.prototype.addEvents = function() {
    //var boardElement = document.querySelector("#main-board");
    this.element.addEventListener("click", this.click.bind(this));
};

Game.prototype.click = function(event) {
    if (this.visibleCards.length < 2 && !event.target.classList.contains("disable")) {
        if (event.target.classList.contains("card")) {
            var yx = event.target.classList[0].split("-")[1];
            var y = yx.charAt(0);
            var x = yx.charAt(1);

            event.target.classList.add("img-" + this.board[y][x].imgNr);
            event.target.classList.add("img");

            this.visibleCards.push(this.board[y][x]);

            //disable the ca<rd that got clicked
            this.element.querySelector(".card-" + this.board[y][x].id).classList.add("disable");

            if(this.visibleCards.length === 2) {
                this.checkIfCorrect();
            }
        }
    }
};

Game.prototype.checkIfCorrect = function() {
    this.turns += 1;
    console.log(this.visibleCards);
    if (this.visibleCards[0].imgNr === this.visibleCards[1].imgNr) {
        this.element.querySelector(".card-" + this.visibleCards[0].id).classList.add("right");
        this.element.querySelector(".card-" + this.visibleCards[1].id).classList.add("right");

        //this.addToPile(this.visibleCards[0].imgNr);
        //this.players[this.activePlayer].cards.push(this.visibleCards[0].imgNr);
        //this.players[this.activePlayer].addToPile();

        //reset the array
        this.visibleCards = [];

        this.correctCount += 1;

        if (this.correctCount === (this.x*this.y / 2)) {
            console.log((this.x*this.y / 2));

            /*if(this.nrOfPlayers === 1) {
                this.totalTime = this.timer.stop();
                this.gameOverSingle();
            }
            else {
                this.gameOverMulti();
            }
            console.log(this.players);*/
        }
    }
    else {
        for (var i = 0; i < this.visibleCards.length; i+=1) {
            this.element.querySelector(".card-" + this.visibleCards[i].id).classList.add("wrong");
            this.element.querySelector(".card-" + this.visibleCards[i].id).classList.remove("disable");
        }
        setTimeout(this.turnBackCards.bind(this), 1000);
        //this.changePlayer();
    }
};

Game.prototype.changePlayer = function() {
    if(this.activePlayer === this.nrOfPlayers - 1) {
        this.activePlayer = 0;
    }
    else {
        this.activePlayer += 1;
    }
};

Game.prototype.turnBackCards = function() {
    var tempCard;
    for (var i = 0; i < this.visibleCards.length; i += 1) {
        tempCard = this.visibleCards[i];
        console.log(tempCard);
        this.element.querySelector(".card-" + tempCard.id).classList.remove("wrong", "img", "img-" + tempCard.imgNr);
    }

    //reset the array
    this.visibleCards = [];
};

Game.prototype.gameOverSingle = function() {
    document.querySelector("body").removeChild(document.querySelector("#main-board"));
    var frag = document.createDocumentFragment();
    var template = document.querySelector("#gameover-singleplayer").content.cloneNode(true);
    template.querySelector("#turns").appendChild(document.createTextNode(this.turns));
    template.querySelector("#time").appendChild(document.createTextNode(this.totalTime));
    frag.appendChild(template);

    document.querySelector("body").appendChild(frag);
};

Game.prototype.gameOverMulti = function() {
    var i = 0;
    var winner = [this.players[0]];

    //find the winner
    for (i = 1; i < this.players.length; i += 1) {
        if (this.players[i].cards.length > winner[0].cards.length) {
            winner = [];
            winner.push(this.players[i]);
        }
        else if (this.players[i].cards.length === winner[0].cards.length) {
            winner.push(this.players[i]);
        }
    }

    document.querySelector("body").removeChild(document.querySelector("#main-board"));
    var frag = document.createDocumentFragment();
    var template = document.querySelector("#gameover-multiplayer").content.cloneNode(true);
    var winnerString = "";

    for (i = 0; i < winner.length; i += 1) {
        winnerString += winner[i].name + ", ";
    }

    winnerString = winnerString.slice(0, -2);
    template.querySelector(".winner").appendChild(document.createTextNode(winnerString));
    frag.appendChild(template);

    document.querySelector("body").appendChild(frag);
};

module.exports = Game;

},{"./MemoryBoard":8,"./MemoryCard":9,"./Timer":10}],8:[function(require,module,exports){
/**
 * Created by Oskar on 2015-11-23.
 */

function MemoryBoard(element, x,y) {
    this.x = x;
    this.y = y;
    this.element = element;

    this.printCards();
}

MemoryBoard.prototype.printCards = function() {
    var frag = document.createDocumentFragment();

    var rowDiv;
    var cardDiv;

    for(var i = 0; i < this.y; i += 1)
    {
        rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for(var j = 0; j < this.x; j += 1) {
            cardDiv = document.createElement("div");
            cardDiv.classList.add("card-" + i + j, "card");
            rowDiv.appendChild(cardDiv);
        }

        frag.appendChild(rowDiv);
    }

    console.log(this.element);
    this.element.appendChild(frag);
};

module.exports = MemoryBoard;

},{}],9:[function(require,module,exports){
/**
 * Created by Oskar on 2015-11-23.
 */

function MemoryCard(id, imgNr) {
    this.id = id;
    this.imgNr = imgNr;
}

module.exports = MemoryCard;

},{}],10:[function(require,module,exports){
"use strict";

/**
 * Timer constructor
 * @param element{Object}, element to print the timer to
 * @constructor
 */
function Timer(element) {
    this.element = element;
    this.startTime = new Date().getTime();
    this.interval = undefined;
}

/**
 * Function that starts an interval for the timer
 */
Timer.prototype.start = function() {
    //call the run function on each interval
    this.interval = setInterval(this.run.bind(this), 100);
};

/**
 * Function to be executed each interval of the timer
 */
Timer.prototype.run = function() {
    var now = new Date().getTime();

    //count the difference from start to now
    var diff = (now - this.startTime) / 1000;

    this.print(diff.toFixed(1));
};

/**
 * Function that stops the timer before its over
 * @returns {number}, the difference in seconds
 */
Timer.prototype.stop = function() {
    clearInterval(this.interval);
    var now = new Date().getTime();

    return (now - this.startTime) / 1000;
};

/**
 * Function to show the timer at the given element
 * @param diff{Number} the time to be printed
 */
Timer.prototype.print = function(diff) {
    if(this.element.hasChildNodes()) {
        this.element.replaceChild(document.createTextNode(diff), this.element.firstChild);
    }
    else {
        this.element.appendChild(document.createTextNode(diff));
    }
};

module.exports = Timer;

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9HYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvVGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIEJhc2ljV2luZG93KG9wdGlvbnMpIHtcclxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMueCA9IG9wdGlvbnMueCB8fCAxMDtcclxuICAgIHRoaXMueSA9IG9wdGlvbnMueSB8fCAxMDtcclxuICAgIHRoaXMuekluZGV4ID0gb3B0aW9ucy56SW5kZXggfHwgMDtcclxuICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8IHRoaXMuaWQ7XHJcbiAgICB0aGlzLmljb24gPSBvcHRpb25zLmljb24gfHwgXCJidWdfcmVwb3J0XCI7XHJcbn1cclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgZGVzdHJveVxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGlzXHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nXCIpO1xyXG4gICAgdmFyIHRlbXBsYXRlICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xyXG4gICAgdmFyIHRlbXBsYXRlV2luZG93ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImRpdlwiKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXMuaWQpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgdmFyIGxhdW5jaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlclwiKTtcclxuICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBsYXVuY2hlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWluaW1pemVkXCIpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vdmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIExhdW5jaGVyID0gcmVxdWlyZShcIi4vTGF1bmNoZXJcIik7XHJcblxyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2VNb3ZlRnVuYyA9IHRoaXMubW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm1vdXNlVXBGdW5jID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuY2xpY2tYID0gMDtcclxuICAgIHRoaXMuY2xpY2tZID0gMDtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuXHJcbiAgICAvL3ZhcmlhYmxlcyB0byBoYW5kbGUgdGhlIFwiZm9jdXNlZFwiIHdpbmRvd1xyXG4gICAgdGhpcy5sYXN0Rm9jdXNlZFdpbmRvdyA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuekluZGV4ID0gMDtcclxuXHJcbiAgICAvL3RoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbGF1bmNoID0gbmV3IExhdW5jaGVyKHRoaXMpO1xyXG4gICAgbGF1bmNoLmluaXQoKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmluZyBtb3ZlLWxpc3RlbmVyXCIpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1vdmluZ1wiKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgLy9nZXQgdGhlIGNsaWNrZWQtd2luZG93cyBcIm1haW4tZGl2XCJcclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUuaWQpIHtcclxuICAgICAgICB3aGlsZSAoZWxlbWVudC5wYXJlbnROb2RlLmlkICE9PSBcIm1haW4tZnJhbWVcIikge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3dcIikpIHtcclxuICAgICAgICAvL2NsaWNrZWQgRE9NIGlzIGEgd2luZG93IC0gZG8gc3R1ZmZcclxuXHJcbiAgICAgICAgLy9tYWtlIHN1cmUgdGhlIGxhc3QgYWN0aXZlIHdpbmRvdyBpcyBvbiB0b3BcclxuICAgICAgICBpZiAodGhpcy5sYXN0Rm9jdXNlZFdpbmRvdyAhPT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCArPSAxO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RGb2N1c2VkV2luZG93ID0gZWxlbWVudC5pZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vZmluZCB0aGUgd2luZG93IGluIHdpbmRvdy1hcnJheVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdGhpcy53aW5kb3dzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FkZCB0aGUgbGlzdGVuZXJzIHRvIGNoZWNrIGZvciBtb3ZlbWVudCBpZiBjbGljayB3ZXJlIGluIHRoZSB3aW5kb3ctdG9wIG9mIHdpbmRvd1xyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LXRvcFwiKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmFjdGl2ZVdpbmRvdy54O1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrWSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmFjdGl2ZVdpbmRvdy55O1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtb3ZpbmdcIik7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFkZGluZyBtb3VzZW1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwidHJ5aW5nIHRvIG1vdmUgd2luZG93XCIpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cueCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmNsaWNrWDtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LnkgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5hY3RpdmVXaW5kb3cueCArIFwicHhcIjtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5hY3RpdmVXaW5kb3cueSArIFwicHhcIjtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLndpbmRvd0J1dHRvbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCB3aW5kb3ctYnV0dG9uXCIpO1xyXG4gICAgdmFyIGFjdGlvbiA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3Q7XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy9maW5kIHdoYXQgd2luZG93IGdvdCBjbGlja2VkXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2luZG93c1tpXS5pZCA9PT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICBpZiAoYWN0aW9uLmNvbnRhaW5zKFwiZXhpdC1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9jbG9zZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWluaW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWluaW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1pbmltaXplKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWlubWl6ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgZXhhbXBsZVwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKS5jbGFzc0xpc3QuYWRkKFwiZXhhbXBsZS1hcHBcIik7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcbnZhciBNZW1vcnlBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL01lbW9yeUFwcGxpY2F0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gTGF1bmNoZXIoZGVza3RvcCkge1xyXG4gICAgdGhpcy5kZXNrdG9wID0gZGVza3RvcDtcclxuICAgIC8vdGhpcy5zdGFydEFwcGxpY2F0aW9uKFwibWVtb3J5XCIpO1xyXG59XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlUYWc7XHJcbiAgICB2YXIgYXBwTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubGF1bmNoZXIgbGlcIik7XHJcbiAgICBjb25zb2xlLmxvZyhhcHBMaXN0KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlUYWcgPSBhcHBMaXN0W2ldLnF1ZXJ5U2VsZWN0b3IoXCJpXCIpO1xyXG4gICAgICAgIC8vaVRhZy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zdGFydEFwcGxpY2F0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGFwcExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc3RhcnRBcHBsaWNhdGlvbi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuc3RhcnRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgbmV3QXBwID0gZmFsc2U7XHJcblxyXG4gICAgdmFyIG1hcmdpbiA9IDEwICogKHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIgKyAxKTtcclxuICAgIHZhciBhcHBPcHRpb25zID0ge1xyXG4gICAgICAgIGlkOiBcIndpbi1cIiArIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgeDogbWFyZ2luLFxyXG4gICAgICAgIHk6IG1hcmdpbixcclxuICAgICAgICB6SW5kZXg6IHRoaXMuZGVza3RvcC56SW5kZXhcclxuICAgIH07XHJcblxyXG4gICAgLy92YXIgbmV3SUQgPSBcIndpbi1cIiArIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXI7XHJcbiAgICB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICs9IDE7XHJcblxyXG4gICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcclxuICAgIHZhciB2YWx1ZTtcclxuICAgIGlmIChldmVudC50YXJnZXQuYXR0cmlidXRlc1tcInZhbHVlXCJdKSB7XHJcbiAgICAgICAgdmFsdWUgPSBldmVudC50YXJnZXQuYXR0cmlidXRlc1tcInZhbHVlXCJdLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuYXR0cmlidXRlc1tcInZhbHVlXCJdKSB7XHJcbiAgICAgICAgdmFsdWUgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5hdHRyaWJ1dGVzW1widmFsdWVcIl0udmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoICh2YWx1ZSkge1xyXG4gICAgICAgIGNhc2UgXCJleGFtcGxlXCI6IHtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IEV4QShhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLnByaW50KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcIm1lbW9yeVwiOiB7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMudGl0bGUgPSBcIk1lbW9yeVwiO1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLmljb24gPSBcIm1lbW9yeVwiO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgTWVtb3J5QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5wcmludCgpO1xyXG4gICAgICAgICAgICBuZXdBcHAuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXdBcHApIHtcclxuICAgICAgICB2YXIgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBuZXdBcHAuaWQgKyBcIiAud2luZG93LWJ1dHRvbnNcIik7XHJcbiAgICAgICAgYnV0dG9ucy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXNrdG9wLndpbmRvd0J1dHRvbkNsaWNrLmJpbmQodGhpcy5kZXNrdG9wKSk7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLndpbmRvd3MucHVzaChuZXdBcHApO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYXVuY2hlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBNZW1vcnlHYW1lID0gcmVxdWlyZShcIi4vbWVtb3J5L0dhbWVcIik7XHJcblxyXG5mdW5jdGlvbiBNZW1vcnlBcHBsaWNhdGlvbihvcHRpb25zKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgLyp0aGlzLnRpdGxlID0gdGl0bGU7XHJcbiAgICB0aGlzLmljb24gPSBpY29uOyovXHJcbn1cclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE1lbW9yeUFwcGxpY2F0aW9uO1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuZWxlbWVudCk7XHJcbiAgICB2YXIgZyA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCA0LCA0KTtcclxuICAgIGcuaW5pdCgpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgbWVtb3J5XCIpO1xyXG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCkuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XHJcblxyXG4gICAgLyp0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7Ki9cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5QXBwbGljYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEZXNrdG9wID0gcmVxdWlyZShcIi4vRGVza3RvcFwiKTtcclxuXHJcbnZhciBkID0gbmV3IERlc2t0b3AoKTtcclxuZC5pbml0KCk7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXG4gKi9cbnZhciBNZW1vcnlCb2FyZCA9IHJlcXVpcmUoXCIuL01lbW9yeUJvYXJkXCIpO1xudmFyIE1lbW9yeUNhcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlDYXJkXCIpO1xudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XG5cbmZ1bmN0aW9uIEdhbWUoZWxlbWVudCwgeCwgeSkge1xuICAgIHZhciBpID0gMDtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMubGF5b3V0ID0gbmV3IE1lbW9yeUJvYXJkKGVsZW1lbnQsIHRoaXMueCwgdGhpcy55KTtcbiAgICB0aGlzLmJvYXJkID0gW107XG4gICAgZm9yKGkgPSAwOyBpIDwgdGhpcy54OyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBBcnJheSh5KSk7XG4gICAgfVxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XG4gICAgdGhpcy50dXJucyA9IDA7XG4gICAgdGhpcy5jb3JyZWN0Q291bnQgPSAwO1xuICAgIHRoaXMuaW1hZ2VzID0gWzAsMCwxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDddO1xuICAgIC8vdGhpcy5mb3VuZFBpbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZvdW5kLXBpbGVcIik7XG5cbiAgICAvL3RoaXMudGltZXIgPSBuZXcgVGltZXIoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImgzXCIpKTtcbiAgICAvL3RoaXMudGltZXIuc3RhcnQoKTtcblxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcblxuICAgIHRoaXMuc2h1ZmZsZUltYWdlcygpO1xuICAgIHRoaXMuYWRkRXZlbnRzKCk7XG59XG5cbkdhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRcIikpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuaW1hZ2VzKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpIHtcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMueCAtIDE7IGogKz0gMikge1xuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgaiwgdGhpcy5pbWFnZXMucG9wKCkpO1xuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqKzFdID0gbmV3IE1lbW9yeUNhcmQoXCJcIiArIGkgKyAoaiArIDEpLCB0aGlzLmltYWdlcy5wb3AoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2codGhpcy5pbWFnZXMpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuYm9hcmQpO1xufTtcblxuR2FtZS5wcm90b3R5cGUuc2h1ZmZsZUltYWdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wO1xuICAgIHZhciByYW5kO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGVtcCA9IHRoaXMuaW1hZ2VzW2ldO1xuICAgICAgICByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5pbWFnZXMubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbaV0gPSB0aGlzLmltYWdlc1tyYW5kXTtcbiAgICAgICAgdGhpcy5pbWFnZXNbcmFuZF0gPSB0ZW1wO1xuICAgIH1cbn07XG5cbkdhbWUucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vdmFyIGJvYXJkRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1ib2FyZFwiKTtcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aCA8IDIgJiYgIWV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkaXNhYmxlXCIpKSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZFwiKSkge1xuICAgICAgICAgICAgdmFyIHl4ID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdFswXS5zcGxpdChcIi1cIilbMV07XG4gICAgICAgICAgICB2YXIgeSA9IHl4LmNoYXJBdCgwKTtcbiAgICAgICAgICAgIHZhciB4ID0geXguY2hhckF0KDEpO1xuXG4gICAgICAgICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LmFkZChcImltZy1cIiArIHRoaXMuYm9hcmRbeV1beF0uaW1nTnIpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJpbWdcIik7XG5cbiAgICAgICAgICAgIHRoaXMudmlzaWJsZUNhcmRzLnB1c2godGhpcy5ib2FyZFt5XVt4XSk7XG5cbiAgICAgICAgICAgIC8vZGlzYWJsZSB0aGUgY2E8cmQgdGhhdCBnb3QgY2xpY2tlZFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMuYm9hcmRbeV1beF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlXCIpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5HYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHVybnMgKz0gMTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnZpc2libGVDYXJkcyk7XG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yID09PSB0aGlzLnZpc2libGVDYXJkc1sxXS5pbWdOcikge1xuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbMF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzWzFdLmlkKS5jbGFzc0xpc3QuYWRkKFwicmlnaHRcIik7XG5cbiAgICAgICAgLy90aGlzLmFkZFRvUGlsZSh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XG4gICAgICAgIC8vdGhpcy5wbGF5ZXJzW3RoaXMuYWN0aXZlUGxheWVyXS5jYXJkcy5wdXNoKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yKTtcbiAgICAgICAgLy90aGlzLnBsYXllcnNbdGhpcy5hY3RpdmVQbGF5ZXJdLmFkZFRvUGlsZSgpO1xuXG4gICAgICAgIC8vcmVzZXQgdGhlIGFycmF5XG4gICAgICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XG5cbiAgICAgICAgdGhpcy5jb3JyZWN0Q291bnQgKz0gMTtcblxuICAgICAgICBpZiAodGhpcy5jb3JyZWN0Q291bnQgPT09ICh0aGlzLngqdGhpcy55IC8gMikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCh0aGlzLngqdGhpcy55IC8gMikpO1xuXG4gICAgICAgICAgICAvKmlmKHRoaXMubnJPZlBsYXllcnMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJTaW5nbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJNdWx0aSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5wbGF5ZXJzKTsqL1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSs9MSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbaV0uaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQodGhpcy50dXJuQmFja0NhcmRzLmJpbmQodGhpcyksIDEwMDApO1xuICAgICAgICAvL3RoaXMuY2hhbmdlUGxheWVyKCk7XG4gICAgfVxufTtcblxuR2FtZS5wcm90b3R5cGUuY2hhbmdlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5hY3RpdmVQbGF5ZXIgPT09IHRoaXMubnJPZlBsYXllcnMgLSAxKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyID0gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyICs9IDE7XG4gICAgfVxufTtcblxuR2FtZS5wcm90b3R5cGUudHVybkJhY2tDYXJkcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wQ2FyZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRlbXBDYXJkID0gdGhpcy52aXNpYmxlQ2FyZHNbaV07XG4gICAgICAgIGNvbnNvbGUubG9nKHRlbXBDYXJkKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRlbXBDYXJkLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwid3JvbmdcIiwgXCJpbWdcIiwgXCJpbWctXCIgKyB0ZW1wQ2FyZC5pbWdOcik7XG4gICAgfVxuXG4gICAgLy9yZXNldCB0aGUgYXJyYXlcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xufTtcblxuR2FtZS5wcm90b3R5cGUuZ2FtZU92ZXJTaW5nbGUgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tYm9hcmRcIikpO1xuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZW92ZXItc2luZ2xlcGxheWVyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIjdHVybnNcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50dXJucykpO1xuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRvdGFsVGltZSkpO1xuICAgIGZyYWcuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5nYW1lT3Zlck11bHRpID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciB3aW5uZXIgPSBbdGhpcy5wbGF5ZXJzWzBdXTtcblxuICAgIC8vZmluZCB0aGUgd2lubmVyXG4gICAgZm9yIChpID0gMTsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmNhcmRzLmxlbmd0aCA+IHdpbm5lclswXS5jYXJkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHdpbm5lciA9IFtdO1xuICAgICAgICAgICAgd2lubmVyLnB1c2godGhpcy5wbGF5ZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnBsYXllcnNbaV0uY2FyZHMubGVuZ3RoID09PSB3aW5uZXJbMF0uY2FyZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB3aW5uZXIucHVzaCh0aGlzLnBsYXllcnNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWJvYXJkXCIpKTtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVvdmVyLW11bHRpcGxheWVyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIHZhciB3aW5uZXJTdHJpbmcgPSBcIlwiO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHdpbm5lci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB3aW5uZXJTdHJpbmcgKz0gd2lubmVyW2ldLm5hbWUgKyBcIiwgXCI7XG4gICAgfVxuXG4gICAgd2lubmVyU3RyaW5nID0gd2lubmVyU3RyaW5nLnNsaWNlKDAsIC0yKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLndpbm5lclwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh3aW5uZXJTdHJpbmcpKTtcbiAgICBmcmFnLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLmFwcGVuZENoaWxkKGZyYWcpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXG4gKi9cblxuZnVuY3Rpb24gTWVtb3J5Qm9hcmQoZWxlbWVudCwgeCx5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgICB0aGlzLnByaW50Q2FyZHMoKTtcbn1cblxuTWVtb3J5Qm9hcmQucHJvdG90eXBlLnByaW50Q2FyZHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgIHZhciByb3dEaXY7XG4gICAgdmFyIGNhcmREaXY7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpXG4gICAge1xuICAgICAgICByb3dEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICByb3dEaXYuY2xhc3NMaXN0LmFkZChcInJvd1wiKTtcblxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy54OyBqICs9IDEpIHtcbiAgICAgICAgICAgIGNhcmREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgY2FyZERpdi5jbGFzc0xpc3QuYWRkKFwiY2FyZC1cIiArIGkgKyBqLCBcImNhcmRcIik7XG4gICAgICAgICAgICByb3dEaXYuYXBwZW5kQ2hpbGQoY2FyZERpdik7XG4gICAgICAgIH1cblxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJvd0Rpdik7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2codGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZnJhZyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUJvYXJkO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXG4gKi9cblxuZnVuY3Rpb24gTWVtb3J5Q2FyZChpZCwgaW1nTnIpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUNhcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBUaW1lciBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0gZWxlbWVudHtPYmplY3R9LCBlbGVtZW50IHRvIHByaW50IHRoZSB0aW1lciB0b1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRpbWVyKGVsZW1lbnQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5pbnRlcnZhbCA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RhcnRzIGFuIGludGVydmFsIGZvciB0aGUgdGltZXJcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jYWxsIHRoZSBydW4gZnVuY3Rpb24gb24gZWFjaCBpbnRlcnZhbFxyXG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMucnVuLmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgZWFjaCBpbnRlcnZhbCBvZiB0aGUgdGltZXJcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAvL2NvdW50IHRoZSBkaWZmZXJlbmNlIGZyb20gc3RhcnQgdG8gbm93XHJcbiAgICB2YXIgZGlmZiA9IChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xyXG5cclxuICAgIHRoaXMucHJpbnQoZGlmZi50b0ZpeGVkKDEpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0b3BzIHRoZSB0aW1lciBiZWZvcmUgaXRzIG92ZXJcclxuICogQHJldHVybnMge251bWJlcn0sIHRoZSBkaWZmZXJlbmNlIGluIHNlY29uZHNcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIHJldHVybiAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSB0aW1lciBhdCB0aGUgZ2l2ZW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZGlmZntOdW1iZXJ9IHRoZSB0aW1lIHRvIGJlIHByaW50ZWRcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKGRpZmYpIHtcclxuICAgIGlmKHRoaXMuZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpLCB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZikpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcclxuIl19

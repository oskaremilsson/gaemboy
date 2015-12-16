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

BasicWindow.prototype.print = function () {
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

Desktop.prototype.destroyWindow = function(event) {
    console.log("destroying window");
    var element = event.target;

    if (element.parentNode) {
        while (!element.parentNode.id) {
            element = element.parentNode;
        }
        element = element.parentNode;
    }

    var index = -1;
    for (var i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            index = i;
        }
    }

    if (index !== -1) {
        this.windows[index].destroy();
        this.windows.splice(index, 1);
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
    var exitButton;

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
        exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
        exitButton.addEventListener("click", this.desktop.destroyWindow.bind(this.desktop));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9HYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvVGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3cob3B0aW9ucykge1xyXG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgXCJcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy54ID0gb3B0aW9ucy54IHx8IDEwO1xyXG4gICAgdGhpcy55ID0gb3B0aW9ucy55IHx8IDEwO1xyXG4gICAgdGhpcy56SW5kZXggPSBvcHRpb25zLnpJbmRleCB8fCAwO1xyXG4gICAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGUgfHwgdGhpcy5pZDtcclxuICAgIHRoaXMuaWNvbiA9IG9wdGlvbnMuaWNvbiB8fCBcImJ1Z19yZXBvcnRcIjtcclxufVxyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCBkZXN0cm95XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCB0aGlzXHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nXCIpO1xyXG4gICAgdmFyIHRlbXBsYXRlICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xyXG4gICAgdmFyIHRlbXBsYXRlV2luZG93ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImRpdlwiKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXMuaWQpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgdmFyIGxhdW5jaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlclwiKTtcclxuICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBsYXVuY2hlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljV2luZG93OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy92YXIgRXhBID0gcmVxdWlyZShcIi4vRXhhbXBsZUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgTGF1bmNoZXIgPSByZXF1aXJlKFwiLi9MYXVuY2hlclwiKTtcclxuXHJcbmZ1bmN0aW9uIERlc2t0b3AoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb3VzZU1vdmVGdW5jID0gdGhpcy5tb3VzZU1vdmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMubW91c2VVcEZ1bmMgPSB0aGlzLm1vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgIHRoaXMud2luZG93cyA9IFtdO1xyXG4gICAgdGhpcy5jbGlja1ggPSAwO1xyXG4gICAgdGhpcy5jbGlja1kgPSAwO1xyXG4gICAgdGhpcy5zZXJpYWxOdW1iZXIgPSAwO1xyXG5cclxuICAgIC8vdmFyaWFibGVzIHRvIGhhbmRsZSB0aGUgXCJmb2N1c2VkXCIgd2luZG93XHJcbiAgICB0aGlzLmxhc3RGb2N1c2VkV2luZG93ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy56SW5kZXggPSAwO1xyXG5cclxuICAgIC8vdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBsYXVuY2ggPSBuZXcgTGF1bmNoZXIodGhpcyk7XHJcbiAgICBsYXVuY2guaW5pdCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlbW92aW5nIG1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibW92aW5nXCIpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAvL2dldCB0aGUgY2xpY2tlZC13aW5kb3dzIFwibWFpbi1kaXZcIlxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgIHdoaWxlIChlbGVtZW50LnBhcmVudE5vZGUuaWQgIT09IFwibWFpbi1mcmFtZVwiKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvd1wiKSkge1xyXG4gICAgICAgIC8vY2xpY2tlZCBET00gaXMgYSB3aW5kb3cgLSBkbyBzdHVmZlxyXG5cclxuICAgICAgICAvL21ha2Ugc3VyZSB0aGUgbGFzdCBhY3RpdmUgd2luZG93IGlzIG9uIHRvcFxyXG4gICAgICAgIGlmICh0aGlzLmxhc3RGb2N1c2VkV2luZG93ICE9PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuekluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy56SW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdEZvY3VzZWRXaW5kb3cgPSBlbGVtZW50LmlkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9maW5kIHRoZSB3aW5kb3cgaW4gd2luZG93LWFycmF5XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMud2luZG93c1tpXS5pZCA9PT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB0aGlzLndpbmRvd3NbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIHRoZSBsaXN0ZW5lcnMgdG8gY2hlY2sgZm9yIG1vdmVtZW50IGlmIGNsaWNrIHdlcmUgaW4gdGhlIHdpbmRvdy10b3Agb2Ygd2luZG93XHJcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3ctdG9wXCIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuYWN0aXZlV2luZG93Lng7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuYWN0aXZlV2luZG93Lnk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1vdmluZ1wiKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkaW5nIG1vdXNlbW92ZS1saXN0ZW5lclwiKTtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ0cnlpbmcgdG8gbW92ZSB3aW5kb3dcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLmFjdGl2ZVdpbmRvdy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLmFjdGl2ZVdpbmRvdy55ICsgXCJweFwiO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuZGVzdHJveVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImRlc3Ryb3lpbmcgd2luZG93XCIpO1xyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgZXhhbXBsZVwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKS5jbGFzc0xpc3QuYWRkKFwiZXhhbXBsZS1hcHBcIik7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcbnZhciBNZW1vcnlBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL01lbW9yeUFwcGxpY2F0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gTGF1bmNoZXIoZGVza3RvcCkge1xyXG4gICAgdGhpcy5kZXNrdG9wID0gZGVza3RvcDtcclxuICAgIC8vdGhpcy5zdGFydEFwcGxpY2F0aW9uKFwibWVtb3J5XCIpO1xyXG59XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlUYWc7XHJcbiAgICB2YXIgYXBwTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubGF1bmNoZXIgbGlcIik7XHJcbiAgICBjb25zb2xlLmxvZyhhcHBMaXN0KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlUYWcgPSBhcHBMaXN0W2ldLnF1ZXJ5U2VsZWN0b3IoXCJpXCIpO1xyXG4gICAgICAgIC8vaVRhZy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zdGFydEFwcGxpY2F0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGFwcExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc3RhcnRBcHBsaWNhdGlvbi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuc3RhcnRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgbmV3QXBwID0gZmFsc2U7XHJcbiAgICB2YXIgZXhpdEJ1dHRvbjtcclxuXHJcbiAgICB2YXIgbWFyZ2luID0gMTAgKiAodGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlciArIDEpO1xyXG4gICAgdmFyIGFwcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB4OiBtYXJnaW4sXHJcbiAgICAgICAgeTogbWFyZ2luLFxyXG4gICAgICAgIHpJbmRleDogdGhpcy5kZXNrdG9wLnpJbmRleFxyXG4gICAgfTtcclxuXHJcbiAgICAvL3ZhciBuZXdJRCA9IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcjtcclxuICAgIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIgKz0gMTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC5hdHRyaWJ1dGVzW1widmFsdWVcIl0pIHtcclxuICAgICAgICB2YWx1ZSA9IGV2ZW50LnRhcmdldC5hdHRyaWJ1dGVzW1widmFsdWVcIl0udmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC50YXJnZXQucGFyZW50Tm9kZS5hdHRyaWJ1dGVzW1widmFsdWVcIl0pIHtcclxuICAgICAgICB2YWx1ZSA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmF0dHJpYnV0ZXNbXCJ2YWx1ZVwiXS52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2ggKHZhbHVlKSB7XHJcbiAgICAgICAgY2FzZSBcImV4YW1wbGVcIjoge1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwibWVtb3J5XCI6IHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy50aXRsZSA9IFwiTWVtb3J5XCI7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMuaWNvbiA9IFwibWVtb3J5XCI7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLnByaW50KCk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld0FwcCkge1xyXG4gICAgICAgIGV4aXRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgbmV3QXBwLmlkICsgXCIgLmV4aXQtYnV0dG9uIFwiKTtcclxuICAgICAgICBleGl0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlc2t0b3AuZGVzdHJveVdpbmRvdy5iaW5kKHRoaXMuZGVza3RvcCkpO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC53aW5kb3dzLnB1c2gobmV3QXBwKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF1bmNoZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG52YXIgTWVtb3J5R2FtZSA9IHJlcXVpcmUoXCIuL21lbW9yeS9HYW1lXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuICAgIC8qdGhpcy50aXRsZSA9IHRpdGxlO1xyXG4gICAgdGhpcy5pY29uID0gaWNvbjsqL1xyXG59XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBNZW1vcnlBcHBsaWNhdGlvbjtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmVsZW1lbnQpO1xyXG4gICAgdmFyIGcgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgNCwgNCk7XHJcbiAgICBnLmluaXQoKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nIG1lbW9yeVwiKTtcclxuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYXBwXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYXBwXCIpO1xyXG5cclxuICAgIC8qdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LXRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGl0bGUpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuaWNvbikpOyovXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7XHJcbmQuaW5pdCgpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxuICovXG52YXIgTWVtb3J5Qm9hcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlCb2FyZFwiKTtcbnZhciBNZW1vcnlDYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Q2FyZFwiKTtcbnZhciBUaW1lciA9IHJlcXVpcmUoXCIuL1RpbWVyXCIpO1xuXG5mdW5jdGlvbiBHYW1lKGVsZW1lbnQsIHgsIHkpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmxheW91dCA9IG5ldyBNZW1vcnlCb2FyZChlbGVtZW50LCB0aGlzLngsIHRoaXMueSk7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xuICAgIGZvcihpID0gMDsgaSA8IHRoaXMueDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkoeSkpO1xuICAgIH1cbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xuICAgIHRoaXMudHVybnMgPSAwO1xuICAgIHRoaXMuY29ycmVjdENvdW50ID0gMDtcbiAgICB0aGlzLmltYWdlcyA9IFswLDAsMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3XTtcbiAgICAvL3RoaXMuZm91bmRQaWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb3VuZC1waWxlXCIpO1xuXG4gICAgLy90aGlzLnRpbWVyID0gbmV3IFRpbWVyKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoM1wiKSk7XG4gICAgLy90aGlzLnRpbWVyLnN0YXJ0KCk7XG5cbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XG5cbiAgICB0aGlzLnNodWZmbGVJbWFnZXMoKTtcbiAgICB0aGlzLmFkZEV2ZW50cygpO1xufVxuXG5HYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpKTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmltYWdlcyk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKSB7XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1bal0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIGosIHRoaXMuaW1hZ2VzLnBvcCgpKTtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1baisxXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgKGogKyAxKSwgdGhpcy5pbWFnZXMucG9wKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRoaXMuaW1hZ2VzKTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmJvYXJkKTtcbn07XG5cbkdhbWUucHJvdG90eXBlLnNodWZmbGVJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcDtcbiAgICB2YXIgcmFuZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW1hZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRlbXAgPSB0aGlzLmltYWdlc1tpXTtcbiAgICAgICAgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuaW1hZ2VzLmxlbmd0aCk7XG4gICAgICAgIHRoaXMuaW1hZ2VzW2ldID0gdGhpcy5pbWFnZXNbcmFuZF07XG4gICAgICAgIHRoaXMuaW1hZ2VzW3JhbmRdID0gdGVtcDtcbiAgICB9XG59O1xuXG5HYW1lLnByb3RvdHlwZS5hZGRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAvL3ZhciBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tYm9hcmRcIik7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrLmJpbmQodGhpcykpO1xufTtcblxuR2FtZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICh0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPCAyICYmICFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGlzYWJsZVwiKSkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImNhcmRcIikpIHtcbiAgICAgICAgICAgIHZhciB5eCA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3RbMF0uc3BsaXQoXCItXCIpWzFdO1xuICAgICAgICAgICAgdmFyIHkgPSB5eC5jaGFyQXQoMCk7XG4gICAgICAgICAgICB2YXIgeCA9IHl4LmNoYXJBdCgxKTtcblxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJpbWctXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmltZ05yKTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKFwiaW1nXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xuXG4gICAgICAgICAgICAvL2Rpc2FibGUgdGhlIGNhPHJkIHRoYXQgZ290IGNsaWNrZWRcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmlkKS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZVwiKTtcblxuICAgICAgICAgICAgaWYodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0lmQ29ycmVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuR2FtZS5wcm90b3R5cGUuY2hlY2tJZkNvcnJlY3QgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnR1cm5zICs9IDE7XG4gICAgY29uc29sZS5sb2codGhpcy52aXNpYmxlQ2FyZHMpO1xuICAgIGlmICh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOciA9PT0gdGhpcy52aXNpYmxlQ2FyZHNbMV0uaW1nTnIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzWzBdLmlkKS5jbGFzc0xpc3QuYWRkKFwicmlnaHRcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1sxXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xuXG4gICAgICAgIC8vdGhpcy5hZGRUb1BpbGUodGhpcy52aXNpYmxlQ2FyZHNbMF0uaW1nTnIpO1xuICAgICAgICAvL3RoaXMucGxheWVyc1t0aGlzLmFjdGl2ZVBsYXllcl0uY2FyZHMucHVzaCh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XG4gICAgICAgIC8vdGhpcy5wbGF5ZXJzW3RoaXMuYWN0aXZlUGxheWVyXS5hZGRUb1BpbGUoKTtcblxuICAgICAgICAvL3Jlc2V0IHRoZSBhcnJheVxuICAgICAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XG5cbiAgICAgICAgaWYgKHRoaXMuY29ycmVjdENvdW50ID09PSAodGhpcy54KnRoaXMueSAvIDIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygodGhpcy54KnRoaXMueSAvIDIpKTtcblxuICAgICAgICAgICAgLyppZih0aGlzLm5yT2ZQbGF5ZXJzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyU2luZ2xlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyTXVsdGkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucGxheWVycyk7Ki9cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkrPTEpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LmFkZChcIndyb25nXCIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMudHVybkJhY2tDYXJkcy5iaW5kKHRoaXMpLCAxMDAwKTtcbiAgICAgICAgLy90aGlzLmNoYW5nZVBsYXllcigpO1xuICAgIH1cbn07XG5cbkdhbWUucHJvdG90eXBlLmNoYW5nZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMuYWN0aXZlUGxheWVyID09PSB0aGlzLm5yT2ZQbGF5ZXJzIC0gMSkge1xuICAgICAgICB0aGlzLmFjdGl2ZVBsYXllciA9IDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmFjdGl2ZVBsYXllciArPSAxO1xuICAgIH1cbn07XG5cbkdhbWUucHJvdG90eXBlLnR1cm5CYWNrQ2FyZHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcENhcmQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0ZW1wQ2FyZCA9IHRoaXMudmlzaWJsZUNhcmRzW2ldO1xuICAgICAgICBjb25zb2xlLmxvZyh0ZW1wQ2FyZCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0ZW1wQ2FyZC5pZCkuY2xhc3NMaXN0LnJlbW92ZShcIndyb25nXCIsIFwiaW1nXCIsIFwiaW1nLVwiICsgdGVtcENhcmQuaW1nTnIpO1xuICAgIH1cblxuICAgIC8vcmVzZXQgdGhlIGFycmF5XG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcbn07XG5cbkdhbWUucHJvdG90eXBlLmdhbWVPdmVyU2luZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWJvYXJkXCIpKTtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVvdmVyLXNpbmdsZXBsYXllclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiI3R1cm5zXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudHVybnMpKTtcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiI3RpbWVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50b3RhbFRpbWUpKTtcbiAgICBmcmFnLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLmFwcGVuZENoaWxkKGZyYWcpO1xufTtcblxuR2FtZS5wcm90b3R5cGUuZ2FtZU92ZXJNdWx0aSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgd2lubmVyID0gW3RoaXMucGxheWVyc1swXV07XG5cbiAgICAvL2ZpbmQgdGhlIHdpbm5lclxuICAgIGZvciAoaSA9IDE7IGkgPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheWVyc1tpXS5jYXJkcy5sZW5ndGggPiB3aW5uZXJbMF0uY2FyZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB3aW5uZXIgPSBbXTtcbiAgICAgICAgICAgIHdpbm5lci5wdXNoKHRoaXMucGxheWVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5wbGF5ZXJzW2ldLmNhcmRzLmxlbmd0aCA9PT0gd2lubmVyWzBdLmNhcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgd2lubmVyLnB1c2godGhpcy5wbGF5ZXJzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1ib2FyZFwiKSk7XG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lb3Zlci1tdWx0aXBsYXllclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICB2YXIgd2lubmVyU3RyaW5nID0gXCJcIjtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB3aW5uZXIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgd2lubmVyU3RyaW5nICs9IHdpbm5lcltpXS5uYW1lICsgXCIsIFwiO1xuICAgIH1cblxuICAgIHdpbm5lclN0cmluZyA9IHdpbm5lclN0cmluZy5zbGljZSgwLCAtMik7XG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi53aW5uZXJcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUod2lubmVyU3RyaW5nKSk7XG4gICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5hcHBlbmRDaGlsZChmcmFnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxuICovXG5cbmZ1bmN0aW9uIE1lbW9yeUJvYXJkKGVsZW1lbnQsIHgseSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgdGhpcy5wcmludENhcmRzKCk7XG59XG5cbk1lbW9yeUJvYXJkLnByb3RvdHlwZS5wcmludENhcmRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICB2YXIgcm93RGl2O1xuICAgIHZhciBjYXJkRGl2O1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKVxuICAgIHtcbiAgICAgICAgcm93RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgcm93RGl2LmNsYXNzTGlzdC5hZGQoXCJyb3dcIik7XG5cbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMueDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjYXJkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGNhcmREaXYuY2xhc3NMaXN0LmFkZChcImNhcmQtXCIgKyBpICsgaiwgXCJjYXJkXCIpO1xuICAgICAgICAgICAgcm93RGl2LmFwcGVuZENoaWxkKGNhcmREaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyb3dEaXYpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlCb2FyZDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxuICovXG5cbmZ1bmN0aW9uIE1lbW9yeUNhcmQoaWQsIGltZ05yKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaW1nTnIgPSBpbWdOcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlDYXJkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogVGltZXIgY29uc3RydWN0b3JcclxuICogQHBhcmFtIGVsZW1lbnR7T2JqZWN0fSwgZWxlbWVudCB0byBwcmludCB0aGUgdGltZXIgdG9cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUaW1lcihlbGVtZW50KSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMuaW50ZXJ2YWwgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0YXJ0cyBhbiBpbnRlcnZhbCBmb3IgdGhlIHRpbWVyXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2FsbCB0aGUgcnVuIGZ1bmN0aW9uIG9uIGVhY2ggaW50ZXJ2YWxcclxuICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnJ1bi5iaW5kKHRoaXMpLCAxMDApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGVhY2ggaW50ZXJ2YWwgb2YgdGhlIHRpbWVyXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgLy9jb3VudCB0aGUgZGlmZmVyZW5jZSBmcm9tIHN0YXJ0IHRvIG5vd1xyXG4gICAgdmFyIGRpZmYgPSAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxuXHJcbiAgICB0aGlzLnByaW50KGRpZmYudG9GaXhlZCgxKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdG9wcyB0aGUgdGltZXIgYmVmb3JlIGl0cyBvdmVyXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9LCB0aGUgZGlmZmVyZW5jZSBpbiBzZWNvbmRzXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICByZXR1cm4gKG5vdyAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDA7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdyB0aGUgdGltZXIgYXQgdGhlIGdpdmVuIGVsZW1lbnRcclxuICogQHBhcmFtIGRpZmZ7TnVtYmVyfSB0aGUgdGltZSB0byBiZSBwcmludGVkXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbihkaWZmKSB7XHJcbiAgICBpZih0aGlzLmVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSwgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XHJcbiJdfQ==

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function BasicWindow(options) {
    this.id = options.id || "" + new Date().getTime();
    this.element = undefined;
    this.x = options.x || 10;
    this.y = options.y || 10;
    this.tabIndex = options.tabIndex || 0;
    this.title = options.title || this.id;
    this.icon = options.icon || "bug_report";
    this.maximizable = options.maximizable || false;
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
    templateWindow.setAttribute("tabindex", this.tabIndex);

    var element = document.querySelector("#main-frame");
    var launcher = document.querySelector(".launcher");
    element.insertBefore(template, launcher);
    this.element = document.querySelector("#" + this.id);
    this.element.querySelector(".window-title").appendChild(document.createTextNode(this.title));
    this.element.querySelector(".window-icon").appendChild(document.createTextNode(this.icon));

    //add maximize-button
    if (this.maximizable) {
        var button = document.querySelector("#template-maximize-button").content.cloneNode(true);
        var windowButtons = this.element.querySelector(".window-buttons");
        var removeButton = this.element.querySelector(".minimize-button");
        windowButtons.insertBefore(button, removeButton);
    }
};

BasicWindow.prototype.minimize = function() {
    this.element.classList.toggle("minimized");
};

BasicWindow.prototype.maximize = function() {
    this.element.classList.toggle("maximized");

    var icon = this.element.querySelector(".maximize-icon i");
    if (!this.element.classList.contains("maximized")) {
        this.element.classList.add("reset-window");
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
        icon.replaceChild(document.createTextNode("crop_din"), icon.firstChild);
    }
    else {
        this.element.classList.remove("reset-window");
        this.element.style.top = "0px";
        this.element.style.left = "0px";
        icon.replaceChild(document.createTextNode("filter_none"), icon.firstChild);
    }
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
}

Desktop.prototype.init = function() {
    var launch = new Launcher(this);
    launch.init();

    document.addEventListener("mousedown", this.mouseDown.bind(this));
    document.addEventListener("keydown", this.keyDown.bind(this));
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
        element.focus();

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


    this.activeWindow.element.classList.remove("reset-window");
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
            //remove from "running-apps"
            var windowTooltip = document.querySelector("[value='id:" + this.windows[index].id + "']");
            windowTooltip.parentNode.removeChild(windowTooltip);

            //close the app
            this.windows[index].destroy();
            this.windows.splice(index, 1);
        }
        else if (action.contains("minimize-button")) {
            //minimize the app
            this.windows[index].minimize();
        }
        else if (action.contains("maximize-button")) {
            //maximize the app
            if (this.windows[index].maximizable) {
                this.windows[index].maximize();
            }
        }
    }
};

Desktop.prototype.clearDesktop = function() {
    for (var i = 0; i < this.windows.length; i += 1) {
        this.windows[i].destroy();
        //remove from "running-apps"
        var windowTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
        windowTooltip.parentNode.removeChild(windowTooltip);
    }
    this.windows = [];
    this.serialNumber = 0;
};

Desktop.prototype.keyDown = function(event) {
    console.log(event.keyCode);
    console.log(document.activeElement);
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
    var value;
    var icon;
    var title;
    var newApp = false;
    var margin = 10 * (this.desktop.serialNumber + 1);

    console.log(event.target);
    var element;
    if (event.target.attributes["value"]) {
        element = event.target;
    }
    else if (event.target.parentNode.attributes["value"]) {
        //is the i-tag in the li
        element = event.target.parentNode;
    }

    if (element) {
        value = element.attributes["value"].value;

        if (value) {
            var switchTo = value.split(":");
            if(switchTo[0] === "id") {
                this.switchToWindow(switchTo[1]);
            }
            else {
                icon = element.querySelector("i").textContent;
                title = element.querySelector(".tooltip-title").textContent;
            }
        }
    }

    var appOptions = {
        id: "win-" + this.desktop.serialNumber,
        x: margin,
        y: margin,
        tabIndex: this.desktop.serialNumber,
        icon: icon,
        title: title
    };

    switch (value) {
        case "example": {
            appOptions.maximizable = true;
            newApp = new ExA(appOptions);
            newApp.print();

            break;
        }
        case "memory":
        {
            newApp = new MemoryApplication(appOptions);
            newApp.print();
            newApp.init();

            break;
        }
        case "reset":
        {
            console.log("resetting");
            this.desktop.clearDesktop();
            break;
        }
    }

    if (newApp) {
        var buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.windowButtonClick.bind(this.desktop));
        this.desktop.windows.push(newApp);
        this.addRunningApp(value, newApp);
        this.desktop.serialNumber += 1;
        newApp.element.focus();
    }
};

Launcher.prototype.switchToWindow = function(id) {
    var window = document.querySelector("#" + id);
    console.log(window);
    if (window) {
        window.classList.toggle("minimized");

        if (!window.classList.contains("minimized")) {
            window.focus();
        }
    }
};

Launcher.prototype.addRunningApp = function(type, app) {
    //get the tooltip-container for the app and add it to the list
    var container = document.querySelector("li[value='" + type + "'] .tooltip-container");

    var template = document.querySelector("#template-tooltip").content.cloneNode(true);
    template.querySelector(".tooltip").appendChild(document.createTextNode(app.title + "(" + app.id + ")"));
    template.querySelector(".tooltip").setAttribute("value", "id:" + app.id);

    container.appendChild(template);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9HYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvVGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3cob3B0aW9ucykge1xyXG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgXCJcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy54ID0gb3B0aW9ucy54IHx8IDEwO1xyXG4gICAgdGhpcy55ID0gb3B0aW9ucy55IHx8IDEwO1xyXG4gICAgdGhpcy50YWJJbmRleCA9IG9wdGlvbnMudGFiSW5kZXggfHwgMDtcclxuICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8IHRoaXMuaWQ7XHJcbiAgICB0aGlzLmljb24gPSBvcHRpb25zLmljb24gfHwgXCJidWdfcmVwb3J0XCI7XHJcbiAgICB0aGlzLm1heGltaXphYmxlID0gb3B0aW9ucy5tYXhpbWl6YWJsZSB8fCBmYWxzZTtcclxufVxyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCBkZXN0cm95XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IHRoaXNcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmdcIik7XHJcbiAgICB2YXIgdGVtcGxhdGUgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3dcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XHJcbiAgICB2YXIgdGVtcGxhdGVXaW5kb3cgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiZGl2XCIpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwiaWRcIiwgdGhpcy5pZCk7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGhpcy50YWJJbmRleCk7XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIik7XHJcbiAgICB2YXIgbGF1bmNoZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxhdW5jaGVyXCIpO1xyXG4gICAgZWxlbWVudC5pbnNlcnRCZWZvcmUodGVtcGxhdGUsIGxhdW5jaGVyKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy10aXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRpdGxlKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmljb24pKTtcclxuXHJcbiAgICAvL2FkZCBtYXhpbWl6ZS1idXR0b25cclxuICAgIGlmICh0aGlzLm1heGltaXphYmxlKSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWF4aW1pemUtYnV0dG9uXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHZhciB3aW5kb3dCdXR0b25zID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWJ1dHRvbnNcIik7XHJcbiAgICAgICAgdmFyIHJlbW92ZUJ1dHRvbiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1pbmltaXplLWJ1dHRvblwiKTtcclxuICAgICAgICB3aW5kb3dCdXR0b25zLmluc2VydEJlZm9yZShidXR0b24sIHJlbW92ZUJ1dHRvbik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwibWluaW1pemVkXCIpO1xyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1heGltaXplZFwiKTtcclxuXHJcbiAgICB2YXIgaWNvbiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWljb24gaVwiKTtcclxuICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJjcm9wX2RpblwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgICAgICBpY29uLnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcImZpbHRlcl9ub25lXCIpLCBpY29uLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vdmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIExhdW5jaGVyID0gcmVxdWlyZShcIi4vTGF1bmNoZXJcIik7XHJcblxyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2VNb3ZlRnVuYyA9IHRoaXMubW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm1vdXNlVXBGdW5jID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuY2xpY2tYID0gMDtcclxuICAgIHRoaXMuY2xpY2tZID0gMDtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxufVxyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxhdW5jaCA9IG5ldyBMYXVuY2hlcih0aGlzKTtcclxuICAgIGxhdW5jaC5pbml0KCk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlRG93bi5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5RG93bi5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlVXAgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZpbmcgbW92ZS1saXN0ZW5lclwiKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtb3ZpbmdcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IHVuZGVmaW5lZDtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlRG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIC8vZ2V0IHRoZSBjbGlja2VkLXdpbmRvd3MgXCJtYWluLWRpdlwiXHJcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgd2hpbGUgKGVsZW1lbnQucGFyZW50Tm9kZS5pZCAhPT0gXCJtYWluLWZyYW1lXCIpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93XCIpKSB7XHJcbiAgICAgICAgLy9jbGlja2VkIERPTSBpcyBhIHdpbmRvdyAtIGRvIHN0dWZmXHJcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xyXG5cclxuICAgICAgICAvL2ZpbmQgdGhlIHdpbmRvdyBpbiB3aW5kb3ctYXJyYXlcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IHRoaXMud2luZG93c1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9hZGQgdGhlIGxpc3RlbmVycyB0byBjaGVjayBmb3IgbW92ZW1lbnQgaWYgY2xpY2sgd2VyZSBpbiB0aGUgd2luZG93LXRvcCBvZiB3aW5kb3dcclxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvdy10b3BcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGlja1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5hY3RpdmVXaW5kb3cueDtcclxuICAgICAgICAgICAgdGhpcy5jbGlja1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5hY3RpdmVXaW5kb3cueTtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibW92aW5nXCIpO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhZGRpbmcgbW91c2Vtb3ZlLWxpc3RlbmVyXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInRyeWluZyB0byBtb3ZlIHdpbmRvd1wiKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LnggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy55ID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuY2xpY2tZO1xyXG5cclxuXHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJyZXNldC13aW5kb3dcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLmFjdGl2ZVdpbmRvdy54ICsgXCJweFwiO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLmFjdGl2ZVdpbmRvdy55ICsgXCJweFwiO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUud2luZG93QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJjbGlja2VkIHdpbmRvdy1idXR0b25cIik7XHJcbiAgICB2YXIgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdDtcclxuXHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgd2hpbGUgKCFlbGVtZW50LnBhcmVudE5vZGUuaWQpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvL2ZpbmQgd2hhdCB3aW5kb3cgZ290IGNsaWNrZWRcclxuICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIGlmIChhY3Rpb24uY29udGFpbnMoXCJleGl0LWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIFwicnVubmluZy1hcHBzXCJcclxuICAgICAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpbmRleF0uaWQgKyBcIiddXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3dUb29sdGlwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQod2luZG93VG9vbHRpcCk7XHJcblxyXG4gICAgICAgICAgICAvL2Nsb3NlIHRoZSBhcHBcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIHRoaXMud2luZG93cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhY3Rpb24uY29udGFpbnMoXCJtaW5pbWl6ZS1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9taW5pbWl6ZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWluaW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWF4aW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWF4aW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuY2xlYXJEZXNrdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgd2luZG93VG9vbHRpcC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHdpbmRvd1Rvb2x0aXApO1xyXG4gICAgfVxyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKGV2ZW50LmtleUNvZGUpO1xyXG4gICAgY29uc29sZS5sb2coZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgZXhhbXBsZVwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKS5jbGFzc0xpc3QuYWRkKFwiZXhhbXBsZS1hcHBcIik7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcbnZhciBNZW1vcnlBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL01lbW9yeUFwcGxpY2F0aW9uXCIpO1xyXG5cclxuZnVuY3Rpb24gTGF1bmNoZXIoZGVza3RvcCkge1xyXG4gICAgdGhpcy5kZXNrdG9wID0gZGVza3RvcDtcclxuICAgIC8vdGhpcy5zdGFydEFwcGxpY2F0aW9uKFwibWVtb3J5XCIpO1xyXG59XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlUYWc7XHJcbiAgICB2YXIgYXBwTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubGF1bmNoZXIgbGlcIik7XHJcbiAgICBjb25zb2xlLmxvZyhhcHBMaXN0KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlUYWcgPSBhcHBMaXN0W2ldLnF1ZXJ5U2VsZWN0b3IoXCJpXCIpO1xyXG4gICAgICAgIC8vaVRhZy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zdGFydEFwcGxpY2F0aW9uLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGFwcExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc3RhcnRBcHBsaWNhdGlvbi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuc3RhcnRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdmFsdWU7XHJcbiAgICB2YXIgaWNvbjtcclxuICAgIHZhciB0aXRsZTtcclxuICAgIHZhciBuZXdBcHAgPSBmYWxzZTtcclxuICAgIHZhciBtYXJnaW4gPSAxMCAqICh0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICsgMSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcclxuICAgIHZhciBlbGVtZW50O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC5hdHRyaWJ1dGVzW1widmFsdWVcIl0pIHtcclxuICAgICAgICBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuYXR0cmlidXRlc1tcInZhbHVlXCJdKSB7XHJcbiAgICAgICAgLy9pcyB0aGUgaS10YWcgaW4gdGhlIGxpXHJcbiAgICAgICAgZWxlbWVudCA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50KSB7XHJcbiAgICAgICAgdmFsdWUgPSBlbGVtZW50LmF0dHJpYnV0ZXNbXCJ2YWx1ZVwiXS52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBzd2l0Y2hUbyA9IHZhbHVlLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgaWYoc3dpdGNoVG9bMF0gPT09IFwiaWRcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1dpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpY29uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaVwiKS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXAtdGl0bGVcIikudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFwcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB4OiBtYXJnaW4sXHJcbiAgICAgICAgeTogbWFyZ2luLFxyXG4gICAgICAgIHRhYkluZGV4OiB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyLFxyXG4gICAgICAgIGljb246IGljb24sXHJcbiAgICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICB9O1xyXG5cclxuICAgIHN3aXRjaCAodmFsdWUpIHtcclxuICAgICAgICBjYXNlIFwiZXhhbXBsZVwiOiB7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMubWF4aW1pemFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwibWVtb3J5XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgTWVtb3J5QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5wcmludCgpO1xyXG4gICAgICAgICAgICBuZXdBcHAuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJyZXNldFwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXNldHRpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVza3RvcC5jbGVhckRlc2t0b3AoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXdBcHApIHtcclxuICAgICAgICB2YXIgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBuZXdBcHAuaWQgKyBcIiAud2luZG93LWJ1dHRvbnNcIik7XHJcbiAgICAgICAgYnV0dG9ucy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXNrdG9wLndpbmRvd0J1dHRvbkNsaWNrLmJpbmQodGhpcy5kZXNrdG9wKSk7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLndpbmRvd3MucHVzaChuZXdBcHApO1xyXG4gICAgICAgIHRoaXMuYWRkUnVubmluZ0FwcCh2YWx1ZSwgbmV3QXBwKTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICs9IDE7XHJcbiAgICAgICAgbmV3QXBwLmVsZW1lbnQuZm9jdXMoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zd2l0Y2hUb1dpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICB2YXIgd2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGlkKTtcclxuICAgIGNvbnNvbGUubG9nKHdpbmRvdyk7XHJcbiAgICBpZiAod2luZG93KSB7XHJcbiAgICAgICAgd2luZG93LmNsYXNzTGlzdC50b2dnbGUoXCJtaW5pbWl6ZWRcIik7XHJcblxyXG4gICAgICAgIGlmICghd2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcIm1pbmltaXplZFwiKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuZm9jdXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xyXG4gICAgLy9nZXQgdGhlIHRvb2x0aXAtY29udGFpbmVyIGZvciB0aGUgYXBwIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3RcclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibGlbdmFsdWU9J1wiICsgdHlwZSArIFwiJ10gLnRvb2x0aXAtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtdG9vbHRpcFwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhcHAudGl0bGUgKyBcIihcIiArIGFwcC5pZCArIFwiKVwiKSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXBcIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgXCJpZDpcIiArIGFwcC5pZCk7XHJcblxyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExhdW5jaGVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIE1lbW9yeUdhbWUgPSByZXF1aXJlKFwiLi9tZW1vcnkvR2FtZVwiKTtcclxuXHJcbmZ1bmN0aW9uIE1lbW9yeUFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICAvKnRoaXMudGl0bGUgPSB0aXRsZTtcclxuICAgIHRoaXMuaWNvbiA9IGljb247Ki9cclxufVxyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTWVtb3J5QXBwbGljYXRpb247XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2codGhpcy5lbGVtZW50KTtcclxuICAgIHZhciBnID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIDQsIDQpO1xyXG4gICAgZy5pbml0KCk7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBtZW1vcnlcIik7XHJcbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKS5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWFwcFwiKTtcclxuXHJcbiAgICAvKnRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy10aXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRpdGxlKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmljb24pKTsqL1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERlc2t0b3AgPSByZXF1aXJlKFwiLi9EZXNrdG9wXCIpO1xyXG5cclxudmFyIGQgPSBuZXcgRGVza3RvcCgpO1xyXG5kLmluaXQoKTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxyXG4gKi9cclxudmFyIE1lbW9yeUJvYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Qm9hcmRcIik7XHJcbnZhciBNZW1vcnlDYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Q2FyZFwiKTtcclxudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XHJcblxyXG5mdW5jdGlvbiBHYW1lKGVsZW1lbnQsIHgsIHkpIHtcclxuICAgIHZhciBpID0gMDtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLmxheW91dCA9IG5ldyBNZW1vcnlCb2FyZChlbGVtZW50LCB0aGlzLngsIHRoaXMueSk7XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLng7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkoeSkpO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuICAgIHRoaXMudHVybnMgPSAwO1xyXG4gICAgdGhpcy5jb3JyZWN0Q291bnQgPSAwO1xyXG4gICAgdGhpcy5pbWFnZXMgPSBbMCwwLDEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsN107XHJcbiAgICAvL3RoaXMuZm91bmRQaWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb3VuZC1waWxlXCIpO1xyXG5cclxuICAgIC8vdGhpcy50aW1lciA9IG5ldyBUaW1lcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaDNcIikpO1xyXG4gICAgLy90aGlzLnRpbWVyLnN0YXJ0KCk7XHJcblxyXG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG5cclxuICAgIHRoaXMuc2h1ZmZsZUltYWdlcygpO1xyXG4gICAgdGhpcy5hZGRFdmVudHMoKTtcclxufVxyXG5cclxuR2FtZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpKTtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuaW1hZ2VzKTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgaiwgdGhpcy5pbWFnZXMucG9wKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkW2ldW2orMV0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIChqICsgMSksIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmltYWdlcyk7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmJvYXJkKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnNodWZmbGVJbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0ZW1wO1xyXG4gICAgdmFyIHJhbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW1hZ2VzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGVtcCA9IHRoaXMuaW1hZ2VzW2ldO1xyXG4gICAgICAgIHJhbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmltYWdlcy5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzW2ldID0gdGhpcy5pbWFnZXNbcmFuZF07XHJcbiAgICAgICAgdGhpcy5pbWFnZXNbcmFuZF0gPSB0ZW1wO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuYWRkRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3ZhciBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tYm9hcmRcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2suYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoIDwgMiAmJiAhZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVcIikpIHtcclxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImNhcmRcIikpIHtcclxuICAgICAgICAgICAgdmFyIHl4ID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdFswXS5zcGxpdChcIi1cIilbMV07XHJcbiAgICAgICAgICAgIHZhciB5ID0geXguY2hhckF0KDApO1xyXG4gICAgICAgICAgICB2YXIgeCA9IHl4LmNoYXJBdCgxKTtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKFwiaW1nLVwiICsgdGhpcy5ib2FyZFt5XVt4XS5pbWdOcik7XHJcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKFwiaW1nXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlQ2FyZHMucHVzaCh0aGlzLmJvYXJkW3ldW3hdKTtcclxuXHJcbiAgICAgICAgICAgIC8vZGlzYWJsZSB0aGUgY2E8cmQgdGhhdCBnb3QgY2xpY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy5ib2FyZFt5XVt4XS5pZCkuY2xhc3NMaXN0LmFkZChcImRpc2FibGVcIik7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tJZkNvcnJlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmNoZWNrSWZDb3JyZWN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnR1cm5zICs9IDE7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLnZpc2libGVDYXJkcyk7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHNbMF0uaW1nTnIgPT09IHRoaXMudmlzaWJsZUNhcmRzWzFdLmltZ05yKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzWzBdLmlkKS5jbGFzc0xpc3QuYWRkKFwicmlnaHRcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzWzFdLmlkKS5jbGFzc0xpc3QuYWRkKFwicmlnaHRcIik7XHJcblxyXG4gICAgICAgIC8vdGhpcy5hZGRUb1BpbGUodGhpcy52aXNpYmxlQ2FyZHNbMF0uaW1nTnIpO1xyXG4gICAgICAgIC8vdGhpcy5wbGF5ZXJzW3RoaXMuYWN0aXZlUGxheWVyXS5jYXJkcy5wdXNoKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yKTtcclxuICAgICAgICAvL3RoaXMucGxheWVyc1t0aGlzLmFjdGl2ZVBsYXllcl0uYWRkVG9QaWxlKCk7XHJcblxyXG4gICAgICAgIC8vcmVzZXQgdGhlIGFycmF5XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb3JyZWN0Q291bnQgKz0gMTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29ycmVjdENvdW50ID09PSAodGhpcy54KnRoaXMueSAvIDIpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCh0aGlzLngqdGhpcy55IC8gMikpO1xyXG5cclxuICAgICAgICAgICAgLyppZih0aGlzLm5yT2ZQbGF5ZXJzID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlclNpbmdsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck11bHRpKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5wbGF5ZXJzKTsqL1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpKz0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LmFkZChcIndyb25nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbaV0uaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMudHVybkJhY2tDYXJkcy5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgICAgICAvL3RoaXMuY2hhbmdlUGxheWVyKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5jaGFuZ2VQbGF5ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKHRoaXMuYWN0aXZlUGxheWVyID09PSB0aGlzLm5yT2ZQbGF5ZXJzIC0gMSkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyID0gMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyICs9IDE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS50dXJuQmFja0NhcmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcENhcmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGVtcENhcmQgPSB0aGlzLnZpc2libGVDYXJkc1tpXTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0ZW1wQ2FyZCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRlbXBDYXJkLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwid3JvbmdcIiwgXCJpbWdcIiwgXCJpbWctXCIgKyB0ZW1wQ2FyZC5pbWdOcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZXNldCB0aGUgYXJyYXlcclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nYW1lT3ZlclNpbmdsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWJvYXJkXCIpKTtcclxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lb3Zlci1zaW5nbGVwbGF5ZXJcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiI3R1cm5zXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudHVybnMpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRvdGFsVGltZSkpO1xyXG4gICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nYW1lT3Zlck11bHRpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB2YXIgd2lubmVyID0gW3RoaXMucGxheWVyc1swXV07XHJcblxyXG4gICAgLy9maW5kIHRoZSB3aW5uZXJcclxuICAgIGZvciAoaSA9IDE7IGkgPCB0aGlzLnBsYXllcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJzW2ldLmNhcmRzLmxlbmd0aCA+IHdpbm5lclswXS5jYXJkcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgd2lubmVyID0gW107XHJcbiAgICAgICAgICAgIHdpbm5lci5wdXNoKHRoaXMucGxheWVyc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMucGxheWVyc1tpXS5jYXJkcy5sZW5ndGggPT09IHdpbm5lclswXS5jYXJkcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgd2lubmVyLnB1c2godGhpcy5wbGF5ZXJzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWJvYXJkXCIpKTtcclxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lb3Zlci1tdWx0aXBsYXllclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB3aW5uZXJTdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCB3aW5uZXIubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB3aW5uZXJTdHJpbmcgKz0gd2lubmVyW2ldLm5hbWUgKyBcIiwgXCI7XHJcbiAgICB9XHJcblxyXG4gICAgd2lubmVyU3RyaW5nID0gd2lubmVyU3RyaW5nLnNsaWNlKDAsIC0yKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIud2lubmVyXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHdpbm5lclN0cmluZykpO1xyXG4gICAgZnJhZy5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5Qm9hcmQoZWxlbWVudCwgeCx5KSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy5wcmludENhcmRzKCk7XHJcbn1cclxuXHJcbk1lbW9yeUJvYXJkLnByb3RvdHlwZS5wcmludENhcmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuXHJcbiAgICB2YXIgcm93RGl2O1xyXG4gICAgdmFyIGNhcmREaXY7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKVxyXG4gICAge1xyXG4gICAgICAgIHJvd0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgcm93RGl2LmNsYXNzTGlzdC5hZGQoXCJyb3dcIik7XHJcblxyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLng7IGogKz0gMSkge1xyXG4gICAgICAgICAgICBjYXJkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAgICAgY2FyZERpdi5jbGFzc0xpc3QuYWRkKFwiY2FyZC1cIiArIGkgKyBqLCBcImNhcmRcIik7XHJcbiAgICAgICAgICAgIHJvd0Rpdi5hcHBlbmRDaGlsZChjYXJkRGl2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQocm93RGl2KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmVsZW1lbnQpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlCb2FyZDtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgT3NrYXIgb24gMjAxNS0xMS0yMy5cclxuICovXHJcblxyXG5mdW5jdGlvbiBNZW1vcnlDYXJkKGlkLCBpbWdOcikge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUNhcmQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIFRpbWVyIGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSBlbGVtZW50e09iamVjdH0sIGVsZW1lbnQgdG8gcHJpbnQgdGhlIHRpbWVyIHRvXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gVGltZXIoZWxlbWVudCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLmludGVydmFsID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdGFydHMgYW4gaW50ZXJ2YWwgZm9yIHRoZSB0aW1lclxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2NhbGwgdGhlIHJ1biBmdW5jdGlvbiBvbiBlYWNoIGludGVydmFsXHJcbiAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwodGhpcy5ydW4uYmluZCh0aGlzKSwgMTAwKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBiZSBleGVjdXRlZCBlYWNoIGludGVydmFsIG9mIHRoZSB0aW1lclxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIC8vY291bnQgdGhlIGRpZmZlcmVuY2UgZnJvbSBzdGFydCB0byBub3dcclxuICAgIHZhciBkaWZmID0gKG5vdyAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDA7XHJcblxyXG4gICAgdGhpcy5wcmludChkaWZmLnRvRml4ZWQoMSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RvcHMgdGhlIHRpbWVyIGJlZm9yZSBpdHMgb3ZlclxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSwgdGhlIGRpZmZlcmVuY2UgaW4gc2Vjb25kc1xyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XHJcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgcmV0dXJuIChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNob3cgdGhlIHRpbWVyIGF0IHRoZSBnaXZlbiBlbGVtZW50XHJcbiAqIEBwYXJhbSBkaWZme051bWJlcn0gdGhlIHRpbWUgdG8gYmUgcHJpbnRlZFxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oZGlmZikge1xyXG4gICAgaWYodGhpcy5lbGVtZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZiksIHRoaXMuZWxlbWVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xyXG4iXX0=

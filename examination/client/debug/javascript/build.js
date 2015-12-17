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

BasicWindow.prototype.clearContent = function() {
    var content = this.element.querySelector(".window-content");
    while (content.hasChildNodes()) {
        content.removeChild(content.firstChild);
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
    this.offsetX = 1;
    this.offsetY = 1;
    this.launcher = new Launcher(this);
}

Desktop.prototype.init = function() {
    this.launcher.init();

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
            this.closeWindow(this.windows[index].id);
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

Desktop.prototype.closeWindow = function(id) {
    var removed = false;
    for (var i = 0; i < this.windows.length && !removed; i += 1) {
        if (this.windows[i].id === id) {
            //remove from "running-apps"
            var clickedTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
            var container = clickedTooltip.parentNode;
            while (!container.classList.contains("tooltip-container")) {
                container = container.parentNode;
            }

            container.removeChild(clickedTooltip.parentNode);

            //remove from window-list
            this.windows[i].destroy();
            this.windows.splice(i, 1);
            removed = true;
        }
    }
};

Desktop.prototype.clearDesktop = function() {
    for (var i = 0; i < this.windows.length; i += 1) {
        this.windows[i].destroy();
        //remove from "running-apps"
        var windowTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
        var container = windowTooltip.parentNode;
        while (!container.classList.contains("tooltip-container")) {
            container = container.parentNode;
        }

        container.removeChild(windowTooltip.parentNode);
    }
    this.windows = [];
    this.serialNumber = 0;
    this.offsetX = 0;
    this.offsetY = 0;
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
    var marginX = 10 * (this.desktop.offsetX);
    var marginY = 10 * (this.desktop.offsetY);

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

            //this handles the "running-apps"-clicks. should be broken out!
            var switchTo = value.split(":");
            if (switchTo[0] === "id") {
                if (element.classList.contains("tooltip-close")) {
                    this.desktop.closeWindow(switchTo[1]);
                }
                else {
                    this.switchToWindow(switchTo[1]);
                }
            }
            //end of running-apps handle

            else {
                icon = element.querySelector("i").textContent;
                title = element.querySelector(".tooltip-title").textContent;
            }
        }
    }

    var appOptions = {
        id: "win-" + this.desktop.serialNumber,
        x: marginX,
        y: marginY,
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
        this.desktop.offsetX += 1;

        if (this.desktop.serialNumber % 15 === 0) {
            this.desktop.offsetY = 1;
        }
        else {
            this.desktop.offsetY += 1;
        }
        newApp.element.focus();
    }
};

Launcher.prototype.switchToWindow = function(id) {
    var window = document.querySelector("#" + id);
    if (window) {
        if (window.classList.contains("minimized")) {
            window.classList.remove("minimized");
        }
        window.focus();
    }
};

Launcher.prototype.addRunningApp = function(type, app) {
    //get the tooltip-container for the app and add it to the list
    console.log(type);
    var container = document.querySelector("li[value='" + type + "'] .tooltip-container");
    console.log(container);
    var template = document.querySelector("#template-tooltip").content.cloneNode(true);
    template.querySelector(".tooltip").appendChild(document.createTextNode(app.title + "(" + app.id + ")"));
    template.querySelector(".tooltip").setAttribute("value", "id:" + app.id);
    template.querySelector(".tooltip-close").setAttribute("value", "id:" + app.id);

    container.appendChild(template);

};

module.exports = Launcher;
},{"./ExampleApplication":3,"./MemoryApplication":5}],5:[function(require,module,exports){
"use strict";
var BasicWindow = require("./BasicWindow");
var MemoryGame = require("./memory/Game");

function MemoryApplication(options) {
    BasicWindow.call(this, options);

    this.settingsOpen = false;
    this.game = undefined;
    this.boardSize = [4, 4];
}

MemoryApplication.prototype = Object.create(BasicWindow.prototype);
MemoryApplication.prototype.constructor =  MemoryApplication;

MemoryApplication.prototype.init = function() {
    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
    this.game = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    this.game.init();
};

MemoryApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing memory");
    this.element.classList.add("memory-app");

    var menu = this.element.querySelector(".window-menu");
    var alt1 = document.querySelector("#template-window-menu-alternative").content.cloneNode(true);
    alt1.querySelector(".menu-alternative").appendChild(document.createTextNode("New Game"));

    var alt2 = document.querySelector("#template-window-menu-alternative").content.cloneNode(true);
    alt2.querySelector(".menu-alternative").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);
};

MemoryApplication.prototype.menuClicked = function(event) {
    var target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "settings": {
                this.menuSettings();
                break;
            }
            case "new game": {
                if (this.settingsOpen) {
                    this.settingsOpen = false;
                }
                this.restart();
                break;
            }
        }
    }
};

MemoryApplication.prototype.restart = function(value) {
    if (value) {
        this.boardSize = value.split("x");
    }
    var y = this.boardSize[1];
    var x = this.boardSize[0];
    this.clearContent();

    this.game.removeEvents();
    this.game = new MemoryGame(this.element.querySelector(".window-content"), x, y);
    this.game.init();
};

MemoryApplication.prototype.menuSettings = function() {
    if (!this.settingsOpen) {
        var template = document.querySelector("#template-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("memory-settings");

        template = this.addSettings(template);
        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    }
    else {
        var settings = document.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

MemoryApplication.prototype.addSettings = function(element) {
    var template = document.querySelector("#template-memory-settings").content.cloneNode(true);

    element.querySelector(".settings").appendChild(template);
    element.querySelector("input[type='button']").addEventListener("click" , this.saveSettings.bind(this));
    return element;
};

MemoryApplication.prototype.saveSettings = function() {
    var value = this.element.querySelector("select[name='board-size']").value;
    this.restart(value);
    this.settingsOpen = false;
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
    this.element = element;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.layout = new MemoryBoard(element, this.x, this.y);
    this.board = [];
    this.visibleCards = [];
    this.turns = 0;
    this.correctCount = 0;
    this.imageList = [0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7];
    this.images = this.imageList.slice(0,(this.y*this.x));
    this.clickFunc = this.click.bind(this);

    //this.foundPile = document.querySelector("#found-pile");

    //this.timer = new Timer(this.element.querySelector("h3"));
    //this.timer.start();

    this.totalTime = 0;

    this.shuffleImages();
    this.addEvents();
}

Game.prototype.init = function() {
    var i = 0;
    this.board = [];
    if (this.x > this.y) {
        for(i = 0; i < this.x; i += 1) {
            this.board.push(new Array(this.y));
        }
    }
    else {
        for(i = 0; i < this.y; i += 1) {
            this.board.push(new Array(this.x));
        }
    }

    this.visibleCards = [];
    for(i = 0; i < this.y; i += 1) {
        for(var j = 0; j < this.x - 1; j += 2) {
            this.board[i][j] = new MemoryCard("" + i + j, this.images.pop());
            this.board[i][j+1] = new MemoryCard("" + i + (j + 1), this.images.pop());
        }
    }
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
    this.element.addEventListener("click", this.clickFunc);
};

Game.prototype.removeEvents = function() {
    this.element.removeEventListener("click", this.clickFunc);
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

            //disable the card that got clicked
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
            this.gameOver();
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

Game.prototype.gameOver = function() {
    console.log("turns:" + this.turns);
    var template = document.querySelector("#template-memory-gameover").content.cloneNode(true);
    template.querySelector(".memory-turns").appendChild(document.createTextNode(this.turns));

    this.element.appendChild(template);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9HYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvVGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3cob3B0aW9ucykge1xyXG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgXCJcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy54ID0gb3B0aW9ucy54IHx8IDEwO1xyXG4gICAgdGhpcy55ID0gb3B0aW9ucy55IHx8IDEwO1xyXG4gICAgdGhpcy50YWJJbmRleCA9IG9wdGlvbnMudGFiSW5kZXggfHwgMDtcclxuICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8IHRoaXMuaWQ7XHJcbiAgICB0aGlzLmljb24gPSBvcHRpb25zLmljb24gfHwgXCJidWdfcmVwb3J0XCI7XHJcbiAgICB0aGlzLm1heGltaXphYmxlID0gb3B0aW9ucy5tYXhpbWl6YWJsZSB8fCBmYWxzZTtcclxufVxyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIFRPRE86IGltcGxlbWVudCBkZXN0cm95XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IHRoaXNcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmdcIik7XHJcbiAgICB2YXIgdGVtcGxhdGUgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3dcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB2YXIgdGVtcGxhdGVXaW5kb3cgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiZGl2XCIpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwiaWRcIiwgdGhpcy5pZCk7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGhpcy50YWJJbmRleCk7XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIik7XHJcbiAgICB2YXIgbGF1bmNoZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxhdW5jaGVyXCIpO1xyXG4gICAgZWxlbWVudC5pbnNlcnRCZWZvcmUodGVtcGxhdGUsIGxhdW5jaGVyKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy10aXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRpdGxlKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmljb24pKTtcclxuXHJcbiAgICAvL2FkZCBtYXhpbWl6ZS1idXR0b25cclxuICAgIGlmICh0aGlzLm1heGltaXphYmxlKSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWF4aW1pemUtYnV0dG9uXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHZhciB3aW5kb3dCdXR0b25zID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWJ1dHRvbnNcIik7XHJcbiAgICAgICAgdmFyIHJlbW92ZUJ1dHRvbiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1pbmltaXplLWJ1dHRvblwiKTtcclxuICAgICAgICB3aW5kb3dCdXR0b25zLmluc2VydEJlZm9yZShidXR0b24sIHJlbW92ZUJ1dHRvbik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwibWluaW1pemVkXCIpO1xyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1heGltaXplZFwiKTtcclxuXHJcbiAgICB2YXIgaWNvbiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWljb24gaVwiKTtcclxuICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJjcm9wX2RpblwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgICAgICBpY29uLnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcImZpbHRlcl9ub25lXCIpLCBpY29uLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmNsZWFyQ29udGVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKTtcclxuICAgIHdoaWxlIChjb250ZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoY29udGVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNXaW5kb3c7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL3ZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcbnZhciBMYXVuY2hlciA9IHJlcXVpcmUoXCIuL0xhdW5jaGVyXCIpO1xyXG5cclxuZnVuY3Rpb24gRGVza3RvcCgpIHtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdXNlTW92ZUZ1bmMgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5tb3VzZVVwRnVuYyA9IHRoaXMubW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLmNsaWNrWCA9IDA7XHJcbiAgICB0aGlzLmNsaWNrWSA9IDA7XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAxO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMTtcclxuICAgIHRoaXMubGF1bmNoZXIgPSBuZXcgTGF1bmNoZXIodGhpcyk7XHJcbn1cclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubGF1bmNoZXIuaW5pdCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlbW92aW5nIG1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibW92aW5nXCIpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAvL2dldCB0aGUgY2xpY2tlZC13aW5kb3dzIFwibWFpbi1kaXZcIlxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgIHdoaWxlIChlbGVtZW50LnBhcmVudE5vZGUuaWQgIT09IFwibWFpbi1mcmFtZVwiKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvd1wiKSkge1xyXG4gICAgICAgIC8vY2xpY2tlZCBET00gaXMgYSB3aW5kb3cgLSBkbyBzdHVmZlxyXG4gICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgLy9maW5kIHRoZSB3aW5kb3cgaW4gd2luZG93LWFycmF5XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMud2luZG93c1tpXS5pZCA9PT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB0aGlzLndpbmRvd3NbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIHRoZSBsaXN0ZW5lcnMgdG8gY2hlY2sgZm9yIG1vdmVtZW50IGlmIGNsaWNrIHdlcmUgaW4gdGhlIHdpbmRvdy10b3Agb2Ygd2luZG93XHJcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3ctdG9wXCIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuYWN0aXZlV2luZG93Lng7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuYWN0aXZlV2luZG93Lnk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1vdmluZ1wiKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkaW5nIG1vdXNlbW92ZS1saXN0ZW5lclwiKTtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ0cnlpbmcgdG8gbW92ZSB3aW5kb3dcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcblxyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5hY3RpdmVXaW5kb3cueCArIFwicHhcIjtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5hY3RpdmVXaW5kb3cueSArIFwicHhcIjtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLndpbmRvd0J1dHRvbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCB3aW5kb3ctYnV0dG9uXCIpO1xyXG4gICAgdmFyIGFjdGlvbiA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3Q7XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy9maW5kIHdoYXQgd2luZG93IGdvdCBjbGlja2VkXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2luZG93c1tpXS5pZCA9PT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICBpZiAoYWN0aW9uLmNvbnRhaW5zKFwiZXhpdC1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZVdpbmRvdyh0aGlzLndpbmRvd3NbaW5kZXhdLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWluaW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWluaW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1pbmltaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1heGltaXplLWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL21heGltaXplIHRoZSBhcHBcclxuICAgICAgICAgICAgaWYgKHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemFibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmNsb3NlV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciByZW1vdmVkID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGggJiYgIXJlbW92ZWQ7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgICAgICB2YXIgY2xpY2tlZFRvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gd2luZG93LWxpc3RcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuY2xlYXJEZXNrdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh3aW5kb3dUb29sdGlwLnBhcmVudE5vZGUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAwO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMDtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQua2V5Q29kZSk7XHJcbiAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcblxyXG5mdW5jdGlvbiBFeGFtcGxlQXBwbGljYXRpb24oaWQsIHgsIHkpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgaWQsIHgsIHkpO1xyXG59XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIEV4YW1wbGVBcHBsaWNhdGlvbjtcclxuXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBleGFtcGxlXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJleGFtcGxlLWFwcFwiKTtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEV4YW1wbGVBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIE1lbW9yeUFwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vTWVtb3J5QXBwbGljYXRpb25cIik7XHJcblxyXG5mdW5jdGlvbiBMYXVuY2hlcihkZXNrdG9wKSB7XHJcbiAgICB0aGlzLmRlc2t0b3AgPSBkZXNrdG9wO1xyXG4gICAgLy90aGlzLnN0YXJ0QXBwbGljYXRpb24oXCJtZW1vcnlcIik7XHJcbn1cclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaVRhZztcclxuICAgIHZhciBhcHBMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5sYXVuY2hlciBsaVwiKTtcclxuICAgIGNvbnNvbGUubG9nKGFwcExpc3QpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcHBMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaVRhZyA9IGFwcExpc3RbaV0ucXVlcnlTZWxlY3RvcihcImlcIik7XHJcbiAgICAgICAgLy9pVGFnLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnN0YXJ0QXBwbGljYXRpb24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgYXBwTGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zdGFydEFwcGxpY2F0aW9uLmJpbmQodGhpcyksIHRydWUpO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zdGFydEFwcGxpY2F0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB2YWx1ZTtcclxuICAgIHZhciBpY29uO1xyXG4gICAgdmFyIHRpdGxlO1xyXG4gICAgdmFyIG5ld0FwcCA9IGZhbHNlO1xyXG4gICAgdmFyIG1hcmdpblggPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WCk7XHJcbiAgICB2YXIgbWFyZ2luWSA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRZKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xyXG4gICAgdmFyIGVsZW1lbnQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmF0dHJpYnV0ZXNbXCJ2YWx1ZVwiXSkge1xyXG4gICAgICAgIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC50YXJnZXQucGFyZW50Tm9kZS5hdHRyaWJ1dGVzW1widmFsdWVcIl0pIHtcclxuICAgICAgICAvL2lzIHRoZSBpLXRhZyBpbiB0aGUgbGlcclxuICAgICAgICBlbGVtZW50ID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQpIHtcclxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuYXR0cmlidXRlc1tcInZhbHVlXCJdLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcyBoYW5kbGVzIHRoZSBcInJ1bm5pbmctYXBwc1wiLWNsaWNrcy4gc2hvdWxkIGJlIGJyb2tlbiBvdXQhXHJcbiAgICAgICAgICAgIHZhciBzd2l0Y2hUbyA9IHZhbHVlLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgaWYgKHN3aXRjaFRvWzBdID09PSBcImlkXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY2xvc2VcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xvc2VXaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1dpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9lbmQgb2YgcnVubmluZy1hcHBzIGhhbmRsZVxyXG5cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpY29uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaVwiKS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXAtdGl0bGVcIikudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFwcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB4OiBtYXJnaW5YLFxyXG4gICAgICAgIHk6IG1hcmdpblksXHJcbiAgICAgICAgdGFiSW5kZXg6IHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgaWNvbjogaWNvbixcclxuICAgICAgICB0aXRsZTogdGl0bGVcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh2YWx1ZSkge1xyXG4gICAgICAgIGNhc2UgXCJleGFtcGxlXCI6IHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBFeEEoYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5wcmludCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJtZW1vcnlcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwicmVzZXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVzZXR0aW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xlYXJEZXNrdG9wKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAobmV3QXBwKSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgbmV3QXBwLmlkICsgXCIgLndpbmRvdy1idXR0b25zXCIpO1xyXG4gICAgICAgIGJ1dHRvbnMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZGVza3RvcC53aW5kb3dCdXR0b25DbGljay5iaW5kKHRoaXMuZGVza3RvcCkpO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC53aW5kb3dzLnB1c2gobmV3QXBwKTtcclxuICAgICAgICB0aGlzLmFkZFJ1bm5pbmdBcHAodmFsdWUsIG5ld0FwcCk7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlciArPSAxO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRYICs9IDE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICUgMTUgPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFkgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFkgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3QXBwLmVsZW1lbnQuZm9jdXMoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zd2l0Y2hUb1dpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICB2YXIgd2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGlkKTtcclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgICBpZiAod2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcIm1pbmltaXplZFwiKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmZvY3VzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xyXG4gICAgLy9nZXQgdGhlIHRvb2x0aXAtY29udGFpbmVyIGZvciB0aGUgYXBwIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3RcclxuICAgIGNvbnNvbGUubG9nKHR5cGUpO1xyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaVt2YWx1ZT0nXCIgKyB0eXBlICsgXCInXSAudG9vbHRpcC1jb250YWluZXJcIik7XHJcbiAgICBjb25zb2xlLmxvZyhjb250YWluZXIpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10b29sdGlwXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC50aXRsZSArIFwiKFwiICsgYXBwLmlkICsgXCIpXCIpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC1jbG9zZVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF1bmNoZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG52YXIgTWVtb3J5R2FtZSA9IHJlcXVpcmUoXCIuL21lbW9yeS9HYW1lXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5ib2FyZFNpemUgPSBbNCwgNF07XHJcbn1cclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE1lbW9yeUFwcGxpY2F0aW9uO1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCA0LCA0KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBtZW1vcnlcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XHJcblxyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIHZhciBhbHQxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmV3IEdhbWVcIikpO1xyXG5cclxuICAgIHZhciBhbHQyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDIucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiU2V0dGluZ3NcIikpO1xyXG5cclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0MSk7XHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDIpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB0YXJnZXQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcclxuICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFwibmV3IGdhbWVcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucmVzdGFydCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZSA9IHZhbHVlLnNwbGl0KFwieFwiKTtcclxuICAgIH1cclxuICAgIHZhciB5ID0gdGhpcy5ib2FyZFNpemVbMV07XHJcbiAgICB2YXIgeCA9IHRoaXMuYm9hcmRTaXplWzBdO1xyXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcclxuXHJcbiAgICB0aGlzLmdhbWUucmVtb3ZlRXZlbnRzKCk7XHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgeCwgeSk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXNldHRpbmdzXCIpO1xyXG5cclxuICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuYWRkU2V0dGluZ3ModGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2V0dGluZ3MgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1lbW9yeS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbdHlwZT0nYnV0dG9uJ11cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIgLCB0aGlzLnNhdmVTZXR0aW5ncy5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZhbHVlID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RbbmFtZT0nYm9hcmQtc2l6ZSddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5yZXN0YXJ0KHZhbHVlKTtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7XHJcbmQuaW5pdCgpOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXHJcbiAqL1xyXG52YXIgTWVtb3J5Qm9hcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlCb2FyZFwiKTtcclxudmFyIE1lbW9yeUNhcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlDYXJkXCIpO1xyXG52YXIgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcclxuXHJcbmZ1bmN0aW9uIEdhbWUoZWxlbWVudCwgeCwgeSkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMueCA9IHBhcnNlSW50KHgpO1xyXG4gICAgdGhpcy55ID0gcGFyc2VJbnQoeSk7XHJcbiAgICB0aGlzLmxheW91dCA9IG5ldyBNZW1vcnlCb2FyZChlbGVtZW50LCB0aGlzLngsIHRoaXMueSk7XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG4gICAgdGhpcy50dXJucyA9IDA7XHJcbiAgICB0aGlzLmNvcnJlY3RDb3VudCA9IDA7XHJcbiAgICB0aGlzLmltYWdlTGlzdCA9IFswLDAsMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3XTtcclxuICAgIHRoaXMuaW1hZ2VzID0gdGhpcy5pbWFnZUxpc3Quc2xpY2UoMCwodGhpcy55KnRoaXMueCkpO1xyXG4gICAgdGhpcy5jbGlja0Z1bmMgPSB0aGlzLmNsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy90aGlzLmZvdW5kUGlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm91bmQtcGlsZVwiKTtcclxuXHJcbiAgICAvL3RoaXMudGltZXIgPSBuZXcgVGltZXIodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoM1wiKSk7XHJcbiAgICAvL3RoaXMudGltZXIuc3RhcnQoKTtcclxuXHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XHJcblxyXG4gICAgdGhpcy5zaHVmZmxlSW1hZ2VzKCk7XHJcbiAgICB0aGlzLmFkZEV2ZW50cygpO1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICBpZiAodGhpcy54ID4gdGhpcy55KSB7XHJcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgdGhpcy54OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBBcnJheSh0aGlzLnkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG4gICAgZm9yKGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpIHtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy54IC0gMTsgaiArPSAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1bal0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIGosIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqKzFdID0gbmV3IE1lbW9yeUNhcmQoXCJcIiArIGkgKyAoaiArIDEpLCB0aGlzLmltYWdlcy5wb3AoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuc2h1ZmZsZUltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRlbXA7XHJcbiAgICB2YXIgcmFuZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wID0gdGhpcy5pbWFnZXNbaV07XHJcbiAgICAgICAgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuaW1hZ2VzLmxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZXNbaV0gPSB0aGlzLmltYWdlc1tyYW5kXTtcclxuICAgICAgICB0aGlzLmltYWdlc1tyYW5kXSA9IHRlbXA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tGdW5jKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGlmICh0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPCAyICYmICFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGlzYWJsZVwiKSkge1xyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZFwiKSkge1xyXG4gICAgICAgICAgICB2YXIgeXggPSBldmVudC50YXJnZXQuY2xhc3NMaXN0WzBdLnNwbGl0KFwiLVwiKVsxXTtcclxuICAgICAgICAgICAgdmFyIHkgPSB5eC5jaGFyQXQoMCk7XHJcbiAgICAgICAgICAgIHZhciB4ID0geXguY2hhckF0KDEpO1xyXG5cclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJpbWctXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmltZ05yKTtcclxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJpbWdcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBjYXJkIHRoYXQgZ290IGNsaWNrZWRcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMuYm9hcmRbeV1beF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50dXJucyArPSAxO1xyXG4gICAgY29uc29sZS5sb2codGhpcy52aXNpYmxlQ2FyZHMpO1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yID09PSB0aGlzLnZpc2libGVDYXJkc1sxXS5pbWdOcikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1swXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1sxXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG5cclxuICAgICAgICAvL3RoaXMuYWRkVG9QaWxlKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yKTtcclxuICAgICAgICAvL3RoaXMucGxheWVyc1t0aGlzLmFjdGl2ZVBsYXllcl0uY2FyZHMucHVzaCh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XHJcbiAgICAgICAgLy90aGlzLnBsYXllcnNbdGhpcy5hY3RpdmVQbGF5ZXJdLmFkZFRvUGlsZSgpO1xyXG5cclxuICAgICAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvcnJlY3RDb3VudCA9PT0gKHRoaXMueCp0aGlzLnkgLyAyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkrPTEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy50dXJuQmFja0NhcmRzLmJpbmQodGhpcyksIDEwMDApO1xyXG4gICAgICAgIC8vdGhpcy5jaGFuZ2VQbGF5ZXIoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmNoYW5nZVBsYXllciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYodGhpcy5hY3RpdmVQbGF5ZXIgPT09IHRoaXMubnJPZlBsYXllcnMgLSAxKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgKz0gMTtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnR1cm5CYWNrQ2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0ZW1wQ2FyZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wQ2FyZCA9IHRoaXMudmlzaWJsZUNhcmRzW2ldO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRlbXBDYXJkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGVtcENhcmQuaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJ3cm9uZ1wiLCBcImltZ1wiLCBcImltZy1cIiArIHRlbXBDYXJkLmltZ05yKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInR1cm5zOlwiICsgdGhpcy50dXJucyk7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1lbW9yeS1nYW1lb3ZlclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIubWVtb3J5LXR1cm5zXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudHVybnMpKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIE1lbW9yeUJvYXJkKGVsZW1lbnQsIHgseSkge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgIHRoaXMucHJpbnRDYXJkcygpO1xyXG59XHJcblxyXG5NZW1vcnlCb2FyZC5wcm90b3R5cGUucHJpbnRDYXJkcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcblxyXG4gICAgdmFyIHJvd0RpdjtcclxuICAgIHZhciBjYXJkRGl2O1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSlcclxuICAgIHtcclxuICAgICAgICByb3dEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHJvd0Rpdi5jbGFzc0xpc3QuYWRkKFwicm93XCIpO1xyXG5cclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy54OyBqICs9IDEpIHtcclxuICAgICAgICAgICAgY2FyZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgIGNhcmREaXYuY2xhc3NMaXN0LmFkZChcImNhcmQtXCIgKyBpICsgaiwgXCJjYXJkXCIpO1xyXG4gICAgICAgICAgICByb3dEaXYuYXBwZW5kQ2hpbGQoY2FyZERpdik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJvd0Rpdik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlCb2FyZDtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXG4gKi9cblxuZnVuY3Rpb24gTWVtb3J5Q2FyZChpZCwgaW1nTnIpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUNhcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBUaW1lciBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0gZWxlbWVudHtPYmplY3R9LCBlbGVtZW50IHRvIHByaW50IHRoZSB0aW1lciB0b1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRpbWVyKGVsZW1lbnQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5pbnRlcnZhbCA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RhcnRzIGFuIGludGVydmFsIGZvciB0aGUgdGltZXJcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jYWxsIHRoZSBydW4gZnVuY3Rpb24gb24gZWFjaCBpbnRlcnZhbFxyXG4gICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMucnVuLmJpbmQodGhpcyksIDEwMCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgZWFjaCBpbnRlcnZhbCBvZiB0aGUgdGltZXJcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAvL2NvdW50IHRoZSBkaWZmZXJlbmNlIGZyb20gc3RhcnQgdG8gbm93XHJcbiAgICB2YXIgZGlmZiA9IChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xyXG5cclxuICAgIHRoaXMucHJpbnQoZGlmZi50b0ZpeGVkKDEpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0b3BzIHRoZSB0aW1lciBiZWZvcmUgaXRzIG92ZXJcclxuICogQHJldHVybnMge251bWJlcn0sIHRoZSBkaWZmZXJlbmNlIGluIHNlY29uZHNcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIHJldHVybiAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSB0aW1lciBhdCB0aGUgZ2l2ZW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZGlmZntOdW1iZXJ9IHRoZSB0aW1lIHRvIGJlIHByaW50ZWRcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKGRpZmYpIHtcclxuICAgIGlmKHRoaXMuZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpLCB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZikpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcclxuIl19

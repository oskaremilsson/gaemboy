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
    this.zIndex = options.zIndex;
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
    templateWindow.style.zIndex = this.zIndex;
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
        this.element.querySelector(".maximize-button").setAttribute("title", "Maximize");
    }
    else {
        this.element.classList.remove("reset-window");
        this.element.style.top = "0px";
        this.element.style.left = "0px";
        icon.replaceChild(document.createTextNode("filter_none"), icon.firstChild);
        this.element.querySelector(".maximize-button").setAttribute("title", "Resize");
    }
};

BasicWindow.prototype.clearContent = function() {
    var content = this.element.querySelector(".window-content");
    while (content.hasChildNodes()) {
        content.removeChild(content.firstChild);
    }
};

BasicWindow.prototype.keyInput = function(key) {
    console.log(key);
};

module.exports = BasicWindow;
},{}],2:[function(require,module,exports){
"use strict";
var BasicWindow = require("./BasicWindow");
var Chat = require("./chatapp/Chat");

function ChatApplication(options) {
    BasicWindow.call(this, options);
    this.chat = undefined;
    this.settingsOpen = false;
    this.username = "";
    this.server = "vhost3.lnu.se:20080/socket/";
    this.channel = "";

    this.addFocusFunc = this.addFocus.bind(this);
    this.removeFocusFunc = this.removeFocus.bind(this);
}

ChatApplication.prototype = Object.create(BasicWindow.prototype);
ChatApplication.prototype.constructor =  ChatApplication;

ChatApplication.prototype.init = function(){
    if (localStorage.getItem("username")) {
        this.username = localStorage.getItem("username");
    }
    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
    //this.chat = new Chat(this.element, this.server, this.channel, this.username);
    //this.chat.init();
};

ChatApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing chat");
    //document.querySelector("#" + this.id).classList.add("chat-app");
    this.element.classList.add("chat-app");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    //add the menu
    var menu = this.element.querySelector(".window-menu");
    var alt = document.querySelector("#template-window-menu-alternative").content;
    var alt1 = alt.cloneNode(true);
    alt1.querySelector(".menu-alternative").appendChild(document.createTextNode("Clear History"));

    var alt2 = alt.cloneNode(true);
    alt2.querySelector(".menu-alternative").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);

    //print the settings
    this.menuSettings();
};

ChatApplication.prototype.destroy = function() {
    if (this.chat) {
        this.chat.socket.close();
    }
    document.querySelector("#main-frame").removeChild(this.element);
};

ChatApplication.prototype.menuClicked = function(event) {
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
            case "clear history": {
                if (this.chat) {
                    this.chat.clearHistory();
                }
                break;
            }
        }
    }
};

ChatApplication.prototype.menuSettings = function() {
    var i;
    var inputList;

    if (!this.settingsOpen) {
        var template = document.querySelector("#template-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("chat-settings");

        template = this.addSettings(template);

        inputList =  template.querySelectorAll("input[type='text']");

        for (i = 0; i < inputList.length; i += 1) {
            inputList[i].addEventListener("focus", this.addFocusFunc);
            inputList[i].addEventListener("focusout", this.removeFocusFunc);
        }

        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    }
    else {
        var settings = this.element.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

ChatApplication.prototype.addSettings = function(element) {
    var template = document.querySelector("#template-chat-settings").content.cloneNode(true);

    template.querySelector("input[name='username']").setAttribute("value", this.username);
    template.querySelector("input[name='server']").setAttribute("value", this.server);
    template.querySelector("input[name='channel']").setAttribute("value", this.channel);


    template.querySelector("input[type='button']").addEventListener("click" , this.saveSettings.bind(this));

    console.log(template.querySelector("form"));
    element.querySelector(".settings").appendChild(template);
    return element;
};

ChatApplication.prototype.saveSettings = function(event) {
    console.log(event);
    if (this.chat) {
        this.chat.socket.close();
    }

    var form = this.element.querySelector(".settings-form");

    this.username = form.querySelector("input[name='username']").value;
    this.server = form.querySelector("input[name='server']").value;
    this.channel = form.querySelector("input[name='channel']").value;

    this.element.querySelector(".window-icon").classList.remove("chat-online", "chat-connecting", "chat-offline");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    this.clearContent();

    //start the new chat
    console.log("start 'new' chat with param");
    if (this.username === "") {
        this.username = "User";
    }
    this.chat = new Chat(this.element, this.server, this.channel, this.username);
    this.chat.init();
    this.settingsOpen = false;
    this.setFocus();
    localStorage.setItem("username", this.username);
};

ChatApplication.prototype.addFocus = function() {
    if (!this.element.classList.contains("focused-window")) {
        this.element.classList.add("focused-window");
        console.log("adding focus-class");
    }
};

ChatApplication.prototype.removeFocus = function() {
    if (this.element.classList.contains("focused-window")) {
        this.element.classList.remove("focused-window");
    }
};

ChatApplication.prototype.setFocus = function() {
    this.element.classList.remove("focused-window");
    this.element.focus();
};

module.exports = ChatApplication;
},{"./BasicWindow":1,"./chatapp/Chat":8}],3:[function(require,module,exports){
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
    this.zIndex = 0;
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
    //this.activeWindow = undefined;
};

Desktop.prototype.mouseDown = function(event) {
    var element = event.target;
    //get the clicked-windows "main-div"
    if (element.parentNode.classList) {
        while (!element.parentNode.classList.contains("main-frame")) {
            element = element.parentNode;
        }
    }

    if (element.classList.contains("window")) {
        //clicked DOM is a window - do stuff
        if (parseInt(element.style.zIndex) !== this.zIndex) {
            this.setFocus(element);
        }

        //add the listeners to check for movement if click were in the window-top of window
        if (event.target.classList.contains("window-top")) {
            if (!event.target.parentNode.classList.contains("maximized")) {
                this.clickX = event.clientX - this.activeWindow.x;
                this.clickY = event.clientY - this.activeWindow.y;
                element.classList.add("moving");

                console.log("adding mousemove-listener");
                window.addEventListener("mousemove", this.mouseMoveFunc);
                window.addEventListener("mouseup", this.mouseUpFunc);
            }
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
        this.setFocus(this.windows[index].element);

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
    this.offsetX = 1;
    this.offsetY = 1;
    this.zIndex = 0;
};

Desktop.prototype.keyDown = function(event) {
    if (document.activeElement.id === this.activeWindow.id) {
        console.log("this.activeWindow has the Object for this window");
        this.activeWindow.keyInput(event.keyCode);
    }
};

Desktop.prototype.setFocus = function(element) {
    element.focus();
    //find the window in window-array
    for (var i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            this.activeWindow = this.windows[i];
            this.zIndex += 1;
            element.style.zIndex = this.zIndex;
        }
    }
};

module.exports = Desktop;
},{"./Launcher":5}],4:[function(require,module,exports){
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
},{"./BasicWindow":1}],5:[function(require,module,exports){
"use strict";
var ExA = require("./ExampleApplication");
var MemoryApplication = require("./MemoryApplication");
var ChatApplication = require("./ChatApplication");

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
        zIndex: this.desktop.zIndex,
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
        case "chat":
        {
            appOptions.maximizable = true;
            newApp = new ChatApplication(appOptions);
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

        this.desktop.setFocus(newApp.element);
    }
};

Launcher.prototype.switchToWindow = function(id) {
    var window = document.querySelector("#" + id);
    if (window) {
        if (window.classList.contains("minimized")) {
            window.classList.remove("minimized");
        }
        this.desktop.setFocus(window);
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
},{"./ChatApplication":2,"./ExampleApplication":4,"./MemoryApplication":6}],6:[function(require,module,exports){
"use strict";
var BasicWindow = require("./BasicWindow");
var MemoryGame = require("./memory/Game");

function MemoryApplication(options) {
    BasicWindow.call(this, options);

    this.settingsOpen = false;
    this.game = undefined;
    this.boardSize = [4, 4];
    this.markedCard = undefined;
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
        var settings = this.element.querySelector(".settings-wrapper");
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

MemoryApplication.prototype.keyInput = function(key) {
    console.log("key in memory:" + key);
    if (!this.markedCard) {
        this.markedCard = this.element.querySelector(".card");
        this.markedCard.classList.add("marked");
    }
    else {
        //toogle the markedCard before changing markedCard
        this.markedCard.classList.toggle("marked");
        console.log(this.markedCard);
        switch (key) {
            case 39: {
                this.keyRight();
                break;
            }
            case 37: {
                this.keyLeft();
                break;
            }
            case 38: {
                this.keyUp();
                break;
            }
            case 40: {
                this.keyDown();
                break;
            }
            case 13: {
                this.game.turnCard(this.markedCard);
                break;
            }
        }

        //this.markedCard = element;

        //element.focus();
        //console.log(document.activeElement);
        //switch
        this.markedCard.classList.toggle("marked");
    }
};

MemoryApplication.prototype.keyRight = function() {
    //find next card
    if (this.markedCard.nextElementSibling) {
        this.markedCard = this.markedCard.nextElementSibling;
    }
    else {
        if (this.markedCard.parentNode.nextElementSibling) {
            this.markedCard = this.markedCard.parentNode.nextElementSibling.firstElementChild;
        }
        else {
            //restart from top
            this.markedCard = this.element.querySelector(".card");
        }
    }
};

MemoryApplication.prototype.keyLeft = function() {
    //find previous card
    if (this.markedCard.previousElementSibling) {
        this.markedCard = this.markedCard.previousElementSibling;
    }
    else {
        if (this.markedCard.parentNode.previousElementSibling) {
            this.markedCard = this.markedCard.parentNode.previousElementSibling.lastElementChild;
        }
        else {
            //restart from bottom right
            var rows = this.element.querySelectorAll(".row");
            var lastRow = rows[rows.length - 1];
            this.markedCard = lastRow.lastElementChild;
        }
    }
};

MemoryApplication.prototype.keyUp = function() {
    //find next row and card
    var row;
    var rowY;

    if (this.markedCard.parentNode.previousElementSibling) {
        var id = this.markedCard.classList[0].slice(-2);
        rowY = parseInt(id.charAt(0)) - 1;
    }
    else {
        //begin from bottom
        var rows = this.element.querySelectorAll(".row");
        row = rows[rows.length - 1];
        rowY = rows.length -1;
    }
    //find what x-position in the row the marked card is on
    var cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

MemoryApplication.prototype.keyDown = function() {
    //find next row and card
    var rowY;

    if (this.markedCard.parentNode.nextElementSibling) {
        var id = this.markedCard.classList[0].slice(-2);
        rowY = parseInt(id.charAt(0)) + 1;
    }
    else {
        rowY = 0;
    }
    //find what x-position in the row the marked card is on
    var cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

module.exports = MemoryApplication;
},{"./BasicWindow":1,"./memory/Game":9}],7:[function(require,module,exports){
"use strict";
var Desktop = require("./Desktop");

var d = new Desktop();
d.init();
},{"./Desktop":3}],8:[function(require,module,exports){
"use strict";

function Chat(element, server, channel, username) {
    this.element = element;
    this.server = server;
    this.channel = channel || "";
    this.username = username;
    this.socket = undefined;
    this.key = "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd";
    this.online = false;
    this.messages = [];
    this.timeStampOptions = {
        year: "numeric", month: "numeric",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };
}

Chat.prototype.init = function() {
    console.log("inits the chat");
    this.print();

    this.readStoredMessages();
    this.connectToServer();
    //add listeners
    this.socket.addEventListener("message", this.newMessageFromServer.bind(this));

    this.element.querySelector(".chat-sendButton").addEventListener("click", this.formSubmit.bind(this));
    this.element.querySelector("form").addEventListener("submit", this.formSubmit.bind(this));
    this.element.querySelector("form").addEventListener("focusout", this.toggleFocus.bind(this));
    this.element.querySelector(".chat-inputField").addEventListener("focus", this.toggleFocus.bind(this));
    this.element.querySelector(".chat-inputField").addEventListener("input", this.checkInput.bind(this));
    this.element.querySelector(".chat-sendButton").addEventListener("focus", this.toggleFocus.bind(this));
};

Chat.prototype.print = function() {
    //print the chat-template to this.element
    var template = document.querySelector("#template-chat-application").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

    //print info
    var info = document.querySelector("#template-window-menu-info").content.cloneNode(true);
    var channelInfo = "";
    if (this.channel === "") {
         channelInfo = "Non-specified";
    }
    else {
        channelInfo = this.channel;
    }
    var infoNode = document.createTextNode("#" + channelInfo.slice(0,18) + "/" + this.username.slice(0,10));
    info.querySelector(".menu-info").appendChild(infoNode);

    var menuInfo = this.element.querySelector(".menu-info");
    var menu = this.element.querySelector(".window-menu");
    if (menuInfo) {
        menu.replaceChild(info, menuInfo);
    }
    else {
        menu.appendChild(info);
    }
};

Chat.prototype.connectToServer = function() {
    this.element.querySelector(".window-icon").classList.remove("chat-offline");
    this.element.querySelector(".window-icon").classList.add("chat-connecting");

    this.socket = new WebSocket("ws://" + this.server, "charcords");

    this.socket.addEventListener("open", this.setOnline.bind(this));
    this.socket.addEventListener("error", this.setOffline.bind(this));
};

Chat.prototype.setOffline = function() {
    this.element.querySelector(".window-icon").classList.remove("chat-connecting");
    this.element.querySelector(".window-icon").classList.add("chat-offline");
    this.online = false;
    console.log("offline");

    var data = {
        username: "GlaDos",
        data: "Could not connect to server... You can still read your chat history"
    };
    this.printNewMessage(data);
};

Chat.prototype.setOnline = function() {
    //this.socket.send(JSON.stringify(this.data));
    console.log("online = true");
    this.online = true;
    this.element.querySelector(".window-icon").classList.remove("chat-connecting");
    this.element.querySelector(".window-icon").classList.add("chat-online");
};

Chat.prototype.newMessageFromServer = function(event) {
    console.log(event.data);
    var data = JSON.parse(event.data);
    if (data.type === "message") {
        //add timestamp to data-object
        data.timestamp = new Date().toLocaleDateString("sv-se", this.timeStampOptions);
        if (!data.channel) {
            data.channel = "";
        }
        if (data.channel === this.channel) {
            this.printNewMessage(data);
            this.saveNewMessage(data);
        }
    }
};

Chat.prototype.formSubmit = function(event) {
    event.preventDefault();
    if (this.online) {
        var input = this.element.querySelector(".chat-inputField").value;

        if (input.length > 0) {
            var msg = {
                "type": "message",
                "data": input,
                "username": this.username,
                "channel": this.channel,
                "key": this.key
            };

            this.socket.send(JSON.stringify(msg));
            this.element.querySelector("form").reset();
            this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
        }
    }
};

Chat.prototype.printNewMessage = function(data) {
    var container = this.element.querySelector(".chat-message-list");
    var scrolled = false;
    if (container.scrollTop !== (container.scrollHeight - container.offsetHeight)) {
        scrolled = true;
    }

    var template = document.querySelector("#template-chat-message-line").content.cloneNode(true);
    var usernameNode = document.createTextNode(data.username);
    var messageNode = document.createTextNode(data.data);

    template.querySelector(".chat-username").appendChild(usernameNode);
    template.querySelector(".chat-message").appendChild(messageNode);
    if (data.timestamp) {
        template.querySelector(".chat-message-line").setAttribute("title", data.timestamp);
    }

    if (this.username === data.username) {
        template.querySelector("li").classList.add("chat-bubble-me");
    }
    else {
        template.querySelector("li").classList.add("chat-bubble");
    }

    this.element.querySelector(".chat-message-list ul").appendChild(template);

    if (!scrolled) {
        container.scrollTop = container.scrollHeight;
    }
};

Chat.prototype.saveNewMessage = function(data) {
    var newMsg = {
        username: data.username,
        data: data.data,
        timestamp: data.timestamp
    };
    this.messages.push(newMsg);
    localStorage.setItem("chat-" + this.channel, JSON.stringify(this.messages));
};

Chat.prototype.readStoredMessages = function() {
    if (localStorage.getItem("chat-" + this.channel)) {
        var messages = localStorage.getItem("chat-" + this.channel);
        this.messages = JSON.parse(messages);

        for (var i = 0; i < this.messages.length; i += 1) {
            this.printNewMessage(this.messages[i]);
        }
    }
};

Chat.prototype.toggleFocus = function() {
    this.element.classList.toggle("focused-window");
};

Chat.prototype.checkInput = function(event) {
    console.log(event.target.value);
    if (event.target.value.length > 0) {
        this.element.querySelector(".chat-sendButton").removeAttribute("disabled");
    }
    else {
        this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
    }
};

Chat.prototype.clearHistory = function() {
    localStorage.removeItem("chat-" + this.channel);
    this.messages = [];

    var listElement = this.element.querySelector("ul");
    while (listElement.hasChildNodes()) {
        listElement.removeChild(listElement.firstChild);
    }
};

module.exports = Chat;
},{}],9:[function(require,module,exports){
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

    this.timer = new Timer();
    this.timer.start();

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
    this.turnCard(event.target);
};

Game.prototype.turnCard = function(element) {
    if (this.visibleCards.length < 2 && !element.classList.contains("disable")) {
        if (element.classList.contains("card")) {
            var yx = element.classList[0].split("-")[1];
            var y = yx.charAt(0);
            var x = yx.charAt(1);

            element.classList.add("img-" + this.board[y][x].imgNr);
            element.classList.add("img");

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
    this.totalTime = this.timer.stop();
    var template = document.querySelector("#template-memory-gameover").content.cloneNode(true);
    template.querySelector(".memory-turns").appendChild(document.createTextNode(this.turns));
    template.querySelector(".memory-time").appendChild(document.createTextNode(this.totalTime));

    this.element.appendChild(template);
};

module.exports = Game;

},{"./MemoryBoard":10,"./MemoryCard":11,"./Timer":12}],10:[function(require,module,exports){
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
            //cardDiv.setAttribute("tabindex", 0);
            rowDiv.appendChild(cardDiv);
        }

        frag.appendChild(rowDiv);
    }

    this.element.appendChild(frag);
};

module.exports = MemoryBoard;

},{}],11:[function(require,module,exports){
/**
 * Created by Oskar on 2015-11-23.
 */

function MemoryCard(id, imgNr) {
    this.id = id;
    this.imgNr = imgNr;
}

module.exports = MemoryCard;

},{}],12:[function(require,module,exports){
"use strict";

/**
 * Timer constructor
 * @constructor
 */
function Timer() {
    this.startTime = undefined;
    //this.interval = undefined;
}

/**
 * Function that starts an interval for the timer
 */
Timer.prototype.start = function() {
    //call the run function on each interval
    //this.interval = setInterval(this.run.bind(this), 100);
    this.startTime = new Date().getTime();
};

/**
 * Function to be executed each interval of the timer
 */
/*
Timer.prototype.run = function() {
    var now = new Date().getTime();
    //count the difference from start to now
    var diff = (now - this.startTime) / 1000;
};*/

/**
 * Function that stops the timer before its over
 * @returns {number}, the difference in seconds
 */
Timer.prototype.stop = function() {
    //clearInterval(this.interval);
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

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvanMvRXhhbXBsZUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9MYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5QXBwbGljYXRpb24uanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvR2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUJvYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Q2FyZC5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIEJhc2ljV2luZG93KG9wdGlvbnMpIHtcclxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMueCA9IG9wdGlvbnMueCB8fCAxMDtcclxuICAgIHRoaXMueSA9IG9wdGlvbnMueSB8fCAxMDtcclxuICAgIHRoaXMudGFiSW5kZXggPSBvcHRpb25zLnRhYkluZGV4IHx8IDA7XHJcbiAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCB0aGlzLmlkO1xyXG4gICAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uIHx8IFwiYnVnX3JlcG9ydFwiO1xyXG4gICAgdGhpcy5tYXhpbWl6YWJsZSA9IG9wdGlvbnMubWF4aW1pemFibGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLnpJbmRleCA9IG9wdGlvbnMuekluZGV4O1xyXG59XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IGRlc3Ryb3lcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhpc1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZ1wiKTtcclxuICAgIHZhciB0ZW1wbGF0ZSAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvd1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB0ZW1wbGF0ZVdpbmRvdyA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0aGlzLmlkKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS56SW5kZXggPSB0aGlzLnpJbmRleDtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRoaXMudGFiSW5kZXgpO1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgdmFyIGxhdW5jaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlclwiKTtcclxuICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBsYXVuY2hlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7XHJcblxyXG4gICAgLy9hZGQgbWF4aW1pemUtYnV0dG9uXHJcbiAgICBpZiAodGhpcy5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1heGltaXplLWJ1dHRvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB2YXIgd2luZG93QnV0dG9ucyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1idXR0b25zXCIpO1xyXG4gICAgICAgIHZhciByZW1vdmVCdXR0b24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZS1idXR0b25cIik7XHJcbiAgICAgICAgd2luZG93QnV0dG9ucy5pbnNlcnRCZWZvcmUoYnV0dG9uLCByZW1vdmVCdXR0b24pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1pbmltaXplZFwiKTtcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtYXhpbWl6ZWRcIik7XHJcblxyXG4gICAgdmFyIGljb24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1pY29uIGlcIik7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtYXhpbWl6ZWRcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgICAgIGljb24ucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiY3JvcF9kaW5cIiksIGljb24uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWF4aW1pemUtYnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIFwiTWF4aW1pemVcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJmaWx0ZXJfbm9uZVwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1idXR0b25cIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgXCJSZXNpemVcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuY2xlYXJDb250ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpO1xyXG4gICAgd2hpbGUgKGNvbnRlbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChjb250ZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBjb25zb2xlLmxvZyhrZXkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdzsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBDaGF0ID0gcmVxdWlyZShcIi4vY2hhdGFwcC9DaGF0XCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhdEFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICB0aGlzLmNoYXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IFwiXCI7XHJcbiAgICB0aGlzLnNlcnZlciA9IFwidmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCI7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuYWRkRm9jdXNGdW5jID0gdGhpcy5hZGRGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5yZW1vdmVGb2N1c0Z1bmMgPSB0aGlzLnJlbW92ZUZvY3VzLmJpbmQodGhpcyk7XHJcbn1cclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgQ2hhdEFwcGxpY2F0aW9uO1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJuYW1lXCIpKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIik7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XHJcbiAgICAvL3RoaXMuY2hhdCA9IG5ldyBDaGF0KHRoaXMuZWxlbWVudCwgdGhpcy5zZXJ2ZXIsIHRoaXMuY2hhbm5lbCwgdGhpcy51c2VybmFtZSk7XHJcbiAgICAvL3RoaXMuY2hhdC5pbml0KCk7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgY2hhdFwiKTtcclxuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hcHBcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG5cclxuICAgIC8vYWRkIHRoZSBtZW51XHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgdmFyIGFsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudDtcclxuICAgIHZhciBhbHQxID0gYWx0LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiQ2xlYXIgSGlzdG9yeVwiKSk7XHJcblxyXG4gICAgdmFyIGFsdDIgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0Mi5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJTZXR0aW5nc1wiKSk7XHJcblxyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0Mik7XHJcblxyXG4gICAgLy9wcmludCB0aGUgc2V0dGluZ3NcclxuICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudUNsaWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImFcIikge1xyXG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0dGluZ3NcIjoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJjbGVhciBoaXN0b3J5XCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXQuY2xlYXJIaXN0b3J5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciBpbnB1dExpc3Q7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmFkZFNldHRpbmdzKHRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgaW5wdXRMaXN0ID0gIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFt0eXBlPSd0ZXh0J11cIik7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnB1dExpc3QubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgaW5wdXRMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLmFkZEZvY3VzRnVuYyk7XHJcbiAgICAgICAgICAgIGlucHV0TGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5yZW1vdmVGb2N1c0Z1bmMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSd1c2VybmFtZSddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMuc2VydmVyKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdjaGFubmVsJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy5jaGFubmVsKTtcclxuXHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9J2J1dHRvbiddXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiICwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImZvcm1cIikpO1xyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5zYXZlU2V0dGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xyXG4gICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5zb2NrZXQuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZm9ybSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLWZvcm1cIik7XHJcblxyXG4gICAgdGhpcy51c2VybmFtZSA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3VzZXJuYW1lJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLnNlcnZlciA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5jaGFubmVsID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nY2hhbm5lbCddXCIpLnZhbHVlO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LW9ubGluZVwiLCBcImNoYXQtY29ubmVjdGluZ1wiLCBcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcblxyXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcclxuXHJcbiAgICAvL3N0YXJ0IHRoZSBuZXcgY2hhdFxyXG4gICAgY29uc29sZS5sb2coXCJzdGFydCAnbmV3JyBjaGF0IHdpdGggcGFyYW1cIik7XHJcbiAgICBpZiAodGhpcy51c2VybmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBcIlVzZXJcIjtcclxuICAgIH1cclxuICAgIHRoaXMuY2hhdCA9IG5ldyBDaGF0KHRoaXMuZWxlbWVudCwgdGhpcy5zZXJ2ZXIsIHRoaXMuY2hhbm5lbCwgdGhpcy51c2VybmFtZSk7XHJcbiAgICB0aGlzLmNoYXQuaW5pdCgpO1xyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuc2V0Rm9jdXMoKTtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlcm5hbWVcIiwgdGhpcy51c2VybmFtZSk7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZEZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJhZGRpbmcgZm9jdXMtY2xhc3NcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnJlbW92ZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImZvY3VzZWQtd2luZG93XCIpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0Rm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdEFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy92YXIgRXhBID0gcmVxdWlyZShcIi4vRXhhbXBsZUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgTGF1bmNoZXIgPSByZXF1aXJlKFwiLi9MYXVuY2hlclwiKTtcclxuXHJcbmZ1bmN0aW9uIERlc2t0b3AoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdyA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb3VzZU1vdmVGdW5jID0gdGhpcy5tb3VzZU1vdmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMubW91c2VVcEZ1bmMgPSB0aGlzLm1vdXNlVXAuYmluZCh0aGlzKTtcclxuICAgIHRoaXMud2luZG93cyA9IFtdO1xyXG4gICAgdGhpcy5jbGlja1ggPSAwO1xyXG4gICAgdGhpcy5jbGlja1kgPSAwO1xyXG4gICAgdGhpcy5zZXJpYWxOdW1iZXIgPSAwO1xyXG4gICAgdGhpcy56SW5kZXggPSAwO1xyXG4gICAgdGhpcy5vZmZzZXRYID0gMTtcclxuICAgIHRoaXMub2Zmc2V0WSA9IDE7XHJcbiAgICB0aGlzLmxhdW5jaGVyID0gbmV3IExhdW5jaGVyKHRoaXMpO1xyXG59XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmxhdW5jaGVyLmluaXQoKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlEb3duLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmluZyBtb3ZlLWxpc3RlbmVyXCIpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm1vdmluZ1wiKTtcclxuICAgIC8vdGhpcy5hY3RpdmVXaW5kb3cgPSB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAvL2dldCB0aGUgY2xpY2tlZC13aW5kb3dzIFwibWFpbi1kaXZcIlxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJtYWluLWZyYW1lXCIpKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvd1wiKSkge1xyXG4gICAgICAgIC8vY2xpY2tlZCBET00gaXMgYSB3aW5kb3cgLSBkbyBzdHVmZlxyXG4gICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LnN0eWxlLnpJbmRleCkgIT09IHRoaXMuekluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXMoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FkZCB0aGUgbGlzdGVuZXJzIHRvIGNoZWNrIGZvciBtb3ZlbWVudCBpZiBjbGljayB3ZXJlIGluIHRoZSB3aW5kb3ctdG9wIG9mIHdpbmRvd1xyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LXRvcFwiKSkge1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5hY3RpdmVXaW5kb3cueDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuYWN0aXZlV2luZG93Lnk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtb3ZpbmdcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJhZGRpbmcgbW91c2Vtb3ZlLWxpc3RlbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ0cnlpbmcgdG8gbW92ZSB3aW5kb3dcIik7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcblxyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5hY3RpdmVXaW5kb3cueCArIFwicHhcIjtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5hY3RpdmVXaW5kb3cueSArIFwicHhcIjtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLndpbmRvd0J1dHRvbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCB3aW5kb3ctYnV0dG9uXCIpO1xyXG4gICAgdmFyIGFjdGlvbiA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3Q7XHJcblxyXG4gICAgdmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy9maW5kIHdoYXQgd2luZG93IGdvdCBjbGlja2VkXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2luZG93c1tpXS5pZCA9PT0gZWxlbWVudC5pZCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICB0aGlzLnNldEZvY3VzKHRoaXMud2luZG93c1tpbmRleF0uZWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmIChhY3Rpb24uY29udGFpbnMoXCJleGl0LWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KHRoaXMud2luZG93c1tpbmRleF0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhY3Rpb24uY29udGFpbnMoXCJtaW5pbWl6ZS1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9taW5pbWl6ZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWluaW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWF4aW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWF4aW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuY2xvc2VXaW5kb3cgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgdmFyIHJlbW92ZWQgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aCAmJiAhcmVtb3ZlZDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2luZG93c1tpXS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgICAgIHZhciBjbGlja2VkVG9vbHRpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbdmFsdWU9J2lkOlwiICsgdGhpcy53aW5kb3dzW2ldLmlkICsgXCInXVwiKTtcclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGNsaWNrZWRUb29sdGlwLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIHdoaWxlICghY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY29udGFpbmVyXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNsaWNrZWRUb29sdGlwLnBhcmVudE5vZGUpO1xyXG5cclxuICAgICAgICAgICAgLy9yZW1vdmUgZnJvbSB3aW5kb3ctbGlzdFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaV0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5jbGVhckRlc2t0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICAvL3JlbW92ZSBmcm9tIFwicnVubmluZy1hcHBzXCJcclxuICAgICAgICB2YXIgd2luZG93VG9vbHRpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbdmFsdWU9J2lkOlwiICsgdGhpcy53aW5kb3dzW2ldLmlkICsgXCInXVwiKTtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gd2luZG93VG9vbHRpcC5wYXJlbnROb2RlO1xyXG4gICAgICAgIHdoaWxlICghY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY29udGFpbmVyXCIpKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuICAgIHRoaXMub2Zmc2V0WCA9IDE7XHJcbiAgICB0aGlzLm9mZnNldFkgPSAxO1xyXG4gICAgdGhpcy56SW5kZXggPSAwO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5pZCA9PT0gdGhpcy5hY3RpdmVXaW5kb3cuaWQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRoaXMuYWN0aXZlV2luZG93IGhhcyB0aGUgT2JqZWN0IGZvciB0aGlzIHdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5rZXlJbnB1dChldmVudC5rZXlDb2RlKTtcclxuICAgIH1cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgLy9maW5kIHRoZSB3aW5kb3cgaW4gd2luZG93LWFycmF5XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB0aGlzLndpbmRvd3NbaV07XHJcbiAgICAgICAgICAgIHRoaXMuekluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy56SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi9CYXNpY1dpbmRvd1wiKTtcclxuXHJcbmZ1bmN0aW9uIEV4YW1wbGVBcHBsaWNhdGlvbihpZCwgeCwgeSkge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCwgeCwgeSk7XHJcbn1cclxuXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgRXhhbXBsZUFwcGxpY2F0aW9uO1xyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nIGV4YW1wbGVcIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCkuY2xhc3NMaXN0LmFkZChcImV4YW1wbGUtYXBwXCIpO1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhhbXBsZUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRXhBID0gcmVxdWlyZShcIi4vRXhhbXBsZUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgTWVtb3J5QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9NZW1vcnlBcHBsaWNhdGlvblwiKTtcclxudmFyIENoYXRBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL0NoYXRBcHBsaWNhdGlvblwiKTtcclxuXHJcbmZ1bmN0aW9uIExhdW5jaGVyKGRlc2t0b3ApIHtcclxuICAgIHRoaXMuZGVza3RvcCA9IGRlc2t0b3A7XHJcbiAgICAvL3RoaXMuc3RhcnRBcHBsaWNhdGlvbihcIm1lbW9yeVwiKTtcclxufVxyXG5cclxuTGF1bmNoZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpVGFnO1xyXG4gICAgdmFyIGFwcExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmxhdW5jaGVyIGxpXCIpO1xyXG4gICAgY29uc29sZS5sb2coYXBwTGlzdCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFwcExpc3QubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpVGFnID0gYXBwTGlzdFtpXS5xdWVyeVNlbGVjdG9yKFwiaVwiKTtcclxuICAgICAgICAvL2lUYWcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc3RhcnRBcHBsaWNhdGlvbi5iaW5kKHRoaXMpKTtcclxuICAgICAgICBhcHBMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnN0YXJ0QXBwbGljYXRpb24uYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuTGF1bmNoZXIucHJvdG90eXBlLnN0YXJ0QXBwbGljYXRpb24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgdmFyIGljb247XHJcbiAgICB2YXIgdGl0bGU7XHJcbiAgICB2YXIgbmV3QXBwID0gZmFsc2U7XHJcbiAgICB2YXIgbWFyZ2luWCA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRYKTtcclxuICAgIHZhciBtYXJnaW5ZID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFkpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XHJcbiAgICB2YXIgZWxlbWVudDtcclxuICAgIGlmIChldmVudC50YXJnZXQuYXR0cmlidXRlc1tcInZhbHVlXCJdKSB7XHJcbiAgICAgICAgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmF0dHJpYnV0ZXNbXCJ2YWx1ZVwiXSkge1xyXG4gICAgICAgIC8vaXMgdGhlIGktdGFnIGluIHRoZSBsaVxyXG4gICAgICAgIGVsZW1lbnQgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgIHZhbHVlID0gZWxlbWVudC5hdHRyaWJ1dGVzW1widmFsdWVcIl0udmFsdWU7XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgLy90aGlzIGhhbmRsZXMgdGhlIFwicnVubmluZy1hcHBzXCItY2xpY2tzLiBzaG91bGQgYmUgYnJva2VuIG91dCFcclxuICAgICAgICAgICAgdmFyIHN3aXRjaFRvID0gdmFsdWUuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICBpZiAoc3dpdGNoVG9bMF0gPT09IFwiaWRcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidG9vbHRpcC1jbG9zZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVza3RvcC5jbG9zZVdpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRvV2luZG93KHN3aXRjaFRvWzFdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2VuZCBvZiBydW5uaW5nLWFwcHMgaGFuZGxlXHJcblxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGljb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC10aXRsZVwiKS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgYXBwT3B0aW9ucyA9IHtcclxuICAgICAgICBpZDogXCJ3aW4tXCIgKyB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyLFxyXG4gICAgICAgIHg6IG1hcmdpblgsXHJcbiAgICAgICAgeTogbWFyZ2luWSxcclxuICAgICAgICB0YWJJbmRleDogdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB6SW5kZXg6IHRoaXMuZGVza3RvcC56SW5kZXgsXHJcbiAgICAgICAgaWNvbjogaWNvbixcclxuICAgICAgICB0aXRsZTogdGl0bGVcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh2YWx1ZSkge1xyXG4gICAgICAgIGNhc2UgXCJleGFtcGxlXCI6IHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBFeEEoYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5wcmludCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJtZW1vcnlcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiY2hhdFwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBDaGF0QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInJlc2V0XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc2V0dGluZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy5kZXNrdG9wLmNsZWFyRGVza3RvcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld0FwcCkge1xyXG4gICAgICAgIHZhciBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0FwcC5pZCArIFwiIC53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICBidXR0b25zLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlc2t0b3Aud2luZG93QnV0dG9uQ2xpY2suYmluZCh0aGlzLmRlc2t0b3ApKTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Aud2luZG93cy5wdXNoKG5ld0FwcCk7XHJcbiAgICAgICAgdGhpcy5hZGRSdW5uaW5nQXBwKHZhbHVlLCBuZXdBcHApO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIgKz0gMTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WCArPSAxO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlciAlIDE1ID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRZID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRZICs9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRlc2t0b3Auc2V0Rm9jdXMobmV3QXBwLmVsZW1lbnQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTGF1bmNoZXIucHJvdG90eXBlLnN3aXRjaFRvV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciB3aW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgaWQpO1xyXG4gICAgaWYgKHdpbmRvdykge1xyXG4gICAgICAgIGlmICh3aW5kb3cuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWluaW1pemVkXCIpKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbGFzc0xpc3QucmVtb3ZlKFwibWluaW1pemVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlc2t0b3Auc2V0Rm9jdXMod2luZG93KTtcclxuICAgIH1cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5hZGRSdW5uaW5nQXBwID0gZnVuY3Rpb24odHlwZSwgYXBwKSB7XHJcbiAgICAvL2dldCB0aGUgdG9vbHRpcC1jb250YWluZXIgZm9yIHRoZSBhcHAgYW5kIGFkZCBpdCB0byB0aGUgbGlzdFxyXG4gICAgY29uc29sZS5sb2codHlwZSk7XHJcbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImxpW3ZhbHVlPSdcIiArIHR5cGUgKyBcIiddIC50b29sdGlwLWNvbnRhaW5lclwiKTtcclxuICAgIGNvbnNvbGUubG9nKGNvbnRhaW5lcik7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXRvb2x0aXBcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXBcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLnRpdGxlICsgXCIoXCIgKyBhcHAuaWQgKyBcIilcIikpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLWNsb3NlXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYXVuY2hlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBNZW1vcnlHYW1lID0gcmVxdWlyZShcIi4vbWVtb3J5L0dhbWVcIik7XHJcblxyXG5mdW5jdGlvbiBNZW1vcnlBcHBsaWNhdGlvbihvcHRpb25zKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLmdhbWUgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmJvYXJkU2l6ZSA9IFs0LCA0XTtcclxuICAgIHRoaXMubWFya2VkQ2FyZCA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTWVtb3J5QXBwbGljYXRpb247XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1lbnVDbGlja2VkLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5nYW1lID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIDQsIDQpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nIG1lbW9yeVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWFwcFwiKTtcclxuXHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgdmFyIGFsdDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0MS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOZXcgR2FtZVwiKSk7XHJcblxyXG4gICAgdmFyIGFsdDIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0Mi5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJTZXR0aW5nc1wiKSk7XHJcblxyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0Mik7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudUNsaWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImFcIikge1xyXG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0dGluZ3NcIjoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJuZXcgZ2FtZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplID0gdmFsdWUuc3BsaXQoXCJ4XCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIHkgPSB0aGlzLmJvYXJkU2l6ZVsxXTtcclxuICAgIHZhciB4ID0gdGhpcy5ib2FyZFNpemVbMF07XHJcbiAgICB0aGlzLmNsZWFyQ29udGVudCgpO1xyXG5cclxuICAgIHRoaXMuZ2FtZS5yZW1vdmVFdmVudHMoKTtcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCB4LCB5KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktc2V0dGluZ3NcIik7XHJcblxyXG4gICAgICAgIHRlbXBsYXRlID0gdGhpcy5hZGRTZXR0aW5ncyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2V0dGluZ3MgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1lbW9yeS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbdHlwZT0nYnV0dG9uJ11cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIgLCB0aGlzLnNhdmVTZXR0aW5ncy5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZhbHVlID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RbbmFtZT0nYm9hcmQtc2l6ZSddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5yZXN0YXJ0KHZhbHVlKTtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5SW5wdXQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIGNvbnNvbGUubG9nKFwia2V5IGluIG1lbW9yeTpcIiArIGtleSk7XHJcbiAgICBpZiAoIXRoaXMubWFya2VkQ2FyZCkge1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmRcIik7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdC5hZGQoXCJtYXJrZWRcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rvb2dsZSB0aGUgbWFya2VkQ2FyZCBiZWZvcmUgY2hhbmdpbmcgbWFya2VkQ2FyZFxyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QudG9nZ2xlKFwibWFya2VkXCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubWFya2VkQ2FyZCk7XHJcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgICAgICAgY2FzZSAzOToge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAzNzoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIDM4OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVVwKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIDQwOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleURvd24oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgMTM6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS50dXJuQ2FyZCh0aGlzLm1hcmtlZENhcmQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdGhpcy5tYXJrZWRDYXJkID0gZWxlbWVudDtcclxuXHJcbiAgICAgICAgLy9lbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcclxuICAgICAgICAvL3N3aXRjaFxyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QudG9nZ2xlKFwibWFya2VkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCBjYXJkXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZy5maXJzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vcmVzdGFydCBmcm9tIHRvcFxyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgcHJldmlvdXMgY2FyZFxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL3Jlc3RhcnQgZnJvbSBib3R0b20gcmlnaHRcclxuICAgICAgICAgICAgdmFyIHJvd3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yb3dcIik7XHJcbiAgICAgICAgICAgIHZhciBsYXN0Um93ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSBsYXN0Um93Lmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcclxuICAgIHZhciByb3c7XHJcbiAgICB2YXIgcm93WTtcclxuXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHZhciBpZCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTIpO1xyXG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpIC0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vYmVnaW4gZnJvbSBib3R0b21cclxuICAgICAgICB2YXIgcm93cyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJvd1wiKTtcclxuICAgICAgICByb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgcm93WSA9IHJvd3MubGVuZ3RoIC0xO1xyXG4gICAgfVxyXG4gICAgLy9maW5kIHdoYXQgeC1wb3NpdGlvbiBpbiB0aGUgcm93IHRoZSBtYXJrZWQgY2FyZCBpcyBvblxyXG4gICAgdmFyIGNhcmRYID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMSk7XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgcm93WSArIGNhcmRYKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcclxuICAgIHZhciByb3dZO1xyXG5cclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB2YXIgaWQgPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0yKTtcclxuICAgICAgICByb3dZID0gcGFyc2VJbnQoaWQuY2hhckF0KDApKSArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByb3dZID0gMDtcclxuICAgIH1cclxuICAgIC8vZmluZCB3aGF0IHgtcG9zaXRpb24gaW4gdGhlIHJvdyB0aGUgbWFya2VkIGNhcmQgaXMgb25cclxuICAgIHZhciBjYXJkWCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTEpO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHJvd1kgKyBjYXJkWCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7XHJcbmQuaW5pdCgpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQ2hhdChlbGVtZW50LCBzZXJ2ZXIsIGNoYW5uZWwsIHVzZXJuYW1lKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsIHx8IFwiXCI7XHJcbiAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XHJcbiAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMua2V5ID0gXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiO1xyXG4gICAgdGhpcy5vbmxpbmUgPSBmYWxzZTtcclxuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcclxuICAgIHRoaXMudGltZVN0YW1wT3B0aW9ucyA9IHtcclxuICAgICAgICB5ZWFyOiBcIm51bWVyaWNcIiwgbW9udGg6IFwibnVtZXJpY1wiLFxyXG4gICAgICAgIGRheTogXCJudW1lcmljXCIsIGhvdXI6IFwiMi1kaWdpdFwiLCBtaW51dGU6IFwiMi1kaWdpdFwiXHJcbiAgICB9O1xyXG59XHJcblxyXG5DaGF0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImluaXRzIHRoZSBjaGF0XCIpO1xyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIHRoaXMucmVhZFN0b3JlZE1lc3NhZ2VzKCk7XHJcbiAgICB0aGlzLmNvbm5lY3RUb1NlcnZlcigpO1xyXG4gICAgLy9hZGQgbGlzdGVuZXJzXHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm5ld01lc3NhZ2VGcm9tU2VydmVyLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5mb3JtU3VibWl0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5mb3JtU3VibWl0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLmNoZWNrSW5wdXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9wcmludCB0aGUgY2hhdC10ZW1wbGF0ZSB0byB0aGlzLmVsZW1lbnRcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1hcHBsaWNhdGlvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuXHJcbiAgICAvL3ByaW50IGluZm9cclxuICAgIHZhciBpbmZvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1pbmZvXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIGNoYW5uZWxJbmZvID0gXCJcIjtcclxuICAgIGlmICh0aGlzLmNoYW5uZWwgPT09IFwiXCIpIHtcclxuICAgICAgICAgY2hhbm5lbEluZm8gPSBcIk5vbi1zcGVjaWZpZWRcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNoYW5uZWxJbmZvID0gdGhpcy5jaGFubmVsO1xyXG4gICAgfVxyXG4gICAgdmFyIGluZm9Ob2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIjXCIgKyBjaGFubmVsSW5mby5zbGljZSgwLDE4KSArIFwiL1wiICsgdGhpcy51c2VybmFtZS5zbGljZSgwLDEwKSk7XHJcbiAgICBpbmZvLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pbmZvXCIpLmFwcGVuZENoaWxkKGluZm9Ob2RlKTtcclxuXHJcbiAgICB2YXIgbWVudUluZm8gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWluZm9cIik7XHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgaWYgKG1lbnVJbmZvKSB7XHJcbiAgICAgICAgbWVudS5yZXBsYWNlQ2hpbGQoaW5mbywgbWVudUluZm8pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbWVudS5hcHBlbmRDaGlsZChpbmZvKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNvbm5lY3RUb1NlcnZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWNvbm5lY3RpbmdcIik7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9cIiArIHRoaXMuc2VydmVyLCBcImNoYXJjb3Jkc1wiKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCB0aGlzLnNldE9ubGluZS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCB0aGlzLnNldE9mZmxpbmUuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5zZXRPZmZsaW5lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMub25saW5lID0gZmFsc2U7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9mZmxpbmVcIik7XHJcblxyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdXNlcm5hbWU6IFwiR2xhRG9zXCIsXHJcbiAgICAgICAgZGF0YTogXCJDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXIuLi4gWW91IGNhbiBzdGlsbCByZWFkIHlvdXIgY2hhdCBoaXN0b3J5XCJcclxuICAgIH07XHJcbiAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNldE9ubGluZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy90aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSkpO1xyXG4gICAgY29uc29sZS5sb2coXCJvbmxpbmUgPSB0cnVlXCIpO1xyXG4gICAgdGhpcy5vbmxpbmUgPSB0cnVlO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9ubGluZVwiKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLm5ld01lc3NhZ2VGcm9tU2VydmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEpO1xyXG4gICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAvL2FkZCB0aW1lc3RhbXAgdG8gZGF0YS1vYmplY3RcclxuICAgICAgICBkYXRhLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKFwic3Ytc2VcIiwgdGhpcy50aW1lU3RhbXBPcHRpb25zKTtcclxuICAgICAgICBpZiAoIWRhdGEuY2hhbm5lbCkge1xyXG4gICAgICAgICAgICBkYXRhLmNoYW5uZWwgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5jaGFubmVsID09PSB0aGlzLmNoYW5uZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmludE5ld01lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5ld01lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuZm9ybVN1Ym1pdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKHRoaXMub25saW5lKSB7XHJcbiAgICAgICAgdmFyIGlucHV0ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgbXNnID0ge1xyXG4gICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJkYXRhXCI6IGlucHV0LFxyXG4gICAgICAgICAgICAgICAgXCJ1c2VybmFtZVwiOiB0aGlzLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgICAgXCJjaGFubmVsXCI6IHRoaXMuY2hhbm5lbCxcclxuICAgICAgICAgICAgICAgIFwia2V5XCI6IHRoaXMua2V5XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1zZykpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUucHJpbnROZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0XCIpO1xyXG4gICAgdmFyIHNjcm9sbGVkID0gZmFsc2U7XHJcbiAgICBpZiAoY29udGFpbmVyLnNjcm9sbFRvcCAhPT0gKGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIub2Zmc2V0SGVpZ2h0KSkge1xyXG4gICAgICAgIHNjcm9sbGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtbWVzc2FnZS1saW5lXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHVzZXJuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUpO1xyXG4gICAgdmFyIG1lc3NhZ2VOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS5kYXRhKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtdXNlcm5hbWVcIikuYXBwZW5kQ2hpbGQodXNlcm5hbWVOb2RlKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlXCIpLmFwcGVuZENoaWxkKG1lc3NhZ2VOb2RlKTtcclxuICAgIGlmIChkYXRhLnRpbWVzdGFtcCkge1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpbmVcIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgZGF0YS50aW1lc3RhbXApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnVzZXJuYW1lID09PSBkYXRhLnVzZXJuYW1lKSB7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImxpXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWJ1YmJsZS1tZVwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJsaVwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1idWJibGVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxuICAgIGlmICghc2Nyb2xsZWQpIHtcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNhdmVOZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG5ld01zZyA9IHtcclxuICAgICAgICB1c2VybmFtZTogZGF0YS51c2VybmFtZSxcclxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXHJcbiAgICAgICAgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcFxyXG4gICAgfTtcclxuICAgIHRoaXMubWVzc2FnZXMucHVzaChuZXdNc2cpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0aGlzLm1lc3NhZ2VzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5yZWFkU3RvcmVkTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gSlNPTi5wYXJzZShtZXNzYWdlcyk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tZXNzYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZSh0aGlzLm1lc3NhZ2VzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS50b2dnbGVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNoZWNrSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuICAgIGlmIChldmVudC50YXJnZXQudmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xlYXJIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpO1xyXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIHZhciBsaXN0RWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwidWxcIik7XHJcbiAgICB3aGlsZSAobGlzdEVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQobGlzdEVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgT3NrYXIgb24gMjAxNS0xMS0yMy5cclxuICovXHJcbnZhciBNZW1vcnlCb2FyZCA9IHJlcXVpcmUoXCIuL01lbW9yeUJvYXJkXCIpO1xyXG52YXIgTWVtb3J5Q2FyZCA9IHJlcXVpcmUoXCIuL01lbW9yeUNhcmRcIik7XHJcbnZhciBUaW1lciA9IHJlcXVpcmUoXCIuL1RpbWVyXCIpO1xyXG5cclxuZnVuY3Rpb24gR2FtZShlbGVtZW50LCB4LCB5KSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy54ID0gcGFyc2VJbnQoeCk7XHJcbiAgICB0aGlzLnkgPSBwYXJzZUludCh5KTtcclxuICAgIHRoaXMubGF5b3V0ID0gbmV3IE1lbW9yeUJvYXJkKGVsZW1lbnQsIHRoaXMueCwgdGhpcy55KTtcclxuICAgIHRoaXMuYm9hcmQgPSBbXTtcclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbiAgICB0aGlzLnR1cm5zID0gMDtcclxuICAgIHRoaXMuY29ycmVjdENvdW50ID0gMDtcclxuICAgIHRoaXMuaW1hZ2VMaXN0ID0gWzAsMCwxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDddO1xyXG4gICAgdGhpcy5pbWFnZXMgPSB0aGlzLmltYWdlTGlzdC5zbGljZSgwLCh0aGlzLnkqdGhpcy54KSk7XHJcbiAgICB0aGlzLmNsaWNrRnVuYyA9IHRoaXMuY2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAvL3RoaXMuZm91bmRQaWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb3VuZC1waWxlXCIpO1xyXG5cclxuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoKTtcclxuICAgIHRoaXMudGltZXIuc3RhcnQoKTtcclxuXHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XHJcblxyXG4gICAgdGhpcy5zaHVmZmxlSW1hZ2VzKCk7XHJcbiAgICB0aGlzLmFkZEV2ZW50cygpO1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICBpZiAodGhpcy54ID4gdGhpcy55KSB7XHJcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgdGhpcy54OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBBcnJheSh0aGlzLnkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG4gICAgZm9yKGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpIHtcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy54IC0gMTsgaiArPSAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1bal0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIGosIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqKzFdID0gbmV3IE1lbW9yeUNhcmQoXCJcIiArIGkgKyAoaiArIDEpLCB0aGlzLmltYWdlcy5wb3AoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuc2h1ZmZsZUltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRlbXA7XHJcbiAgICB2YXIgcmFuZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wID0gdGhpcy5pbWFnZXNbaV07XHJcbiAgICAgICAgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuaW1hZ2VzLmxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZXNbaV0gPSB0aGlzLmltYWdlc1tyYW5kXTtcclxuICAgICAgICB0aGlzLmltYWdlc1tyYW5kXSA9IHRlbXA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5hZGRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tGdW5jKTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMudHVybkNhcmQoZXZlbnQudGFyZ2V0KTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnR1cm5DYXJkID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aCA8IDIgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGlzYWJsZVwiKSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImNhcmRcIikpIHtcclxuICAgICAgICAgICAgdmFyIHl4ID0gZWxlbWVudC5jbGFzc0xpc3RbMF0uc3BsaXQoXCItXCIpWzFdO1xyXG4gICAgICAgICAgICB2YXIgeSA9IHl4LmNoYXJBdCgwKTtcclxuICAgICAgICAgICAgdmFyIHggPSB5eC5jaGFyQXQoMSk7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbWctXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmltZ05yKTtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaW1nXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlQ2FyZHMucHVzaCh0aGlzLmJvYXJkW3ldW3hdKTtcclxuXHJcbiAgICAgICAgICAgIC8vZGlzYWJsZSB0aGUgY2FyZCB0aGF0IGdvdCBjbGlja2VkXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmlkKS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZVwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0lmQ29ycmVjdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuY2hlY2tJZkNvcnJlY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudHVybnMgKz0gMTtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMudmlzaWJsZUNhcmRzKTtcclxuICAgIGlmICh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOciA9PT0gdGhpcy52aXNpYmxlQ2FyZHNbMV0uaW1nTnIpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbMF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbMV0uaWQpLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcclxuXHJcbiAgICAgICAgLy90aGlzLmFkZFRvUGlsZSh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XHJcbiAgICAgICAgLy90aGlzLnBsYXllcnNbdGhpcy5hY3RpdmVQbGF5ZXJdLmNhcmRzLnB1c2godGhpcy52aXNpYmxlQ2FyZHNbMF0uaW1nTnIpO1xyXG4gICAgICAgIC8vdGhpcy5wbGF5ZXJzW3RoaXMuYWN0aXZlUGxheWVyXS5hZGRUb1BpbGUoKTtcclxuXHJcbiAgICAgICAgLy9yZXNldCB0aGUgYXJyYXlcclxuICAgICAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNvcnJlY3RDb3VudCArPSAxO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3JyZWN0Q291bnQgPT09ICh0aGlzLngqdGhpcy55IC8gMikpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpKz0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LmFkZChcIndyb25nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbaV0uaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMudHVybkJhY2tDYXJkcy5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgICAgICAvL3RoaXMuY2hhbmdlUGxheWVyKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5jaGFuZ2VQbGF5ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKHRoaXMuYWN0aXZlUGxheWVyID09PSB0aGlzLm5yT2ZQbGF5ZXJzIC0gMSkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyID0gMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWVyICs9IDE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS50dXJuQmFja0NhcmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcENhcmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGVtcENhcmQgPSB0aGlzLnZpc2libGVDYXJkc1tpXTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0ZW1wQ2FyZCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRlbXBDYXJkLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwid3JvbmdcIiwgXCJpbWdcIiwgXCJpbWctXCIgKyB0ZW1wQ2FyZC5pbWdOcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZXNldCB0aGUgYXJyYXlcclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5nYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJ0dXJuczpcIiArIHRoaXMudHVybnMpO1xyXG4gICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWVtb3J5LWdhbWVvdmVyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5tZW1vcnktdHVybnNcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50dXJucykpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5tZW1vcnktdGltZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRvdGFsVGltZSkpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5Qm9hcmQoZWxlbWVudCwgeCx5KSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy5wcmludENhcmRzKCk7XHJcbn1cclxuXHJcbk1lbW9yeUJvYXJkLnByb3RvdHlwZS5wcmludENhcmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuXHJcbiAgICB2YXIgcm93RGl2O1xyXG4gICAgdmFyIGNhcmREaXY7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKVxyXG4gICAge1xyXG4gICAgICAgIHJvd0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgcm93RGl2LmNsYXNzTGlzdC5hZGQoXCJyb3dcIik7XHJcblxyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLng7IGogKz0gMSkge1xyXG4gICAgICAgICAgICBjYXJkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAgICAgY2FyZERpdi5jbGFzc0xpc3QuYWRkKFwiY2FyZC1cIiArIGkgKyBqLCBcImNhcmRcIik7XHJcbiAgICAgICAgICAgIC8vY2FyZERpdi5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAwKTtcclxuICAgICAgICAgICAgcm93RGl2LmFwcGVuZENoaWxkKGNhcmREaXYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyb3dEaXYpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5Qm9hcmQ7XHJcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxuICovXG5cbmZ1bmN0aW9uIE1lbW9yeUNhcmQoaWQsIGltZ05yKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMuaW1nTnIgPSBpbWdOcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlDYXJkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogVGltZXIgY29uc3RydWN0b3JcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUaW1lcigpIHtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gdW5kZWZpbmVkO1xyXG4gICAgLy90aGlzLmludGVydmFsID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdGFydHMgYW4gaW50ZXJ2YWwgZm9yIHRoZSB0aW1lclxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2NhbGwgdGhlIHJ1biBmdW5jdGlvbiBvbiBlYWNoIGludGVydmFsXHJcbiAgICAvL3RoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnJ1bi5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBiZSBleGVjdXRlZCBlYWNoIGludGVydmFsIG9mIHRoZSB0aW1lclxyXG4gKi9cclxuLypcclxuVGltZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgLy9jb3VudCB0aGUgZGlmZmVyZW5jZSBmcm9tIHN0YXJ0IHRvIG5vd1xyXG4gICAgdmFyIGRpZmYgPSAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTsqL1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RvcHMgdGhlIHRpbWVyIGJlZm9yZSBpdHMgb3ZlclxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSwgdGhlIGRpZmZlcmVuY2UgaW4gc2Vjb25kc1xyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICByZXR1cm4gKG5vdyAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDA7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdyB0aGUgdGltZXIgYXQgdGhlIGdpdmVuIGVsZW1lbnRcclxuICogQHBhcmFtIGRpZmZ7TnVtYmVyfSB0aGUgdGltZSB0byBiZSBwcmludGVkXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbihkaWZmKSB7XHJcbiAgICBpZih0aGlzLmVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSwgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XHJcbiJdfQ==

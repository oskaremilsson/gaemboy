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
                this.chat.clearHistory();
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
    var template = document.querySelector("#template-chat-message-line").content.cloneNode(true);
    var usernameNode = document.createTextNode(data.username);
    var messageNode = document.createTextNode(data.data);
    var timeNode = document.createTextNode(data.timestamp);

    template.querySelector(".chat-username").appendChild(usernameNode);
    template.querySelector(".chat-message").appendChild(messageNode);
    if (data.timestamp) {
        template.querySelector(".chat-tooltip-time").appendChild(timeNode);
    }

    this.element.querySelector(".chat-message-list ul").appendChild(template);
    var container = this.element.querySelector(".chat-message-list");
    container.scrollTop = container.scrollHeight;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvanMvRXhhbXBsZUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9MYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5QXBwbGljYXRpb24uanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvR2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUJvYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Q2FyZC5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIEJhc2ljV2luZG93KG9wdGlvbnMpIHtcclxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMueCA9IG9wdGlvbnMueCB8fCAxMDtcclxuICAgIHRoaXMueSA9IG9wdGlvbnMueSB8fCAxMDtcclxuICAgIHRoaXMudGFiSW5kZXggPSBvcHRpb25zLnRhYkluZGV4IHx8IDA7XHJcbiAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCB0aGlzLmlkO1xyXG4gICAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uIHx8IFwiYnVnX3JlcG9ydFwiO1xyXG4gICAgdGhpcy5tYXhpbWl6YWJsZSA9IG9wdGlvbnMubWF4aW1pemFibGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLnpJbmRleCA9IG9wdGlvbnMuekluZGV4O1xyXG59XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IGRlc3Ryb3lcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgdGhpc1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZ1wiKTtcclxuICAgIHZhciB0ZW1wbGF0ZSAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvd1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB0ZW1wbGF0ZVdpbmRvdyA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0aGlzLmlkKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS56SW5kZXggPSB0aGlzLnpJbmRleDtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRoaXMudGFiSW5kZXgpO1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgdmFyIGxhdW5jaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlclwiKTtcclxuICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBsYXVuY2hlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7XHJcblxyXG4gICAgLy9hZGQgbWF4aW1pemUtYnV0dG9uXHJcbiAgICBpZiAodGhpcy5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1heGltaXplLWJ1dHRvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB2YXIgd2luZG93QnV0dG9ucyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1idXR0b25zXCIpO1xyXG4gICAgICAgIHZhciByZW1vdmVCdXR0b24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZS1idXR0b25cIik7XHJcbiAgICAgICAgd2luZG93QnV0dG9ucy5pbnNlcnRCZWZvcmUoYnV0dG9uLCByZW1vdmVCdXR0b24pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1pbmltaXplZFwiKTtcclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtYXhpbWl6ZWRcIik7XHJcblxyXG4gICAgdmFyIGljb24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1pY29uIGlcIik7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtYXhpbWl6ZWRcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgICAgIGljb24ucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiY3JvcF9kaW5cIiksIGljb24uZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJmaWx0ZXJfbm9uZVwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgIH1cclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5jbGVhckNvbnRlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIik7XHJcbiAgICB3aGlsZSAoY29udGVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKGNvbnRlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUua2V5SW5wdXQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIGNvbnNvbGUubG9nKGtleSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljV2luZG93OyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIENoYXQgPSByZXF1aXJlKFwiLi9jaGF0YXBwL0NoYXRcIik7XHJcblxyXG5mdW5jdGlvbiBDaGF0QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuICAgIHRoaXMuY2hhdCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnVzZXJuYW1lID0gXCJcIjtcclxuICAgIHRoaXMuc2VydmVyID0gXCJ2aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIjtcclxuICAgIHRoaXMuY2hhbm5lbCA9IFwiXCI7XHJcblxyXG4gICAgdGhpcy5hZGRGb2N1c0Z1bmMgPSB0aGlzLmFkZEZvY3VzLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnJlbW92ZUZvY3VzRnVuYyA9IHRoaXMucmVtb3ZlRm9jdXMuYmluZCh0aGlzKTtcclxufVxyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBDaGF0QXBwbGljYXRpb247XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIikpIHtcclxuICAgICAgICB0aGlzLnVzZXJuYW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VybmFtZVwiKTtcclxuICAgIH1cclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxuICAgIC8vdGhpcy5jaGF0ID0gbmV3IENoYXQodGhpcy5lbGVtZW50LCB0aGlzLnNlcnZlciwgdGhpcy5jaGFubmVsLCB0aGlzLnVzZXJuYW1lKTtcclxuICAgIC8vdGhpcy5jaGF0LmluaXQoKTtcclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBjaGF0XCIpO1xyXG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCkuY2xhc3NMaXN0LmFkZChcImNoYXQtYXBwXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcblxyXG4gICAgLy9hZGQgdGhlIG1lbnVcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50O1xyXG4gICAgdmFyIGFsdDEgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0MS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJDbGVhciBIaXN0b3J5XCIpKTtcclxuXHJcbiAgICB2YXIgYWx0MiA9IGFsdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcclxuXHJcbiAgICAvL3ByaW50IHRoZSBzZXR0aW5nc1xyXG4gICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5zb2NrZXQuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcImNsZWFyIGhpc3RvcnlcIjoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGF0LmNsZWFySGlzdG9yeSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgaW5wdXRMaXN0O1xyXG5cclxuICAgIGlmICghdGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtc2V0dGluZ3NcIik7XHJcblxyXG4gICAgICAgIHRlbXBsYXRlID0gdGhpcy5hZGRTZXR0aW5ncyh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIGlucHV0TGlzdCA9ICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5wdXRMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGlucHV0TGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy5hZGRGb2N1c0Z1bmMpO1xyXG4gICAgICAgICAgICBpbnB1dExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMucmVtb3ZlRm9jdXNGdW5jKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy13cmFwcGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLnJlbW92ZUNoaWxkKHNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRTZXR0aW5ncyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0ndXNlcm5hbWUnXVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCB0aGlzLnVzZXJuYW1lKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdzZXJ2ZXInXVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCB0aGlzLnNlcnZlcik7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nY2hhbm5lbCddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMuY2hhbm5lbCk7XHJcblxyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiAsIHRoaXMuc2F2ZVNldHRpbmdzLmJpbmQodGhpcykpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpKTtcclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZvcm0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy1mb3JtXCIpO1xyXG5cclxuICAgIHRoaXMudXNlcm5hbWUgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSd1c2VybmFtZSddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5zZXJ2ZXIgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdzZXJ2ZXInXVwiKS52YWx1ZTtcclxuICAgIHRoaXMuY2hhbm5lbCA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J2NoYW5uZWwnXVwiKS52YWx1ZTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1vbmxpbmVcIiwgXCJjaGF0LWNvbm5lY3RpbmdcIiwgXCJjaGF0LW9mZmxpbmVcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG5cclxuICAgIHRoaXMuY2xlYXJDb250ZW50KCk7XHJcblxyXG4gICAgLy9zdGFydCB0aGUgbmV3IGNoYXRcclxuICAgIGNvbnNvbGUubG9nKFwic3RhcnQgJ25ldycgY2hhdCB3aXRoIHBhcmFtXCIpO1xyXG4gICAgaWYgKHRoaXMudXNlcm5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICB0aGlzLnVzZXJuYW1lID0gXCJVc2VyXCI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNoYXQgPSBuZXcgQ2hhdCh0aGlzLmVsZW1lbnQsIHRoaXMuc2VydmVyLCB0aGlzLmNoYW5uZWwsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgdGhpcy5jaGF0LmluaXQoKTtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnNldEZvY3VzKCk7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJuYW1lXCIsIHRoaXMudXNlcm5hbWUpO1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZm9jdXNlZC13aW5kb3dcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiYWRkaW5nIGZvY3VzLWNsYXNzXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5yZW1vdmVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXRBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vdmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIExhdW5jaGVyID0gcmVxdWlyZShcIi4vTGF1bmNoZXJcIik7XHJcblxyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2VNb3ZlRnVuYyA9IHRoaXMubW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm1vdXNlVXBGdW5jID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuY2xpY2tYID0gMDtcclxuICAgIHRoaXMuY2xpY2tZID0gMDtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuICAgIHRoaXMuekluZGV4ID0gMDtcclxuICAgIHRoaXMub2Zmc2V0WCA9IDE7XHJcbiAgICB0aGlzLm9mZnNldFkgPSAxO1xyXG4gICAgdGhpcy5sYXVuY2hlciA9IG5ldyBMYXVuY2hlcih0aGlzKTtcclxufVxyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5sYXVuY2hlci5pbml0KCk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlRG93bi5iaW5kKHRoaXMpKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5RG93bi5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlVXAgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZpbmcgbW92ZS1saXN0ZW5lclwiKTtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtb3ZpbmdcIik7XHJcbiAgICAvL3RoaXMuYWN0aXZlV2luZG93ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgLy9nZXQgdGhlIGNsaWNrZWQtd2luZG93cyBcIm1haW4tZGl2XCJcclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgd2hpbGUgKCFlbGVtZW50LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWFpbi1mcmFtZVwiKSkge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3dcIikpIHtcclxuICAgICAgICAvL2NsaWNrZWQgRE9NIGlzIGEgd2luZG93IC0gZG8gc3R1ZmZcclxuICAgICAgICBpZiAocGFyc2VJbnQoZWxlbWVudC5zdHlsZS56SW5kZXgpICE9PSB0aGlzLnpJbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEZvY3VzKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9hZGQgdGhlIGxpc3RlbmVycyB0byBjaGVjayBmb3IgbW92ZW1lbnQgaWYgY2xpY2sgd2VyZSBpbiB0aGUgd2luZG93LXRvcCBvZiB3aW5kb3dcclxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvdy10b3BcIikpIHtcclxuICAgICAgICAgICAgaWYgKCFldmVudC50YXJnZXQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJtYXhpbWl6ZWRcIikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuYWN0aXZlV2luZG93Lng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrWSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmFjdGl2ZVdpbmRvdy55O1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibW92aW5nXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWRkaW5nIG1vdXNlbW92ZS1saXN0ZW5lclwiKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwidHJ5aW5nIHRvIG1vdmUgd2luZG93XCIpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cueCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmNsaWNrWDtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LnkgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG5cclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMuYWN0aXZlV2luZG93LnggKyBcInB4XCI7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMuYWN0aXZlV2luZG93LnkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS53aW5kb3dCdXR0b25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgd2luZG93LWJ1dHRvblwiKTtcclxuICAgIHZhciBhY3Rpb24gPSBldmVudC50YXJnZXQuY2xhc3NMaXN0O1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG5cclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB3aGF0IHdpbmRvdyBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgdGhpcy5zZXRGb2N1cyh0aGlzLndpbmRvd3NbaW5kZXhdLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoYWN0aW9uLmNvbnRhaW5zKFwiZXhpdC1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZVdpbmRvdyh0aGlzLndpbmRvd3NbaW5kZXhdLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWluaW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWluaW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1pbmltaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1heGltaXplLWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL21heGltaXplIHRoZSBhcHBcclxuICAgICAgICAgICAgaWYgKHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemFibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmNsb3NlV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciByZW1vdmVkID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGggJiYgIXJlbW92ZWQ7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgICAgICB2YXIgY2xpY2tlZFRvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gd2luZG93LWxpc3RcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuY2xlYXJEZXNrdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh3aW5kb3dUb29sdGlwLnBhcmVudE5vZGUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAxO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMTtcclxuICAgIHRoaXMuekluZGV4ID0gMDtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuaWQgPT09IHRoaXMuYWN0aXZlV2luZG93LmlkKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0aGlzLmFjdGl2ZVdpbmRvdyBoYXMgdGhlIE9iamVjdCBmb3IgdGhpcyB3aW5kb3dcIik7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cua2V5SW5wdXQoZXZlbnQua2V5Q29kZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5zZXRGb2N1cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIC8vZmluZCB0aGUgd2luZG93IGluIHdpbmRvdy1hcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdGhpcy53aW5kb3dzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCArPSAxO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcblxyXG5mdW5jdGlvbiBFeGFtcGxlQXBwbGljYXRpb24oaWQsIHgsIHkpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgaWQsIHgsIHkpO1xyXG59XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIEV4YW1wbGVBcHBsaWNhdGlvbjtcclxuXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBleGFtcGxlXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJleGFtcGxlLWFwcFwiKTtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEV4YW1wbGVBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIE1lbW9yeUFwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vTWVtb3J5QXBwbGljYXRpb25cIik7XHJcbnZhciBDaGF0QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9DaGF0QXBwbGljYXRpb25cIik7XHJcblxyXG5mdW5jdGlvbiBMYXVuY2hlcihkZXNrdG9wKSB7XHJcbiAgICB0aGlzLmRlc2t0b3AgPSBkZXNrdG9wO1xyXG4gICAgLy90aGlzLnN0YXJ0QXBwbGljYXRpb24oXCJtZW1vcnlcIik7XHJcbn1cclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaVRhZztcclxuICAgIHZhciBhcHBMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5sYXVuY2hlciBsaVwiKTtcclxuICAgIGNvbnNvbGUubG9nKGFwcExpc3QpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcHBMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaVRhZyA9IGFwcExpc3RbaV0ucXVlcnlTZWxlY3RvcihcImlcIik7XHJcbiAgICAgICAgLy9pVGFnLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnN0YXJ0QXBwbGljYXRpb24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgYXBwTGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zdGFydEFwcGxpY2F0aW9uLmJpbmQodGhpcyksIHRydWUpO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zdGFydEFwcGxpY2F0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB2YWx1ZTtcclxuICAgIHZhciBpY29uO1xyXG4gICAgdmFyIHRpdGxlO1xyXG4gICAgdmFyIG5ld0FwcCA9IGZhbHNlO1xyXG4gICAgdmFyIG1hcmdpblggPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WCk7XHJcbiAgICB2YXIgbWFyZ2luWSA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRZKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQpO1xyXG4gICAgdmFyIGVsZW1lbnQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmF0dHJpYnV0ZXNbXCJ2YWx1ZVwiXSkge1xyXG4gICAgICAgIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC50YXJnZXQucGFyZW50Tm9kZS5hdHRyaWJ1dGVzW1widmFsdWVcIl0pIHtcclxuICAgICAgICAvL2lzIHRoZSBpLXRhZyBpbiB0aGUgbGlcclxuICAgICAgICBlbGVtZW50ID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQpIHtcclxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuYXR0cmlidXRlc1tcInZhbHVlXCJdLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcyBoYW5kbGVzIHRoZSBcInJ1bm5pbmctYXBwc1wiLWNsaWNrcy4gc2hvdWxkIGJlIGJyb2tlbiBvdXQhXHJcbiAgICAgICAgICAgIHZhciBzd2l0Y2hUbyA9IHZhbHVlLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgaWYgKHN3aXRjaFRvWzBdID09PSBcImlkXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY2xvc2VcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xvc2VXaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1dpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9lbmQgb2YgcnVubmluZy1hcHBzIGhhbmRsZVxyXG5cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpY29uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaVwiKS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXAtdGl0bGVcIikudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFwcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB4OiBtYXJnaW5YLFxyXG4gICAgICAgIHk6IG1hcmdpblksXHJcbiAgICAgICAgdGFiSW5kZXg6IHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgekluZGV4OiB0aGlzLmRlc2t0b3AuekluZGV4LFxyXG4gICAgICAgIGljb246IGljb24sXHJcbiAgICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICB9O1xyXG5cclxuICAgIHN3aXRjaCAodmFsdWUpIHtcclxuICAgICAgICBjYXNlIFwiZXhhbXBsZVwiOiB7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMubWF4aW1pemFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwibWVtb3J5XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgTWVtb3J5QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcImNoYXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMubWF4aW1pemFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgQ2hhdEFwcGxpY2F0aW9uKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJyZXNldFwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXNldHRpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVza3RvcC5jbGVhckRlc2t0b3AoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXdBcHApIHtcclxuICAgICAgICB2YXIgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBuZXdBcHAuaWQgKyBcIiAud2luZG93LWJ1dHRvbnNcIik7XHJcbiAgICAgICAgYnV0dG9ucy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXNrdG9wLndpbmRvd0J1dHRvbkNsaWNrLmJpbmQodGhpcy5kZXNrdG9wKSk7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLndpbmRvd3MucHVzaChuZXdBcHApO1xyXG4gICAgICAgIHRoaXMuYWRkUnVubmluZ0FwcCh2YWx1ZSwgbmV3QXBwKTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICs9IDE7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggKz0gMTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIgJSAxNSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSArPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKG5ld0FwcC5lbGVtZW50KTtcclxuICAgIH1cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zd2l0Y2hUb1dpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICB2YXIgd2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGlkKTtcclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgICBpZiAod2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcIm1pbmltaXplZFwiKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKHdpbmRvdyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xyXG4gICAgLy9nZXQgdGhlIHRvb2x0aXAtY29udGFpbmVyIGZvciB0aGUgYXBwIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3RcclxuICAgIGNvbnNvbGUubG9nKHR5cGUpO1xyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaVt2YWx1ZT0nXCIgKyB0eXBlICsgXCInXSAudG9vbHRpcC1jb250YWluZXJcIik7XHJcbiAgICBjb25zb2xlLmxvZyhjb250YWluZXIpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10b29sdGlwXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC50aXRsZSArIFwiKFwiICsgYXBwLmlkICsgXCIpXCIpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC1jbG9zZVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF1bmNoZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG52YXIgTWVtb3J5R2FtZSA9IHJlcXVpcmUoXCIuL21lbW9yeS9HYW1lXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5ib2FyZFNpemUgPSBbNCwgNF07XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE1lbW9yeUFwcGxpY2F0aW9uO1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCA0LCA0KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBtZW1vcnlcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XHJcblxyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIHZhciBhbHQxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmV3IEdhbWVcIikpO1xyXG5cclxuICAgIHZhciBhbHQyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDIucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiU2V0dGluZ3NcIikpO1xyXG5cclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0MSk7XHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDIpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB0YXJnZXQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcclxuICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFwibmV3IGdhbWVcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucmVzdGFydCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZSA9IHZhbHVlLnNwbGl0KFwieFwiKTtcclxuICAgIH1cclxuICAgIHZhciB5ID0gdGhpcy5ib2FyZFNpemVbMV07XHJcbiAgICB2YXIgeCA9IHRoaXMuYm9hcmRTaXplWzBdO1xyXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcclxuXHJcbiAgICB0aGlzLmdhbWUucmVtb3ZlRXZlbnRzKCk7XHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgeCwgeSk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXNldHRpbmdzXCIpO1xyXG5cclxuICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuYWRkU2V0dGluZ3ModGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy13cmFwcGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLnJlbW92ZUNoaWxkKHNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tZW1vcnktc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9J2J1dHRvbiddXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiICwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5zYXZlU2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2YWx1ZSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwic2VsZWN0W25hbWU9J2JvYXJkLXNpemUnXVwiKS52YWx1ZTtcclxuICAgIHRoaXMucmVzdGFydCh2YWx1ZSk7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImtleSBpbiBtZW1vcnk6XCIgKyBrZXkpO1xyXG4gICAgaWYgKCF0aGlzLm1hcmtlZENhcmQpIHtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QuYWRkKFwibWFya2VkXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy90b29nbGUgdGhlIG1hcmtlZENhcmQgYmVmb3JlIGNoYW5naW5nIG1hcmtlZENhcmRcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm1hcmtlZENhcmQpO1xyXG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgICAgIGNhc2UgMzk6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5UmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgMzc6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5TGVmdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAzODoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlVcCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSA0MDoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlEb3duKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIDEzOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUudHVybkNhcmQodGhpcy5tYXJrZWRDYXJkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RoaXMubWFya2VkQ2FyZCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vZWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XHJcbiAgICAgICAgLy9zd2l0Y2hcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlSaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIG5leHQgY2FyZFxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL3Jlc3RhcnQgZnJvbSB0b3BcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5TGVmdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIHByZXZpb3VzIGNhcmRcclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZy5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy9yZXN0YXJ0IGZyb20gYm90dG9tIHJpZ2h0XHJcbiAgICAgICAgICAgIHZhciByb3dzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucm93XCIpO1xyXG4gICAgICAgICAgICB2YXIgbGFzdFJvdyA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gbGFzdFJvdy5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlVcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIG5leHQgcm93IGFuZCBjYXJkXHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIHJvd1k7XHJcblxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB2YXIgaWQgPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0yKTtcclxuICAgICAgICByb3dZID0gcGFyc2VJbnQoaWQuY2hhckF0KDApKSAtIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2JlZ2luIGZyb20gYm90dG9tXHJcbiAgICAgICAgdmFyIHJvd3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yb3dcIik7XHJcbiAgICAgICAgcm93ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIHJvd1kgPSByb3dzLmxlbmd0aCAtMTtcclxuICAgIH1cclxuICAgIC8vZmluZCB3aGF0IHgtcG9zaXRpb24gaW4gdGhlIHJvdyB0aGUgbWFya2VkIGNhcmQgaXMgb25cclxuICAgIHZhciBjYXJkWCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTEpO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHJvd1kgKyBjYXJkWCk7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIG5leHQgcm93IGFuZCBjYXJkXHJcbiAgICB2YXIgcm93WTtcclxuXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdmFyIGlkID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMik7XHJcbiAgICAgICAgcm93WSA9IHBhcnNlSW50KGlkLmNoYXJBdCgwKSkgKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcm93WSA9IDA7XHJcbiAgICB9XHJcbiAgICAvL2ZpbmQgd2hhdCB4LXBvc2l0aW9uIGluIHRoZSByb3cgdGhlIG1hcmtlZCBjYXJkIGlzIG9uXHJcbiAgICB2YXIgY2FyZFggPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0xKTtcclxuICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyByb3dZICsgY2FyZFgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERlc2t0b3AgPSByZXF1aXJlKFwiLi9EZXNrdG9wXCIpO1xyXG5cclxudmFyIGQgPSBuZXcgRGVza3RvcCgpO1xyXG5kLmluaXQoKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIENoYXQoZWxlbWVudCwgc2VydmVyLCBjaGFubmVsLCB1c2VybmFtZSkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xyXG4gICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbCB8fCBcIlwiO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmtleSA9IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIjtcclxuICAgIHRoaXMub25saW5lID0gZmFsc2U7XHJcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XHJcbiAgICB0aGlzLnRpbWVTdGFtcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsIG1vbnRoOiBcIm51bWVyaWNcIixcclxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiLCBob3VyOiBcIjItZGlnaXRcIiwgbWludXRlOiBcIjItZGlnaXRcIlxyXG4gICAgfTtcclxufVxyXG5cclxuQ2hhdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJpbml0cyB0aGUgY2hhdFwiKTtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLnJlYWRTdG9yZWRNZXNzYWdlcygpO1xyXG4gICAgdGhpcy5jb25uZWN0VG9TZXJ2ZXIoKTtcclxuICAgIC8vYWRkIGxpc3RlbmVyc1xyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5uZXdNZXNzYWdlRnJvbVNlcnZlci5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5jaGVja0lucHV0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcHJpbnQgdGhlIGNoYXQtdGVtcGxhdGUgdG8gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtYXBwbGljYXRpb25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgLy9wcmludCBpbmZvXHJcbiAgICB2YXIgaW5mbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtaW5mb1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciBjaGFubmVsSW5mbyA9IFwiXCI7XHJcbiAgICBpZiAodGhpcy5jaGFubmVsID09PSBcIlwiKSB7XHJcbiAgICAgICAgIGNoYW5uZWxJbmZvID0gXCJOb24tc3BlY2lmaWVkXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjaGFubmVsSW5mbyA9IHRoaXMuY2hhbm5lbDtcclxuICAgIH1cclxuICAgIHZhciBpbmZvTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiI1wiICsgY2hhbm5lbEluZm8uc2xpY2UoMCwxOCkgKyBcIi9cIiArIHRoaXMudXNlcm5hbWUuc2xpY2UoMCwxMCkpO1xyXG4gICAgaW5mby5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaW5mb1wiKS5hcHBlbmRDaGlsZChpbmZvTm9kZSk7XHJcblxyXG4gICAgdmFyIG1lbnVJbmZvID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pbmZvXCIpO1xyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIGlmIChtZW51SW5mbykge1xyXG4gICAgICAgIG1lbnUucmVwbGFjZUNoaWxkKGluZm8sIG1lbnVJbmZvKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIG1lbnUuYXBwZW5kQ2hpbGQoaW5mbyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jb25uZWN0VG9TZXJ2ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LW9mZmxpbmVcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChcIndzOi8vXCIgKyB0aGlzLnNlcnZlciwgXCJjaGFyY29yZHNcIik7XHJcblxyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgdGhpcy5zZXRPbmxpbmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgdGhpcy5zZXRPZmZsaW5lLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2V0T2ZmbGluZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcbiAgICB0aGlzLm9ubGluZSA9IGZhbHNlO1xyXG4gICAgY29uc29sZS5sb2coXCJvZmZsaW5lXCIpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2V0T25saW5lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3RoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9ubGluZSA9IHRydWVcIik7XHJcbiAgICB0aGlzLm9ubGluZSA9IHRydWU7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb25saW5lXCIpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUubmV3TWVzc2FnZUZyb21TZXJ2ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQuZGF0YSk7XHJcbiAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgIC8vYWRkIHRpbWVzdGFtcCB0byBkYXRhLW9iamVjdFxyXG4gICAgICAgIGRhdGEudGltZXN0YW1wID0gbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoXCJzdi1zZVwiLCB0aGlzLnRpbWVTdGFtcE9wdGlvbnMpO1xyXG4gICAgICAgIGlmICghZGF0YS5jaGFubmVsKSB7XHJcbiAgICAgICAgICAgIGRhdGEuY2hhbm5lbCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmNoYW5uZWwgPT09IHRoaXMuY2hhbm5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlTmV3TWVzc2FnZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5mb3JtU3VibWl0ID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGhpcy5vbmxpbmUpIHtcclxuICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikudmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBtc2cgPSB7XHJcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgICAgICAgICBcImRhdGFcIjogaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBcInVzZXJuYW1lXCI6IHRoaXMudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgICBcImNoYW5uZWxcIjogdGhpcy5jaGFubmVsLFxyXG4gICAgICAgICAgICAgICAgXCJrZXlcIjogdGhpcy5rZXlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5yZXNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wcmludE5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtbWVzc2FnZS1saW5lXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHVzZXJuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUpO1xyXG4gICAgdmFyIG1lc3NhZ2VOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS5kYXRhKTtcclxuICAgIHZhciB0aW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudGltZXN0YW1wKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtdXNlcm5hbWVcIikuYXBwZW5kQ2hpbGQodXNlcm5hbWVOb2RlKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlXCIpLmFwcGVuZENoaWxkKG1lc3NhZ2VOb2RlKTtcclxuICAgIGlmIChkYXRhLnRpbWVzdGFtcCkge1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC10b29sdGlwLXRpbWVcIikuYXBwZW5kQ2hpbGQodGltZU5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0IHVsXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGlzdFwiKTtcclxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2F2ZU5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgbmV3TXNnID0ge1xyXG4gICAgICAgIHVzZXJuYW1lOiBkYXRhLnVzZXJuYW1lLFxyXG4gICAgICAgIGRhdGE6IGRhdGEuZGF0YSxcclxuICAgICAgICB0aW1lc3RhbXA6IGRhdGEudGltZXN0YW1wXHJcbiAgICB9O1xyXG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKG5ld01zZyk7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KHRoaXMubWVzc2FnZXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnJlYWRTdG9yZWRNZXNzYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCkpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBKU09OLnBhcnNlKG1lc3NhZ2VzKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1lc3NhZ2VzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJpbnROZXdNZXNzYWdlKHRoaXMubWVzc2FnZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnRvZ2dsZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImZvY3VzZWQtd2luZG93XCIpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2hlY2tJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5jbGVhckhpc3RvcnkgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCk7XHJcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XHJcblxyXG4gICAgdmFyIGxpc3RFbGVtZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKTtcclxuICAgIHdoaWxlIChsaXN0RWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICBsaXN0RWxlbWVudC5yZW1vdmVDaGlsZChsaXN0RWxlbWVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdDsiLCIvKipcclxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxyXG4gKi9cclxudmFyIE1lbW9yeUJvYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Qm9hcmRcIik7XHJcbnZhciBNZW1vcnlDYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Q2FyZFwiKTtcclxudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XHJcblxyXG5mdW5jdGlvbiBHYW1lKGVsZW1lbnQsIHgsIHkpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnggPSBwYXJzZUludCh4KTtcclxuICAgIHRoaXMueSA9IHBhcnNlSW50KHkpO1xyXG4gICAgdGhpcy5sYXlvdXQgPSBuZXcgTWVtb3J5Qm9hcmQoZWxlbWVudCwgdGhpcy54LCB0aGlzLnkpO1xyXG4gICAgdGhpcy5ib2FyZCA9IFtdO1xyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuICAgIHRoaXMudHVybnMgPSAwO1xyXG4gICAgdGhpcy5jb3JyZWN0Q291bnQgPSAwO1xyXG4gICAgdGhpcy5pbWFnZUxpc3QgPSBbMCwwLDEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsN107XHJcbiAgICB0aGlzLmltYWdlcyA9IHRoaXMuaW1hZ2VMaXN0LnNsaWNlKDAsKHRoaXMueSp0aGlzLngpKTtcclxuICAgIHRoaXMuY2xpY2tGdW5jID0gdGhpcy5jbGljay5iaW5kKHRoaXMpO1xyXG5cclxuICAgIC8vdGhpcy5mb3VuZFBpbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZvdW5kLXBpbGVcIik7XHJcblxyXG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigpO1xyXG4gICAgdGhpcy50aW1lci5zdGFydCgpO1xyXG5cclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuXHJcbiAgICB0aGlzLnNodWZmbGVJbWFnZXMoKTtcclxuICAgIHRoaXMuYWRkRXZlbnRzKCk7XHJcbn1cclxuXHJcbkdhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpID0gMDtcclxuICAgIHRoaXMuYm9hcmQgPSBbXTtcclxuICAgIGlmICh0aGlzLnggPiB0aGlzLnkpIHtcclxuICAgICAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLng7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZvcihpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkodGhpcy54KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbiAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgaiwgdGhpcy5pbWFnZXMucG9wKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkW2ldW2orMV0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIChqICsgMSksIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5zaHVmZmxlSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcDtcclxuICAgIHZhciByYW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRlbXAgPSB0aGlzLmltYWdlc1tpXTtcclxuICAgICAgICByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5pbWFnZXMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLmltYWdlc1tpXSA9IHRoaXMuaW1hZ2VzW3JhbmRdO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzW3JhbmRdID0gdGVtcDtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrRnVuYyk7XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy50dXJuQ2FyZChldmVudC50YXJnZXQpO1xyXG59O1xyXG5cclxuR2FtZS5wcm90b3R5cGUudHVybkNhcmQgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoIDwgMiAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJkaXNhYmxlXCIpKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZFwiKSkge1xyXG4gICAgICAgICAgICB2YXIgeXggPSBlbGVtZW50LmNsYXNzTGlzdFswXS5zcGxpdChcIi1cIilbMV07XHJcbiAgICAgICAgICAgIHZhciB5ID0geXguY2hhckF0KDApO1xyXG4gICAgICAgICAgICB2YXIgeCA9IHl4LmNoYXJBdCgxKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImltZy1cIiArIHRoaXMuYm9hcmRbeV1beF0uaW1nTnIpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbWdcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBjYXJkIHRoYXQgZ290IGNsaWNrZWRcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMuYm9hcmRbeV1beF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5HYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50dXJucyArPSAxO1xyXG4gICAgY29uc29sZS5sb2codGhpcy52aXNpYmxlQ2FyZHMpO1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yID09PSB0aGlzLnZpc2libGVDYXJkc1sxXS5pbWdOcikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1swXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1sxXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG5cclxuICAgICAgICAvL3RoaXMuYWRkVG9QaWxlKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yKTtcclxuICAgICAgICAvL3RoaXMucGxheWVyc1t0aGlzLmFjdGl2ZVBsYXllcl0uY2FyZHMucHVzaCh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XHJcbiAgICAgICAgLy90aGlzLnBsYXllcnNbdGhpcy5hY3RpdmVQbGF5ZXJdLmFkZFRvUGlsZSgpO1xyXG5cclxuICAgICAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvcnJlY3RDb3VudCA9PT0gKHRoaXMueCp0aGlzLnkgLyAyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkrPTEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy50dXJuQmFja0NhcmRzLmJpbmQodGhpcyksIDEwMDApO1xyXG4gICAgICAgIC8vdGhpcy5jaGFuZ2VQbGF5ZXIoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmNoYW5nZVBsYXllciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYodGhpcy5hY3RpdmVQbGF5ZXIgPT09IHRoaXMubnJPZlBsYXllcnMgLSAxKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgKz0gMTtcclxuICAgIH1cclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLnR1cm5CYWNrQ2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0ZW1wQ2FyZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wQ2FyZCA9IHRoaXMudmlzaWJsZUNhcmRzW2ldO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRlbXBDYXJkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGVtcENhcmQuaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJ3cm9uZ1wiLCBcImltZ1wiLCBcImltZy1cIiArIHRlbXBDYXJkLmltZ05yKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxufTtcclxuXHJcbkdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInR1cm5zOlwiICsgdGhpcy50dXJucyk7XHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tZW1vcnktZ2FtZW92ZXJcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10dXJuc1wiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnR1cm5zKSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10aW1lXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudG90YWxUaW1lKSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgT3NrYXIgb24gMjAxNS0xMS0yMy5cclxuICovXHJcblxyXG5mdW5jdGlvbiBNZW1vcnlCb2FyZChlbGVtZW50LCB4LHkpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLnByaW50Q2FyZHMoKTtcclxufVxyXG5cclxuTWVtb3J5Qm9hcmQucHJvdG90eXBlLnByaW50Q2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuICAgIHZhciByb3dEaXY7XHJcbiAgICB2YXIgY2FyZERpdjtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpXHJcbiAgICB7XHJcbiAgICAgICAgcm93RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICByb3dEaXYuY2xhc3NMaXN0LmFkZChcInJvd1wiKTtcclxuXHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMueDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgIGNhcmREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICBjYXJkRGl2LmNsYXNzTGlzdC5hZGQoXCJjYXJkLVwiICsgaSArIGosIFwiY2FyZFwiKTtcclxuICAgICAgICAgICAgLy9jYXJkRGl2LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIDApO1xyXG4gICAgICAgICAgICByb3dEaXYuYXBwZW5kQ2hpbGQoY2FyZERpdik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJvd0Rpdik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlCb2FyZDtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXG4gKi9cblxuZnVuY3Rpb24gTWVtb3J5Q2FyZChpZCwgaW1nTnIpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUNhcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBUaW1lciBjb25zdHJ1Y3RvclxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRpbWVyKCkge1xyXG4gICAgdGhpcy5zdGFydFRpbWUgPSB1bmRlZmluZWQ7XHJcbiAgICAvL3RoaXMuaW50ZXJ2YWwgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0YXJ0cyBhbiBpbnRlcnZhbCBmb3IgdGhlIHRpbWVyXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2FsbCB0aGUgcnVuIGZ1bmN0aW9uIG9uIGVhY2ggaW50ZXJ2YWxcclxuICAgIC8vdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMucnVuLmJpbmQodGhpcyksIDEwMCk7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGVhY2ggaW50ZXJ2YWwgb2YgdGhlIHRpbWVyXHJcbiAqL1xyXG4vKlxyXG5UaW1lci5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAvL2NvdW50IHRoZSBkaWZmZXJlbmNlIGZyb20gc3RhcnQgdG8gbm93XHJcbiAgICB2YXIgZGlmZiA9IChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xyXG59OyovXHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdG9wcyB0aGUgdGltZXIgYmVmb3JlIGl0cyBvdmVyXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9LCB0aGUgZGlmZmVyZW5jZSBpbiBzZWNvbmRzXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIHJldHVybiAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSB0aW1lciBhdCB0aGUgZ2l2ZW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZGlmZntOdW1iZXJ9IHRoZSB0aW1lIHRvIGJlIHByaW50ZWRcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKGRpZmYpIHtcclxuICAgIGlmKHRoaXMuZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpLCB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZikpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcclxuIl19

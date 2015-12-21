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
    this.keyActivated = options.keyActivated || false;
    this.zIndex = options.zIndex;
}

BasicWindow.prototype.destroy = function() {
    document.querySelector("#main-frame").removeChild(this.element);
};

BasicWindow.prototype.print = function() {
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
    var newX = event.clientX - this.clickX;
    var newY = event.clientY - this.clickY;

    console.log(this.activeWindow.element.offsetWidth);
    var newMiddleX = newX + parseInt(this.activeWindow.element.offsetWidth) / 2;
    var newMiddleY = newY + parseInt(this.activeWindow.element.offsetHeight) / 2;

    var windowW = window.innerWidth;
    var windowH = window.innerHeight;

    console.log(newMiddleX + "<" + windowW + "&&" + newMiddleX + "> 0 && " + newMiddleY + "<" + windowH + "&&" + newY + "> 0");

    if (newMiddleX < windowW && newMiddleX > 0 && newMiddleY < windowH && newY > 0) {
        this.activeWindow.x = event.clientX - this.clickX;
        this.activeWindow.y = event.clientY - this.clickY;


        this.activeWindow.element.classList.remove("reset-window");
        this.activeWindow.element.style.left = this.activeWindow.x + "px";
        this.activeWindow.element.style.top = this.activeWindow.y + "px";
    }
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
        if (this.activeWindow.keyActivated) {
            this.activeWindow.keyInput(event.keyCode);
        }
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

ExampleApplication.prototype.keyInput = function(key) {
    console.log(key);
};

module.exports = ExampleApplication;
},{"./BasicWindow":1}],4:[function(require,module,exports){
"use strict";
var ExA = require("./ExampleApplication");
var MemoryApplication = require("./memory/MemoryApplication");
var ChatApplication = require("./chatapp/ChatApplication");
var TetrisApplication = require("./tetris/TetrisApplication");

function Launcher(desktop) {
    this.desktop = desktop;
}

Launcher.prototype.init = function() {
    var iTag;
    var appList = document.querySelectorAll(".launcher li");
    console.log(appList);
    for (var i = 0; i < appList.length; i += 1) {
        iTag = appList[i].querySelector("i");
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
        title: title,
        maximizable: false,
        keyActivated: false
    };

    switch (value) {
        case "example": {
            appOptions.maximizable = true;
            appOptions.keyActivated = true;
            newApp = new ExA(appOptions);
            newApp.print();

            break;
        }
        case "memory":
        {
            appOptions.keyActivated = true;
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
        case "tetris":
        {
            appOptions.keyActivated = true;
            newApp = new TetrisApplication(appOptions);
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
        this.desktop.offsetY += 1;

        this.desktop.setFocus(newApp.element);
        this.checkBounds(newApp);
    }
};

Launcher.prototype.checkBounds = function(app) {
    var windowW = window.innerWidth;
    var windowH = window.innerHeight;

    console.log(app.y + "+" + parseInt(app.element.offsetHeight));
    var appRight = app.x + parseInt(app.element.offsetWidth);
    var appBottom = app.y + parseInt(app.element.offsetHeight);

    console.log(windowW + "," + windowH);

    //check if the app-window is out of bounds and get it into bounds
    if (appRight > windowW || app.x < 0) {
        console.log("out of x bounds. fixing");
        //reset the offset
        this.desktop.offsetX = 1;

        //set new positions
        app.x = 10 * (this.desktop.offsetX);
        app.element.style.left = app.x + "px";
    }
    else if (appBottom > windowH || app.y < 0) {
        //reset the offset
        this.desktop.offsetY = 1;

        //set new positions
        app.y = 10 * (this.desktop.offsetY);
        app.element.style.top = app.y + "px";
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
},{"./ExampleApplication":3,"./chatapp/ChatApplication":7,"./memory/MemoryApplication":8,"./tetris/TetrisApplication":14}],5:[function(require,module,exports){
"use strict";
var Desktop = require("./Desktop");

var d = new Desktop();
d.init();
},{"./Desktop":2}],6:[function(require,module,exports){
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
    this.shifted = false;
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

    //this.element.querySelector(".chat-inputField").addEventListener("keydown", this.checkKey.bind(this));
    //this.element.querySelector(".chat-inputField").addEventListener("keyup", this.checkKey.bind(this));
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
    if (event) {
        event.preventDefault();
    }
    if (this.online) {
        var input = this.element.querySelector(".chat-inputField").value;

        if (input.length > 1) {
            var msg = {
                "type": "message",
                "data": input,
                "username": this.username,
                "channel": this.channel,
                "key": this.key
            };

            this.socket.send(JSON.stringify(msg));
            this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
            this.element.querySelector("form").reset();
        }
    }
};

Chat.prototype.printNewMessage = function(data) {
    var container = this.element.querySelector(".chat-message-list");
    var scrolled = false;
    //check if the user has scrolled up
    if (container.scrollTop !== (container.scrollHeight - container.offsetHeight)) {
        scrolled = true;
    }

    var template = document.querySelector("#template-chat-message-line").content.cloneNode(true);
    var usernameNode = document.createTextNode(data.username + ": ");
    //var messageNode = document.createTextNode(data.data);
    var messageNode = this.parseMessageWithLinks(data.data);

    template.querySelector(".chat-message").appendChild(messageNode);
    if (data.timestamp) {
        template.querySelector(".chat-message-line").setAttribute("title", data.timestamp);
    }

    if (this.username === data.username) {
        template.querySelector("li").classList.add("chat-bubble-me");
    }
    else {
        template.querySelector("li").classList.add("chat-bubble");
        template.querySelector(".chat-username").appendChild(usernameNode);
    }

    this.element.querySelector(".chat-message-list ul").appendChild(template);

    if (!scrolled) {
        //If user was at bottom, auto-scroll down to the new bottom
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

        //add end-of-history separator
        if (this.messages.length > 0) {
            var separator = document.querySelector("#template-chat-history-separator").content.cloneNode(true);
            this.element.querySelector(".chat-message-list ul").appendChild(separator);
            var container = this.element.querySelector(".chat-message-list");
            container.scrollTop = container.scrollHeight;
        }
    }
};

Chat.prototype.toggleFocus = function() {
    this.element.classList.toggle("focused-window");
};

Chat.prototype.checkInput = function(event) {
    var input = event.target.value;
    console.log(input.charCodeAt(input.length  -1));
    if (input.length > 0) {
        this.element.querySelector(".chat-sendButton").removeAttribute("disabled");
    }
    else {
        this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
    }

    //check if the last char was enter
    if (input.charCodeAt(input.length  -1) === 10) {
        this.formSubmit();
    }

    if (input.charCodeAt(0) === 10) {
        //first char is enter, reset form and disable send-button
        this.element.querySelector("form").reset();
        this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
    }
};

Chat.prototype.parseMessageWithLinks = function(text) {
    var frag = document.createDocumentFragment();
    var link;
    var aTag;
    var linkNode;
    var textNode;
    var words = text.split(" ");

    for (var i = 0; i < words.length; i++) {
        if (words[i].slice(0, 7) === "http://") {
            link = words[i].slice(7);
        }
        else if(words[i].slice(0, 8) === "https://") {
            link = words[i].slice(7);
        }

        if (link) {
            aTag = document.createElement("a");
            aTag.setAttribute("href", "//" + link);
            aTag.setAttribute("target", "_blank");
            linkNode = document.createTextNode(link);

            aTag.appendChild(linkNode);
            textNode = document.createTextNode(" ");

            frag.appendChild(aTag);
            frag.appendChild(textNode);

            link = undefined;
        }
        else {
            textNode = document.createTextNode(words[i] + " ");
            frag.appendChild(textNode);
        }
    }

    return frag;
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
},{}],7:[function(require,module,exports){
"use strict";
var BasicWindow = require("../BasicWindow");
var Chat = require("./Chat");

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
},{"../BasicWindow":1,"./Chat":6}],8:[function(require,module,exports){
"use strict";
var BasicWindow = require("../BasicWindow");
var MemoryGame = require("./MemoryGame");

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
},{"../BasicWindow":1,"./MemoryGame":11}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/**
 * Created by Oskar on 2015-11-23.
 */

function MemoryCard(id, imgNr) {
    this.id = id;
    this.imgNr = imgNr;
}

module.exports = MemoryCard;

},{}],11:[function(require,module,exports){
/**
 * Created by Oskar on 2015-11-23.
 */
var MemoryBoard = require("./MemoryBoard");
var MemoryCard = require("./MemoryCard");
var Timer = require("./Timer");

function MemoryGame(element, x, y) {
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

MemoryGame.prototype.init = function() {
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

MemoryGame.prototype.shuffleImages = function() {
    var temp;
    var rand;
    for (var i = 0; i < this.images.length; i += 1) {
        temp = this.images[i];
        rand = Math.floor(Math.random() * this.images.length);
        this.images[i] = this.images[rand];
        this.images[rand] = temp;
    }
};

MemoryGame.prototype.addEvents = function() {
    this.element.addEventListener("click", this.clickFunc);
};

MemoryGame.prototype.removeEvents = function() {
    this.element.removeEventListener("click", this.clickFunc);
};

MemoryGame.prototype.click = function(event) {
    this.turnCard(event.target);
};

MemoryGame.prototype.turnCard = function(element) {
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

MemoryGame.prototype.checkIfCorrect = function() {
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

MemoryGame.prototype.changePlayer = function() {
    if(this.activePlayer === this.nrOfPlayers - 1) {
        this.activePlayer = 0;
    }
    else {
        this.activePlayer += 1;
    }
};

MemoryGame.prototype.turnBackCards = function() {
    var tempCard;
    for (var i = 0; i < this.visibleCards.length; i += 1) {
        tempCard = this.visibleCards[i];
        console.log(tempCard);
        this.element.querySelector(".card-" + tempCard.id).classList.remove("wrong", "img", "img-" + tempCard.imgNr);
    }

    //reset the array
    this.visibleCards = [];
};

MemoryGame.prototype.gameOver = function() {
    console.log("turns:" + this.turns);
    this.totalTime = this.timer.stop();
    var template = document.querySelector("#template-memory-gameover").content.cloneNode(true);
    template.querySelector(".memory-turns").appendChild(document.createTextNode(this.turns));
    template.querySelector(".memory-time").appendChild(document.createTextNode(this.totalTime));

    this.element.appendChild(template);
};

module.exports = MemoryGame;

},{"./MemoryBoard":9,"./MemoryCard":10,"./Timer":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
"use strict";

function BlockShape(shapes) {
    //this.shapes = shapes;
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
        row: 0,
        col: 4
    };
}

module.exports = BlockShape;
},{}],14:[function(require,module,exports){
"use strict";
var BasicWindow = require("../BasicWindow");
var TetrisGame = require("./TetrisGame");

function TetrisApplication(options) {
    BasicWindow.call(this, options);

    this.game = undefined;
}

TetrisApplication.prototype = Object.create(BasicWindow.prototype);
TetrisApplication.prototype.constructor =  TetrisApplication;

TetrisApplication.prototype.init = function() {
    this.print();

    this.game = new TetrisGame(this.element);
    this.game.init();
};

TetrisApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing Tetris");
    this.element.classList.add("tetris-app");
    this.element.querySelector("i").classList.add("tetris-icon");

};

TetrisApplication.prototype.keyInput = function(key) {
    console.log(key);
    if (key === 37) {
        //left
        this.game.moveFallingBlock(-1);
    }
    else if (key === 39) {
        //right
        this.game.moveFallingBlock(1);
    }
    else if (key === 38) {
        //up
        this.game.rotateFallingBlock(1);
    }
    else if (key === 40) {
        //down
        this.game.fallBlock();
    }
};

TetrisApplication.prototype.destroy = function() {
    if (this.game.fallingBlockInterval) {
        window.clearInterval(this.game.fallingBlockInterval);
    }
    document.querySelector("#main-frame").removeChild(this.element);
};

module.exports = TetrisApplication;
},{"../BasicWindow":1,"./TetrisGame":15}],15:[function(require,module,exports){
"use strict";
var BlockShape = require("./BlockShape");
/**
 * To create this module I have read the following guide:
 * http://gamedevelopment.tutsplus.com/tutorials/implementing-tetris-collision-detection--gamedev-852
 */

function TetrisGame(element) {
    this.element = element;
    this.Jblock = new BlockShape();
    this.fallingBlock = this.Jblock;
    this.field = [];

    this.fallingBlockInterval = undefined;
}

TetrisGame.prototype.init = function() {
    this.initField();

    this.print();
    this.render();
    this.fallingBlockInterval = window.setInterval(this.fallBlock.bind(this), 500);
};

TetrisGame.prototype.fallBlock = function() {
    console.log("fall one row");
    if (this.isFallable()) {
        this.fallingBlock.topLeft.row += 1;
    }
    else {
        window.clearInterval(this.fallingBlockInterval);
        this.landFallingBlock();
        this.dropNewBlock();
    }

    this.render();
};

TetrisGame.prototype.dropNewBlock = function() {
    this.Jblock = new BlockShape();
    this.fallingBlock = this.Jblock;
    this.fallingBlockInterval = window.setInterval(this.fallBlock.bind(this), 500);

    if (this.isCollision()) {
        console.log("Game over");
    }
};

TetrisGame.prototype.landFallingBlock = function() {
    this.clearFallingBlock();
    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] = shape[row][col];
            }
        }
    }

    console.log(this.field);
};

TetrisGame.prototype.render = function() {
    this.clearFallingBlock();

    // Change the classes to render the blocks to user
    var trs = this.element.querySelectorAll("tr");
    var tds;
    for (var row = 0; row < this.field.length; row += 1) {
        tds = trs[row].querySelectorAll("td");
        for (var col = 0; col < this.field[row].length; col += 1) {
            if (this.field[row][col] === 1) {
                //should render class for block here
                tds[col].classList.add("tetris-block-part");
            }
        }
    }

    this.renderFallingBlock();
};

TetrisGame.prototype.renderFallingBlock = function() {
    var row;
    var col;

    //get the nodes
    var trs = this.element.querySelectorAll("tr");
    var tds = [];
    for (row = 0; row < this.field.length; row += 1) {
        tds.push(trs[row].querySelectorAll("td"));
    }

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];
    for (row = 0; row < shape.length; row += 1) {
        for (col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                //draw block at position corresponding to the shapes position
                var y = row + this.fallingBlock.topLeft.row;
                var x = col + this.fallingBlock.topLeft.col;
                tds[y][x].classList.add("tetris-falling-block-part");
            }
        }
    }
};

TetrisGame.prototype.isCollision = function() {
    var collision = false;

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                if (row + this.fallingBlock.topLeft.row >= this.field.length) {
                    //this block would be below the playing field
                    collision = true;
                }
                //console.log(this.field[row + potentialTopLeft.row][col + potentialTopLeft.col]);
                else if (this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] !== 0) {
                    //the space is taken
                    collision = true;
                }
            }
        }
    }

    return collision;
};

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
                if (row + potentialTopLeft.row >= this.field.length) {
                    //this block would be below the playing field
                    console.log("out of bounds");
                    fallable = false;
                }
                //console.log(this.field[row + potentialTopLeft.row][col + potentialTopLeft.col]);
                else if (this.field[row + potentialTopLeft.row][col + potentialTopLeft.col] !== 0) {
                    //the space is taken
                    console.log("collision");
                    fallable = false;
                }
            }
        }
    }

    return fallable;
};

TetrisGame.prototype.moveFallingBlock = function(dir) {
    if (this.isMovable(dir)) {
        this.fallingBlock.topLeft.col += dir;
    }

    this.render();
};

TetrisGame.prototype.isMovable = function(dir) {
    var movable = true;
    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];
    var potentialTopLeft = {
            row: this.fallingBlock.topLeft.row,
            col: this.fallingBlock.topLeft.col + dir
        };

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                if (col + potentialTopLeft.col < 0) {
                    //this block would be to the left of the playing field
                    movable = false;
                }
                if (col + potentialTopLeft.col >= this.field[0].length) {
                    //this block would be to the right of the playing field
                    movable = false;
                }
                if (this.field[row + potentialTopLeft.row][col + potentialTopLeft.col] !== 0) {
                    //the space is taken
                    movable = false;
                }
            }
        }
    }

    return movable;
};

TetrisGame.prototype.rotateFallingBlock = function(dir) {
    var newRotation = this.fallingBlock.rotation + dir;
    if (newRotation > 3) {
        newRotation = 0;
    }
    else if (newRotation < 0) {
        newRotation = 3;
    }

    this.fallingBlock.rotation = newRotation;

    this.render();
};

TetrisGame.prototype.clearFallingBlock = function() {
    //clear from last falling-block
    var trs = this.element.querySelectorAll("tr");
    var tds;
    for (var row = 0; row < this.field.length; row += 1) {
        tds = trs[row].querySelectorAll("td");
        for (var col = 0; col < this.field[row].length; col += 1) {
                tds[col].classList.remove("tetris-falling-block-part");
            }
        }
};

TetrisGame.prototype.print = function() {
    //print the chat-template to this.element
    var template = document.querySelector("#template-tetris-application").content.cloneNode(true);

    var frag = document.createDocumentFragment();
    var tr;
    var td;

    for (var row = 0; row < this.field.length; row += 1) {
        tr = document.createElement("tr");
        //tr.setAttribute("id", "row-" + row);
        for (var col = 0; col < this.field[row].length; col += 1) {
            td = document.createElement("td");
            //td.setAttribute("id", "col-" + col);
            tr.appendChild(td);
        }
        frag.appendChild(tr);
    }

    template.querySelector(".tetris-grid-body").appendChild(frag);

    this.element.querySelector(".window-content").appendChild(template);
};

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
        [0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
};

module.exports = TetrisGame;
},{"./BlockShape":13}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5R2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RldHJpc0FwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVGV0cmlzR2FtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmFzaWNXaW5kb3cob3B0aW9ucykge1xyXG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgXCJcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy54ID0gb3B0aW9ucy54IHx8IDEwO1xyXG4gICAgdGhpcy55ID0gb3B0aW9ucy55IHx8IDEwO1xyXG4gICAgdGhpcy50YWJJbmRleCA9IG9wdGlvbnMudGFiSW5kZXggfHwgMDtcclxuICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8IHRoaXMuaWQ7XHJcbiAgICB0aGlzLmljb24gPSBvcHRpb25zLmljb24gfHwgXCJidWdfcmVwb3J0XCI7XHJcbiAgICB0aGlzLm1heGltaXphYmxlID0gb3B0aW9ucy5tYXhpbWl6YWJsZSB8fCBmYWxzZTtcclxuICAgIHRoaXMua2V5QWN0aXZhdGVkID0gb3B0aW9ucy5rZXlBY3RpdmF0ZWQgfHwgZmFsc2U7XHJcbiAgICB0aGlzLnpJbmRleCA9IG9wdGlvbnMuekluZGV4O1xyXG59XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmdcIik7XHJcbiAgICB2YXIgdGVtcGxhdGUgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3dcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB2YXIgdGVtcGxhdGVXaW5kb3cgPSB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiZGl2XCIpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwiaWRcIiwgdGhpcy5pZCk7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUuekluZGV4ID0gdGhpcy56SW5kZXg7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCB0aGlzLnRhYkluZGV4KTtcclxuXHJcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKTtcclxuICAgIHZhciBsYXVuY2hlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGF1bmNoZXJcIik7XHJcbiAgICBlbGVtZW50Lmluc2VydEJlZm9yZSh0ZW1wbGF0ZSwgbGF1bmNoZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LXRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGl0bGUpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuaWNvbikpO1xyXG5cclxuICAgIC8vYWRkIG1heGltaXplLWJ1dHRvblxyXG4gICAgaWYgKHRoaXMubWF4aW1pemFibGUpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tYXhpbWl6ZS1idXR0b25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdmFyIHdpbmRvd0J1dHRvbnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICB2YXIgcmVtb3ZlQnV0dG9uID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWluaW1pemUtYnV0dG9uXCIpO1xyXG4gICAgICAgIHdpbmRvd0J1dHRvbnMuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgcmVtb3ZlQnV0dG9uKTtcclxuICAgIH1cclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtaW5pbWl6ZWRcIik7XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWF4aW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwibWF4aW1pemVkXCIpO1xyXG5cclxuICAgIHZhciBpY29uID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWF4aW1pemUtaWNvbiBpXCIpO1xyXG4gICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWF4aW1pemVkXCIpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJyZXNldC13aW5kb3dcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgICAgICBpY29uLnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcImNyb3BfZGluXCIpLCBpY29uLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBcIk1heGltaXplXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJyZXNldC13aW5kb3dcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCA9IFwiMHB4XCI7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBweFwiO1xyXG4gICAgICAgIGljb24ucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiZmlsdGVyX25vbmVcIiksIGljb24uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWF4aW1pemUtYnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIFwiUmVzaXplXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmNsZWFyQ29udGVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKTtcclxuICAgIHdoaWxlIChjb250ZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAgIGNvbnRlbnQucmVtb3ZlQ2hpbGQoY29udGVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNXaW5kb3c7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vL3ZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcbnZhciBMYXVuY2hlciA9IHJlcXVpcmUoXCIuL0xhdW5jaGVyXCIpO1xyXG5cclxuZnVuY3Rpb24gRGVza3RvcCgpIHtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdXNlTW92ZUZ1bmMgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5tb3VzZVVwRnVuYyA9IHRoaXMubW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLmNsaWNrWCA9IDA7XHJcbiAgICB0aGlzLmNsaWNrWSA9IDA7XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLnpJbmRleCA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAxO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMTtcclxuICAgIHRoaXMubGF1bmNoZXIgPSBuZXcgTGF1bmNoZXIodGhpcyk7XHJcbn1cclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubGF1bmNoZXIuaW5pdCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlbW92aW5nIG1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibW92aW5nXCIpO1xyXG4gICAgLy90aGlzLmFjdGl2ZVdpbmRvdyA9IHVuZGVmaW5lZDtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlRG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIC8vZ2V0IHRoZSBjbGlja2VkLXdpbmRvd3MgXCJtYWluLWRpdlwiXHJcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdCkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1haW4tZnJhbWVcIikpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93XCIpKSB7XHJcbiAgICAgICAgLy9jbGlja2VkIERPTSBpcyBhIHdpbmRvdyAtIGRvIHN0dWZmXHJcbiAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuc3R5bGUuekluZGV4KSAhPT0gdGhpcy56SW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRGb2N1cyhlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIHRoZSBsaXN0ZW5lcnMgdG8gY2hlY2sgZm9yIG1vdmVtZW50IGlmIGNsaWNrIHdlcmUgaW4gdGhlIHdpbmRvdy10b3Agb2Ygd2luZG93XHJcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3ctdG9wXCIpKSB7XHJcbiAgICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWF4aW1pemVkXCIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmFjdGl2ZVdpbmRvdy54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5hY3RpdmVXaW5kb3cueTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1vdmluZ1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImFkZGluZyBtb3VzZW1vdmUtbGlzdGVuZXJcIik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInRyeWluZyB0byBtb3ZlIHdpbmRvd1wiKTtcclxuICAgIHZhciBuZXdYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdmFyIG5ld1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG4gICAgY29uc29sZS5sb2codGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICB2YXIgbmV3TWlkZGxlWCA9IG5ld1ggKyBwYXJzZUludCh0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50Lm9mZnNldFdpZHRoKSAvIDI7XHJcbiAgICB2YXIgbmV3TWlkZGxlWSA9IG5ld1kgKyBwYXJzZUludCh0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50Lm9mZnNldEhlaWdodCkgLyAyO1xyXG5cclxuICAgIHZhciB3aW5kb3dXID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB2YXIgd2luZG93SCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhuZXdNaWRkbGVYICsgXCI8XCIgKyB3aW5kb3dXICsgXCImJlwiICsgbmV3TWlkZGxlWCArIFwiPiAwICYmIFwiICsgbmV3TWlkZGxlWSArIFwiPFwiICsgd2luZG93SCArIFwiJiZcIiArIG5ld1kgKyBcIj4gMFwiKTtcclxuXHJcbiAgICBpZiAobmV3TWlkZGxlWCA8IHdpbmRvd1cgJiYgbmV3TWlkZGxlWCA+IDAgJiYgbmV3TWlkZGxlWSA8IHdpbmRvd0ggJiYgbmV3WSA+IDApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LnkgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJyZXNldC13aW5kb3dcIik7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5hY3RpdmVXaW5kb3cueCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMuYWN0aXZlV2luZG93LnkgKyBcInB4XCI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS53aW5kb3dCdXR0b25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQgd2luZG93LWJ1dHRvblwiKTtcclxuICAgIHZhciBhY3Rpb24gPSBldmVudC50YXJnZXQuY2xhc3NMaXN0O1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG5cclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB3aGF0IHdpbmRvdyBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgdGhpcy5zZXRGb2N1cyh0aGlzLndpbmRvd3NbaW5kZXhdLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAoYWN0aW9uLmNvbnRhaW5zKFwiZXhpdC1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZVdpbmRvdyh0aGlzLndpbmRvd3NbaW5kZXhdLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWluaW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWluaW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1pbmltaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1heGltaXplLWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL21heGltaXplIHRoZSBhcHBcclxuICAgICAgICAgICAgaWYgKHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemFibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWF4aW1pemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmNsb3NlV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciByZW1vdmVkID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGggJiYgIXJlbW92ZWQ7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgICAgICB2YXIgY2xpY2tlZFRvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gd2luZG93LWxpc3RcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRGVza3RvcC5wcm90b3R5cGUuY2xlYXJEZXNrdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh3aW5kb3dUb29sdGlwLnBhcmVudE5vZGUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAxO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMTtcclxuICAgIHRoaXMuekluZGV4ID0gMDtcclxufTtcclxuXHJcbkRlc2t0b3AucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuaWQgPT09IHRoaXMuYWN0aXZlV2luZG93LmlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlV2luZG93LmtleUFjdGl2YXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5rZXlJbnB1dChldmVudC5rZXlDb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5EZXNrdG9wLnByb3RvdHlwZS5zZXRGb2N1cyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIC8vZmluZCB0aGUgd2luZG93IGluIHdpbmRvdy1hcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdGhpcy53aW5kb3dzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCArPSAxO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcDsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcblxyXG5mdW5jdGlvbiBFeGFtcGxlQXBwbGljYXRpb24oaWQsIHgsIHkpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgaWQsIHgsIHkpO1xyXG59XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIEV4YW1wbGVBcHBsaWNhdGlvbjtcclxuXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcmludGluZyBleGFtcGxlXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJleGFtcGxlLWFwcFwiKTtcclxuXHJcbn07XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBjb25zb2xlLmxvZyhrZXkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBFeEEgPSByZXF1aXJlKFwiLi9FeGFtcGxlQXBwbGljYXRpb25cIik7XHJcbnZhciBNZW1vcnlBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL21lbW9yeS9NZW1vcnlBcHBsaWNhdGlvblwiKTtcclxudmFyIENoYXRBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL2NoYXRhcHAvQ2hhdEFwcGxpY2F0aW9uXCIpO1xyXG52YXIgVGV0cmlzQXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi90ZXRyaXMvVGV0cmlzQXBwbGljYXRpb25cIik7XHJcblxyXG5mdW5jdGlvbiBMYXVuY2hlcihkZXNrdG9wKSB7XHJcbiAgICB0aGlzLmRlc2t0b3AgPSBkZXNrdG9wO1xyXG59XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlUYWc7XHJcbiAgICB2YXIgYXBwTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubGF1bmNoZXIgbGlcIik7XHJcbiAgICBjb25zb2xlLmxvZyhhcHBMaXN0KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlUYWcgPSBhcHBMaXN0W2ldLnF1ZXJ5U2VsZWN0b3IoXCJpXCIpO1xyXG4gICAgICAgIGFwcExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc3RhcnRBcHBsaWNhdGlvbi5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuc3RhcnRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdmFsdWU7XHJcbiAgICB2YXIgaWNvbjtcclxuICAgIHZhciB0aXRsZTtcclxuICAgIHZhciBuZXdBcHAgPSBmYWxzZTtcclxuICAgIHZhciBtYXJnaW5YID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFgpO1xyXG4gICAgdmFyIG1hcmdpblkgPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcclxuICAgIHZhciBlbGVtZW50O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC5hdHRyaWJ1dGVzW1widmFsdWVcIl0pIHtcclxuICAgICAgICBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuYXR0cmlidXRlc1tcInZhbHVlXCJdKSB7XHJcbiAgICAgICAgLy9pcyB0aGUgaS10YWcgaW4gdGhlIGxpXHJcbiAgICAgICAgZWxlbWVudCA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50KSB7XHJcbiAgICAgICAgdmFsdWUgPSBlbGVtZW50LmF0dHJpYnV0ZXNbXCJ2YWx1ZVwiXS52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMgaGFuZGxlcyB0aGUgXCJydW5uaW5nLWFwcHNcIi1jbGlja3MuIHNob3VsZCBiZSBicm9rZW4gb3V0IVxyXG4gICAgICAgICAgICB2YXIgc3dpdGNoVG8gPSB2YWx1ZS5zcGxpdChcIjpcIik7XHJcbiAgICAgICAgICAgIGlmIChzd2l0Y2hUb1swXSA9PT0gXCJpZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNsb3NlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNrdG9wLmNsb3NlV2luZG93KHN3aXRjaFRvWzFdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVG9XaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZW5kIG9mIHJ1bm5pbmctYXBwcyBoYW5kbGVcclxuXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWNvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcImlcIikudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLXRpdGxlXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBhcHBPcHRpb25zID0ge1xyXG4gICAgICAgIGlkOiBcIndpbi1cIiArIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgeDogbWFyZ2luWCxcclxuICAgICAgICB5OiBtYXJnaW5ZLFxyXG4gICAgICAgIHRhYkluZGV4OiB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyLFxyXG4gICAgICAgIHpJbmRleDogdGhpcy5kZXNrdG9wLnpJbmRleCxcclxuICAgICAgICBpY29uOiBpY29uLFxyXG4gICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICBtYXhpbWl6YWJsZTogZmFsc2UsXHJcbiAgICAgICAga2V5QWN0aXZhdGVkOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICBzd2l0Y2ggKHZhbHVlKSB7XHJcbiAgICAgICAgY2FzZSBcImV4YW1wbGVcIjoge1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwibWVtb3J5XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLmtleUFjdGl2YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiY2hhdFwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBDaGF0QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInRldHJpc1wiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgVGV0cmlzQXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInJlc2V0XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc2V0dGluZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy5kZXNrdG9wLmNsZWFyRGVza3RvcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld0FwcCkge1xyXG4gICAgICAgIHZhciBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0FwcC5pZCArIFwiIC53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICBidXR0b25zLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlc2t0b3Aud2luZG93QnV0dG9uQ2xpY2suYmluZCh0aGlzLmRlc2t0b3ApKTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Aud2luZG93cy5wdXNoKG5ld0FwcCk7XHJcbiAgICAgICAgdGhpcy5hZGRSdW5uaW5nQXBwKHZhbHVlLCBuZXdBcHApO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIgKz0gMTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WCArPSAxO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRZICs9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXRGb2N1cyhuZXdBcHAuZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5jaGVja0JvdW5kcyhuZXdBcHApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTGF1bmNoZXIucHJvdG90eXBlLmNoZWNrQm91bmRzID0gZnVuY3Rpb24oYXBwKSB7XHJcbiAgICB2YXIgd2luZG93VyA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIHdpbmRvd0ggPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgY29uc29sZS5sb2coYXBwLnkgKyBcIitcIiArIHBhcnNlSW50KGFwcC5lbGVtZW50Lm9mZnNldEhlaWdodCkpO1xyXG4gICAgdmFyIGFwcFJpZ2h0ID0gYXBwLnggKyBwYXJzZUludChhcHAuZWxlbWVudC5vZmZzZXRXaWR0aCk7XHJcbiAgICB2YXIgYXBwQm90dG9tID0gYXBwLnkgKyBwYXJzZUludChhcHAuZWxlbWVudC5vZmZzZXRIZWlnaHQpO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHdpbmRvd1cgKyBcIixcIiArIHdpbmRvd0gpO1xyXG5cclxuICAgIC8vY2hlY2sgaWYgdGhlIGFwcC13aW5kb3cgaXMgb3V0IG9mIGJvdW5kcyBhbmQgZ2V0IGl0IGludG8gYm91bmRzXHJcbiAgICBpZiAoYXBwUmlnaHQgPiB3aW5kb3dXIHx8IGFwcC54IDwgMCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwib3V0IG9mIHggYm91bmRzLiBmaXhpbmdcIik7XHJcbiAgICAgICAgLy9yZXNldCB0aGUgb2Zmc2V0XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggPSAxO1xyXG5cclxuICAgICAgICAvL3NldCBuZXcgcG9zaXRpb25zXHJcbiAgICAgICAgYXBwLnggPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WCk7XHJcbiAgICAgICAgYXBwLmVsZW1lbnQuc3R5bGUubGVmdCA9IGFwcC54ICsgXCJweFwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXBwQm90dG9tID4gd2luZG93SCB8fCBhcHAueSA8IDApIHtcclxuICAgICAgICAvL3Jlc2V0IHRoZSBvZmZzZXRcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSA9IDE7XHJcblxyXG4gICAgICAgIC8vc2V0IG5ldyBwb3NpdGlvbnNcclxuICAgICAgICBhcHAueSA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRZKTtcclxuICAgICAgICBhcHAuZWxlbWVudC5zdHlsZS50b3AgPSBhcHAueSArIFwicHhcIjtcclxuICAgIH1cclxufTtcclxuXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zd2l0Y2hUb1dpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICB2YXIgd2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGlkKTtcclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgICBpZiAod2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcIm1pbmltaXplZFwiKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKHdpbmRvdyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xyXG4gICAgLy9nZXQgdGhlIHRvb2x0aXAtY29udGFpbmVyIGZvciB0aGUgYXBwIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3RcclxuICAgIGNvbnNvbGUubG9nKHR5cGUpO1xyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaVt2YWx1ZT0nXCIgKyB0eXBlICsgXCInXSAudG9vbHRpcC1jb250YWluZXJcIik7XHJcbiAgICBjb25zb2xlLmxvZyhjb250YWluZXIpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10b29sdGlwXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC50aXRsZSArIFwiKFwiICsgYXBwLmlkICsgXCIpXCIpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC1jbG9zZVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF1bmNoZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEZXNrdG9wID0gcmVxdWlyZShcIi4vRGVza3RvcFwiKTtcclxuXHJcbnZhciBkID0gbmV3IERlc2t0b3AoKTtcclxuZC5pbml0KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBDaGF0KGVsZW1lbnQsIHNlcnZlciwgY2hhbm5lbCwgdXNlcm5hbWUpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcclxuICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWwgfHwgXCJcIjtcclxuICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcclxuICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5rZXkgPSBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCI7XHJcbiAgICB0aGlzLm9ubGluZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xyXG4gICAgdGhpcy50aW1lU3RhbXBPcHRpb25zID0ge1xyXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLCBtb250aDogXCJudW1lcmljXCIsXHJcbiAgICAgICAgZGF5OiBcIm51bWVyaWNcIiwgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCJcclxuICAgIH07XHJcbiAgICB0aGlzLnNoaWZ0ZWQgPSBmYWxzZTtcclxufVxyXG5cclxuQ2hhdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJpbml0cyB0aGUgY2hhdFwiKTtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLnJlYWRTdG9yZWRNZXNzYWdlcygpO1xyXG4gICAgdGhpcy5jb25uZWN0VG9TZXJ2ZXIoKTtcclxuICAgIC8vYWRkIGxpc3RlbmVyc1xyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5uZXdNZXNzYWdlRnJvbVNlcnZlci5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5jaGVja0lucHV0LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuY2hlY2tLZXkuYmluZCh0aGlzKSk7XHJcbiAgICAvL3RoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgdGhpcy5jaGVja0tleS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3ByaW50IHRoZSBjaGF0LXRlbXBsYXRlIHRvIHRoaXMuZWxlbWVudFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LWFwcGxpY2F0aW9uXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxuICAgIC8vcHJpbnQgaW5mb1xyXG4gICAgdmFyIGluZm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWluZm9cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB2YXIgY2hhbm5lbEluZm8gPSBcIlwiO1xyXG4gICAgaWYgKHRoaXMuY2hhbm5lbCA9PT0gXCJcIikge1xyXG4gICAgICAgICBjaGFubmVsSW5mbyA9IFwiTm9uLXNwZWNpZmllZFwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEluZm8gPSB0aGlzLmNoYW5uZWw7XHJcbiAgICB9XHJcbiAgICB2YXIgaW5mb05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiNcIiArIGNoYW5uZWxJbmZvLnNsaWNlKDAsMTgpICsgXCIvXCIgKyB0aGlzLnVzZXJuYW1lLnNsaWNlKDAsMTApKTtcclxuICAgIGluZm8ucXVlcnlTZWxlY3RvcihcIi5tZW51LWluZm9cIikuYXBwZW5kQ2hpbGQoaW5mb05vZGUpO1xyXG5cclxuICAgIHZhciBtZW51SW5mbyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaW5mb1wiKTtcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICBpZiAobWVudUluZm8pIHtcclxuICAgICAgICBtZW51LnJlcGxhY2VDaGlsZChpbmZvLCBtZW51SW5mbyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBtZW51LmFwcGVuZENoaWxkKGluZm8pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdFRvU2VydmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL1wiICsgdGhpcy5zZXJ2ZXIsIFwiY2hhcmNvcmRzXCIpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIHRoaXMuc2V0T25saW5lLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIHRoaXMuc2V0T2ZmbGluZS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNldE9mZmxpbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWNvbm5lY3RpbmdcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5vbmxpbmUgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKFwib2ZmbGluZVwiKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB1c2VybmFtZTogXCJHbGFEb3NcIixcclxuICAgICAgICBkYXRhOiBcIkNvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlci4uLiBZb3UgY2FuIHN0aWxsIHJlYWQgeW91ciBjaGF0IGhpc3RvcnlcIlxyXG4gICAgfTtcclxuICAgIHRoaXMucHJpbnROZXdNZXNzYWdlKGRhdGEpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2V0T25saW5lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3RoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9ubGluZSA9IHRydWVcIik7XHJcbiAgICB0aGlzLm9ubGluZSA9IHRydWU7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb25saW5lXCIpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUubmV3TWVzc2FnZUZyb21TZXJ2ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQuZGF0YSk7XHJcbiAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgIC8vYWRkIHRpbWVzdGFtcCB0byBkYXRhLW9iamVjdFxyXG4gICAgICAgIGRhdGEudGltZXN0YW1wID0gbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoXCJzdi1zZVwiLCB0aGlzLnRpbWVTdGFtcE9wdGlvbnMpO1xyXG4gICAgICAgIGlmICghZGF0YS5jaGFubmVsKSB7XHJcbiAgICAgICAgICAgIGRhdGEuY2hhbm5lbCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmNoYW5uZWwgPT09IHRoaXMuY2hhbm5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlTmV3TWVzc2FnZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5mb3JtU3VibWl0ID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGlmIChldmVudCkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5vbmxpbmUpIHtcclxuICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikudmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHZhciBtc2cgPSB7XHJcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJtZXNzYWdlXCIsXHJcbiAgICAgICAgICAgICAgICBcImRhdGFcIjogaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBcInVzZXJuYW1lXCI6IHRoaXMudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgICBcImNoYW5uZWxcIjogdGhpcy5jaGFubmVsLFxyXG4gICAgICAgICAgICAgICAgXCJrZXlcIjogdGhpcy5rZXlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wcmludE5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICB2YXIgc2Nyb2xsZWQgPSBmYWxzZTtcclxuICAgIC8vY2hlY2sgaWYgdGhlIHVzZXIgaGFzIHNjcm9sbGVkIHVwXHJcbiAgICBpZiAoY29udGFpbmVyLnNjcm9sbFRvcCAhPT0gKGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIub2Zmc2V0SGVpZ2h0KSkge1xyXG4gICAgICAgIHNjcm9sbGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtbWVzc2FnZS1saW5lXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHVzZXJuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUgKyBcIjogXCIpO1xyXG4gICAgLy92YXIgbWVzc2FnZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLmRhdGEpO1xyXG4gICAgdmFyIG1lc3NhZ2VOb2RlID0gdGhpcy5wYXJzZU1lc3NhZ2VXaXRoTGlua3MoZGF0YS5kYXRhKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZVwiKS5hcHBlbmRDaGlsZChtZXNzYWdlTm9kZSk7XHJcbiAgICBpZiAoZGF0YS50aW1lc3RhbXApIHtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saW5lXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIGRhdGEudGltZXN0YW1wKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy51c2VybmFtZSA9PT0gZGF0YS51c2VybmFtZSkge1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJsaVwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1idWJibGUtbWVcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlXCIpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC11c2VybmFtZVwiKS5hcHBlbmRDaGlsZCh1c2VybmFtZU5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0IHVsXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuXHJcbiAgICBpZiAoIXNjcm9sbGVkKSB7XHJcbiAgICAgICAgLy9JZiB1c2VyIHdhcyBhdCBib3R0b20sIGF1dG8tc2Nyb2xsIGRvd24gdG8gdGhlIG5ldyBib3R0b21cclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNhdmVOZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG5ld01zZyA9IHtcclxuICAgICAgICB1c2VybmFtZTogZGF0YS51c2VybmFtZSxcclxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXHJcbiAgICAgICAgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcFxyXG4gICAgfTtcclxuICAgIHRoaXMubWVzc2FnZXMucHVzaChuZXdNc2cpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0aGlzLm1lc3NhZ2VzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5yZWFkU3RvcmVkTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gSlNPTi5wYXJzZShtZXNzYWdlcyk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tZXNzYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZSh0aGlzLm1lc3NhZ2VzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIGVuZC1vZi1oaXN0b3J5IHNlcGFyYXRvclxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1oaXN0b3J5LXNlcGFyYXRvclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQoc2VwYXJhdG9yKTtcclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0XCIpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS50b2dnbGVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNoZWNrSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGlucHV0ID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG4gICAgY29uc29sZS5sb2coaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggIC0xKSk7XHJcbiAgICBpZiAoaW5wdXQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vY2hlY2sgaWYgdGhlIGxhc3QgY2hhciB3YXMgZW50ZXJcclxuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KGlucHV0Lmxlbmd0aCAgLTEpID09PSAxMCkge1xyXG4gICAgICAgIHRoaXMuZm9ybVN1Ym1pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KDApID09PSAxMCkge1xyXG4gICAgICAgIC8vZmlyc3QgY2hhciBpcyBlbnRlciwgcmVzZXQgZm9ybSBhbmQgZGlzYWJsZSBzZW5kLWJ1dHRvblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUucGFyc2VNZXNzYWdlV2l0aExpbmtzID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICB2YXIgbGluaztcclxuICAgIHZhciBhVGFnO1xyXG4gICAgdmFyIGxpbmtOb2RlO1xyXG4gICAgdmFyIHRleHROb2RlO1xyXG4gICAgdmFyIHdvcmRzID0gdGV4dC5zcGxpdChcIiBcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh3b3Jkc1tpXS5zbGljZSgwLCA3KSA9PT0gXCJodHRwOi8vXCIpIHtcclxuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHdvcmRzW2ldLnNsaWNlKDAsIDgpID09PSBcImh0dHBzOi8vXCIpIHtcclxuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmspIHtcclxuICAgICAgICAgICAgYVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgICAgICAgICBhVGFnLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIvL1wiICsgbGluayk7XHJcbiAgICAgICAgICAgIGFUYWcuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgICAgICBsaW5rTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxpbmspO1xyXG5cclxuICAgICAgICAgICAgYVRhZy5hcHBlbmRDaGlsZChsaW5rTm9kZSk7XHJcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgXCIpO1xyXG5cclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChhVGFnKTtcclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XHJcblxyXG4gICAgICAgICAgICBsaW5rID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh3b3Jkc1tpXSArIFwiIFwiKTtcclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcmFnO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xlYXJIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpO1xyXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIHZhciBsaXN0RWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwidWxcIik7XHJcbiAgICB3aGlsZSAobGlzdEVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQobGlzdEVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIENoYXQgPSByZXF1aXJlKFwiLi9DaGF0XCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhdEFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICB0aGlzLmNoYXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IFwiXCI7XHJcbiAgICB0aGlzLnNlcnZlciA9IFwidmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCI7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuYWRkRm9jdXNGdW5jID0gdGhpcy5hZGRGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5yZW1vdmVGb2N1c0Z1bmMgPSB0aGlzLnJlbW92ZUZvY3VzLmJpbmQodGhpcyk7XHJcbn1cclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgQ2hhdEFwcGxpY2F0aW9uO1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJuYW1lXCIpKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIik7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XHJcbiAgICAvL3RoaXMuY2hhdCA9IG5ldyBDaGF0KHRoaXMuZWxlbWVudCwgdGhpcy5zZXJ2ZXIsIHRoaXMuY2hhbm5lbCwgdGhpcy51c2VybmFtZSk7XHJcbiAgICAvL3RoaXMuY2hhdC5pbml0KCk7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgY2hhdFwiKTtcclxuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hcHBcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG5cclxuICAgIC8vYWRkIHRoZSBtZW51XHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgdmFyIGFsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudDtcclxuICAgIHZhciBhbHQxID0gYWx0LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiQ2xlYXIgSGlzdG9yeVwiKSk7XHJcblxyXG4gICAgdmFyIGFsdDIgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0Mi5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJTZXR0aW5nc1wiKSk7XHJcblxyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0Mik7XHJcblxyXG4gICAgLy9wcmludCB0aGUgc2V0dGluZ3NcclxuICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudUNsaWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImFcIikge1xyXG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0dGluZ3NcIjoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJjbGVhciBoaXN0b3J5XCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXQuY2xlYXJIaXN0b3J5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciBpbnB1dExpc3Q7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmFkZFNldHRpbmdzKHRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgaW5wdXRMaXN0ID0gIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFt0eXBlPSd0ZXh0J11cIik7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnB1dExpc3QubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgaW5wdXRMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLmFkZEZvY3VzRnVuYyk7XHJcbiAgICAgICAgICAgIGlucHV0TGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5yZW1vdmVGb2N1c0Z1bmMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSd1c2VybmFtZSddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMuc2VydmVyKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdjaGFubmVsJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy5jaGFubmVsKTtcclxuXHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9J2J1dHRvbiddXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiICwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImZvcm1cIikpO1xyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5zYXZlU2V0dGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xyXG4gICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5zb2NrZXQuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZm9ybSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLWZvcm1cIik7XHJcblxyXG4gICAgdGhpcy51c2VybmFtZSA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3VzZXJuYW1lJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLnNlcnZlciA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5jaGFubmVsID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nY2hhbm5lbCddXCIpLnZhbHVlO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LW9ubGluZVwiLCBcImNoYXQtY29ubmVjdGluZ1wiLCBcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcblxyXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcclxuXHJcbiAgICAvL3N0YXJ0IHRoZSBuZXcgY2hhdFxyXG4gICAgY29uc29sZS5sb2coXCJzdGFydCAnbmV3JyBjaGF0IHdpdGggcGFyYW1cIik7XHJcbiAgICBpZiAodGhpcy51c2VybmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBcIlVzZXJcIjtcclxuICAgIH1cclxuICAgIHRoaXMuY2hhdCA9IG5ldyBDaGF0KHRoaXMuZWxlbWVudCwgdGhpcy5zZXJ2ZXIsIHRoaXMuY2hhbm5lbCwgdGhpcy51c2VybmFtZSk7XHJcbiAgICB0aGlzLmNoYXQuaW5pdCgpO1xyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuc2V0Rm9jdXMoKTtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlcm5hbWVcIiwgdGhpcy51c2VybmFtZSk7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZEZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJhZGRpbmcgZm9jdXMtY2xhc3NcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnJlbW92ZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImZvY3VzZWQtd2luZG93XCIpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0Rm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdEFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBNZW1vcnlHYW1lID0gcmVxdWlyZShcIi4vTWVtb3J5R2FtZVwiKTtcclxuXHJcbmZ1bmN0aW9uIE1lbW9yeUFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuZ2FtZSA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuYm9hcmRTaXplID0gWzQsIDRdO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBNZW1vcnlBcHBsaWNhdGlvbjtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgNCwgNCk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJpbnRpbmcgbWVtb3J5XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYXBwXCIpO1xyXG5cclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0MSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5ldyBHYW1lXCIpKTtcclxuXHJcbiAgICB2YXIgYWx0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcIm5ldyBnYW1lXCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemUgPSB2YWx1ZS5zcGxpdChcInhcIik7XHJcbiAgICB9XHJcbiAgICB2YXIgeSA9IHRoaXMuYm9hcmRTaXplWzFdO1xyXG4gICAgdmFyIHggPSB0aGlzLmJvYXJkU2l6ZVswXTtcclxuICAgIHRoaXMuY2xlYXJDb250ZW50KCk7XHJcblxyXG4gICAgdGhpcy5nYW1lLnJlbW92ZUV2ZW50cygpO1xyXG4gICAgdGhpcy5nYW1lID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIHgsIHkpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmFkZFNldHRpbmdzKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3Mtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5yZW1vdmVDaGlsZChzZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRTZXR0aW5ncyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWVtb3J5LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiAsIHRoaXMuc2F2ZVNldHRpbmdzLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcInNlbGVjdFtuYW1lPSdib2FyZC1zaXplJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLnJlc3RhcnQodmFsdWUpO1xyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgY29uc29sZS5sb2coXCJrZXkgaW4gbWVtb3J5OlwiICsga2V5KTtcclxuICAgIGlmICghdGhpcy5tYXJrZWRDYXJkKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZFwiKTtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LmFkZChcIm1hcmtlZFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vdG9vZ2xlIHRoZSBtYXJrZWRDYXJkIGJlZm9yZSBjaGFuZ2luZyBtYXJrZWRDYXJkXHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdC50b2dnbGUoXCJtYXJrZWRcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5tYXJrZWRDYXJkKTtcclxuICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICBjYXNlIDM5OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIDM3OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgMzg6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5VXAoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgNDA6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5RG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAxMzoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnR1cm5DYXJkKHRoaXMubWFya2VkQ2FyZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90aGlzLm1hcmtlZENhcmQgPSBlbGVtZW50O1xyXG5cclxuICAgICAgICAvL2VsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xyXG4gICAgICAgIC8vc3dpdGNoXHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdC50b2dnbGUoXCJtYXJrZWRcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5UmlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBuZXh0IGNhcmRcclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLm5leHRFbGVtZW50U2libGluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy9yZXN0YXJ0IGZyb20gdG9wXHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleUxlZnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBwcmV2aW91cyBjYXJkXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vcmVzdGFydCBmcm9tIGJvdHRvbSByaWdodFxyXG4gICAgICAgICAgICB2YXIgcm93cyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJvd1wiKTtcclxuICAgICAgICAgICAgdmFyIGxhc3RSb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IGxhc3RSb3cubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5VXAgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBuZXh0IHJvdyBhbmQgY2FyZFxyXG4gICAgdmFyIHJvdztcclxuICAgIHZhciByb3dZO1xyXG5cclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdmFyIGlkID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMik7XHJcbiAgICAgICAgcm93WSA9IHBhcnNlSW50KGlkLmNoYXJBdCgwKSkgLSAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9iZWdpbiBmcm9tIGJvdHRvbVxyXG4gICAgICAgIHZhciByb3dzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucm93XCIpO1xyXG4gICAgICAgIHJvdyA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXTtcclxuICAgICAgICByb3dZID0gcm93cy5sZW5ndGggLTE7XHJcbiAgICB9XHJcbiAgICAvL2ZpbmQgd2hhdCB4LXBvc2l0aW9uIGluIHRoZSByb3cgdGhlIG1hcmtlZCBjYXJkIGlzIG9uXHJcbiAgICB2YXIgY2FyZFggPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0xKTtcclxuICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyByb3dZICsgY2FyZFgpO1xyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBuZXh0IHJvdyBhbmQgY2FyZFxyXG4gICAgdmFyIHJvd1k7XHJcblxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHZhciBpZCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTIpO1xyXG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpICsgMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJvd1kgPSAwO1xyXG4gICAgfVxyXG4gICAgLy9maW5kIHdoYXQgeC1wb3NpdGlvbiBpbiB0aGUgcm93IHRoZSBtYXJrZWQgY2FyZCBpcyBvblxyXG4gICAgdmFyIGNhcmRYID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMSk7XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgcm93WSArIGNhcmRYKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5QXBwbGljYXRpb247IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgT3NrYXIgb24gMjAxNS0xMS0yMy5cclxuICovXHJcblxyXG5mdW5jdGlvbiBNZW1vcnlCb2FyZChlbGVtZW50LCB4LHkpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHJcbiAgICB0aGlzLnByaW50Q2FyZHMoKTtcclxufVxyXG5cclxuTWVtb3J5Qm9hcmQucHJvdG90eXBlLnByaW50Q2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuICAgIHZhciByb3dEaXY7XHJcbiAgICB2YXIgY2FyZERpdjtcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpXHJcbiAgICB7XHJcbiAgICAgICAgcm93RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICByb3dEaXYuY2xhc3NMaXN0LmFkZChcInJvd1wiKTtcclxuXHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMueDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgIGNhcmREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICBjYXJkRGl2LmNsYXNzTGlzdC5hZGQoXCJjYXJkLVwiICsgaSArIGosIFwiY2FyZFwiKTtcclxuICAgICAgICAgICAgLy9jYXJkRGl2LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIDApO1xyXG4gICAgICAgICAgICByb3dEaXYuYXBwZW5kQ2hpbGQoY2FyZERpdik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJvd0Rpdik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlCb2FyZDtcclxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IE9za2FyIG9uIDIwMTUtMTEtMjMuXG4gKi9cblxuZnVuY3Rpb24gTWVtb3J5Q2FyZChpZCwgaW1nTnIpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUNhcmQ7XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBPc2thciBvbiAyMDE1LTExLTIzLlxyXG4gKi9cclxudmFyIE1lbW9yeUJvYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Qm9hcmRcIik7XHJcbnZhciBNZW1vcnlDYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Q2FyZFwiKTtcclxudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XHJcblxyXG5mdW5jdGlvbiBNZW1vcnlHYW1lKGVsZW1lbnQsIHgsIHkpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnggPSBwYXJzZUludCh4KTtcclxuICAgIHRoaXMueSA9IHBhcnNlSW50KHkpO1xyXG4gICAgdGhpcy5sYXlvdXQgPSBuZXcgTWVtb3J5Qm9hcmQoZWxlbWVudCwgdGhpcy54LCB0aGlzLnkpO1xyXG4gICAgdGhpcy5ib2FyZCA9IFtdO1xyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuICAgIHRoaXMudHVybnMgPSAwO1xyXG4gICAgdGhpcy5jb3JyZWN0Q291bnQgPSAwO1xyXG4gICAgdGhpcy5pbWFnZUxpc3QgPSBbMCwwLDEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsN107XHJcbiAgICB0aGlzLmltYWdlcyA9IHRoaXMuaW1hZ2VMaXN0LnNsaWNlKDAsKHRoaXMueSp0aGlzLngpKTtcclxuICAgIHRoaXMuY2xpY2tGdW5jID0gdGhpcy5jbGljay5iaW5kKHRoaXMpO1xyXG5cclxuICAgIC8vdGhpcy5mb3VuZFBpbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZvdW5kLXBpbGVcIik7XHJcblxyXG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigpO1xyXG4gICAgdGhpcy50aW1lci5zdGFydCgpO1xyXG5cclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuXHJcbiAgICB0aGlzLnNodWZmbGVJbWFnZXMoKTtcclxuICAgIHRoaXMuYWRkRXZlbnRzKCk7XHJcbn1cclxuXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpID0gMDtcclxuICAgIHRoaXMuYm9hcmQgPSBbXTtcclxuICAgIGlmICh0aGlzLnggPiB0aGlzLnkpIHtcclxuICAgICAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLng7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZvcihpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkodGhpcy54KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbiAgICBmb3IoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgaiwgdGhpcy5pbWFnZXMucG9wKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkW2ldW2orMV0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIChqICsgMSksIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5zaHVmZmxlSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcDtcclxuICAgIHZhciByYW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRlbXAgPSB0aGlzLmltYWdlc1tpXTtcclxuICAgICAgICByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5pbWFnZXMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLmltYWdlc1tpXSA9IHRoaXMuaW1hZ2VzW3JhbmRdO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzW3JhbmRdID0gdGVtcDtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrRnVuYyk7XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5yZW1vdmVFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy50dXJuQ2FyZChldmVudC50YXJnZXQpO1xyXG59O1xyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUudHVybkNhcmQgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoIDwgMiAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJkaXNhYmxlXCIpKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZFwiKSkge1xyXG4gICAgICAgICAgICB2YXIgeXggPSBlbGVtZW50LmNsYXNzTGlzdFswXS5zcGxpdChcIi1cIilbMV07XHJcbiAgICAgICAgICAgIHZhciB5ID0geXguY2hhckF0KDApO1xyXG4gICAgICAgICAgICB2YXIgeCA9IHl4LmNoYXJBdCgxKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImltZy1cIiArIHRoaXMuYm9hcmRbeV1beF0uaW1nTnIpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbWdcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBjYXJkIHRoYXQgZ290IGNsaWNrZWRcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMuYm9hcmRbeV1beF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50dXJucyArPSAxO1xyXG4gICAgY29uc29sZS5sb2codGhpcy52aXNpYmxlQ2FyZHMpO1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yID09PSB0aGlzLnZpc2libGVDYXJkc1sxXS5pbWdOcikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1swXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1sxXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG5cclxuICAgICAgICAvL3RoaXMuYWRkVG9QaWxlKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yKTtcclxuICAgICAgICAvL3RoaXMucGxheWVyc1t0aGlzLmFjdGl2ZVBsYXllcl0uY2FyZHMucHVzaCh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XHJcbiAgICAgICAgLy90aGlzLnBsYXllcnNbdGhpcy5hY3RpdmVQbGF5ZXJdLmFkZFRvUGlsZSgpO1xyXG5cclxuICAgICAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvcnJlY3RDb3VudCA9PT0gKHRoaXMueCp0aGlzLnkgLyAyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkrPTEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy50dXJuQmFja0NhcmRzLmJpbmQodGhpcyksIDEwMDApO1xyXG4gICAgICAgIC8vdGhpcy5jaGFuZ2VQbGF5ZXIoKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmNoYW5nZVBsYXllciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYodGhpcy5hY3RpdmVQbGF5ZXIgPT09IHRoaXMubnJPZlBsYXllcnMgLSAxKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5ZXIgKz0gMTtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLnR1cm5CYWNrQ2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0ZW1wQ2FyZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wQ2FyZCA9IHRoaXMudmlzaWJsZUNhcmRzW2ldO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRlbXBDYXJkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGVtcENhcmQuaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJ3cm9uZ1wiLCBcImltZ1wiLCBcImltZy1cIiArIHRlbXBDYXJkLmltZ05yKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxufTtcclxuXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInR1cm5zOlwiICsgdGhpcy50dXJucyk7XHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tZW1vcnktZ2FtZW92ZXJcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10dXJuc1wiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnR1cm5zKSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10aW1lXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudG90YWxUaW1lKSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5R2FtZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogVGltZXIgY29uc3RydWN0b3JcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUaW1lcigpIHtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gdW5kZWZpbmVkO1xyXG4gICAgLy90aGlzLmludGVydmFsID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdGFydHMgYW4gaW50ZXJ2YWwgZm9yIHRoZSB0aW1lclxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2NhbGwgdGhlIHJ1biBmdW5jdGlvbiBvbiBlYWNoIGludGVydmFsXHJcbiAgICAvL3RoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnJ1bi5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBiZSBleGVjdXRlZCBlYWNoIGludGVydmFsIG9mIHRoZSB0aW1lclxyXG4gKi9cclxuLypcclxuVGltZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgLy9jb3VudCB0aGUgZGlmZmVyZW5jZSBmcm9tIHN0YXJ0IHRvIG5vd1xyXG4gICAgdmFyIGRpZmYgPSAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTsqL1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RvcHMgdGhlIHRpbWVyIGJlZm9yZSBpdHMgb3ZlclxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSwgdGhlIGRpZmZlcmVuY2UgaW4gc2Vjb25kc1xyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICByZXR1cm4gKG5vdyAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDA7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdyB0aGUgdGltZXIgYXQgdGhlIGdpdmVuIGVsZW1lbnRcclxuICogQHBhcmFtIGRpZmZ7TnVtYmVyfSB0aGUgdGltZSB0byBiZSBwcmludGVkXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbihkaWZmKSB7XHJcbiAgICBpZih0aGlzLmVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSwgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gQmxvY2tTaGFwZShzaGFwZXMpIHtcclxuICAgIC8vdGhpcy5zaGFwZXMgPSBzaGFwZXM7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAxXSxcclxuICAgICAgICAgICAgWzAsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDAsIDBdLFxyXG4gICAgICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMF0sXHJcbiAgICAgICAgICAgIFsxLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMSwgMV0sXHJcbiAgICAgICAgICAgIFswLCAwLCAxXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IDAsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrU2hhcGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIFRldHJpc0dhbWUgPSByZXF1aXJlKFwiLi9UZXRyaXNHYW1lXCIpO1xyXG5cclxuZnVuY3Rpb24gVGV0cmlzQXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLmdhbWUgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIFRldHJpc0FwcGxpY2F0aW9uO1xyXG5cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgVGV0cmlzR2FtZSh0aGlzLmVsZW1lbnQpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxufTtcclxuXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByaW50aW5nIFRldHJpc1wiKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaVwiKS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWljb25cIik7XHJcblxyXG59O1xyXG5cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBjb25zb2xlLmxvZyhrZXkpO1xyXG4gICAgaWYgKGtleSA9PT0gMzcpIHtcclxuICAgICAgICAvL2xlZnRcclxuICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygtMSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChrZXkgPT09IDM5KSB7XHJcbiAgICAgICAgLy9yaWdodFxyXG4gICAgICAgIHRoaXMuZ2FtZS5tb3ZlRmFsbGluZ0Jsb2NrKDEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoa2V5ID09PSAzOCkge1xyXG4gICAgICAgIC8vdXBcclxuICAgICAgICB0aGlzLmdhbWUucm90YXRlRmFsbGluZ0Jsb2NrKDEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoa2V5ID09PSA0MCkge1xyXG4gICAgICAgIC8vZG93blxyXG4gICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2soKTtcclxuICAgIH1cclxufTtcclxuXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5nYW1lLmZhbGxpbmdCbG9ja0ludGVydmFsKSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5nYW1lLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgIH1cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXRyaXNBcHBsaWNhdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9CbG9ja1NoYXBlXCIpO1xyXG4vKipcclxuICogVG8gY3JlYXRlIHRoaXMgbW9kdWxlIEkgaGF2ZSByZWFkIHRoZSBmb2xsb3dpbmcgZ3VpZGU6XHJcbiAqIGh0dHA6Ly9nYW1lZGV2ZWxvcG1lbnQudHV0c3BsdXMuY29tL3R1dG9yaWFscy9pbXBsZW1lbnRpbmctdGV0cmlzLWNvbGxpc2lvbi1kZXRlY3Rpb24tLWdhbWVkZXYtODUyXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gVGV0cmlzR2FtZShlbGVtZW50KSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5KYmxvY2sgPSBuZXcgQmxvY2tTaGFwZSgpO1xyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2sgPSB0aGlzLkpibG9jaztcclxuICAgIHRoaXMuZmllbGQgPSBbXTtcclxuXHJcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmluaXRGaWVsZCgpO1xyXG5cclxuICAgIHRoaXMucHJpbnQoKTtcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuZmFsbEJsb2NrLmJpbmQodGhpcyksIDUwMCk7XHJcbn07XHJcblxyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5mYWxsQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZmFsbCBvbmUgcm93XCIpO1xyXG4gICAgaWYgKHRoaXMuaXNGYWxsYWJsZSgpKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKz0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgICAgIHRoaXMubGFuZEZhbGxpbmdCbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJvcE5ld0Jsb2NrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmRyb3BOZXdCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5KYmxvY2sgPSBuZXcgQmxvY2tTaGFwZSgpO1xyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2sgPSB0aGlzLkpibG9jaztcclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5mYWxsQmxvY2suYmluZCh0aGlzKSwgNTAwKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0NvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJHYW1lIG92ZXJcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5sYW5kRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyRmFsbGluZ0Jsb2NrKCk7XHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZFtyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvd11bY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xdID0gc2hhcGVbcm93XVtjb2xdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKHRoaXMuZmllbGQpO1xyXG59O1xyXG5cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyRmFsbGluZ0Jsb2NrKCk7XHJcblxyXG4gICAgLy8gQ2hhbmdlIHRoZSBjbGFzc2VzIHRvIHJlbmRlciB0aGUgYmxvY2tzIHRvIHVzZXJcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3ddW2NvbF0gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vc2hvdWxkIHJlbmRlciBjbGFzcyBmb3IgYmxvY2sgaGVyZVxyXG4gICAgICAgICAgICAgICAgdGRzW2NvbF0uY2xhc3NMaXN0LmFkZChcInRldHJpcy1ibG9jay1wYXJ0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVuZGVyRmFsbGluZ0Jsb2NrKCk7XHJcbn07XHJcblxyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXJGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByb3c7XHJcbiAgICB2YXIgY29sO1xyXG5cclxuICAgIC8vZ2V0IHRoZSBub2Rlc1xyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidHJcIik7XHJcbiAgICB2YXIgdGRzID0gW107XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcy5wdXNoKHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZHJhdyBibG9jayBhdCBwb3NpdGlvbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBzaGFwZXMgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgIHZhciB5ID0gcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3c7XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sO1xyXG4gICAgICAgICAgICAgICAgdGRzW3ldW3hdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIGJlbG93IHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmllbGRbcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3ddW2NvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhlIHNwYWNlIGlzIHRha2VuXHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29sbGlzaW9uO1xyXG59O1xyXG5cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNGYWxsYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZhbGxhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG4gICAgdmFyIHBvdGVudGlhbFRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArIDEsXHJcbiAgICAgICAgY29sOiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbFxyXG4gICAgfTtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSB0aGlzLmZpZWxkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSBiZWxvdyB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib3V0IG9mIGJvdW5kc1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBmYWxsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0pO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbGxpc2lvblwiKTtcclxuICAgICAgICAgICAgICAgICAgICBmYWxsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxsYWJsZTtcclxufTtcclxuXHJcblRldHJpc0dhbWUucHJvdG90eXBlLm1vdmVGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbihkaXIpIHtcclxuICAgIGlmICh0aGlzLmlzTW92YWJsZShkaXIpKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKz0gZGlyO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbn07XHJcblxyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc01vdmFibGUgPSBmdW5jdGlvbihkaXIpIHtcclxuICAgIHZhciBtb3ZhYmxlID0gdHJ1ZTtcclxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XHJcbiAgICB2YXIgcG90ZW50aWFsVG9wTGVmdCA9IHtcclxuICAgICAgICAgICAgcm93OiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyxcclxuICAgICAgICAgICAgY29sOiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCArIGRpclxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2wgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbCArIHBvdGVudGlhbFRvcExlZnQuY29sID49IHRoaXMuZmllbGRbMF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxyXG4gICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW92YWJsZTtcclxufTtcclxuXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJvdGF0ZUZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKGRpcikge1xyXG4gICAgdmFyIG5ld1JvdGF0aW9uID0gdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb24gKyBkaXI7XHJcbiAgICBpZiAobmV3Um90YXRpb24gPiAzKSB7XHJcbiAgICAgICAgbmV3Um90YXRpb24gPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAobmV3Um90YXRpb24gPCAwKSB7XHJcbiAgICAgICAgbmV3Um90YXRpb24gPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uID0gbmV3Um90YXRpb247XHJcblxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2NsZWFyIGZyb20gbGFzdCBmYWxsaW5nLWJsb2NrXHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0clwiKTtcclxuICAgIHZhciB0ZHM7XHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ZHMgPSB0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIik7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHRkc1tjb2xdLmNsYXNzTGlzdC5yZW1vdmUoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG59O1xyXG5cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcHJpbnQgdGhlIGNoYXQtdGVtcGxhdGUgdG8gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXRldHJpcy1hcHBsaWNhdGlvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIHZhciB0cjtcclxuICAgIHZhciB0ZDtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKTtcclxuICAgICAgICAvL3RyLnNldEF0dHJpYnV0ZShcImlkXCIsIFwicm93LVwiICsgcm93KTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgLy90ZC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbC1cIiArIGNvbCk7XHJcbiAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0cik7XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmFwcGVuZENoaWxkKGZyYWcpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxufTtcclxuXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmluaXRGaWVsZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWVsZCA9IFtcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAxLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cclxuICAgIF07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0dhbWU7Il19

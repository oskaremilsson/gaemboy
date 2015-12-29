(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Constructor for basic window
 * @param options, object with the settings
 * @constructor
 */
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

/**
 * Destroy the window
 */
BasicWindow.prototype.destroy = function() {
    document.querySelector("#main-frame").removeChild(this.element);
};

/**
 * Print the window
 */
BasicWindow.prototype.print = function() {
    //get the template and modify it to the params
    var template  = document.querySelector("#template-window").content.cloneNode(true);
    var templateWindow = template.querySelector("div");
    templateWindow.setAttribute("id", this.id);
    templateWindow.style.left = this.x + "px";
    templateWindow.style.top = this.y + "px";
    templateWindow.style.zIndex = this.zIndex;
    templateWindow.setAttribute("tabindex", this.tabIndex);

    //insert the new window before launcher in the DOM
    var element = document.querySelector("#main-frame");
    var launcher = document.querySelector(".launcher");
    element.insertBefore(template, launcher);

    //save the element to the object
    this.element = document.querySelector("#" + this.id);

    //add title and icon to the window
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

/**
 * Minimize the window
 */
BasicWindow.prototype.minimize = function() {
    this.element.classList.toggle("minimized");
};

/**
 * Maximize the window
 */
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

var Launcher = require("./Launcher");

/**
 * Constructor for the Desktop module
 * @constructor
 */
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

/**
 * Function to handle the basic features of the desktop
 */
Desktop.prototype.init = function() {
    this.launcher.init();

    document.addEventListener("mousedown", this.mouseDown.bind(this));
    document.addEventListener("keydown", this.keyDown.bind(this));
};

/**
 * Function to handle what will happen if mouse up
 */
Desktop.prototype.mouseUp = function() {
    window.removeEventListener("mousemove", this.mouseMoveFunc);
    window.removeEventListener("mouseup", this.mouseUpFunc);
    this.activeWindow.element.classList.remove("moving");
};

/**
 * Function to handle what will happen when mouse is down
 * @param event
 */
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

                window.addEventListener("mousemove", this.mouseMoveFunc);
                window.addEventListener("mouseup", this.mouseUpFunc);
            }
        }
    }

};

/**
 * Function to handle the mouse move
 * @param event
 */
Desktop.prototype.mouseMove = function(event) {
    var newX = event.clientX - this.clickX;
    var newY = event.clientY - this.clickY;

    //check where the new middle should be
    var newMiddleX = newX + parseInt(this.activeWindow.element.offsetWidth) / 2;
    var newMiddleY = newY + parseInt(this.activeWindow.element.offsetHeight) / 2;

    var windowW = window.innerWidth;
    var windowH = window.innerHeight;

    //if the move is not out of bounds then move it
    if (newMiddleX < windowW && newMiddleX > 0 && newMiddleY < windowH && newY > 0) {
        this.activeWindow.x = event.clientX - this.clickX;
        this.activeWindow.y = event.clientY - this.clickY;

        this.activeWindow.element.classList.remove("reset-window");
        this.activeWindow.element.style.left = this.activeWindow.x + "px";
        this.activeWindow.element.style.top = this.activeWindow.y + "px";
    }
};

/**
 * Function to handle clicks on windows
 * @param event
 */
Desktop.prototype.windowButtonClick = function(event) {
    var action = event.target.classList;

    var element = event.target;

    //get the 'parent' window-element
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
        //set focus to the window
        this.setFocus(this.windows[index].element);

        //check what action to take
        if (action.contains("exit-button")) {
            //clos the app
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

/**
 * Function to close a window and destroy the app
 * @param id
 */
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

            //remove from window-list and destroy the app
            this.windows[i].destroy();
            this.windows.splice(i, 1);
            removed = true;
        }
    }
};

/**
 * Function to clear and reset the desktop
 */
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

/**
 * Function to handle if key is pressed
 * @param event
 */
Desktop.prototype.keyDown = function(event) {
    if (document.activeElement.id === this.activeWindow.id) {
        if (this.activeWindow.keyActivated) {
            this.activeWindow.keyInput(event.keyCode);
        }
    }
};

/**
 * Set focus to an element
 * @param element - the element to set focus on
 */
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

/**
 * Print the example app
 */
ExampleApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
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

/**
 * Constructor for the launcher
 * @param desktop, the parent Desktop object
 * @constructor
 */
function Launcher(desktop) {
    this.desktop = desktop;
}

/**
 * Function to initialize the basics
 */
Launcher.prototype.init = function() {
    var iTag;
    var appList = document.querySelectorAll(".launcher li");

    //Add eventlisteners to the launcher-buttons
    for (var i = 0; i < appList.length; i += 1) {
        iTag = appList[i].querySelector("i");
        appList[i].addEventListener("click", this.launcherClick.bind(this), true);
    }

};

/**
 * Function to handle the clicks in the launcher
 * @param event
 */
Launcher.prototype.launcherClick = function(event) {
    var value;
    var icon;
    var title;

    //Get the element that got clicked
    var element = this.getClickedLauncherElement(event.target);

    if (element) {
        //get value from the element
        value = element.getAttribute("value");
    }

    if (value) {
        var switchTo = value.split(":");

        //check if the click is in the "running-apps"-section.
        if (switchTo[0] === "id") {
            if (element.classList.contains("tooltip-close")) {
                //close pressed, close window
                this.desktop.closeWindow(switchTo[1]);
            }
            else {
                //running-apps-tab clicked, switch to that app
                this.switchToWindow(switchTo[1]);
            }
        }

        //start the app that got clicked
        else {
            icon = element.querySelector("i").textContent;
            title = element.querySelector(".tooltip-title").textContent;
            this.startApplication(value, icon, title);
        }
    }
};

/**
 * Function to get what element got clicked in the launcher
 * @param target - the event-target from click
 * @returns DOM-element
 */
Launcher.prototype.getClickedLauncherElement = function(target) {
    var element;

    if (target.getAttribute("value")) {
        element = target;
    }
    else if (target.parentNode.getAttribute("value")) {
        //is the i-tag in the li
        element = target.parentNode;
    }

    return element;
};

/**
 * Function to start new application
 * @param value - what app should be started
 * @param icon - what icon to use
 * @param title - what title to use
 */
Launcher.prototype.startApplication = function(value, icon, title) {
    var newApp = false;
    var marginX = 10 * (this.desktop.offsetX);
    var marginY = 10 * (this.desktop.offsetY);

    //create the settings-object
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

    //check what app to start and start it, add eventually maximizable and keyActivated
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
            //set setting to listen on keys
            appOptions.keyActivated = true;
            newApp = new MemoryApplication(appOptions);
            newApp.init();

            break;
        }

        case "chat":
        {
            //set option to be able to maximize window
            appOptions.maximizable = true;
            newApp = new ChatApplication(appOptions);
            newApp.init();

            break;
        }

        case "tetris":
        {
            //set option to listen on keys
            appOptions.keyActivated = true;
            newApp = new TetrisApplication(appOptions);
            newApp.init();

            break;
        }

        case "reset":
        {
            //reset the desktop
            this.desktop.clearDesktop();
            break;
        }
    }

    if (newApp) {
        //add listener to the window-buttons
        var buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.windowButtonClick.bind(this.desktop));

        //save the object to windows-array
        this.desktop.windows.push(newApp);

        //add to the running-apps-list
        this.addRunningApp(value, newApp);

        //increase the serialnumber and such
        this.desktop.serialNumber += 1;
        this.desktop.offsetX += 1;
        this.desktop.offsetY += 1;

        //set focus to the new app and check bounds
        this.desktop.setFocus(newApp.element);
        this.checkBounds(newApp);
    }
};

/**
 * Function to handle if the new window is out of bounds
 * @param app - the app-object to be checked
 */
Launcher.prototype.checkBounds = function(app) {
    var windowW = window.innerWidth;
    var windowH = window.innerHeight;

    var appRight = app.x + parseInt(app.element.offsetWidth);
    var appBottom = app.y + parseInt(app.element.offsetHeight);

    //check if the app-window is out of bounds and get it into bounds
    if (appRight > windowW || app.x < 0) {
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

/**
 * Function to handle focus on call, and show minimized window again
 * @param id - the window-id to set focus on
 */
Launcher.prototype.switchToWindow = function(id) {
    var window = document.querySelector("#" + id);
    if (window) {
        //if minimized, show it again
        if (window.classList.contains("minimized")) {
            window.classList.remove("minimized");
        }

        //set focus
        this.desktop.setFocus(window);
    }
};

/**
 * Function to add a new app to the running-app-list
 * @param type - what type is the app (what list to add to)
 * @param app - the app-object to be added
 */
Launcher.prototype.addRunningApp = function(type, app) {
    //get the tooltip-container for the app and add it to the list
    var container = document.querySelector("li[value='" + type + "'] .tooltip-container");
    var template = document.querySelector("#template-tooltip").content.cloneNode(true);
    template.querySelector(".tooltip").appendChild(document.createTextNode(app.title + "(" + app.id + ")"));
    template.querySelector(".tooltip").setAttribute("value", "id:" + app.id);
    template.querySelector(".tooltip-close").setAttribute("value", "id:" + app.id);

    container.appendChild(template);

};

module.exports = Launcher;

},{"./ExampleApplication":3,"./chatapp/ChatApplication":7,"./memory/MemoryApplication":8,"./tetris/TetrisApplication":19}],5:[function(require,module,exports){
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

    var data = {
        username: "GlaDos",
        data: "Could not connect to server... You can still read your chat history"
    };
    this.printNewMessage(data);
};

Chat.prototype.setOnline = function() {
    this.online = true;
    this.element.querySelector(".window-icon").classList.remove("chat-connecting");
    this.element.querySelector(".window-icon").classList.add("chat-online");
};

Chat.prototype.newMessageFromServer = function(event) {
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
                type: "message",
                data: input,
                username: this.username,
                channel: this.channel,
                key: this.key
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

    this.scrollToBottom(scrolled);
};

Chat.prototype.scrollToBottom = function(scrolled) {
    var container = this.element.querySelector(".chat-message-list");
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

    if (input.length > 0) {
        this.element.querySelector(".chat-sendButton").removeAttribute("disabled");
    }
    else {
        this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
    }

    //check if the last char was enter
    if (input.charCodeAt(input.length - 1) === 10) {
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
        else if (words[i].slice(0, 8) === "https://") {
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

ChatApplication.prototype.init = function() {
    if (localStorage.getItem("username")) {
        this.username = localStorage.getItem("username");
    }
    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
};

ChatApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);

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

    element.querySelector(".settings").appendChild(template);
    return element;
};

ChatApplication.prototype.saveSettings = function(event) {
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
    if (this.username === "") {
        this.username = "User";
    }

    this.chat = new Chat(this.element, this.server, this.channel, this.username);
    this.chat.init();
    this.settingsOpen = false;
    this.setFocus();
    localStorage.setItem("username", this.username);
};

ChatApplication.prototype.maximize = function() {
    BasicWindow.prototype.maximize.call(this);

    //scroll to bottom
    this.chat.scrollToBottom(false);
};

ChatApplication.prototype.addFocus = function() {
    if (!this.element.classList.contains("focused-window")) {
        this.element.classList.add("focused-window");
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
    if (!this.markedCard) {
        this.markedCard = this.element.querySelector(".card");
        this.markedCard.classList.add("marked");
    }
    else {
        //toogle the markedCard before changing markedCard
        this.markedCard.classList.toggle("marked");
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
"use strict";

function MemoryBoard(element, x, y) {
    this.x = x;
    this.y = y;
    this.element = element;

    this.printCards();
}

MemoryBoard.prototype.printCards = function() {
    var frag = document.createDocumentFragment();

    var rowDiv;
    var cardDiv;

    for (var i = 0; i < this.y; i += 1)
    {
        rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (var j = 0; j < this.x; j += 1) {
            cardDiv = document.createElement("div");
            cardDiv.classList.add("card-" + i + j, "card");
            rowDiv.appendChild(cardDiv);
        }

        frag.appendChild(rowDiv);
    }

    this.element.appendChild(frag);
};

module.exports = MemoryBoard;

},{}],10:[function(require,module,exports){
"use strict";

function MemoryCard(id, imgNr) {
    this.id = id;
    this.imgNr = imgNr;
}

module.exports = MemoryCard;

},{}],11:[function(require,module,exports){
"use strict";

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
        for (i = 0; i < this.x; i += 1) {
            this.board.push(new Array(this.y));
        }
    }
    else {
        for (i = 0; i < this.y; i += 1) {
            this.board.push(new Array(this.x));
        }
    }

    this.visibleCards = [];
    for (i = 0; i < this.y; i += 1) {
        for (var j = 0; j < this.x - 1; j += 2) {
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
        this.element.querySelector(".card-" + tempCard.id).classList.remove("wrong", "img", "img-" + tempCard.imgNr);
    }

    //reset the array
    this.visibleCards = [];
};

MemoryGame.prototype.gameOver = function() {
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
    if (this.element.hasChildNodes()) {
        this.element.replaceChild(document.createTextNode(diff), this.element.firstChild);
    }
    else {
        this.element.appendChild(document.createTextNode(diff));
    }
};

module.exports = Timer;

},{}],13:[function(require,module,exports){
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
        row: 0,
        col: 4
    };
}

module.exports = IBlockShape;

},{}],14:[function(require,module,exports){
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
        row: 0,
        col: 4
    };
}

module.exports = JBlockShape;

},{}],15:[function(require,module,exports){
"use strict";

function LBlockShape() {
    this.shapes = [
        [
            [2, 0],
            [2, 0],
            [2, 2]
        ],
        [
            [2, 0, 0],
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
        row: 0,
        col: 4
    };
}

module.exports = LBlockShape;

},{}],16:[function(require,module,exports){
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
        row: 0,
        col: 4
    };
}

module.exports = SBlockShape;

},{}],17:[function(require,module,exports){
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
        row: 0,
        col: 4
    };
}

module.exports = SquareBlockShape;

},{}],18:[function(require,module,exports){
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
        row: 0,
        col: 4
    };
}

module.exports = TBlockShape;

},{}],19:[function(require,module,exports){
"use strict";
var BasicWindow = require("../BasicWindow");
var TetrisGame = require("./TetrisGame");

/**
 * Constructor function for the tetris-app
 * @param options - the settings-object
 * @constructor
 */
function TetrisApplication(options) {
    BasicWindow.call(this, options);

    this.game = undefined;
}

TetrisApplication.prototype = Object.create(BasicWindow.prototype);
TetrisApplication.prototype.constructor =  TetrisApplication;

/**
 * Init the basics
 */
TetrisApplication.prototype.init = function() {
    this.print();

    //create new game
    this.game = new TetrisGame(this.element);
    this.game.init();

    //add eventlistener for the menu
    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
};

/**
 * Function to print the app
 */
TetrisApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("tetris-app");
    this.element.querySelector("i").classList.add("tetris-icon");

    //add the menu
    var menu = this.element.querySelector(".window-menu");
    var alt = document.querySelector("#template-window-menu-alternative").content;
    var alt1 = alt.cloneNode(true);
    alt1.querySelector(".menu-alternative").appendChild(document.createTextNode("New Game"));

    menu.appendChild(alt1);
};

/**
 * Function to handle the menu-clicks
 * @param event - click-event
 */
TetrisApplication.prototype.menuClicked = function(event) {
    var target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "new game": {
                if (this.game) {
                    this.game.start();
                }

                break;
            }
        }
    }
};

/**
 * Function to handle the key-inputs
 * @param key - the key-code
 */
TetrisApplication.prototype.keyInput = function(key) {
    //If game is "alive" and not paused, call the correct functions in game
    if (this.game.alive) {
        if (!this.game.paused) {
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
            else if (key === 32) {
                this.game.fallBlockToBottom();
            }
            else if (key === 13) {
                //enter: play/pause
                this.game.pauseGame();
            }
        }
        else {
            //the game is paused resume game if enter
            if (key === 13) {
                this.game.resumeGame();
            }
        }
    }
    else {
        //game is not running, start on enter
        if (key === 13) {
            this.game.start();
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

    document.querySelector("#main-frame").removeChild(this.element);
};

module.exports = TetrisApplication;

},{"../BasicWindow":1,"./TetrisGame":20}],20:[function(require,module,exports){
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

    this.fallingBlockInterval = undefined;
}

/**
 * Initialized the basics of the module
 */
TetrisGame.prototype.init = function() {
    this.initField();
    this.print();

    //add listener to pause if focus is lost
    this.element.addEventListener("focusout", this.pauseGame.bind(this));
};

/**
 * Function to pause the game
 */
TetrisGame.prototype.pauseGame = function() {
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

    if (this.isCollision()) {
        //the new block collided at launch, game over
        this.saveHighScore();
        this.element.querySelector(".tetris-grid-body").classList.add("game-over");
        this.alive = false;
        window.clearInterval(this.fallingBlockInterval);
    }
};

/**
 * Function to land the falling block to the field
 */
TetrisGame.prototype.landFallingBlock = function() {
    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] = shape[row][col];
            }
        }
    }

    //check if there are full rows after landing
    this.findFullRows();

    if (this.fullRows.length > 0) {
        //erase the rows
        this.eraseFullRows();

        //count points
        this.points += this.countRowPoints();

        //if new HS add class to show it to the user
        if (this.points > this.highScore) {
            this.element.querySelector(".tetris-points").classList.add("new-highscore");
        }

        //reset the fullRows array
        this.fullRows = [];

        //render the points
        this.renderPoints();
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
    var pointNode = document.createTextNode(this.points);
    var levelNode = document.createTextNode(this.level);

    //replace the textnodes to the new ones
    pointsElem.replaceChild(pointNode, pointsElem.firstChild);
    levelElem.replaceChild(levelNode, levelElem.firstChild);
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
                tds[y][x].classList.add("tetris-falling-block-part", "color-" + shape[row][col]);
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
 * Function to check if the fallingblock collided at launch
 * @returns {boolean} - collision or not
 */
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

                else if (this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] !== 0) {
                    //the space is taken
                    collision = true;
                }
            }
        }
    }

    return collision;
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

    return fallable;
};

/**
 * Function to move the falling block
 * @param dir
 */
TetrisGame.prototype.moveFallingBlock = function(dir) {
    if (this.isMovable(dir)) {
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

/**
 * Function to rotate falling block
 * @param dir - positive or negative number to handle left/Right
 */
TetrisGame.prototype.rotateFallingBlock = function(dir) {
    if (this.isRotatable(dir)) {
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
            if (potentialShape[row][col] !== 0) {
                if (col + this.fallingBlock.topLeft.col < 0) {
                    //this block would be to the left of the playing field
                    rotatable = false;
                }

                if (col + this.fallingBlock.topLeft.col >= this.field[0].length) {
                    //this block would be to the right of the playing field
                    rotatable = false;
                }

                if (this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] !== 0) {
                    //the space is taken
                    rotatable = false;
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
 * Function to erase the full rows from field
 */
TetrisGame.prototype.eraseFullRows = function() {
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
    //print the chat-template to this.element
    var template = document.querySelector("#template-tetris-application").content.cloneNode(true);

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

    template.querySelector(".tetris-grid-body").appendChild(frag);

    this.element.querySelector(".window-content").appendChild(template);
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

module.exports = TetrisGame;

},{"./IBlockShape":13,"./JBlockShape":14,"./LBlockShape":15,"./SBlockShape":16,"./SquareBlockShape":17,"./TBlockShape":18,"./ZBlockShape":21}],21:[function(require,module,exports){
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
        row: 0,
        col: 4
    };
}

module.exports = SBlockShape;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5R2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSUJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9KQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0xCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU0Jsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9TcXVhcmVCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVEJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RldHJpc0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9aQmxvY2tTaGFwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25SQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDanBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciBiYXNpYyB3aW5kb3dcclxuICogQHBhcmFtIG9wdGlvbnMsIG9iamVjdCB3aXRoIHRoZSBzZXR0aW5nc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIEJhc2ljV2luZG93KG9wdGlvbnMpIHtcclxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMueCA9IG9wdGlvbnMueCB8fCAxMDtcclxuICAgIHRoaXMueSA9IG9wdGlvbnMueSB8fCAxMDtcclxuICAgIHRoaXMudGFiSW5kZXggPSBvcHRpb25zLnRhYkluZGV4IHx8IDA7XHJcbiAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCB0aGlzLmlkO1xyXG4gICAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uIHx8IFwiYnVnX3JlcG9ydFwiO1xyXG4gICAgdGhpcy5tYXhpbWl6YWJsZSA9IG9wdGlvbnMubWF4aW1pemFibGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmtleUFjdGl2YXRlZCA9IG9wdGlvbnMua2V5QWN0aXZhdGVkIHx8IGZhbHNlO1xyXG4gICAgdGhpcy56SW5kZXggPSBvcHRpb25zLnpJbmRleDtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlc3Ryb3kgdGhlIHdpbmRvd1xyXG4gKi9cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByaW50IHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9nZXQgdGhlIHRlbXBsYXRlIGFuZCBtb2RpZnkgaXQgdG8gdGhlIHBhcmFtc1xyXG4gICAgdmFyIHRlbXBsYXRlICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHRlbXBsYXRlV2luZG93ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImRpdlwiKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXMuaWQpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGhpcy50YWJJbmRleCk7XHJcblxyXG4gICAgLy9pbnNlcnQgdGhlIG5ldyB3aW5kb3cgYmVmb3JlIGxhdW5jaGVyIGluIHRoZSBET01cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgdmFyIGxhdW5jaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlclwiKTtcclxuICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBsYXVuY2hlcik7XHJcblxyXG4gICAgLy9zYXZlIHRoZSBlbGVtZW50IHRvIHRoZSBvYmplY3RcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgICAvL2FkZCB0aXRsZSBhbmQgaWNvbiB0byB0aGUgd2luZG93XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7XHJcblxyXG4gICAgLy9hZGQgbWF4aW1pemUtYnV0dG9uXHJcbiAgICBpZiAodGhpcy5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1heGltaXplLWJ1dHRvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB2YXIgd2luZG93QnV0dG9ucyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1idXR0b25zXCIpO1xyXG4gICAgICAgIHZhciByZW1vdmVCdXR0b24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZS1idXR0b25cIik7XHJcbiAgICAgICAgd2luZG93QnV0dG9ucy5pbnNlcnRCZWZvcmUoYnV0dG9uLCByZW1vdmVCdXR0b24pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1pbmltaXplIHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtaW5pbWl6ZWRcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogTWF4aW1pemUgdGhlIHdpbmRvd1xyXG4gKi9cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1heGltaXplZFwiKTtcclxuXHJcbiAgICB2YXIgaWNvbiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWljb24gaVwiKTtcclxuICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJjcm9wX2RpblwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1idXR0b25cIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgXCJNYXhpbWl6ZVwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgICAgICBpY29uLnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcImZpbHRlcl9ub25lXCIpLCBpY29uLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBcIlJlc2l6ZVwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5jbGVhckNvbnRlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIik7XHJcbiAgICB3aGlsZSAoY29udGVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKGNvbnRlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljV2luZG93O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBMYXVuY2hlciA9IHJlcXVpcmUoXCIuL0xhdW5jaGVyXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgRGVza3RvcCBtb2R1bGVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2VNb3ZlRnVuYyA9IHRoaXMubW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm1vdXNlVXBGdW5jID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuY2xpY2tYID0gMDtcclxuICAgIHRoaXMuY2xpY2tZID0gMDtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuICAgIHRoaXMuekluZGV4ID0gMDtcclxuICAgIHRoaXMub2Zmc2V0WCA9IDE7XHJcbiAgICB0aGlzLm9mZnNldFkgPSAxO1xyXG4gICAgdGhpcy5sYXVuY2hlciA9IG5ldyBMYXVuY2hlcih0aGlzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgYmFzaWMgZmVhdHVyZXMgb2YgdGhlIGRlc2t0b3BcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubGF1bmNoZXIuaW5pdCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHdoYXQgd2lsbCBoYXBwZW4gaWYgbW91c2UgdXBcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlVXAgPSBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtb3ZpbmdcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHdoYXQgd2lsbCBoYXBwZW4gd2hlbiBtb3VzZSBpcyBkb3duXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG5cclxuICAgIC8vZ2V0IHRoZSBjbGlja2VkLXdpbmRvd3MgXCJtYWluLWRpdlwiXHJcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdCkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1haW4tZnJhbWVcIikpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93XCIpKSB7XHJcbiAgICAgICAgLy9jbGlja2VkIERPTSBpcyBhIHdpbmRvdyAtIGRvIHN0dWZmXHJcbiAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuc3R5bGUuekluZGV4KSAhPT0gdGhpcy56SW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRGb2N1cyhlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIHRoZSBsaXN0ZW5lcnMgdG8gY2hlY2sgZm9yIG1vdmVtZW50IGlmIGNsaWNrIHdlcmUgaW4gdGhlIHdpbmRvdy10b3Agb2Ygd2luZG93XHJcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3ctdG9wXCIpKSB7XHJcbiAgICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWF4aW1pemVkXCIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmFjdGl2ZVdpbmRvdy54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5hY3RpdmVXaW5kb3cueTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1vdmluZ1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIG1vdXNlIG1vdmVcclxuICogQHBhcmFtIGV2ZW50XHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIG5ld1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XHJcbiAgICB2YXIgbmV3WSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcbiAgICAvL2NoZWNrIHdoZXJlIHRoZSBuZXcgbWlkZGxlIHNob3VsZCBiZVxyXG4gICAgdmFyIG5ld01pZGRsZVggPSBuZXdYICsgcGFyc2VJbnQodGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5vZmZzZXRXaWR0aCkgLyAyO1xyXG4gICAgdmFyIG5ld01pZGRsZVkgPSBuZXdZICsgcGFyc2VJbnQodGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5vZmZzZXRIZWlnaHQpIC8gMjtcclxuXHJcbiAgICB2YXIgd2luZG93VyA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIHdpbmRvd0ggPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgLy9pZiB0aGUgbW92ZSBpcyBub3Qgb3V0IG9mIGJvdW5kcyB0aGVuIG1vdmUgaXRcclxuICAgIGlmIChuZXdNaWRkbGVYIDwgd2luZG93VyAmJiBuZXdNaWRkbGVYID4gMCAmJiBuZXdNaWRkbGVZIDwgd2luZG93SCAmJiBuZXdZID4gMCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LnggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMuYWN0aXZlV2luZG93LnggKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLmFjdGl2ZVdpbmRvdy55ICsgXCJweFwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBjbGlja3Mgb24gd2luZG93c1xyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLndpbmRvd0J1dHRvbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBhY3Rpb24gPSBldmVudC50YXJnZXQuY2xhc3NMaXN0O1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG5cclxuICAgIC8vZ2V0IHRoZSAncGFyZW50JyB3aW5kb3ctZWxlbWVudFxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB3aGF0IHdpbmRvdyBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgLy9zZXQgZm9jdXMgdG8gdGhlIHdpbmRvd1xyXG4gICAgICAgIHRoaXMuc2V0Rm9jdXModGhpcy53aW5kb3dzW2luZGV4XS5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy9jaGVjayB3aGF0IGFjdGlvbiB0byB0YWtlXHJcbiAgICAgICAgaWYgKGFjdGlvbi5jb250YWlucyhcImV4aXQtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vY2xvcyB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VXaW5kb3codGhpcy53aW5kb3dzW2luZGV4XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1pbmltaXplLWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL21pbmltaXplIHRoZSBhcHBcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5taW5pbWl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhY3Rpb24uY29udGFpbnMoXCJtYXhpbWl6ZS1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9tYXhpbWl6ZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIGlmICh0aGlzLndpbmRvd3NbaW5kZXhdLm1heGltaXphYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1heGltaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xvc2UgYSB3aW5kb3cgYW5kIGRlc3Ryb3kgdGhlIGFwcFxyXG4gKiBAcGFyYW0gaWRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLmNsb3NlV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciByZW1vdmVkID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGggJiYgIXJlbW92ZWQ7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgICAgICB2YXIgY2xpY2tlZFRvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gd2luZG93LWxpc3QgYW5kIGRlc3Ryb3kgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaV0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xlYXIgYW5kIHJlc2V0IHRoZSBkZXNrdG9wXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5jbGVhckRlc2t0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh3aW5kb3dUb29sdGlwLnBhcmVudE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMud2luZG93cyA9IFtdO1xyXG4gICAgdGhpcy5zZXJpYWxOdW1iZXIgPSAwO1xyXG4gICAgdGhpcy5vZmZzZXRYID0gMTtcclxuICAgIHRoaXMub2Zmc2V0WSA9IDE7XHJcbiAgICB0aGlzLnpJbmRleCA9IDA7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIGtleSBpcyBwcmVzc2VkXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5pZCA9PT0gdGhpcy5hY3RpdmVXaW5kb3cuaWQpIHtcclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVXaW5kb3cua2V5QWN0aXZhdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmtleUlucHV0KGV2ZW50LmtleUNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgZm9jdXMgdG8gYW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHNldCBmb2N1cyBvblxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUuc2V0Rm9jdXMgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBlbGVtZW50LmZvY3VzKCk7XHJcblxyXG4gICAgLy9maW5kIHRoZSB3aW5kb3cgaW4gd2luZG93LWFycmF5XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB0aGlzLndpbmRvd3NbaV07XHJcbiAgICAgICAgICAgIHRoaXMuekluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy56SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcblxyXG5mdW5jdGlvbiBFeGFtcGxlQXBwbGljYXRpb24oaWQsIHgsIHkpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgaWQsIHgsIHkpO1xyXG59XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIEV4YW1wbGVBcHBsaWNhdGlvbjtcclxuXHJcbi8qKlxyXG4gKiBQcmludCB0aGUgZXhhbXBsZSBhcHBcclxuICovXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJleGFtcGxlLWFwcFwiKTtcclxuXHJcbn07XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBjb25zb2xlLmxvZyhrZXkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRXhBID0gcmVxdWlyZShcIi4vRXhhbXBsZUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgTWVtb3J5QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9tZW1vcnkvTWVtb3J5QXBwbGljYXRpb25cIik7XHJcbnZhciBDaGF0QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvblwiKTtcclxudmFyIFRldHJpc0FwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vdGV0cmlzL1RldHJpc0FwcGxpY2F0aW9uXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgbGF1bmNoZXJcclxuICogQHBhcmFtIGRlc2t0b3AsIHRoZSBwYXJlbnQgRGVza3RvcCBvYmplY3RcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBMYXVuY2hlcihkZXNrdG9wKSB7XHJcbiAgICB0aGlzLmRlc2t0b3AgPSBkZXNrdG9wO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgYmFzaWNzXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlUYWc7XHJcbiAgICB2YXIgYXBwTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubGF1bmNoZXIgbGlcIik7XHJcblxyXG4gICAgLy9BZGQgZXZlbnRsaXN0ZW5lcnMgdG8gdGhlIGxhdW5jaGVyLWJ1dHRvbnNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlUYWcgPSBhcHBMaXN0W2ldLnF1ZXJ5U2VsZWN0b3IoXCJpXCIpO1xyXG4gICAgICAgIGFwcExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubGF1bmNoZXJDbGljay5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBjbGlja3MgaW4gdGhlIGxhdW5jaGVyXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmxhdW5jaGVyQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgdmFyIGljb247XHJcbiAgICB2YXIgdGl0bGU7XHJcblxyXG4gICAgLy9HZXQgdGhlIGVsZW1lbnQgdGhhdCBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcclxuXHJcbiAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgIC8vZ2V0IHZhbHVlIGZyb20gdGhlIGVsZW1lbnRcclxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIHN3aXRjaFRvID0gdmFsdWUuc3BsaXQoXCI6XCIpO1xyXG5cclxuICAgICAgICAvL2NoZWNrIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgXCJydW5uaW5nLWFwcHNcIi1zZWN0aW9uLlxyXG4gICAgICAgIGlmIChzd2l0Y2hUb1swXSA9PT0gXCJpZFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY2xvc2VcIikpIHtcclxuICAgICAgICAgICAgICAgIC8vY2xvc2UgcHJlc3NlZCwgY2xvc2Ugd2luZG93XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xvc2VXaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9ydW5uaW5nLWFwcHMtdGFiIGNsaWNrZWQsIHN3aXRjaCB0byB0aGF0IGFwcFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1dpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vc3RhcnQgdGhlIGFwcCB0aGF0IGdvdCBjbGlja2VkXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGljb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB0aXRsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLXRpdGxlXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0QXBwbGljYXRpb24odmFsdWUsIGljb24sIHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZ2V0IHdoYXQgZWxlbWVudCBnb3QgY2xpY2tlZCBpbiB0aGUgbGF1bmNoZXJcclxuICogQHBhcmFtIHRhcmdldCAtIHRoZSBldmVudC10YXJnZXQgZnJvbSBjbGlja1xyXG4gKiBAcmV0dXJucyBET00tZWxlbWVudFxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQgPSBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgIHZhciBlbGVtZW50O1xyXG5cclxuICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcclxuICAgICAgICAvL2lzIHRoZSBpLXRhZyBpbiB0aGUgbGlcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc3RhcnQgbmV3IGFwcGxpY2F0aW9uXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHdoYXQgYXBwIHNob3VsZCBiZSBzdGFydGVkXHJcbiAqIEBwYXJhbSBpY29uIC0gd2hhdCBpY29uIHRvIHVzZVxyXG4gKiBAcGFyYW0gdGl0bGUgLSB3aGF0IHRpdGxlIHRvIHVzZVxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLnN0YXJ0QXBwbGljYXRpb24gPSBmdW5jdGlvbih2YWx1ZSwgaWNvbiwgdGl0bGUpIHtcclxuICAgIHZhciBuZXdBcHAgPSBmYWxzZTtcclxuICAgIHZhciBtYXJnaW5YID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFgpO1xyXG4gICAgdmFyIG1hcmdpblkgPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WSk7XHJcblxyXG4gICAgLy9jcmVhdGUgdGhlIHNldHRpbmdzLW9iamVjdFxyXG4gICAgdmFyIGFwcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB4OiBtYXJnaW5YLFxyXG4gICAgICAgIHk6IG1hcmdpblksXHJcbiAgICAgICAgdGFiSW5kZXg6IHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgekluZGV4OiB0aGlzLmRlc2t0b3AuekluZGV4LFxyXG4gICAgICAgIGljb246IGljb24sXHJcbiAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgIG1heGltaXphYmxlOiBmYWxzZSxcclxuICAgICAgICBrZXlBY3RpdmF0ZWQ6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vY2hlY2sgd2hhdCBhcHAgdG8gc3RhcnQgYW5kIHN0YXJ0IGl0LCBhZGQgZXZlbnR1YWxseSBtYXhpbWl6YWJsZSBhbmQga2V5QWN0aXZhdGVkXHJcbiAgICBzd2l0Y2ggKHZhbHVlKSB7XHJcbiAgICAgICAgY2FzZSBcImV4YW1wbGVcIjoge1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIm1lbW9yeVwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9zZXQgc2V0dGluZyB0byBsaXN0ZW4gb24ga2V5c1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLmtleUFjdGl2YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImNoYXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vc2V0IG9wdGlvbiB0byBiZSBhYmxlIHRvIG1heGltaXplIHdpbmRvd1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IENoYXRBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcInRldHJpc1wiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9zZXQgb3B0aW9uIHRvIGxpc3RlbiBvbiBrZXlzXHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMua2V5QWN0aXZhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IFRldHJpc0FwcGxpY2F0aW9uKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwicmVzZXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGRlc2t0b3BcclxuICAgICAgICAgICAgdGhpcy5kZXNrdG9wLmNsZWFyRGVza3RvcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld0FwcCkge1xyXG4gICAgICAgIC8vYWRkIGxpc3RlbmVyIHRvIHRoZSB3aW5kb3ctYnV0dG9uc1xyXG4gICAgICAgIHZhciBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0FwcC5pZCArIFwiIC53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICBidXR0b25zLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlc2t0b3Aud2luZG93QnV0dG9uQ2xpY2suYmluZCh0aGlzLmRlc2t0b3ApKTtcclxuXHJcbiAgICAgICAgLy9zYXZlIHRoZSBvYmplY3QgdG8gd2luZG93cy1hcnJheVxyXG4gICAgICAgIHRoaXMuZGVza3RvcC53aW5kb3dzLnB1c2gobmV3QXBwKTtcclxuXHJcbiAgICAgICAgLy9hZGQgdG8gdGhlIHJ1bm5pbmctYXBwcy1saXN0XHJcbiAgICAgICAgdGhpcy5hZGRSdW5uaW5nQXBwKHZhbHVlLCBuZXdBcHApO1xyXG5cclxuICAgICAgICAvL2luY3JlYXNlIHRoZSBzZXJpYWxudW1iZXIgYW5kIHN1Y2hcclxuICAgICAgICB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICs9IDE7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggKz0gMTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSArPSAxO1xyXG5cclxuICAgICAgICAvL3NldCBmb2N1cyB0byB0aGUgbmV3IGFwcCBhbmQgY2hlY2sgYm91bmRzXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKG5ld0FwcC5lbGVtZW50KTtcclxuICAgICAgICB0aGlzLmNoZWNrQm91bmRzKG5ld0FwcCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIHRoZSBuZXcgd2luZG93IGlzIG91dCBvZiBib3VuZHNcclxuICogQHBhcmFtIGFwcCAtIHRoZSBhcHAtb2JqZWN0IHRvIGJlIGNoZWNrZWRcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGFwcCkge1xyXG4gICAgdmFyIHdpbmRvd1cgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciB3aW5kb3dIID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIHZhciBhcHBSaWdodCA9IGFwcC54ICsgcGFyc2VJbnQoYXBwLmVsZW1lbnQub2Zmc2V0V2lkdGgpO1xyXG4gICAgdmFyIGFwcEJvdHRvbSA9IGFwcC55ICsgcGFyc2VJbnQoYXBwLmVsZW1lbnQub2Zmc2V0SGVpZ2h0KTtcclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZSBhcHAtd2luZG93IGlzIG91dCBvZiBib3VuZHMgYW5kIGdldCBpdCBpbnRvIGJvdW5kc1xyXG4gICAgaWYgKGFwcFJpZ2h0ID4gd2luZG93VyB8fCBhcHAueCA8IDApIHtcclxuICAgICAgICAvL3Jlc2V0IHRoZSBvZmZzZXRcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WCA9IDE7XHJcblxyXG4gICAgICAgIC8vc2V0IG5ldyBwb3NpdGlvbnNcclxuICAgICAgICBhcHAueCA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRYKTtcclxuICAgICAgICBhcHAuZWxlbWVudC5zdHlsZS5sZWZ0ID0gYXBwLnggKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChhcHBCb3R0b20gPiB3aW5kb3dIIHx8IGFwcC55IDwgMCkge1xyXG4gICAgICAgIC8vcmVzZXQgdGhlIG9mZnNldFxyXG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRZID0gMTtcclxuXHJcbiAgICAgICAgLy9zZXQgbmV3IHBvc2l0aW9uc1xyXG4gICAgICAgIGFwcC55ID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFkpO1xyXG4gICAgICAgIGFwcC5lbGVtZW50LnN0eWxlLnRvcCA9IGFwcC55ICsgXCJweFwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBmb2N1cyBvbiBjYWxsLCBhbmQgc2hvdyBtaW5pbWl6ZWQgd2luZG93IGFnYWluXHJcbiAqIEBwYXJhbSBpZCAtIHRoZSB3aW5kb3ctaWQgdG8gc2V0IGZvY3VzIG9uXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuc3dpdGNoVG9XaW5kb3cgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgdmFyIHdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBpZCk7XHJcbiAgICBpZiAod2luZG93KSB7XHJcbiAgICAgICAgLy9pZiBtaW5pbWl6ZWQsIHNob3cgaXQgYWdhaW5cclxuICAgICAgICBpZiAod2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcIm1pbmltaXplZFwiKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vc2V0IGZvY3VzXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKHdpbmRvdyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYWRkIGEgbmV3IGFwcCB0byB0aGUgcnVubmluZy1hcHAtbGlzdFxyXG4gKiBAcGFyYW0gdHlwZSAtIHdoYXQgdHlwZSBpcyB0aGUgYXBwICh3aGF0IGxpc3QgdG8gYWRkIHRvKVxyXG4gKiBAcGFyYW0gYXBwIC0gdGhlIGFwcC1vYmplY3QgdG8gYmUgYWRkZWRcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5hZGRSdW5uaW5nQXBwID0gZnVuY3Rpb24odHlwZSwgYXBwKSB7XHJcbiAgICAvL2dldCB0aGUgdG9vbHRpcC1jb250YWluZXIgZm9yIHRoZSBhcHAgYW5kIGFkZCBpdCB0byB0aGUgbGlzdFxyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaVt2YWx1ZT0nXCIgKyB0eXBlICsgXCInXSAudG9vbHRpcC1jb250YWluZXJcIik7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXRvb2x0aXBcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXBcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLnRpdGxlICsgXCIoXCIgKyBhcHAuaWQgKyBcIilcIikpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLWNsb3NlXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYXVuY2hlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7XHJcbmQuaW5pdCgpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIENoYXQoZWxlbWVudCwgc2VydmVyLCBjaGFubmVsLCB1c2VybmFtZSkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xyXG4gICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbCB8fCBcIlwiO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmtleSA9IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIjtcclxuICAgIHRoaXMub25saW5lID0gZmFsc2U7XHJcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XHJcbiAgICB0aGlzLnRpbWVTdGFtcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsIG1vbnRoOiBcIm51bWVyaWNcIixcclxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiLCBob3VyOiBcIjItZGlnaXRcIiwgbWludXRlOiBcIjItZGlnaXRcIlxyXG4gICAgfTtcclxuICAgIHRoaXMuc2hpZnRlZCA9IGZhbHNlO1xyXG59XHJcblxyXG5DaGF0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgdGhpcy5yZWFkU3RvcmVkTWVzc2FnZXMoKTtcclxuICAgIHRoaXMuY29ubmVjdFRvU2VydmVyKCk7XHJcbiAgICAvL2FkZCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMubmV3TWVzc2FnZUZyb21TZXJ2ZXIuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmZvcm1TdWJtaXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLmZvcm1TdWJtaXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMuY2hlY2tJbnB1dC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvL3RoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmNoZWNrS2V5LmJpbmQodGhpcykpO1xyXG4gICAgLy90aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIHRoaXMuY2hlY2tLZXkuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9wcmludCB0aGUgY2hhdC10ZW1wbGF0ZSB0byB0aGlzLmVsZW1lbnRcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1hcHBsaWNhdGlvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuXHJcbiAgICAvL3ByaW50IGluZm9cclxuICAgIHZhciBpbmZvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1pbmZvXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIGNoYW5uZWxJbmZvID0gXCJcIjtcclxuICAgIGlmICh0aGlzLmNoYW5uZWwgPT09IFwiXCIpIHtcclxuICAgICAgICBjaGFubmVsSW5mbyA9IFwiTm9uLXNwZWNpZmllZFwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEluZm8gPSB0aGlzLmNoYW5uZWw7XHJcbiAgICB9XHJcbiAgICB2YXIgaW5mb05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiNcIiArIGNoYW5uZWxJbmZvLnNsaWNlKDAsMTgpICsgXCIvXCIgKyB0aGlzLnVzZXJuYW1lLnNsaWNlKDAsMTApKTtcclxuICAgIGluZm8ucXVlcnlTZWxlY3RvcihcIi5tZW51LWluZm9cIikuYXBwZW5kQ2hpbGQoaW5mb05vZGUpO1xyXG5cclxuICAgIHZhciBtZW51SW5mbyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaW5mb1wiKTtcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICBpZiAobWVudUluZm8pIHtcclxuICAgICAgICBtZW51LnJlcGxhY2VDaGlsZChpbmZvLCBtZW51SW5mbyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBtZW51LmFwcGVuZENoaWxkKGluZm8pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdFRvU2VydmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuXHJcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL1wiICsgdGhpcy5zZXJ2ZXIsIFwiY2hhcmNvcmRzXCIpO1xyXG5cclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIHRoaXMuc2V0T25saW5lLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIHRoaXMuc2V0T2ZmbGluZS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNldE9mZmxpbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWNvbm5lY3RpbmdcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5vbmxpbmUgPSBmYWxzZTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB1c2VybmFtZTogXCJHbGFEb3NcIixcclxuICAgICAgICBkYXRhOiBcIkNvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlci4uLiBZb3UgY2FuIHN0aWxsIHJlYWQgeW91ciBjaGF0IGhpc3RvcnlcIlxyXG4gICAgfTtcclxuICAgIHRoaXMucHJpbnROZXdNZXNzYWdlKGRhdGEpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuc2V0T25saW5lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm9ubGluZSA9IHRydWU7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb25saW5lXCIpO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUubmV3TWVzc2FnZUZyb21TZXJ2ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAvL2FkZCB0aW1lc3RhbXAgdG8gZGF0YS1vYmplY3RcclxuICAgICAgICBkYXRhLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKFwic3Ytc2VcIiwgdGhpcy50aW1lU3RhbXBPcHRpb25zKTtcclxuICAgICAgICBpZiAoIWRhdGEuY2hhbm5lbCkge1xyXG4gICAgICAgICAgICBkYXRhLmNoYW5uZWwgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5jaGFubmVsID09PSB0aGlzLmNoYW5uZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmludE5ld01lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5ld01lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuZm9ybVN1Ym1pdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm9ubGluZSkge1xyXG4gICAgICAgIHZhciBpbnB1dCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdmFyIG1zZyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCxcclxuICAgICAgICAgICAgICAgIGtleTogdGhpcy5rZXlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wcmludE5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICB2YXIgc2Nyb2xsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZSB1c2VyIGhhcyBzY3JvbGxlZCB1cFxyXG4gICAgaWYgKGNvbnRhaW5lci5zY3JvbGxUb3AgIT09IChjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLm9mZnNldEhlaWdodCkpIHtcclxuICAgICAgICBzY3JvbGxlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LW1lc3NhZ2UtbGluZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB1c2VybmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLnVzZXJuYW1lICsgXCI6IFwiKTtcclxuICAgIC8vdmFyIG1lc3NhZ2VOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS5kYXRhKTtcclxuICAgIHZhciBtZXNzYWdlTm9kZSA9IHRoaXMucGFyc2VNZXNzYWdlV2l0aExpbmtzKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2VcIikuYXBwZW5kQ2hpbGQobWVzc2FnZU5vZGUpO1xyXG4gICAgaWYgKGRhdGEudGltZXN0YW1wKSB7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGluZVwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBkYXRhLnRpbWVzdGFtcCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMudXNlcm5hbWUgPT09IGRhdGEudXNlcm5hbWUpIHtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlLW1lXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImxpXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWJ1YmJsZVwiKTtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtdXNlcm5hbWVcIikuYXBwZW5kQ2hpbGQodXNlcm5hbWVOb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGlzdCB1bFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zY3JvbGxUb0JvdHRvbShzY3JvbGxlZCk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5zY3JvbGxUb0JvdHRvbSA9IGZ1bmN0aW9uKHNjcm9sbGVkKSB7XHJcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICBpZiAoIXNjcm9sbGVkKSB7XHJcbiAgICAgICAgLy9JZiB1c2VyIHdhcyBhdCBib3R0b20sIGF1dG8tc2Nyb2xsIGRvd24gdG8gdGhlIG5ldyBib3R0b21cclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLnNhdmVOZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG5ld01zZyA9IHtcclxuICAgICAgICB1c2VybmFtZTogZGF0YS51c2VybmFtZSxcclxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXHJcbiAgICAgICAgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcFxyXG4gICAgfTtcclxuICAgIHRoaXMubWVzc2FnZXMucHVzaChuZXdNc2cpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsLCBKU09OLnN0cmluZ2lmeSh0aGlzLm1lc3NhZ2VzKSk7XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5yZWFkU3RvcmVkTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gSlNPTi5wYXJzZShtZXNzYWdlcyk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tZXNzYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZSh0aGlzLm1lc3NhZ2VzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIGVuZC1vZi1oaXN0b3J5IHNlcGFyYXRvclxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1oaXN0b3J5LXNlcGFyYXRvclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQoc2VwYXJhdG9yKTtcclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0XCIpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS50b2dnbGVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxufTtcclxuXHJcbkNoYXQucHJvdG90eXBlLmNoZWNrSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGlucHV0ID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG5cclxuICAgIGlmIChpbnB1dC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jaGVjayBpZiB0aGUgbGFzdCBjaGFyIHdhcyBlbnRlclxyXG4gICAgaWYgKGlucHV0LmNoYXJDb2RlQXQoaW5wdXQubGVuZ3RoIC0gMSkgPT09IDEwKSB7XHJcbiAgICAgICAgdGhpcy5mb3JtU3VibWl0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlucHV0LmNoYXJDb2RlQXQoMCkgPT09IDEwKSB7XHJcbiAgICAgICAgLy9maXJzdCBjaGFyIGlzIGVudGVyLCByZXNldCBmb3JtIGFuZCBkaXNhYmxlIHNlbmQtYnV0dG9uXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0LnByb3RvdHlwZS5wYXJzZU1lc3NhZ2VXaXRoTGlua3MgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIHZhciBsaW5rO1xyXG4gICAgdmFyIGFUYWc7XHJcbiAgICB2YXIgbGlua05vZGU7XHJcbiAgICB2YXIgdGV4dE5vZGU7XHJcbiAgICB2YXIgd29yZHMgPSB0ZXh0LnNwbGl0KFwiIFwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHdvcmRzW2ldLnNsaWNlKDAsIDcpID09PSBcImh0dHA6Ly9cIikge1xyXG4gICAgICAgICAgICBsaW5rID0gd29yZHNbaV0uc2xpY2UoNyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdvcmRzW2ldLnNsaWNlKDAsIDgpID09PSBcImh0dHBzOi8vXCIpIHtcclxuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmspIHtcclxuICAgICAgICAgICAgYVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgICAgICAgICBhVGFnLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIvL1wiICsgbGluayk7XHJcbiAgICAgICAgICAgIGFUYWcuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgICAgICBsaW5rTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxpbmspO1xyXG5cclxuICAgICAgICAgICAgYVRhZy5hcHBlbmRDaGlsZChsaW5rTm9kZSk7XHJcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgXCIpO1xyXG5cclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChhVGFnKTtcclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XHJcblxyXG4gICAgICAgICAgICBsaW5rID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh3b3Jkc1tpXSArIFwiIFwiKTtcclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcmFnO1xyXG59O1xyXG5cclxuQ2hhdC5wcm90b3R5cGUuY2xlYXJIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpO1xyXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIHZhciBsaXN0RWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwidWxcIik7XHJcbiAgICB3aGlsZSAobGlzdEVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQobGlzdEVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIENoYXQgPSByZXF1aXJlKFwiLi9DaGF0XCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhdEFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICB0aGlzLmNoYXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IFwiXCI7XHJcbiAgICB0aGlzLnNlcnZlciA9IFwidmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCI7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuYWRkRm9jdXNGdW5jID0gdGhpcy5hZGRGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5yZW1vdmVGb2N1c0Z1bmMgPSB0aGlzLnJlbW92ZUZvY3VzLmJpbmQodGhpcyk7XHJcbn1cclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgQ2hhdEFwcGxpY2F0aW9uO1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VybmFtZVwiKSkge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJuYW1lXCIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1lbnVDbGlja2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcblxyXG4gICAgLy9hZGQgdGhlIG1lbnVcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50O1xyXG4gICAgdmFyIGFsdDEgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0MS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJDbGVhciBIaXN0b3J5XCIpKTtcclxuXHJcbiAgICB2YXIgYWx0MiA9IGFsdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcclxuXHJcbiAgICAvL3ByaW50IHRoZSBzZXR0aW5nc1xyXG4gICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5zb2NrZXQuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcImNsZWFyIGhpc3RvcnlcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhdC5jbGVhckhpc3RvcnkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpO1xyXG4gICAgdmFyIGlucHV0TGlzdDtcclxuXHJcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LXNldHRpbmdzXCIpO1xyXG5cclxuICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuYWRkU2V0dGluZ3ModGVtcGxhdGUpO1xyXG5cclxuICAgICAgICBpbnB1dExpc3QgPSAgdGVtcGxhdGUucXVlcnlTZWxlY3RvckFsbChcImlucHV0W3R5cGU9J3RleHQnXVwiKTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGlucHV0TGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBpbnB1dExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMuYWRkRm9jdXNGdW5jKTtcclxuICAgICAgICAgICAgaW5wdXRMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLnJlbW92ZUZvY3VzRnVuYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3Mtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5yZW1vdmVDaGlsZChzZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2V0dGluZ3MgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3VzZXJuYW1lJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy51c2VybmFtZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nc2VydmVyJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy5zZXJ2ZXIpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J2NoYW5uZWwnXVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCB0aGlzLmNoYW5uZWwpO1xyXG5cclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbdHlwZT0nYnV0dG9uJ11cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIgLCB0aGlzLnNhdmVTZXR0aW5ncy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy5jaGF0KSB7XHJcbiAgICAgICAgdGhpcy5jaGF0LnNvY2tldC5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmb3JtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3MtZm9ybVwiKTtcclxuXHJcbiAgICB0aGlzLnVzZXJuYW1lID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0ndXNlcm5hbWUnXVwiKS52YWx1ZTtcclxuICAgIHRoaXMuc2VydmVyID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nc2VydmVyJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdjaGFubmVsJ11cIikudmFsdWU7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtb25saW5lXCIsIFwiY2hhdC1jb25uZWN0aW5nXCIsIFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb2ZmbGluZVwiKTtcclxuXHJcbiAgICB0aGlzLmNsZWFyQ29udGVudCgpO1xyXG5cclxuICAgIC8vc3RhcnQgdGhlIG5ldyBjaGF0XHJcbiAgICBpZiAodGhpcy51c2VybmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBcIlVzZXJcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoYXQgPSBuZXcgQ2hhdCh0aGlzLmVsZW1lbnQsIHRoaXMuc2VydmVyLCB0aGlzLmNoYW5uZWwsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgdGhpcy5jaGF0LmluaXQoKTtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnNldEZvY3VzKCk7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJuYW1lXCIsIHRoaXMudXNlcm5hbWUpO1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLm1heGltaXplLmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy9zY3JvbGwgdG8gYm90dG9tXHJcbiAgICB0aGlzLmNoYXQuc2Nyb2xsVG9Cb3R0b20oZmFsc2UpO1xyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZm9jdXNlZC13aW5kb3dcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5yZW1vdmVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXRBcHBsaWNhdGlvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIE1lbW9yeUdhbWUgPSByZXF1aXJlKFwiLi9NZW1vcnlHYW1lXCIpO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5ib2FyZFNpemUgPSBbNCwgNF07XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE1lbW9yeUFwcGxpY2F0aW9uO1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCA0LCA0KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYXBwXCIpO1xyXG5cclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0MSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5ldyBHYW1lXCIpKTtcclxuXHJcbiAgICB2YXIgYWx0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcIm5ldyBnYW1lXCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemUgPSB2YWx1ZS5zcGxpdChcInhcIik7XHJcbiAgICB9XHJcbiAgICB2YXIgeSA9IHRoaXMuYm9hcmRTaXplWzFdO1xyXG4gICAgdmFyIHggPSB0aGlzLmJvYXJkU2l6ZVswXTtcclxuICAgIHRoaXMuY2xlYXJDb250ZW50KCk7XHJcblxyXG4gICAgdGhpcy5nYW1lLnJlbW92ZUV2ZW50cygpO1xyXG4gICAgdGhpcy5nYW1lID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIHgsIHkpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmFkZFNldHRpbmdzKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3Mtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5yZW1vdmVDaGlsZChzZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRTZXR0aW5ncyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWVtb3J5LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiAsIHRoaXMuc2F2ZVNldHRpbmdzLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcInNlbGVjdFtuYW1lPSdib2FyZC1zaXplJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLnJlc3RhcnQodmFsdWUpO1xyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgaWYgKCF0aGlzLm1hcmtlZENhcmQpIHtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QuYWRkKFwibWFya2VkXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy90b29nbGUgdGhlIG1hcmtlZENhcmQgYmVmb3JlIGNoYW5naW5nIG1hcmtlZENhcmRcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcclxuICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICBjYXNlIDM5OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSAzNzoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSAzODoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlVcCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5RG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS50dXJuQ2FyZCh0aGlzLm1hcmtlZENhcmQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QudG9nZ2xlKFwibWFya2VkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCBjYXJkXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZy5maXJzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vcmVzdGFydCBmcm9tIHRvcFxyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgcHJldmlvdXMgY2FyZFxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL3Jlc3RhcnQgZnJvbSBib3R0b20gcmlnaHRcclxuICAgICAgICAgICAgdmFyIHJvd3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yb3dcIik7XHJcbiAgICAgICAgICAgIHZhciBsYXN0Um93ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSBsYXN0Um93Lmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcclxuICAgIHZhciByb3c7XHJcbiAgICB2YXIgcm93WTtcclxuXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHZhciBpZCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTIpO1xyXG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpIC0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vYmVnaW4gZnJvbSBib3R0b21cclxuICAgICAgICB2YXIgcm93cyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJvd1wiKTtcclxuICAgICAgICByb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgcm93WSA9IHJvd3MubGVuZ3RoIC0xO1xyXG4gICAgfVxyXG4gICAgLy9maW5kIHdoYXQgeC1wb3NpdGlvbiBpbiB0aGUgcm93IHRoZSBtYXJrZWQgY2FyZCBpcyBvblxyXG4gICAgdmFyIGNhcmRYID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMSk7XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgcm93WSArIGNhcmRYKTtcclxufTtcclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcclxuICAgIHZhciByb3dZO1xyXG5cclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB2YXIgaWQgPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0yKTtcclxuICAgICAgICByb3dZID0gcGFyc2VJbnQoaWQuY2hhckF0KDApKSArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByb3dZID0gMDtcclxuICAgIH1cclxuICAgIC8vZmluZCB3aGF0IHgtcG9zaXRpb24gaW4gdGhlIHJvdyB0aGUgbWFya2VkIGNhcmQgaXMgb25cclxuICAgIHZhciBjYXJkWCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTEpO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHJvd1kgKyBjYXJkWCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUFwcGxpY2F0aW9uOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gTWVtb3J5Qm9hcmQoZWxlbWVudCwgeCwgeSkge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgIHRoaXMucHJpbnRDYXJkcygpO1xyXG59XHJcblxyXG5NZW1vcnlCb2FyZC5wcm90b3R5cGUucHJpbnRDYXJkcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcblxyXG4gICAgdmFyIHJvd0RpdjtcclxuICAgIHZhciBjYXJkRGl2O1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpXHJcbiAgICB7XHJcbiAgICAgICAgcm93RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICByb3dEaXYuY2xhc3NMaXN0LmFkZChcInJvd1wiKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLng7IGogKz0gMSkge1xyXG4gICAgICAgICAgICBjYXJkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAgICAgY2FyZERpdi5jbGFzc0xpc3QuYWRkKFwiY2FyZC1cIiArIGkgKyBqLCBcImNhcmRcIik7XHJcbiAgICAgICAgICAgIHJvd0Rpdi5hcHBlbmRDaGlsZChjYXJkRGl2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQocm93RGl2KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZnJhZyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUJvYXJkO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIE1lbW9yeUNhcmQoaWQsIGltZ05yKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmltZ05yID0gaW1nTnI7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5Q2FyZDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTWVtb3J5Qm9hcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlCb2FyZFwiKTtcclxudmFyIE1lbW9yeUNhcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlDYXJkXCIpO1xyXG52YXIgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcclxuXHJcbmZ1bmN0aW9uIE1lbW9yeUdhbWUoZWxlbWVudCwgeCwgeSkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMueCA9IHBhcnNlSW50KHgpO1xyXG4gICAgdGhpcy55ID0gcGFyc2VJbnQoeSk7XHJcbiAgICB0aGlzLmxheW91dCA9IG5ldyBNZW1vcnlCb2FyZChlbGVtZW50LCB0aGlzLngsIHRoaXMueSk7XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG4gICAgdGhpcy50dXJucyA9IDA7XHJcbiAgICB0aGlzLmNvcnJlY3RDb3VudCA9IDA7XHJcbiAgICB0aGlzLmltYWdlTGlzdCA9IFswLDAsMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3XTtcclxuICAgIHRoaXMuaW1hZ2VzID0gdGhpcy5pbWFnZUxpc3Quc2xpY2UoMCwodGhpcy55KnRoaXMueCkpO1xyXG4gICAgdGhpcy5jbGlja0Z1bmMgPSB0aGlzLmNsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy90aGlzLmZvdW5kUGlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm91bmQtcGlsZVwiKTtcclxuXHJcbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyKCk7XHJcbiAgICB0aGlzLnRpbWVyLnN0YXJ0KCk7XHJcblxyXG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG5cclxuICAgIHRoaXMuc2h1ZmZsZUltYWdlcygpO1xyXG4gICAgdGhpcy5hZGRFdmVudHMoKTtcclxufVxyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgdGhpcy5ib2FyZCA9IFtdO1xyXG4gICAgaWYgKHRoaXMueCA+IHRoaXMueSkge1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLng7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgaiwgdGhpcy5pbWFnZXMucG9wKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkW2ldW2orMV0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIChqICsgMSksIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5zaHVmZmxlSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcDtcclxuICAgIHZhciByYW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRlbXAgPSB0aGlzLmltYWdlc1tpXTtcclxuICAgICAgICByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5pbWFnZXMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLmltYWdlc1tpXSA9IHRoaXMuaW1hZ2VzW3JhbmRdO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzW3JhbmRdID0gdGVtcDtcclxuICAgIH1cclxufTtcclxuXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrRnVuYyk7XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5yZW1vdmVFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy50dXJuQ2FyZChldmVudC50YXJnZXQpO1xyXG59O1xyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUudHVybkNhcmQgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoIDwgMiAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJkaXNhYmxlXCIpKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZFwiKSkge1xyXG4gICAgICAgICAgICB2YXIgeXggPSBlbGVtZW50LmNsYXNzTGlzdFswXS5zcGxpdChcIi1cIilbMV07XHJcbiAgICAgICAgICAgIHZhciB5ID0geXguY2hhckF0KDApO1xyXG4gICAgICAgICAgICB2YXIgeCA9IHl4LmNoYXJBdCgxKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImltZy1cIiArIHRoaXMuYm9hcmRbeV1beF0uaW1nTnIpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbWdcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBjYXJkIHRoYXQgZ290IGNsaWNrZWRcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMuYm9hcmRbeV1beF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50dXJucyArPSAxO1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yID09PSB0aGlzLnZpc2libGVDYXJkc1sxXS5pbWdOcikge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1swXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1sxXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG5cclxuICAgICAgICAvL3RoaXMuYWRkVG9QaWxlKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yKTtcclxuICAgICAgICAvL3RoaXMucGxheWVyc1t0aGlzLmFjdGl2ZVBsYXllcl0uY2FyZHMucHVzaCh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOcik7XHJcbiAgICAgICAgLy90aGlzLnBsYXllcnNbdGhpcy5hY3RpdmVQbGF5ZXJdLmFkZFRvUGlsZSgpO1xyXG5cclxuICAgICAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvcnJlY3RDb3VudCA9PT0gKHRoaXMueCp0aGlzLnkgLyAyKSkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkrPTEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMudHVybkJhY2tDYXJkcy5iaW5kKHRoaXMpLCAxMDAwKTtcclxuXHJcbiAgICAgICAgLy90aGlzLmNoYW5nZVBsYXllcigpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuY2hhbmdlUGxheWVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZih0aGlzLmFjdGl2ZVBsYXllciA9PT0gdGhpcy5uck9mUGxheWVycyAtIDEpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVBsYXllciA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVBsYXllciArPSAxO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUudHVybkJhY2tDYXJkcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRlbXBDYXJkO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRlbXBDYXJkID0gdGhpcy52aXNpYmxlQ2FyZHNbaV07XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRlbXBDYXJkLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwid3JvbmdcIiwgXCJpbWdcIiwgXCJpbWctXCIgKyB0ZW1wQ2FyZC5pbWdOcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZXNldCB0aGUgYXJyYXlcclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbn07XHJcblxyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5nYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWVtb3J5LWdhbWVvdmVyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5tZW1vcnktdHVybnNcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50dXJucykpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5tZW1vcnktdGltZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRvdGFsVGltZSkpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUdhbWU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIFRpbWVyIGNvbnN0cnVjdG9yXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gVGltZXIoKSB7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvL3RoaXMuaW50ZXJ2YWwgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0YXJ0cyBhbiBpbnRlcnZhbCBmb3IgdGhlIHRpbWVyXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2FsbCB0aGUgcnVuIGZ1bmN0aW9uIG9uIGVhY2ggaW50ZXJ2YWxcclxuICAgIC8vdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMucnVuLmJpbmQodGhpcyksIDEwMCk7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGVhY2ggaW50ZXJ2YWwgb2YgdGhlIHRpbWVyXHJcbiAqL1xyXG4vKlxyXG5UaW1lci5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAvL2NvdW50IHRoZSBkaWZmZXJlbmNlIGZyb20gc3RhcnQgdG8gbm93XHJcbiAgICB2YXIgZGlmZiA9IChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xyXG59OyovXHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdG9wcyB0aGUgdGltZXIgYmVmb3JlIGl0cyBvdmVyXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9LCB0aGUgZGlmZmVyZW5jZSBpbiBzZWNvbmRzXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIHJldHVybiAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSB0aW1lciBhdCB0aGUgZ2l2ZW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZGlmZntOdW1iZXJ9IHRoZSB0aW1lIHRvIGJlIHByaW50ZWRcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKGRpZmYpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSwgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gSUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNiwgNiwgNiwgNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2LCA2LCA2LCA2XVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IDAsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IElCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIEpCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgMV0sXHJcbiAgICAgICAgICAgIFswLCAxXSxcclxuICAgICAgICAgICAgWzEsIDFdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcclxuICAgICAgICAgICAgWzEsIDEsIDFdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsxLCAxXSxcclxuICAgICAgICAgICAgWzEsIDBdLFxyXG4gICAgICAgICAgICBbMSwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDEsIDFdLFxyXG4gICAgICAgICAgICBbMCwgMCwgMV1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAwLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBMQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzIsIDBdLFxyXG4gICAgICAgICAgICBbMiwgMF0sXHJcbiAgICAgICAgICAgIFsyLCAyXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMiwgMCwgMF0sXHJcbiAgICAgICAgICAgIFsyLCAyLCAyXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMiwgMl0sXHJcbiAgICAgICAgICAgIFswLCAyXSxcclxuICAgICAgICAgICAgWzAsIDJdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsyLCAyLCAyXSxcclxuICAgICAgICAgICAgWzIsIDAsIDBdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogMCxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTEJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gU0Jsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA0LCA0XSxcclxuICAgICAgICAgICAgWzQsIDQsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs0LCAwXSxcclxuICAgICAgICAgICAgWzQsIDRdLFxyXG4gICAgICAgICAgICBbMCwgNF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDQsIDRdLFxyXG4gICAgICAgICAgICBbNCwgNCwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzQsIDBdLFxyXG4gICAgICAgICAgICBbNCwgNF0sXHJcbiAgICAgICAgICAgIFswLCA0XVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IDAsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNxdWFyZUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogMCxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3F1YXJlQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDMsIDBdLFxyXG4gICAgICAgICAgICBbMywgMywgM11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDBdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFszLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMywgMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgM10sXHJcbiAgICAgICAgICAgIFszLCAzXSxcclxuICAgICAgICAgICAgWzAsIDNdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogMCxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVEJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBUZXRyaXNHYW1lID0gcmVxdWlyZShcIi4vVGV0cmlzR2FtZVwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHRldHJpcy1hcHBcclxuICogQHBhcmFtIG9wdGlvbnMgLSB0aGUgc2V0dGluZ3Mtb2JqZWN0XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gVGV0cmlzQXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLmdhbWUgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIFRldHJpc0FwcGxpY2F0aW9uO1xyXG5cclxuLyoqXHJcbiAqIEluaXQgdGhlIGJhc2ljc1xyXG4gKi9cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICAvL2NyZWF0ZSBuZXcgZ2FtZVxyXG4gICAgdGhpcy5nYW1lID0gbmV3IFRldHJpc0dhbWUodGhpcy5lbGVtZW50KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcblxyXG4gICAgLy9hZGQgZXZlbnRsaXN0ZW5lciBmb3IgdGhlIG1lbnVcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1lbnVDbGlja2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBhcHBcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInRldHJpcy1hcHBcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImlcIikuY2xhc3NMaXN0LmFkZChcInRldHJpcy1pY29uXCIpO1xyXG5cclxuICAgIC8vYWRkIHRoZSBtZW51XHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgdmFyIGFsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudDtcclxuICAgIHZhciBhbHQxID0gYWx0LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmV3IEdhbWVcIikpO1xyXG5cclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0MSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBtZW51LWNsaWNrc1xyXG4gKiBAcGFyYW0gZXZlbnQgLSBjbGljay1ldmVudFxyXG4gKi9cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB0YXJnZXQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcclxuICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcIm5ldyBnYW1lXCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdhbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUuc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGtleS1pbnB1dHNcclxuICogQHBhcmFtIGtleSAtIHRoZSBrZXktY29kZVxyXG4gKi9cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAvL0lmIGdhbWUgaXMgXCJhbGl2ZVwiIGFuZCBub3QgcGF1c2VkLCBjYWxsIHRoZSBjb3JyZWN0IGZ1bmN0aW9ucyBpbiBnYW1lXHJcbiAgICBpZiAodGhpcy5nYW1lLmFsaXZlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmdhbWUucGF1c2VkKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IDM3KSB7XHJcbiAgICAgICAgICAgICAgICAvL2xlZnRcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5tb3ZlRmFsbGluZ0Jsb2NrKC0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IDM5KSB7XHJcbiAgICAgICAgICAgICAgICAvL3JpZ2h0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IDM4KSB7XHJcbiAgICAgICAgICAgICAgICAvL3VwXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUucm90YXRlRmFsbGluZ0Jsb2NrKDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gNDApIHtcclxuICAgICAgICAgICAgICAgIC8vZG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLmZhbGxCbG9jaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2tUb0JvdHRvbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIC8vZW50ZXI6IHBsYXkvcGF1c2VcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZUdhbWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy90aGUgZ2FtZSBpcyBwYXVzZWQgcmVzdW1lIGdhbWUgaWYgZW50ZXJcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5yZXN1bWVHYW1lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2dhbWUgaXMgbm90IHJ1bm5pbmcsIHN0YXJ0IG9uIGVudGVyXHJcbiAgICAgICAgaWYgKGtleSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGRlc3Ryb3kgdGhlIGFwcFxyXG4gKi9cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmdhbWUuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmdhbWUuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXRyaXNBcHBsaWNhdGlvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBKQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL0pCbG9ja1NoYXBlXCIpO1xyXG52YXIgTEJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9MQmxvY2tTaGFwZVwiKTtcclxudmFyIFNCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vU0Jsb2NrU2hhcGVcIik7XHJcbnZhciBaQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1pCbG9ja1NoYXBlXCIpO1xyXG52YXIgSUJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9JQmxvY2tTaGFwZVwiKTtcclxudmFyIFNxdWFyZUJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9TcXVhcmVCbG9ja1NoYXBlXCIpO1xyXG52YXIgVEJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9UQmxvY2tTaGFwZVwiKTtcclxuLyoqXHJcbiAqIFRvIGNyZWF0ZSB0aGlzIG1vZHVsZSBJIGhhdmUgcmVhZCB0aGUgZm9sbG93aW5nIGd1aWRlOlxyXG4gKiBodHRwOi8vZ2FtZWRldmVsb3BtZW50LnR1dHNwbHVzLmNvbS90dXRvcmlhbHMvaW1wbGVtZW50aW5nLXRldHJpcy1jb2xsaXNpb24tZGV0ZWN0aW9uLS1nYW1lZGV2LTg1MlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDb250cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgdGV0cmlzIGdhbWVcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZG9tLWVsZW1lbnQgdG8gYmUgcHJpbnRlZCB0b1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRldHJpc0dhbWUoZWxlbWVudCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5maWVsZCA9IFtdO1xyXG4gICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5mdWxsUm93cyA9IFtdO1xyXG4gICAgdGhpcy5iYXNlUG9pbnRzID0gMTAwO1xyXG4gICAgdGhpcy5mYWxsU3BlZWQgPSA2MDA7XHJcbiAgICB0aGlzLmxldmVsID0gMTtcclxuICAgIHRoaXMucm93Q291bnQgPSAwO1xyXG4gICAgdGhpcy5wb2ludHMgPSAwO1xyXG4gICAgdGhpcy5oaWdoU2NvcmUgPSAwO1xyXG4gICAgdGhpcy5uZXh0QmxvY2sgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplZCB0aGUgYmFzaWNzIG9mIHRoZSBtb2R1bGVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaW5pdEZpZWxkKCk7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgLy9hZGQgbGlzdGVuZXIgdG8gcGF1c2UgaWYgZm9jdXMgaXMgbG9zdFxyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLnBhdXNlR2FtZS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwYXVzZSB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucGF1c2VHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3BhdXNlIHRoZSBnYW1lXHJcbiAgICBpZiAodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCAmJiB0aGlzLmFsaXZlKSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wYXVzZWRcIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVzdW1lIHRoZSBnYW1lXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZXN1bWVHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3N0YXJ0IHRoZSBkcm9wLWludGVydmFsIGFnYWluXHJcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuZmFsbEJsb2NrLmJpbmQodGhpcyksIHRoaXMuZmFsbFNwZWVkKTtcclxuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFN0YXJ0IHRoZSBnYW1lXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3NldCBhbGwgdGhlIHZhcmlhYmxlcyB0byB0aGUgc3RhcnQtc3RhdGVcclxuICAgIHRoaXMuYWxpdmUgPSB0cnVlO1xyXG4gICAgdGhpcy5sZXZlbCA9IDE7XHJcbiAgICB0aGlzLnBvaW50cyA9IDA7XHJcbiAgICB0aGlzLmZhbGxTcGVlZCA9IDYwMDtcclxuICAgIHRoaXMucm93Q291bnQgPSAwO1xyXG4gICAgdGhpcy5yZWFkSGlnaFNjb3JlKCk7XHJcblxyXG4gICAgLy9tYWtlIHN1cmUgdGhlIGNsYXNzZXMgaXMgcmVzZXR0ZWRcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuY2xhc3NMaXN0LnJlbW92ZShcImdhbWUtb3ZlclwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIikuY2xhc3NMaXN0LnJlbW92ZShcIm5ldy1oaWdoc2NvcmVcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXNwbGFzaC1zY3JlZW5cIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XHJcblxyXG4gICAgLy9ydW4gYWxsIHRoZSBmdW5jdGlvbnMgdG8gbWFrZSB0aGUgbWFnaWMgaGFwcGVuXHJcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5pbml0RmllbGQoKTtcclxuICAgIHRoaXMuY2xlYXJGaWVsZCgpO1xyXG4gICAgdGhpcy5yZW5kZXJQb2ludHMoKTtcclxuICAgIHRoaXMubmV3TmV4dEJsb2NrKCk7XHJcbiAgICB0aGlzLmRyb3BOZXdCbG9jaygpO1xyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZWFkIHRoZSBoaWdoIHNjb3JlIGZyb20gbG9jYWwgc3RvcmFnZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVhZEhpZ2hTY29yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidGV0cmlzLWhzXCIpKSB7XHJcbiAgICAgICAgdGhpcy5oaWdoU2NvcmUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRldHJpcy1oc1wiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzYXZlIHRoZSBoaWdoIHNjb3JlIHRvIGxvY2FsIHN0b3JhZ2VcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnNhdmVIaWdoU2NvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLnBvaW50cyA+IHRoaXMuaGlnaFNjb3JlKSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0ZXRyaXMtaHNcIiwgdGhpcy5wb2ludHMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGZhbGwgdGhlIGJsb2NrIG9uZSByb3cgZG93blxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmFsbEJsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5pc0ZhbGxhYmxlKCkpIHtcclxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArPSAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9ibG9jayBoYXMgY29sbGlkZWQsIGxhbmQgdGhlIGJsb2NrIGFuZCBkcm9wIG5ld1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgICAgIHRoaXMubGFuZEZhbGxpbmdCbG9jaygpO1xyXG4gICAgICAgIHRoaXMuZHJvcE5ld0Jsb2NrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW5kZXIgdGhlIGNoYW5nZVxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBmYWxsIGJsb2NrIHRvIGJvdHRvbSBkaXJlY3RseVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmFsbEJsb2NrVG9Cb3R0b20gPSBmdW5jdGlvbigpIHtcclxuICAgIHdoaWxlICh0aGlzLmlzRmFsbGFibGUoKSkge1xyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW5kZXIgdGhlIGNoYW5nZVxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByYW5kb21pemUgYSBuZXcgYmxvY2tcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLm5ld05leHRCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNoYXBlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyk7XHJcblxyXG4gICAgLy9jcmVhdGUgbmV3IGJsb2NrIGZyb20gdGhlIHJhbmRvbSBudW1iZXJcclxuICAgIHN3aXRjaCAoc2hhcGUpIHtcclxuICAgICAgICBjYXNlIDA6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgSkJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDE6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgTEJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDI6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgU0Jsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDM6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgWkJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDQ6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgSUJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDU6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgU3F1YXJlQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgNjoge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBUQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZHJvcCBuZXcgYmxvY2tcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmRyb3BOZXdCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9nZXQgdGhlIGJsb2NrIGZyb20gbmV4dC1ibG9ja1xyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2sgPSB0aGlzLm5leHRCbG9jaztcclxuXHJcbiAgICAvL2dldCBhIG5ldyBuZXh0IGJsb2NrXHJcbiAgICB0aGlzLmNsZWFyTmV4dEJsb2NrKCk7XHJcbiAgICB0aGlzLm5ld05leHRCbG9jaygpO1xyXG5cclxuICAgIC8vYWRkIGZhbGxpbnRlcnZhbCB3aXRoIGN1cnJlbnQgc3BlZWRcclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5mYWxsQmxvY2suYmluZCh0aGlzKSwgdGhpcy5mYWxsU3BlZWQpO1xyXG5cclxuICAgIGlmICh0aGlzLmlzQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAvL3RoZSBuZXcgYmxvY2sgY29sbGlkZWQgYXQgbGF1bmNoLCBnYW1lIG92ZXJcclxuICAgICAgICB0aGlzLnNhdmVIaWdoU2NvcmUoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmNsYXNzTGlzdC5hZGQoXCJnYW1lLW92ZXJcIik7XHJcbiAgICAgICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGxhbmQgdGhlIGZhbGxpbmcgYmxvY2sgdG8gdGhlIGZpZWxkXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5sYW5kRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZFtyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvd11bY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xdID0gc2hhcGVbcm93XVtjb2xdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vY2hlY2sgaWYgdGhlcmUgYXJlIGZ1bGwgcm93cyBhZnRlciBsYW5kaW5nXHJcbiAgICB0aGlzLmZpbmRGdWxsUm93cygpO1xyXG5cclxuICAgIGlmICh0aGlzLmZ1bGxSb3dzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvL2VyYXNlIHRoZSByb3dzXHJcbiAgICAgICAgdGhpcy5lcmFzZUZ1bGxSb3dzKCk7XHJcblxyXG4gICAgICAgIC8vY291bnQgcG9pbnRzXHJcbiAgICAgICAgdGhpcy5wb2ludHMgKz0gdGhpcy5jb3VudFJvd1BvaW50cygpO1xyXG5cclxuICAgICAgICAvL2lmIG5ldyBIUyBhZGQgY2xhc3MgdG8gc2hvdyBpdCB0byB0aGUgdXNlclxyXG4gICAgICAgIGlmICh0aGlzLnBvaW50cyA+IHRoaXMuaGlnaFNjb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIikuY2xhc3NMaXN0LmFkZChcIm5ldy1oaWdoc2NvcmVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3Jlc2V0IHRoZSBmdWxsUm93cyBhcnJheVxyXG4gICAgICAgIHRoaXMuZnVsbFJvd3MgPSBbXTtcclxuXHJcbiAgICAgICAgLy9yZW5kZXIgdGhlIHBvaW50c1xyXG4gICAgICAgIHRoaXMucmVuZGVyUG9pbnRzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBnYW1lXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2xlYXJGaWVsZCgpO1xyXG5cclxuICAgIC8vIENoYW5nZSB0aGUgY2xhc3NlcyB0byByZW5kZXIgdGhlIGJsb2NrcyB0byB1c2VyXHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdHJcIik7XHJcbiAgICB2YXIgdGRzO1xyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjbGFzcyB0byBzaG93IGJsb2NrLXBhcnRcclxuICAgICAgICAgICAgICAgIHRkc1tjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtYmxvY2stcGFydFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL3JlbmRlciB0aGUgZmFsbGluZyBibG9jayBhbmQgbmV4dGJsb2NrXHJcbiAgICB0aGlzLnJlbmRlckZhbGxpbmdCbG9jaygpO1xyXG4gICAgdGhpcy5yZW5kZXJOZXh0QmxvY2soKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW5kZXIgdGhlIHBvaW50c1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcG9pbnRzRWxlbSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIik7XHJcbiAgICB2YXIgbGV2ZWxFbGVtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWxldmVsXCIpO1xyXG4gICAgdmFyIHBvaW50Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMucG9pbnRzKTtcclxuICAgIHZhciBsZXZlbE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmxldmVsKTtcclxuXHJcbiAgICAvL3JlcGxhY2UgdGhlIHRleHRub2RlcyB0byB0aGUgbmV3IG9uZXNcclxuICAgIHBvaW50c0VsZW0ucmVwbGFjZUNoaWxkKHBvaW50Tm9kZSwgcG9pbnRzRWxlbS5maXJzdENoaWxkKTtcclxuICAgIGxldmVsRWxlbS5yZXBsYWNlQ2hpbGQobGV2ZWxOb2RlLCBsZXZlbEVsZW0uZmlyc3RDaGlsZCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBmYWxsaW5nIGJsb2NrXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXJGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByb3c7XHJcbiAgICB2YXIgY29sO1xyXG5cclxuICAgIC8vZ2V0IHRoZSBub2Rlc1xyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkIHRyXCIpO1xyXG4gICAgdmFyIHRkcyA9IFtdO1xyXG4gICAgZm9yIChyb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ZHMucHVzaCh0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkIHRkXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG4gICAgZm9yIChyb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kcmF3IGJsb2NrIGF0IHBvc2l0aW9uIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNoYXBlcyBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgdmFyIHkgPSByb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdztcclxuICAgICAgICAgICAgICAgIHZhciB4ID0gY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2w7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9hZGQgY2xhc3MgdG8gdGhlIGNvcnJlY3QgYmxvY2stcGFydFxyXG4gICAgICAgICAgICAgICAgdGRzW3ldW3hdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgbmV4dCBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyTmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIGNvbDtcclxuXHJcbiAgICAvL2dldCB0aGUgbm9kZXNcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtbmV4dC1ibG9jayB0Ym9keSB0clwiKTtcclxuICAgIHZhciB0ZHMgPSBbXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgdHJzLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ZHMucHVzaCh0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaGFwZSA9IHRoaXMubmV4dEJsb2NrLnNoYXBlc1t0aGlzLm5leHRCbG9jay5yb3RhdGlvbl07XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICB0ZHNbcm93XVtjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIHRoZSBuZXh0LWJsb2NrLWNvbnRhaW5lclxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXIgbmV4dC1ibG9ja1xyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1uZXh0LWJsb2NrIHRib2R5IHRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRycy5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRkcy5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vY2xlYXIgdGhlIGNvbHVtblxyXG4gICAgICAgICAgICB0ZHNbY29sXS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGZhbGxpbmdibG9jayBjb2xsaWRlZCBhdCBsYXVuY2hcclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gY29sbGlzaW9uIG9yIG5vdFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIGJlbG93IHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbGxpc2lvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgYmxvY2sgaXMgZmFsbGFibGVcclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gZmFsbGFibGUgb3Igbm90XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pc0ZhbGxhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmFsbGFibGUgPSB0cnVlO1xyXG5cclxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XHJcbiAgICB2YXIgcG90ZW50aWFsVG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ICsgMSxcclxuICAgICAgICBjb2w6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXHJcbiAgICB9O1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIGJlbG93IHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsbGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmllbGRbcm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3ddW2NvbCArIHBvdGVudGlhbFRvcExlZnQuY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhlIHNwYWNlIGlzIHRha2VuXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsbGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsbGFibGU7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gbW92ZSB0aGUgZmFsbGluZyBibG9ja1xyXG4gKiBAcGFyYW0gZGlyXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5tb3ZlRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICBpZiAodGhpcy5pc01vdmFibGUoZGlyKSkge1xyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sICs9IGRpcjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGJsb2NrIGlzIG1vdmFibGVcclxuICogQHBhcmFtIGRpciAtIG5lZ2F0aXZlIG9yIHBvc2l0aXZlIG51bWJlclxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBtb3ZhYmxlIG9yIG5vdFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNNb3ZhYmxlID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICB2YXIgbW92YWJsZSA9IHRydWU7XHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG4gICAgdmFyIHBvdGVudGlhbFRvcExlZnQgPSB7XHJcbiAgICAgICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3csXHJcbiAgICAgICAgICAgIGNvbDogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKyBkaXJcclxuICAgICAgICB9O1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbCArIHBvdGVudGlhbFRvcExlZnQuY29sIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSB0byB0aGUgbGVmdCBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2wgPj0gdGhpcy5maWVsZFswXS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxyXG4gICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW92YWJsZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByb3RhdGUgZmFsbGluZyBibG9ja1xyXG4gKiBAcGFyYW0gZGlyIC0gcG9zaXRpdmUgb3IgbmVnYXRpdmUgbnVtYmVyIHRvIGhhbmRsZSBsZWZ0L1JpZ2h0XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yb3RhdGVGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbihkaXIpIHtcclxuICAgIGlmICh0aGlzLmlzUm90YXRhYmxlKGRpcikpIHtcclxuICAgICAgICB2YXIgbmV3Um90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcclxuICAgICAgICBpZiAobmV3Um90YXRpb24gPiAzKSB7XHJcbiAgICAgICAgICAgIG5ld1JvdGF0aW9uID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobmV3Um90YXRpb24gPCAwKSB7XHJcbiAgICAgICAgICAgIG5ld1JvdGF0aW9uID0gMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uID0gbmV3Um90YXRpb247XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyByb3RhdGFibGVcclxuICogQHBhcmFtIGRpciAtIG5lZyBvciBwb3MgbnVtYmVyXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIHJvdGF0YWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzUm90YXRhYmxlID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICB2YXIgcm90YXRhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgcG90ZW50aWFsUm90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcclxuICAgIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA+IDMpIHtcclxuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA8IDApIHtcclxuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jcmVhdGUgcG90ZW50aWFsIHNoYXBlXHJcbiAgICB2YXIgcG90ZW50aWFsU2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbcG90ZW50aWFsUm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHBvdGVudGlhbFNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBwb3RlbnRpYWxTaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHBvdGVudGlhbFNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSB0byB0aGUgbGVmdCBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCA+PSB0aGlzLmZpZWxkWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSB0byB0aGUgcmlnaHQgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvd11bY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcm90YXRhYmxlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIGFsbCB0aGUgdGFibGVyb3dzIGluIGdhbWVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyRmllbGQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXIgZmllbGRcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICAvL3Jlc2V0IHRoZSBjbGFzc2VzXHJcbiAgICAgICAgICAgIHRkc1tjb2xdLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBmaW5kIHRoZSBmdWxscm93cyBvbiB0aGUgZmllbGRcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmZpbmRGdWxsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIGZ1bGwgcm93c1xyXG4gICAgdmFyIGZ1bGwgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGggLSAxOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3ddLmluZGV4T2YoMCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvL3JvdyBpcyBmdWxsXHJcbiAgICAgICAgICAgICAgICBmdWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZ1bGwpIHtcclxuICAgICAgICAgICAgLy9hZGQgdGhlbSB0byB0aGUgYXJyYXkgb3MgZnVsbCByb3dzXHJcbiAgICAgICAgICAgIHRoaXMuZnVsbFJvd3MucHVzaChyb3cpO1xyXG4gICAgICAgICAgICB0aGlzLnJvd0NvdW50ICs9IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yb3dDb3VudCAlIDUgPT09IDAgJiYgdGhpcy5mYWxsU3BlZWQgPiAxNTApIHtcclxuICAgICAgICAgICAgICAgIC8vc3BlZWQgdXAgdGhlIGdhbWVcclxuICAgICAgICAgICAgICAgIHRoaXMuZmFsbFNwZWVkIC09IDM1O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sZXZlbCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdWxsID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGVyYXNlIHRoZSBmdWxsIHJvd3MgZnJvbSBmaWVsZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZXJhc2VGdWxsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZ1bGxSb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgLy9yZW1vdmUgdGhlIGZ1bGwgcm93IGZyb20gZmllbGRcclxuICAgICAgICB0aGlzLmZpZWxkLnNwbGljZSh0aGlzLmZ1bGxSb3dzW2ldLCAxKTtcclxuXHJcbiAgICAgICAgLy9hZGQgYSBuZXcgZW1wdHkgb24gdG9wIG9mIGZpZWxkXHJcbiAgICAgICAgdmFyIG5ld1JvdyA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTtcclxuXHJcbiAgICAgICAgLy9hZGQgaXQgdG8gdGhlIGJlZ2lubmluZyBvZiBhcnJheVxyXG4gICAgICAgIHRoaXMuZmllbGQudW5zaGlmdChuZXdSb3cpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNvdW50IHRoZSBwb2ludHNcclxuICogQHJldHVybnMge251bWJlcn0gLSB0aGUgbmV3IHBvaW50c1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY291bnRSb3dQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vMTAwcCBmb3Igb25lIHJvdywgYWRkIGFkZGl0aW9uYWwgMjAlIHBlciBleHRyYSByb3dcclxuICAgIHJldHVybiB0aGlzLmJhc2VQb2ludHMgKyAoKHRoaXMuZnVsbFJvd3MubGVuZ3RoIC0gMSkgKiB0aGlzLmJhc2VQb2ludHMpICogMS4yO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBnYW1lYm9hcmRcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3ByaW50IHRoZSBjaGF0LXRlbXBsYXRlIHRvIHRoaXMuZWxlbWVudFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10ZXRyaXMtYXBwbGljYXRpb25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICB2YXIgdHI7XHJcbiAgICB2YXIgdGQ7XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xyXG4gICAgICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRyKTtcclxuICAgIH1cclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGluaXRpYWxpemUgdGhlIGZpZWxkLWFycmF5XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pbml0RmllbGQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmllbGQgPSBbXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbiAgICBdO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXRyaXNHYW1lO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNSwgNSwgMF0sXHJcbiAgICAgICAgICAgIFswLCA1LCA1XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNV0sXHJcbiAgICAgICAgICAgIFs1LCA1XSxcclxuICAgICAgICAgICAgWzUsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs1LCA1LCAwXSxcclxuICAgICAgICAgICAgWzAsIDUsIDVdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA1XSxcclxuICAgICAgICAgICAgWzUsIDVdLFxyXG4gICAgICAgICAgICBbNSwgMF1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAwLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTQmxvY2tTaGFwZTtcclxuIl19

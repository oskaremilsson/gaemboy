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

/**
 * Constructor for the chat
 * @param element - the elemnt to print to
 * @param server - the server
 * @param channel - the channel, default empty
 * @param username - username
 * @constructor
 */
function Chat(element, server, channel, username) {
    this.element = element;
    this.server = server;
    this.channel = channel || "";
    this.username = username;
    this.socket = undefined;
    this.key = "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd";
    this.online = false;
    this.messages = [];

    //the timestampoptions to use
    this.timeStampOptions = {
        year: "numeric", month: "numeric",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };
}

/**
 * Function to init the basics
 */
Chat.prototype.init = function() {
    this.print();

    //get the stored messages
    this.readStoredMessages();

    //connect
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

/**
 * Function to print the chat
 */
Chat.prototype.print = function() {
    //print the chat-template to this.element
    var template = document.querySelector("#template-chat-application").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

    //print info
    var info = document.querySelector("#template-window-menu-info").content.cloneNode(true);
    var channelInfo = "";

    //handle the channels
    if (this.channel === "") {
        channelInfo = "Non-specified";
    }
    else {
        channelInfo = this.channel;
    }

    //show info
    var infoNode = document.createTextNode("#" + channelInfo.slice(0, 18) + "/" + this.username.slice(0, 10));
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

/**
 * Function to connect to the server
 */
Chat.prototype.connectToServer = function() {
    //change the classes to show whats happening
    this.element.querySelector(".window-icon").classList.remove("chat-offline");
    this.element.querySelector(".window-icon").classList.add("chat-connecting");

    //start new websocket
    this.socket = new WebSocket("ws://" + this.server, "charcords");

    //add listeners to the socket
    this.socket.addEventListener("open", this.setOnline.bind(this));
    this.socket.addEventListener("error", this.setOffline.bind(this));
};

//function to set chat offline if error
Chat.prototype.setOffline = function() {
    this.element.querySelector(".window-icon").classList.remove("chat-connecting");
    this.element.querySelector(".window-icon").classList.add("chat-offline");
    this.online = false;

    //print message in the chat from "glados" to show that the connection failed
    var data = {
        username: "GlaDos",
        data: "Could not connect to server... You can still read your chat history"
    };
    this.printNewMessage(data);
};

/**
 * Function to set chat online if connected
 */
Chat.prototype.setOnline = function() {
    this.online = true;
    this.element.querySelector(".window-icon").classList.remove("chat-connecting");
    this.element.querySelector(".window-icon").classList.add("chat-online");
};

/**
 * Function to handle the messages from server
 * @param event - the datastring from server
 */
Chat.prototype.newMessageFromServer = function(event) {
    var data = JSON.parse(event.data);
    if (data.type === "message") {
        //add timestamp to data-object
        data.timestamp = new Date().toLocaleDateString("sv-se", this.timeStampOptions);
        if (!data.channel) {
            data.channel = "";
        }

        //check the channel and att the message if its the same
        if (data.channel === this.channel) {
            this.printNewMessage(data);
            this.saveNewMessage(data);
        }
    }
};

/**
 * Function to submit a message
 * @param event - the event from form
 */
Chat.prototype.formSubmit = function(event) {
    if (event) {
        //dont submit the form standard-way
        event.preventDefault();
    }

    if (this.online) {
        //get the input from form
        var input = this.element.querySelector(".chat-inputField").value;

        if (input.length > 1) {
            //the message is at least one char, create object to send
            var msg = {
                type: "message",
                data: input,
                username: this.username,
                channel: this.channel,
                key: this.key
            };

            //send the object to server
            this.socket.send(JSON.stringify(msg));

            //disable the button and reset the form
            this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
            this.element.querySelector("form").reset();
        }
    }
};

/**
 * Function to print message to the window
 * @param data - the data-string to print
 */
Chat.prototype.printNewMessage = function(data) {
    //get the container to check scrolled
    var container = this.element.querySelector(".chat-message-list");
    var scrolled = false;

    //check if the user has scrolled up
    if (container.scrollTop !== (container.scrollHeight - container.offsetHeight)) {
        scrolled = true;
    }

    //get the template for new message and modify it
    var template = document.querySelector("#template-chat-message-line").content.cloneNode(true);
    var usernameNode = document.createTextNode(data.username + ": ");
    var messageNode = this.parseMessageWithLinks(data.data);

    template.querySelector(".chat-message").appendChild(messageNode);
    if (data.timestamp) {
        //add the timestamp as title
        template.querySelector(".chat-message-line").setAttribute("title", data.timestamp);
    }

    if (this.username === data.username) {
        //it's my message - add class to show that
        template.querySelector("li").classList.add("chat-bubble-me");
    }
    else {
        //message isn't mine, show that via class
        template.querySelector("li").classList.add("chat-bubble");
        template.querySelector(".chat-username").appendChild(usernameNode);
    }

    //append the new message
    this.element.querySelector(".chat-message-list ul").appendChild(template);

    //autoscroll to bottom
    this.scrollToBottom(scrolled);
};

/**
 * Function to autoscroll when new message
 * @param scrolled
 */
Chat.prototype.scrollToBottom = function(scrolled) {
    var container = this.element.querySelector(".chat-message-list");
    if (!scrolled) {
        //If user was at bottom, auto-scroll down to the new bottom after new message
        container.scrollTop = container.scrollHeight;
    }
};

/**
 * Function to save the new message to local storage for history
 * @param data
 */
Chat.prototype.saveNewMessage = function(data) {
    var newMsg = {
        username: data.username,
        data: data.data,
        timestamp: data.timestamp
    };

    //add the new message to the array and save it
    this.messages.push(newMsg);
    localStorage.setItem("chat-" + this.channel, JSON.stringify(this.messages));
};

/**
 * Function to read the stored messages from local storage and print them
 */
Chat.prototype.readStoredMessages = function() {
    if (localStorage.getItem("chat-" + this.channel)) {
        var messages = localStorage.getItem("chat-" + this.channel);
        this.messages = JSON.parse(messages);

        //print all the messages from history
        for (var i = 0; i < this.messages.length; i += 1) {
            this.printNewMessage(this.messages[i]);
        }

        //add end-of-history separator
        if (this.messages.length > 0) {
            var separator = document.querySelector("#template-chat-history-separator").content.cloneNode(true);
            this.element.querySelector(".chat-message-list ul").appendChild(separator);

            //scroll to bottom
            var container = this.element.querySelector(".chat-message-list");
            container.scrollTop = container.scrollHeight;
        }
    }
};

/**
 * Function to toggle the focus
 * needed since the window drops focus when form in window is focused
 */
Chat.prototype.toggleFocus = function() {
    this.element.classList.toggle("focused-window");
};

/**
 * Function to check the input in textarea
 * @param event
 */
Chat.prototype.checkInput = function(event) {
    //get the input
    var input = event.target.value;

    //handle that the button should only be clickable if input is one or more chars
    if (input.length > 0) {
        this.element.querySelector(".chat-sendButton").removeAttribute("disabled");
    }
    else {
        this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
    }

    //check if the last char was enter, and submit
    if (input.charCodeAt(input.length - 1) === 10) {
        this.formSubmit();
    }

    if (input.charCodeAt(0) === 10) {
        //first char is enter, reset form and disable send-button
        this.element.querySelector("form").reset();
        this.element.querySelector(".chat-sendButton").setAttribute("disabled", "disabled");
    }
};

/**
 * Function to find and parse links in message to clickable nodes
 * @param text - the message
 * @returns {*} - documentFragment to append as message
 */
Chat.prototype.parseMessageWithLinks = function(text) {
    var frag = document.createDocumentFragment();
    var link;
    var aTag;
    var linkNode;
    var textNode;

    //split message into words
    var words = text.split(" ");

    for (var i = 0; i < words.length; i++) {
        //search for links
        if (words[i].slice(0, 7) === "http://") {
            link = words[i].slice(7);
        }
        else if (words[i].slice(0, 8) === "https://") {
            link = words[i].slice(7);
        }

        if (link) {
            //link found, create a-element
            aTag = document.createElement("a");
            aTag.setAttribute("href", "//" + link);
            aTag.setAttribute("target", "_blank");
            linkNode = document.createTextNode(link);

            aTag.appendChild(linkNode);
            textNode = document.createTextNode(" ");

            frag.appendChild(aTag);
            frag.appendChild(textNode);

            //reset link
            link = undefined;
        }
        else {
            //append the word as it is
            textNode = document.createTextNode(words[i] + " ");
            frag.appendChild(textNode);
        }
    }

    return frag;
};

/**
 * Function to clear the history
 */
Chat.prototype.clearHistory = function() {
    //remove from storage and reset array
    localStorage.removeItem("chat-" + this.channel);
    this.messages = [];

    //remove elements from DOM
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

/**
 * Constructor function for the chat application
 * @param options - the settings-object
 * @constructor
 */
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

/**
 * Function to init the basics
 */
ChatApplication.prototype.init = function() {
    if (localStorage.getItem("username")) {
        this.username = localStorage.getItem("username");
    }

    this.print();

    //add listener to the menu
    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
};

/**
 * Function to print the application
 */
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

/**
 * Function to destroy the application
 */
ChatApplication.prototype.destroy = function() {
    if (this.chat) {
        this.chat.socket.close();
    }

    document.querySelector("#main-frame").removeChild(this.element);
};

/**
 * Function to handle the menu-click
 * @param event
 */
ChatApplication.prototype.menuClicked = function(event) {
    var target;
    if (event.target.tagName.toLowerCase() === "a") {
        //get the target text and make it lower case
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            //make the correct call
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

/**
 * Function to show the settings
 */
ChatApplication.prototype.menuSettings = function() {
    var i;
    var inputList;

    if (!this.settingsOpen) {
        //show the settings
        var template = document.querySelector("#template-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("chat-settings");

        //get the settings
        template = this.addSettings(template);

        inputList =  template.querySelectorAll("input[type='text']");

        for (i = 0; i < inputList.length; i += 1) {
            inputList[i].addEventListener("focus", this.addFocusFunc);
            inputList[i].addEventListener("focusout", this.removeFocusFunc);
        }

        //append it
        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    }
    else {
        //settings showing. close the settings
        var settings = this.element.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

/**
 * Function to add the settings
 * @param element - the element to append to
 * @returns {*} - the element
 */
ChatApplication.prototype.addSettings = function(element) {
    var template = document.querySelector("#template-chat-settings").content.cloneNode(true);

    template.querySelector("input[name='username']").setAttribute("value", this.username);
    template.querySelector("input[name='server']").setAttribute("value", this.server);
    template.querySelector("input[name='channel']").setAttribute("value", this.channel);

    template.querySelector("input[type='button']").addEventListener("click", this.saveSettings.bind(this));

    element.querySelector(".settings").appendChild(template);
    return element;
};

/**
 * Function to save the settings and reopen chat with them
 */
ChatApplication.prototype.saveSettings = function() {
    //close the chat-connection
    if (this.chat) {
        this.chat.socket.close();
        this.chat.online = false;
    }

    var form = this.element.querySelector(".settings-form");

    //get the values from settings-form
    this.username = form.querySelector("input[name='username']").value;
    this.server = form.querySelector("input[name='server']").value;
    this.channel = form.querySelector("input[name='channel']").value;

    //show offline to the user
    this.element.querySelector(".window-icon").classList.remove("chat-online", "chat-connecting", "chat-offline");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    this.clearContent();

    //start the new chat
    if (this.username === "") {
        this.username = "User";
    }

    //start the new chat
    this.chat = new Chat(this.element, this.server, this.channel, this.username);
    this.chat.init();
    this.settingsOpen = false;
    this.setFocus();

    //save the username to storage
    localStorage.setItem("username", this.username);
};

/**
 * Function to maximize the application
 */
ChatApplication.prototype.maximize = function() {
    BasicWindow.prototype.maximize.call(this);

    //scroll to bottom (not working?)
    this.chat.scrollToBottom(false);
};

/**
 * Function to add focus to the window
 */
ChatApplication.prototype.addFocus = function() {
    if (!this.element.classList.contains("focused-window")) {
        this.element.classList.add("focused-window");
    }
};

/**
 * Function to remove focus from window
 */
ChatApplication.prototype.removeFocus = function() {
    if (this.element.classList.contains("focused-window")) {
        this.element.classList.remove("focused-window");
    }
};

/**
 * Function to set focus
 */
ChatApplication.prototype.setFocus = function() {
    this.element.classList.remove("focused-window");
    this.element.focus();
};

module.exports = ChatApplication;

},{"../BasicWindow":1,"./Chat":6}],8:[function(require,module,exports){
"use strict";
var BasicWindow = require("../BasicWindow");
var MemoryGame = require("./MemoryGame");

/**
 * Contructor function for the memory applicationm
 * @param options - the settings
 * @constructor
 */
function MemoryApplication(options) {
    BasicWindow.call(this, options);

    this.settingsOpen = false;
    this.game = undefined;
    this.boardSize = [4, 4];
    this.markedCard = undefined;
}

MemoryApplication.prototype = Object.create(BasicWindow.prototype);
MemoryApplication.prototype.constructor =  MemoryApplication;

/**
 * Function to init the basics
 */
MemoryApplication.prototype.init = function() {
    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));

    //create new game and init it
    this.game = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    this.game.init();
};

/**
 * Function to print the application
 */
MemoryApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("memory-app");

    //add the menu alternatives
    var menu = this.element.querySelector(".window-menu");
    var alt1 = document.querySelector("#template-window-menu-alternative").content.cloneNode(true);
    alt1.querySelector(".menu-alternative").appendChild(document.createTextNode("New Game"));

    var alt2 = document.querySelector("#template-window-menu-alternative").content.cloneNode(true);
    alt2.querySelector(".menu-alternative").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);
};

/**
 * Function to handle the menu-clicked
 * @param event - click-event
 */
MemoryApplication.prototype.menuClicked = function(event) {
    var target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    //check what was clicked
    if (target) {
        switch (target) {
            case "settings": {
                //open the settings
                this.menuSettings();
                break;
            }

            case "new game": {
                if (this.settingsOpen) {
                    //hide the settings
                    this.settingsOpen = false;
                }

                //restart new game
                this.restart();
                break;
            }
        }
    }
};

/**
 * Function to restart the game
 * @param value - the board-size (eg. 4x4)
 */
MemoryApplication.prototype.restart = function(value) {
    //split value to get x/y
    if (value) {
        this.boardSize = value.split("x");
    }

    //find y and x from split
    var y = this.boardSize[1];
    var x = this.boardSize[0];

    //clear the content
    this.clearContent();

    //remove old eventhandlers
    this.game.removeEvents();

    //create new game and init it
    this.game = new MemoryGame(this.element.querySelector(".window-content"), x, y);
    this.game.init();
};

/**
 * Function to show/hide the settings
 */
MemoryApplication.prototype.menuSettings = function() {
    if (!this.settingsOpen) {
        //show the settings
        var template = document.querySelector("#template-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("memory-settings");

        template = this.addSettings(template);
        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    }
    else {
        //hide the settings
        var settings = this.element.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

/**
 * Function to add the settings
 * @param element - the element to print to
 * @returns {*} - the element
 */
MemoryApplication.prototype.addSettings = function(element) {
    var template = document.querySelector("#template-memory-settings").content.cloneNode(true);

    element.querySelector(".settings").appendChild(template);
    element.querySelector("input[type='button']").addEventListener("click", this.saveSettings.bind(this));
    return element;
};

/**
 * Function to save the settings and run new game
 */
MemoryApplication.prototype.saveSettings = function() {
    var value = this.element.querySelector("select[name='board-size']").value;

    //restart with the new settings
    this.restart(value);
    this.settingsOpen = false;
};

/**
 * Function to handle the key input
 * @param key - keycode to handle
 */
MemoryApplication.prototype.keyInput = function(key) {
    if (!this.markedCard) {
        //no card is marked, mark the top left
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
                //enter . turn the marked card
                this.game.turnCard(this.markedCard);
                break;
            }
        }

        this.markedCard.classList.toggle("marked");
    }
};

/**
 * Function to handle if key right pressed
 */
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

/**
 * Function to handle if key left pressed
 */
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

/**
 * Function to handle if key up pressed
 */
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
        rowY = rows.length - 1;
    }

    //find what x-position in the row the marked card is on
    var cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

/**
 * Function to handle if key down pressed
 */
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

/**
 * Constructor function for memory board
 * @param element - the element to print to
 * @param x - the amount of cols
 * @param y - the amount of rows
 * @constructor
 */
function MemoryBoard(element, x, y) {
    this.x = x;
    this.y = y;
    this.element = element;

    //call the printfunction
    this.printCards();
}

/**
 * Function to print the cards
 */
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

/**
 * Constructor for memory card
 * @param id - id of card
 * @param imgNr - image number
 * @constructor
 */
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

/**
 * Constructorfunction for the memorygame
 * @param element - element to print to
 * @param x - amount of cols
 * @param y - amount of rows
 * @constructor
 */
function MemoryGame(element, x, y) {
    this.element = element;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.layout = new MemoryBoard(element, this.x, this.y);
    this.board = [];
    this.visibleCards = [];
    this.turns = 0;
    this.correctCount = 0;
    this.imageList = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
    this.images = this.imageList.slice(0, (this.y * this.x));
    this.clickFunc = this.click.bind(this);

    //start new timer
    this.timer = new Timer();
    this.timer.start();

    this.totalTime = 0;

    //shuffle and add eventlisteners
    this.shuffleImages();
    this.addEvents();
}

/**
 * Init the game
 */
MemoryGame.prototype.init = function() {
    var i = 0;

    //init the empty board-array
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

    //push new cards to the board-array
    for (i = 0; i < this.y; i += 1) {
        for (var j = 0; j < this.x - 1; j += 2) {
            this.board[i][j] = new MemoryCard("" + i + j, this.images.pop());
            this.board[i][j + 1] = new MemoryCard("" + i + (j + 1), this.images.pop());
        }
    }
};

/**
 * Function to shuffle the images-array
 */
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

/**
 * Function to add the events needed
 */
MemoryGame.prototype.addEvents = function() {
    this.element.addEventListener("click", this.clickFunc);
};

/**
 * Function to remove the events
 */
MemoryGame.prototype.removeEvents = function() {
    this.element.removeEventListener("click", this.clickFunc);
};

/**
 * Function to handle the clicks
 * @param event - the click-event
 */
MemoryGame.prototype.click = function(event) {
    this.turnCard(event.target);
};

/**
 * Function to turn the given carde
 * @param element - the card to turn
 */
MemoryGame.prototype.turnCard = function(element) {
    if (this.visibleCards.length < 2 && !element.classList.contains("disable")) {
        if (element.classList.contains("card")) {
            var yx = element.classList[0].split("-")[1];
            var y = yx.charAt(0);
            var x = yx.charAt(1);

            //add classes to show the card
            element.classList.add("img-" + this.board[y][x].imgNr);
            element.classList.add("img");

            this.visibleCards.push(this.board[y][x]);

            //disable the card that got clicked
            this.element.querySelector(".card-" + this.board[y][x].id).classList.add("disable");

            if (this.visibleCards.length === 2) {
                //check fi the pair is the same
                this.checkIfCorrect();
            }
        }
    }
};

/**
 * Function to check if the pair is the same
 */
MemoryGame.prototype.checkIfCorrect = function() {
    this.turns += 1;
    if (this.visibleCards[0].imgNr === this.visibleCards[1].imgNr) {
        //it was the same image, show it to the user
        this.element.querySelector(".card-" + this.visibleCards[0].id).classList.add("right");
        this.element.querySelector(".card-" + this.visibleCards[1].id).classList.add("right");

        //reset the visible-cards array
        this.visibleCards = [];

        this.correctCount += 1;

        if (this.correctCount === (this.x * this.y / 2)) {
            //the game is over since the correctcount is the amount of cards
            this.gameOver();
        }
    }
    else {
        //it was not correct, set the classes
        for (var i = 0; i < this.visibleCards.length; i += 1) {
            this.element.querySelector(".card-" + this.visibleCards[i].id).classList.add("wrong");
            this.element.querySelector(".card-" + this.visibleCards[i].id).classList.remove("disable");
        }

        //turn back the cards
        setTimeout(this.turnBackCards.bind(this), 1000);
    }
};

/**
 * Function to turn back cards when wrong
 */
MemoryGame.prototype.turnBackCards = function() {
    var tempCard;
    for (var i = 0; i < this.visibleCards.length; i += 1) {
        tempCard = this.visibleCards[i];
        this.element.querySelector(".card-" + tempCard.id).classList.remove("wrong", "img", "img-" + tempCard.imgNr);
    }

    //reset the array
    this.visibleCards = [];
};

/**
 * Function to show the game over
 */
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
}

/**
 * Function that starts an interval for the timer
 */
Timer.prototype.start = function() {
    this.startTime = new Date().getTime();
};

/**
 * Function that stops the timer before its over
 * @returns {number}, the difference in seconds
 */
Timer.prototype.stop = function() {
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
        row: -4,
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
        row: -3,
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
        row: -3,
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
        row: -2,
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
        row: -2,
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
        row: -2,
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
 * Function to check if the fallingblock collided at launch
 * @returns {boolean} - collision or not
 */
TetrisGame.prototype.isCollision = function() {
    var collision = false;

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                //check that the shape is not above the field
                if (row + this.fallingBlock.topLeft.row >= 0) {
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
            //check that the shape is not above the field
            if (row + potentialTopLeft.row >= 0) {
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
            //check that the shape is not above the field
            if (row + this.fallingBlock.topLeft.row >= 0) {
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
        row: -2,
        col: 4
    };
}

module.exports = SBlockShape;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5R2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSUJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9KQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0xCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU0Jsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9TcXVhcmVCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVEJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RldHJpc0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9aQmxvY2tTaGFwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciBiYXNpYyB3aW5kb3dcclxuICogQHBhcmFtIG9wdGlvbnMsIG9iamVjdCB3aXRoIHRoZSBzZXR0aW5nc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIEJhc2ljV2luZG93KG9wdGlvbnMpIHtcclxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMueCA9IG9wdGlvbnMueCB8fCAxMDtcclxuICAgIHRoaXMueSA9IG9wdGlvbnMueSB8fCAxMDtcclxuICAgIHRoaXMudGFiSW5kZXggPSBvcHRpb25zLnRhYkluZGV4IHx8IDA7XHJcbiAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCB0aGlzLmlkO1xyXG4gICAgdGhpcy5pY29uID0gb3B0aW9ucy5pY29uIHx8IFwiYnVnX3JlcG9ydFwiO1xyXG4gICAgdGhpcy5tYXhpbWl6YWJsZSA9IG9wdGlvbnMubWF4aW1pemFibGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmtleUFjdGl2YXRlZCA9IG9wdGlvbnMua2V5QWN0aXZhdGVkIHx8IGZhbHNlO1xyXG4gICAgdGhpcy56SW5kZXggPSBvcHRpb25zLnpJbmRleDtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlc3Ryb3kgdGhlIHdpbmRvd1xyXG4gKi9cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByaW50IHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9nZXQgdGhlIHRlbXBsYXRlIGFuZCBtb2RpZnkgaXQgdG8gdGhlIHBhcmFtc1xyXG4gICAgdmFyIHRlbXBsYXRlICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93XCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHRlbXBsYXRlV2luZG93ID0gdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImRpdlwiKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcImlkXCIsIHRoaXMuaWQpO1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnRvcCA9IHRoaXMueSArIFwicHhcIjtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgdGVtcGxhdGVXaW5kb3cuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgdGhpcy50YWJJbmRleCk7XHJcblxyXG4gICAgLy9pbnNlcnQgdGhlIG5ldyB3aW5kb3cgYmVmb3JlIGxhdW5jaGVyIGluIHRoZSBET01cclxuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpO1xyXG4gICAgdmFyIGxhdW5jaGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlclwiKTtcclxuICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBsYXVuY2hlcik7XHJcblxyXG4gICAgLy9zYXZlIHRoZSBlbGVtZW50IHRvIHRoZSBvYmplY3RcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKTtcclxuXHJcbiAgICAvL2FkZCB0aXRsZSBhbmQgaWNvbiB0byB0aGUgd2luZG93XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctdGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50aXRsZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5pY29uKSk7XHJcblxyXG4gICAgLy9hZGQgbWF4aW1pemUtYnV0dG9uXHJcbiAgICBpZiAodGhpcy5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1heGltaXplLWJ1dHRvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB2YXIgd2luZG93QnV0dG9ucyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1idXR0b25zXCIpO1xyXG4gICAgICAgIHZhciByZW1vdmVCdXR0b24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZS1idXR0b25cIik7XHJcbiAgICAgICAgd2luZG93QnV0dG9ucy5pbnNlcnRCZWZvcmUoYnV0dG9uLCByZW1vdmVCdXR0b24pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1pbmltaXplIHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtaW5pbWl6ZWRcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogTWF4aW1pemUgdGhlIHdpbmRvd1xyXG4gKi9cclxuQmFzaWNXaW5kb3cucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcIm1heGltaXplZFwiKTtcclxuXHJcbiAgICB2YXIgaWNvbiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWljb24gaVwiKTtcclxuICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy54ICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJjcm9wX2RpblwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1idXR0b25cIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgXCJNYXhpbWl6ZVwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSBcIjBweFwiO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcclxuICAgICAgICBpY29uLnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcImZpbHRlcl9ub25lXCIpLCBpY29uLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1heGltaXplLWJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBcIlJlc2l6ZVwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5jbGVhckNvbnRlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb250ZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIik7XHJcbiAgICB3aGlsZSAoY29udGVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKGNvbnRlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljV2luZG93O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBMYXVuY2hlciA9IHJlcXVpcmUoXCIuL0xhdW5jaGVyXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgRGVza3RvcCBtb2R1bGVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBEZXNrdG9wKCkge1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cgPSBmYWxzZTtcclxuICAgIHRoaXMubW91c2VNb3ZlRnVuYyA9IHRoaXMubW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm1vdXNlVXBGdW5jID0gdGhpcy5tb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuY2xpY2tYID0gMDtcclxuICAgIHRoaXMuY2xpY2tZID0gMDtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuICAgIHRoaXMuekluZGV4ID0gMDtcclxuICAgIHRoaXMub2Zmc2V0WCA9IDE7XHJcbiAgICB0aGlzLm9mZnNldFkgPSAxO1xyXG4gICAgdGhpcy5sYXVuY2hlciA9IG5ldyBMYXVuY2hlcih0aGlzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgYmFzaWMgZmVhdHVyZXMgb2YgdGhlIGRlc2t0b3BcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubGF1bmNoZXIuaW5pdCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZURvd24uYmluZCh0aGlzKSk7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleURvd24uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHdoYXQgd2lsbCBoYXBwZW4gaWYgbW91c2UgdXBcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlVXAgPSBmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlRnVuYyk7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVVwRnVuYyk7XHJcbiAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJtb3ZpbmdcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHdoYXQgd2lsbCBoYXBwZW4gd2hlbiBtb3VzZSBpcyBkb3duXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG5cclxuICAgIC8vZ2V0IHRoZSBjbGlja2VkLXdpbmRvd3MgXCJtYWluLWRpdlwiXHJcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdCkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1haW4tZnJhbWVcIikpIHtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93XCIpKSB7XHJcbiAgICAgICAgLy9jbGlja2VkIERPTSBpcyBhIHdpbmRvdyAtIGRvIHN0dWZmXHJcbiAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuc3R5bGUuekluZGV4KSAhPT0gdGhpcy56SW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRGb2N1cyhlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIHRoZSBsaXN0ZW5lcnMgdG8gY2hlY2sgZm9yIG1vdmVtZW50IGlmIGNsaWNrIHdlcmUgaW4gdGhlIHdpbmRvdy10b3Agb2Ygd2luZG93XHJcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJ3aW5kb3ctdG9wXCIpKSB7XHJcbiAgICAgICAgICAgIGlmICghZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWF4aW1pemVkXCIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmFjdGl2ZVdpbmRvdy54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5hY3RpdmVXaW5kb3cueTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1vdmluZ1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIG1vdXNlIG1vdmVcclxuICogQHBhcmFtIGV2ZW50XHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIG5ld1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XHJcbiAgICB2YXIgbmV3WSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcbiAgICAvL2NoZWNrIHdoZXJlIHRoZSBuZXcgbWlkZGxlIHNob3VsZCBiZVxyXG4gICAgdmFyIG5ld01pZGRsZVggPSBuZXdYICsgcGFyc2VJbnQodGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5vZmZzZXRXaWR0aCkgLyAyO1xyXG4gICAgdmFyIG5ld01pZGRsZVkgPSBuZXdZICsgcGFyc2VJbnQodGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5vZmZzZXRIZWlnaHQpIC8gMjtcclxuXHJcbiAgICB2YXIgd2luZG93VyA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIHdpbmRvd0ggPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgLy9pZiB0aGUgbW92ZSBpcyBub3Qgb3V0IG9mIGJvdW5kcyB0aGVuIG1vdmUgaXRcclxuICAgIGlmIChuZXdNaWRkbGVYIDwgd2luZG93VyAmJiBuZXdNaWRkbGVYID4gMCAmJiBuZXdNaWRkbGVZIDwgd2luZG93SCAmJiBuZXdZID4gMCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LnggPSBldmVudC5jbGllbnRYIC0gdGhpcy5jbGlja1g7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cueSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWNrWTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwicmVzZXQtd2luZG93XCIpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMuYWN0aXZlV2luZG93LnggKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLmFjdGl2ZVdpbmRvdy55ICsgXCJweFwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBjbGlja3Mgb24gd2luZG93c1xyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLndpbmRvd0J1dHRvbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBhY3Rpb24gPSBldmVudC50YXJnZXQuY2xhc3NMaXN0O1xyXG5cclxuICAgIHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG5cclxuICAgIC8vZ2V0IHRoZSAncGFyZW50JyB3aW5kb3ctZWxlbWVudFxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHdoaWxlICghZWxlbWVudC5wYXJlbnROb2RlLmlkKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB3aGF0IHdpbmRvdyBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgLy9zZXQgZm9jdXMgdG8gdGhlIHdpbmRvd1xyXG4gICAgICAgIHRoaXMuc2V0Rm9jdXModGhpcy53aW5kb3dzW2luZGV4XS5lbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy9jaGVjayB3aGF0IGFjdGlvbiB0byB0YWtlXHJcbiAgICAgICAgaWYgKGFjdGlvbi5jb250YWlucyhcImV4aXQtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vY2xvcyB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VXaW5kb3codGhpcy53aW5kb3dzW2luZGV4XS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGFjdGlvbi5jb250YWlucyhcIm1pbmltaXplLWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL21pbmltaXplIHRoZSBhcHBcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5taW5pbWl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhY3Rpb24uY29udGFpbnMoXCJtYXhpbWl6ZS1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9tYXhpbWl6ZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIGlmICh0aGlzLndpbmRvd3NbaW5kZXhdLm1heGltaXphYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndpbmRvd3NbaW5kZXhdLm1heGltaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xvc2UgYSB3aW5kb3cgYW5kIGRlc3Ryb3kgdGhlIGFwcFxyXG4gKiBAcGFyYW0gaWRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLmNsb3NlV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciByZW1vdmVkID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGggJiYgIXJlbW92ZWQ7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgICAgICB2YXIgY2xpY2tlZFRvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjbGlja2VkVG9vbHRpcC5wYXJlbnROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gd2luZG93LWxpc3QgYW5kIGRlc3Ryb3kgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3NbaV0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLndpbmRvd3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xlYXIgYW5kIHJlc2V0IHRoZSBkZXNrdG9wXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5jbGVhckRlc2t0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgLy9yZW1vdmUgZnJvbSBcInJ1bm5pbmctYXBwc1wiXHJcbiAgICAgICAgdmFyIHdpbmRvd1Rvb2x0aXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW3ZhbHVlPSdpZDpcIiArIHRoaXMud2luZG93c1tpXS5pZCArIFwiJ11cIik7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHdpbmRvd1Rvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICB3aGlsZSAoIWNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNvbnRhaW5lclwiKSkge1xyXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZCh3aW5kb3dUb29sdGlwLnBhcmVudE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMud2luZG93cyA9IFtdO1xyXG4gICAgdGhpcy5zZXJpYWxOdW1iZXIgPSAwO1xyXG4gICAgdGhpcy5vZmZzZXRYID0gMTtcclxuICAgIHRoaXMub2Zmc2V0WSA9IDE7XHJcbiAgICB0aGlzLnpJbmRleCA9IDA7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIGtleSBpcyBwcmVzc2VkXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5pZCA9PT0gdGhpcy5hY3RpdmVXaW5kb3cuaWQpIHtcclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVXaW5kb3cua2V5QWN0aXZhdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmtleUlucHV0KGV2ZW50LmtleUNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgZm9jdXMgdG8gYW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHNldCBmb2N1cyBvblxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUuc2V0Rm9jdXMgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBlbGVtZW50LmZvY3VzKCk7XHJcblxyXG4gICAgLy9maW5kIHRoZSB3aW5kb3cgaW4gd2luZG93LWFycmF5XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLndpbmRvd3NbaV0uaWQgPT09IGVsZW1lbnQuaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVXaW5kb3cgPSB0aGlzLndpbmRvd3NbaV07XHJcbiAgICAgICAgICAgIHRoaXMuekluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy56SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4vQmFzaWNXaW5kb3dcIik7XHJcblxyXG5mdW5jdGlvbiBFeGFtcGxlQXBwbGljYXRpb24oaWQsIHgsIHkpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgaWQsIHgsIHkpO1xyXG59XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIEV4YW1wbGVBcHBsaWNhdGlvbjtcclxuXHJcbi8qKlxyXG4gKiBQcmludCB0aGUgZXhhbXBsZSBhcHBcclxuICovXHJcbkV4YW1wbGVBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpLmNsYXNzTGlzdC5hZGQoXCJleGFtcGxlLWFwcFwiKTtcclxuXHJcbn07XHJcblxyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBjb25zb2xlLmxvZyhrZXkpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeGFtcGxlQXBwbGljYXRpb247XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRXhBID0gcmVxdWlyZShcIi4vRXhhbXBsZUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgTWVtb3J5QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9tZW1vcnkvTWVtb3J5QXBwbGljYXRpb25cIik7XHJcbnZhciBDaGF0QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvblwiKTtcclxudmFyIFRldHJpc0FwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vdGV0cmlzL1RldHJpc0FwcGxpY2F0aW9uXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgbGF1bmNoZXJcclxuICogQHBhcmFtIGRlc2t0b3AsIHRoZSBwYXJlbnQgRGVza3RvcCBvYmplY3RcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBMYXVuY2hlcihkZXNrdG9wKSB7XHJcbiAgICB0aGlzLmRlc2t0b3AgPSBkZXNrdG9wO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgYmFzaWNzXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlUYWc7XHJcbiAgICB2YXIgYXBwTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubGF1bmNoZXIgbGlcIik7XHJcblxyXG4gICAgLy9BZGQgZXZlbnRsaXN0ZW5lcnMgdG8gdGhlIGxhdW5jaGVyLWJ1dHRvbnNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlUYWcgPSBhcHBMaXN0W2ldLnF1ZXJ5U2VsZWN0b3IoXCJpXCIpO1xyXG4gICAgICAgIGFwcExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubGF1bmNoZXJDbGljay5iaW5kKHRoaXMpLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBjbGlja3MgaW4gdGhlIGxhdW5jaGVyXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmxhdW5jaGVyQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgdmFyIGljb247XHJcbiAgICB2YXIgdGl0bGU7XHJcblxyXG4gICAgLy9HZXQgdGhlIGVsZW1lbnQgdGhhdCBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcclxuXHJcbiAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgIC8vZ2V0IHZhbHVlIGZyb20gdGhlIGVsZW1lbnRcclxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIHN3aXRjaFRvID0gdmFsdWUuc3BsaXQoXCI6XCIpO1xyXG5cclxuICAgICAgICAvL2NoZWNrIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgXCJydW5uaW5nLWFwcHNcIi1zZWN0aW9uLlxyXG4gICAgICAgIGlmIChzd2l0Y2hUb1swXSA9PT0gXCJpZFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY2xvc2VcIikpIHtcclxuICAgICAgICAgICAgICAgIC8vY2xvc2UgcHJlc3NlZCwgY2xvc2Ugd2luZG93XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xvc2VXaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9ydW5uaW5nLWFwcHMtdGFiIGNsaWNrZWQsIHN3aXRjaCB0byB0aGF0IGFwcFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1dpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vc3RhcnQgdGhlIGFwcCB0aGF0IGdvdCBjbGlja2VkXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGljb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB0aXRsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLXRpdGxlXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0QXBwbGljYXRpb24odmFsdWUsIGljb24sIHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZ2V0IHdoYXQgZWxlbWVudCBnb3QgY2xpY2tlZCBpbiB0aGUgbGF1bmNoZXJcclxuICogQHBhcmFtIHRhcmdldCAtIHRoZSBldmVudC10YXJnZXQgZnJvbSBjbGlja1xyXG4gKiBAcmV0dXJucyBET00tZWxlbWVudFxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQgPSBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgIHZhciBlbGVtZW50O1xyXG5cclxuICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcclxuICAgICAgICAvL2lzIHRoZSBpLXRhZyBpbiB0aGUgbGlcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc3RhcnQgbmV3IGFwcGxpY2F0aW9uXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHdoYXQgYXBwIHNob3VsZCBiZSBzdGFydGVkXHJcbiAqIEBwYXJhbSBpY29uIC0gd2hhdCBpY29uIHRvIHVzZVxyXG4gKiBAcGFyYW0gdGl0bGUgLSB3aGF0IHRpdGxlIHRvIHVzZVxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLnN0YXJ0QXBwbGljYXRpb24gPSBmdW5jdGlvbih2YWx1ZSwgaWNvbiwgdGl0bGUpIHtcclxuICAgIHZhciBuZXdBcHAgPSBmYWxzZTtcclxuICAgIHZhciBtYXJnaW5YID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFgpO1xyXG4gICAgdmFyIG1hcmdpblkgPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WSk7XHJcblxyXG4gICAgLy9jcmVhdGUgdGhlIHNldHRpbmdzLW9iamVjdFxyXG4gICAgdmFyIGFwcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaWQ6IFwid2luLVwiICsgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlcixcclxuICAgICAgICB4OiBtYXJnaW5YLFxyXG4gICAgICAgIHk6IG1hcmdpblksXHJcbiAgICAgICAgdGFiSW5kZXg6IHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgekluZGV4OiB0aGlzLmRlc2t0b3AuekluZGV4LFxyXG4gICAgICAgIGljb246IGljb24sXHJcbiAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgIG1heGltaXphYmxlOiBmYWxzZSxcclxuICAgICAgICBrZXlBY3RpdmF0ZWQ6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vY2hlY2sgd2hhdCBhcHAgdG8gc3RhcnQgYW5kIHN0YXJ0IGl0LCBhZGQgZXZlbnR1YWxseSBtYXhpbWl6YWJsZSBhbmQga2V5QWN0aXZhdGVkXHJcbiAgICBzd2l0Y2ggKHZhbHVlKSB7XHJcbiAgICAgICAgY2FzZSBcImV4YW1wbGVcIjoge1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIm1lbW9yeVwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9zZXQgc2V0dGluZyB0byBsaXN0ZW4gb24ga2V5c1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLmtleUFjdGl2YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImNoYXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vc2V0IG9wdGlvbiB0byBiZSBhYmxlIHRvIG1heGltaXplIHdpbmRvd1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IENoYXRBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcInRldHJpc1wiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9zZXQgb3B0aW9uIHRvIGxpc3RlbiBvbiBrZXlzXHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMua2V5QWN0aXZhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IFRldHJpc0FwcGxpY2F0aW9uKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwicmVzZXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGRlc2t0b3BcclxuICAgICAgICAgICAgdGhpcy5kZXNrdG9wLmNsZWFyRGVza3RvcCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld0FwcCkge1xyXG4gICAgICAgIC8vYWRkIGxpc3RlbmVyIHRvIHRoZSB3aW5kb3ctYnV0dG9uc1xyXG4gICAgICAgIHZhciBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0FwcC5pZCArIFwiIC53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICBidXR0b25zLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlc2t0b3Aud2luZG93QnV0dG9uQ2xpY2suYmluZCh0aGlzLmRlc2t0b3ApKTtcclxuXHJcbiAgICAgICAgLy9zYXZlIHRoZSBvYmplY3QgdG8gd2luZG93cy1hcnJheVxyXG4gICAgICAgIHRoaXMuZGVza3RvcC53aW5kb3dzLnB1c2gobmV3QXBwKTtcclxuXHJcbiAgICAgICAgLy9hZGQgdG8gdGhlIHJ1bm5pbmctYXBwcy1saXN0XHJcbiAgICAgICAgdGhpcy5hZGRSdW5uaW5nQXBwKHZhbHVlLCBuZXdBcHApO1xyXG5cclxuICAgICAgICAvL2luY3JlYXNlIHRoZSBzZXJpYWxudW1iZXIgYW5kIHN1Y2hcclxuICAgICAgICB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyICs9IDE7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggKz0gMTtcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSArPSAxO1xyXG5cclxuICAgICAgICAvL3NldCBmb2N1cyB0byB0aGUgbmV3IGFwcCBhbmQgY2hlY2sgYm91bmRzXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKG5ld0FwcC5lbGVtZW50KTtcclxuICAgICAgICB0aGlzLmNoZWNrQm91bmRzKG5ld0FwcCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIHRoZSBuZXcgd2luZG93IGlzIG91dCBvZiBib3VuZHNcclxuICogQHBhcmFtIGFwcCAtIHRoZSBhcHAtb2JqZWN0IHRvIGJlIGNoZWNrZWRcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5jaGVja0JvdW5kcyA9IGZ1bmN0aW9uKGFwcCkge1xyXG4gICAgdmFyIHdpbmRvd1cgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciB3aW5kb3dIID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIHZhciBhcHBSaWdodCA9IGFwcC54ICsgcGFyc2VJbnQoYXBwLmVsZW1lbnQub2Zmc2V0V2lkdGgpO1xyXG4gICAgdmFyIGFwcEJvdHRvbSA9IGFwcC55ICsgcGFyc2VJbnQoYXBwLmVsZW1lbnQub2Zmc2V0SGVpZ2h0KTtcclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZSBhcHAtd2luZG93IGlzIG91dCBvZiBib3VuZHMgYW5kIGdldCBpdCBpbnRvIGJvdW5kc1xyXG4gICAgaWYgKGFwcFJpZ2h0ID4gd2luZG93VyB8fCBhcHAueCA8IDApIHtcclxuICAgICAgICAvL3Jlc2V0IHRoZSBvZmZzZXRcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WCA9IDE7XHJcblxyXG4gICAgICAgIC8vc2V0IG5ldyBwb3NpdGlvbnNcclxuICAgICAgICBhcHAueCA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRYKTtcclxuICAgICAgICBhcHAuZWxlbWVudC5zdHlsZS5sZWZ0ID0gYXBwLnggKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChhcHBCb3R0b20gPiB3aW5kb3dIIHx8IGFwcC55IDwgMCkge1xyXG4gICAgICAgIC8vcmVzZXQgdGhlIG9mZnNldFxyXG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRZID0gMTtcclxuXHJcbiAgICAgICAgLy9zZXQgbmV3IHBvc2l0aW9uc1xyXG4gICAgICAgIGFwcC55ID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFkpO1xyXG4gICAgICAgIGFwcC5lbGVtZW50LnN0eWxlLnRvcCA9IGFwcC55ICsgXCJweFwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBmb2N1cyBvbiBjYWxsLCBhbmQgc2hvdyBtaW5pbWl6ZWQgd2luZG93IGFnYWluXHJcbiAqIEBwYXJhbSBpZCAtIHRoZSB3aW5kb3ctaWQgdG8gc2V0IGZvY3VzIG9uXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuc3dpdGNoVG9XaW5kb3cgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgdmFyIHdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBpZCk7XHJcbiAgICBpZiAod2luZG93KSB7XHJcbiAgICAgICAgLy9pZiBtaW5pbWl6ZWQsIHNob3cgaXQgYWdhaW5cclxuICAgICAgICBpZiAod2luZG93LmNsYXNzTGlzdC5jb250YWlucyhcIm1pbmltaXplZFwiKSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vc2V0IGZvY3VzXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNldEZvY3VzKHdpbmRvdyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYWRkIGEgbmV3IGFwcCB0byB0aGUgcnVubmluZy1hcHAtbGlzdFxyXG4gKiBAcGFyYW0gdHlwZSAtIHdoYXQgdHlwZSBpcyB0aGUgYXBwICh3aGF0IGxpc3QgdG8gYWRkIHRvKVxyXG4gKiBAcGFyYW0gYXBwIC0gdGhlIGFwcC1vYmplY3QgdG8gYmUgYWRkZWRcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5hZGRSdW5uaW5nQXBwID0gZnVuY3Rpb24odHlwZSwgYXBwKSB7XHJcbiAgICAvL2dldCB0aGUgdG9vbHRpcC1jb250YWluZXIgZm9yIHRoZSBhcHAgYW5kIGFkZCBpdCB0byB0aGUgbGlzdFxyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaVt2YWx1ZT0nXCIgKyB0eXBlICsgXCInXSAudG9vbHRpcC1jb250YWluZXJcIik7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXRvb2x0aXBcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRvb2x0aXBcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLnRpdGxlICsgXCIoXCIgKyBhcHAuaWQgKyBcIilcIikpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLWNsb3NlXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiaWQ6XCIgKyBhcHAuaWQpO1xyXG5cclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYXVuY2hlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRGVza3RvcCA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BcIik7XHJcblxyXG52YXIgZCA9IG5ldyBEZXNrdG9wKCk7XHJcbmQuaW5pdCgpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgdGhlIGNoYXRcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZWxlbW50IHRvIHByaW50IHRvXHJcbiAqIEBwYXJhbSBzZXJ2ZXIgLSB0aGUgc2VydmVyXHJcbiAqIEBwYXJhbSBjaGFubmVsIC0gdGhlIGNoYW5uZWwsIGRlZmF1bHQgZW1wdHlcclxuICogQHBhcmFtIHVzZXJuYW1lIC0gdXNlcm5hbWVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDaGF0KGVsZW1lbnQsIHNlcnZlciwgY2hhbm5lbCwgdXNlcm5hbWUpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcclxuICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWwgfHwgXCJcIjtcclxuICAgIHRoaXMudXNlcm5hbWUgPSB1c2VybmFtZTtcclxuICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5rZXkgPSBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCI7XHJcbiAgICB0aGlzLm9ubGluZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vdGhlIHRpbWVzdGFtcG9wdGlvbnMgdG8gdXNlXHJcbiAgICB0aGlzLnRpbWVTdGFtcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsIG1vbnRoOiBcIm51bWVyaWNcIixcclxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiLCBob3VyOiBcIjItZGlnaXRcIiwgbWludXRlOiBcIjItZGlnaXRcIlxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGluaXQgdGhlIGJhc2ljc1xyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIC8vZ2V0IHRoZSBzdG9yZWQgbWVzc2FnZXNcclxuICAgIHRoaXMucmVhZFN0b3JlZE1lc3NhZ2VzKCk7XHJcblxyXG4gICAgLy9jb25uZWN0XHJcbiAgICB0aGlzLmNvbm5lY3RUb1NlcnZlcigpO1xyXG5cclxuICAgIC8vYWRkIGxpc3RlbmVyc1xyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5uZXdNZXNzYWdlRnJvbVNlcnZlci5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5mb3JtU3VibWl0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5mb3JtU3VibWl0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLmNoZWNrSW5wdXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGNoYXRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3ByaW50IHRoZSBjaGF0LXRlbXBsYXRlIHRvIHRoaXMuZWxlbWVudFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LWFwcGxpY2F0aW9uXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxuICAgIC8vcHJpbnQgaW5mb1xyXG4gICAgdmFyIGluZm8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWluZm9cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB2YXIgY2hhbm5lbEluZm8gPSBcIlwiO1xyXG5cclxuICAgIC8vaGFuZGxlIHRoZSBjaGFubmVsc1xyXG4gICAgaWYgKHRoaXMuY2hhbm5lbCA9PT0gXCJcIikge1xyXG4gICAgICAgIGNoYW5uZWxJbmZvID0gXCJOb24tc3BlY2lmaWVkXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjaGFubmVsSW5mbyA9IHRoaXMuY2hhbm5lbDtcclxuICAgIH1cclxuXHJcbiAgICAvL3Nob3cgaW5mb1xyXG4gICAgdmFyIGluZm9Ob2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIjXCIgKyBjaGFubmVsSW5mby5zbGljZSgwLCAxOCkgKyBcIi9cIiArIHRoaXMudXNlcm5hbWUuc2xpY2UoMCwgMTApKTtcclxuICAgIGluZm8ucXVlcnlTZWxlY3RvcihcIi5tZW51LWluZm9cIikuYXBwZW5kQ2hpbGQoaW5mb05vZGUpO1xyXG5cclxuICAgIHZhciBtZW51SW5mbyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaW5mb1wiKTtcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICBpZiAobWVudUluZm8pIHtcclxuICAgICAgICBtZW51LnJlcGxhY2VDaGlsZChpbmZvLCBtZW51SW5mbyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBtZW51LmFwcGVuZENoaWxkKGluZm8pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNvbm5lY3QgdG8gdGhlIHNlcnZlclxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdFRvU2VydmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2NoYW5nZSB0aGUgY2xhc3NlcyB0byBzaG93IHdoYXRzIGhhcHBlbmluZ1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWNvbm5lY3RpbmdcIik7XHJcblxyXG4gICAgLy9zdGFydCBuZXcgd2Vic29ja2V0XHJcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL1wiICsgdGhpcy5zZXJ2ZXIsIFwiY2hhcmNvcmRzXCIpO1xyXG5cclxuICAgIC8vYWRkIGxpc3RlbmVycyB0byB0aGUgc29ja2V0XHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCB0aGlzLnNldE9ubGluZS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCB0aGlzLnNldE9mZmxpbmUuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vL2Z1bmN0aW9uIHRvIHNldCBjaGF0IG9mZmxpbmUgaWYgZXJyb3JcclxuQ2hhdC5wcm90b3R5cGUuc2V0T2ZmbGluZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcbiAgICB0aGlzLm9ubGluZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vcHJpbnQgbWVzc2FnZSBpbiB0aGUgY2hhdCBmcm9tIFwiZ2xhZG9zXCIgdG8gc2hvdyB0aGF0IHRoZSBjb25uZWN0aW9uIGZhaWxlZFxyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdXNlcm5hbWU6IFwiR2xhRG9zXCIsXHJcbiAgICAgICAgZGF0YTogXCJDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXIuLi4gWW91IGNhbiBzdGlsbCByZWFkIHlvdXIgY2hhdCBoaXN0b3J5XCJcclxuICAgIH07XHJcbiAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzZXQgY2hhdCBvbmxpbmUgaWYgY29ubmVjdGVkXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5zZXRPbmxpbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub25saW5lID0gdHJ1ZTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWNvbm5lY3RpbmdcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vbmxpbmVcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBtZXNzYWdlcyBmcm9tIHNlcnZlclxyXG4gKiBAcGFyYW0gZXZlbnQgLSB0aGUgZGF0YXN0cmluZyBmcm9tIHNlcnZlclxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUubmV3TWVzc2FnZUZyb21TZXJ2ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcclxuICAgICAgICAvL2FkZCB0aW1lc3RhbXAgdG8gZGF0YS1vYmplY3RcclxuICAgICAgICBkYXRhLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKFwic3Ytc2VcIiwgdGhpcy50aW1lU3RhbXBPcHRpb25zKTtcclxuICAgICAgICBpZiAoIWRhdGEuY2hhbm5lbCkge1xyXG4gICAgICAgICAgICBkYXRhLmNoYW5uZWwgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jaGVjayB0aGUgY2hhbm5lbCBhbmQgYXR0IHRoZSBtZXNzYWdlIGlmIGl0cyB0aGUgc2FtZVxyXG4gICAgICAgIGlmIChkYXRhLmNoYW5uZWwgPT09IHRoaXMuY2hhbm5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZShkYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5zYXZlTmV3TWVzc2FnZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc3VibWl0IGEgbWVzc2FnZVxyXG4gKiBAcGFyYW0gZXZlbnQgLSB0aGUgZXZlbnQgZnJvbSBmb3JtXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5mb3JtU3VibWl0ID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGlmIChldmVudCkge1xyXG4gICAgICAgIC8vZG9udCBzdWJtaXQgdGhlIGZvcm0gc3RhbmRhcmQtd2F5XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5vbmxpbmUpIHtcclxuICAgICAgICAvL2dldCB0aGUgaW5wdXQgZnJvbSBmb3JtXHJcbiAgICAgICAgdmFyIGlucHV0ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1pbnB1dEZpZWxkXCIpLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAvL3RoZSBtZXNzYWdlIGlzIGF0IGxlYXN0IG9uZSBjaGFyLCBjcmVhdGUgb2JqZWN0IHRvIHNlbmRcclxuICAgICAgICAgICAgdmFyIG1zZyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCxcclxuICAgICAgICAgICAgICAgIGtleTogdGhpcy5rZXlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vc2VuZCB0aGUgb2JqZWN0IHRvIHNlcnZlclxyXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1zZykpO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBidXR0b24gYW5kIHJlc2V0IHRoZSBmb3JtXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgbWVzc2FnZSB0byB0aGUgd2luZG93XHJcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEtc3RyaW5nIHRvIHByaW50XHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5wcmludE5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvL2dldCB0aGUgY29udGFpbmVyIHRvIGNoZWNrIHNjcm9sbGVkXHJcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICB2YXIgc2Nyb2xsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZSB1c2VyIGhhcyBzY3JvbGxlZCB1cFxyXG4gICAgaWYgKGNvbnRhaW5lci5zY3JvbGxUb3AgIT09IChjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLm9mZnNldEhlaWdodCkpIHtcclxuICAgICAgICBzY3JvbGxlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy9nZXQgdGhlIHRlbXBsYXRlIGZvciBuZXcgbWVzc2FnZSBhbmQgbW9kaWZ5IGl0XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtbWVzc2FnZS1saW5lXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHVzZXJuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUgKyBcIjogXCIpO1xyXG4gICAgdmFyIG1lc3NhZ2VOb2RlID0gdGhpcy5wYXJzZU1lc3NhZ2VXaXRoTGlua3MoZGF0YS5kYXRhKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZVwiKS5hcHBlbmRDaGlsZChtZXNzYWdlTm9kZSk7XHJcbiAgICBpZiAoZGF0YS50aW1lc3RhbXApIHtcclxuICAgICAgICAvL2FkZCB0aGUgdGltZXN0YW1wIGFzIHRpdGxlXHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGluZVwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBkYXRhLnRpbWVzdGFtcCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMudXNlcm5hbWUgPT09IGRhdGEudXNlcm5hbWUpIHtcclxuICAgICAgICAvL2l0J3MgbXkgbWVzc2FnZSAtIGFkZCBjbGFzcyB0byBzaG93IHRoYXRcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlLW1lXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9tZXNzYWdlIGlzbid0IG1pbmUsIHNob3cgdGhhdCB2aWEgY2xhc3NcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlXCIpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC11c2VybmFtZVwiKS5hcHBlbmRDaGlsZCh1c2VybmFtZU5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXBwZW5kIHRoZSBuZXcgbWVzc2FnZVxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxuICAgIC8vYXV0b3Njcm9sbCB0byBib3R0b21cclxuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oc2Nyb2xsZWQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGF1dG9zY3JvbGwgd2hlbiBuZXcgbWVzc2FnZVxyXG4gKiBAcGFyYW0gc2Nyb2xsZWRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnNjcm9sbFRvQm90dG9tID0gZnVuY3Rpb24oc2Nyb2xsZWQpIHtcclxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGlzdFwiKTtcclxuICAgIGlmICghc2Nyb2xsZWQpIHtcclxuICAgICAgICAvL0lmIHVzZXIgd2FzIGF0IGJvdHRvbSwgYXV0by1zY3JvbGwgZG93biB0byB0aGUgbmV3IGJvdHRvbSBhZnRlciBuZXcgbWVzc2FnZVxyXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIG5ldyBtZXNzYWdlIHRvIGxvY2FsIHN0b3JhZ2UgZm9yIGhpc3RvcnlcclxuICogQHBhcmFtIGRhdGFcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnNhdmVOZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG5ld01zZyA9IHtcclxuICAgICAgICB1c2VybmFtZTogZGF0YS51c2VybmFtZSxcclxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXHJcbiAgICAgICAgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcFxyXG4gICAgfTtcclxuXHJcbiAgICAvL2FkZCB0aGUgbmV3IG1lc3NhZ2UgdG8gdGhlIGFycmF5IGFuZCBzYXZlIGl0XHJcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobmV3TXNnKTtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkodGhpcy5tZXNzYWdlcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlYWQgdGhlIHN0b3JlZCBtZXNzYWdlcyBmcm9tIGxvY2FsIHN0b3JhZ2UgYW5kIHByaW50IHRoZW1cclxuICovXHJcbkNoYXQucHJvdG90eXBlLnJlYWRTdG9yZWRNZXNzYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCkpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBKU09OLnBhcnNlKG1lc3NhZ2VzKTtcclxuXHJcbiAgICAgICAgLy9wcmludCBhbGwgdGhlIG1lc3NhZ2VzIGZyb20gaGlzdG9yeVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tZXNzYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZSh0aGlzLm1lc3NhZ2VzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIGVuZC1vZi1oaXN0b3J5IHNlcGFyYXRvclxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1oaXN0b3J5LXNlcGFyYXRvclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQoc2VwYXJhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIC8vc2Nyb2xsIHRvIGJvdHRvbVxyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byB0b2dnbGUgdGhlIGZvY3VzXHJcbiAqIG5lZWRlZCBzaW5jZSB0aGUgd2luZG93IGRyb3BzIGZvY3VzIHdoZW4gZm9ybSBpbiB3aW5kb3cgaXMgZm9jdXNlZFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUudG9nZ2xlRm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgdGhlIGlucHV0IGluIHRleHRhcmVhXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuY2hlY2tJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAvL2dldCB0aGUgaW5wdXRcclxuICAgIHZhciBpbnB1dCA9IGV2ZW50LnRhcmdldC52YWx1ZTtcclxuXHJcbiAgICAvL2hhbmRsZSB0aGF0IHRoZSBidXR0b24gc2hvdWxkIG9ubHkgYmUgY2xpY2thYmxlIGlmIGlucHV0IGlzIG9uZSBvciBtb3JlIGNoYXJzXHJcbiAgICBpZiAoaW5wdXQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vY2hlY2sgaWYgdGhlIGxhc3QgY2hhciB3YXMgZW50ZXIsIGFuZCBzdWJtaXRcclxuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KGlucHV0Lmxlbmd0aCAtIDEpID09PSAxMCkge1xyXG4gICAgICAgIHRoaXMuZm9ybVN1Ym1pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KDApID09PSAxMCkge1xyXG4gICAgICAgIC8vZmlyc3QgY2hhciBpcyBlbnRlciwgcmVzZXQgZm9ybSBhbmQgZGlzYWJsZSBzZW5kLWJ1dHRvblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGZpbmQgYW5kIHBhcnNlIGxpbmtzIGluIG1lc3NhZ2UgdG8gY2xpY2thYmxlIG5vZGVzXHJcbiAqIEBwYXJhbSB0ZXh0IC0gdGhlIG1lc3NhZ2VcclxuICogQHJldHVybnMgeyp9IC0gZG9jdW1lbnRGcmFnbWVudCB0byBhcHBlbmQgYXMgbWVzc2FnZVxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUucGFyc2VNZXNzYWdlV2l0aExpbmtzID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICB2YXIgbGluaztcclxuICAgIHZhciBhVGFnO1xyXG4gICAgdmFyIGxpbmtOb2RlO1xyXG4gICAgdmFyIHRleHROb2RlO1xyXG5cclxuICAgIC8vc3BsaXQgbWVzc2FnZSBpbnRvIHdvcmRzXHJcbiAgICB2YXIgd29yZHMgPSB0ZXh0LnNwbGl0KFwiIFwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy9zZWFyY2ggZm9yIGxpbmtzXHJcbiAgICAgICAgaWYgKHdvcmRzW2ldLnNsaWNlKDAsIDcpID09PSBcImh0dHA6Ly9cIikge1xyXG4gICAgICAgICAgICBsaW5rID0gd29yZHNbaV0uc2xpY2UoNyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdvcmRzW2ldLnNsaWNlKDAsIDgpID09PSBcImh0dHBzOi8vXCIpIHtcclxuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmspIHtcclxuICAgICAgICAgICAgLy9saW5rIGZvdW5kLCBjcmVhdGUgYS1lbGVtZW50XHJcbiAgICAgICAgICAgIGFUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgICAgICAgICAgYVRhZy5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiLy9cIiArIGxpbmspO1xyXG4gICAgICAgICAgICBhVGFnLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcclxuICAgICAgICAgICAgbGlua05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsaW5rKTtcclxuXHJcbiAgICAgICAgICAgIGFUYWcuYXBwZW5kQ2hpbGQobGlua05vZGUpO1xyXG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiKTtcclxuXHJcbiAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoYVRhZyk7XHJcbiAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xyXG5cclxuICAgICAgICAgICAgLy9yZXNldCBsaW5rXHJcbiAgICAgICAgICAgIGxpbmsgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL2FwcGVuZCB0aGUgd29yZCBhcyBpdCBpc1xyXG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHdvcmRzW2ldICsgXCIgXCIpO1xyXG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHROb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZyYWc7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xlYXIgdGhlIGhpc3RvcnlcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmNsZWFySGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9yZW1vdmUgZnJvbSBzdG9yYWdlIGFuZCByZXNldCBhcnJheVxyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcclxuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHJcbiAgICAvL3JlbW92ZSBlbGVtZW50cyBmcm9tIERPTVxyXG4gICAgdmFyIGxpc3RFbGVtZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKTtcclxuICAgIHdoaWxlIChsaXN0RWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICBsaXN0RWxlbWVudC5yZW1vdmVDaGlsZChsaXN0RWxlbWVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIENoYXQgPSByZXF1aXJlKFwiLi9DaGF0XCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgY2hhdCBhcHBsaWNhdGlvblxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIHRoZSBzZXR0aW5ncy1vYmplY3RcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDaGF0QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuICAgIHRoaXMuY2hhdCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnVzZXJuYW1lID0gXCJcIjtcclxuICAgIHRoaXMuc2VydmVyID0gXCJ2aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIjtcclxuICAgIHRoaXMuY2hhbm5lbCA9IFwiXCI7XHJcblxyXG4gICAgdGhpcy5hZGRGb2N1c0Z1bmMgPSB0aGlzLmFkZEZvY3VzLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnJlbW92ZUZvY3VzRnVuYyA9IHRoaXMucmVtb3ZlRm9jdXMuYmluZCh0aGlzKTtcclxufVxyXG5cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBDaGF0QXBwbGljYXRpb247XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdCB0aGUgYmFzaWNzXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJuYW1lXCIpKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIC8vYWRkIGxpc3RlbmVyIHRvIHRoZSBtZW51XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgYXBwbGljYXRpb25cclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiY2hhdC1hcHBcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG5cclxuICAgIC8vYWRkIHRoZSBtZW51XHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgdmFyIGFsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudDtcclxuICAgIHZhciBhbHQxID0gYWx0LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiQ2xlYXIgSGlzdG9yeVwiKSk7XHJcblxyXG4gICAgdmFyIGFsdDIgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0Mi5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJTZXR0aW5nc1wiKSk7XHJcblxyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0Mik7XHJcblxyXG4gICAgLy9wcmludCB0aGUgc2V0dGluZ3NcclxuICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZGVzdHJveSB0aGUgYXBwbGljYXRpb25cclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5zb2NrZXQuY2xvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIG1lbnUtY2xpY2tcclxuICogQHBhcmFtIGV2ZW50XHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB0YXJnZXQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcclxuICAgICAgICAvL2dldCB0aGUgdGFyZ2V0IHRleHQgYW5kIG1ha2UgaXQgbG93ZXIgY2FzZVxyXG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xyXG4gICAgICAgICAgICAvL21ha2UgdGhlIGNvcnJlY3QgY2FsbFxyXG4gICAgICAgICAgICBjYXNlIFwic2V0dGluZ3NcIjoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwiY2xlYXIgaGlzdG9yeVwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGF0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGF0LmNsZWFySGlzdG9yeSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNob3cgdGhlIHNldHRpbmdzXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgaW5wdXRMaXN0O1xyXG5cclxuICAgIGlmICghdGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICAvL3Nob3cgdGhlIHNldHRpbmdzXHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LXNldHRpbmdzXCIpO1xyXG5cclxuICAgICAgICAvL2dldCB0aGUgc2V0dGluZ3NcclxuICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuYWRkU2V0dGluZ3ModGVtcGxhdGUpO1xyXG5cclxuICAgICAgICBpbnB1dExpc3QgPSAgdGVtcGxhdGUucXVlcnlTZWxlY3RvckFsbChcImlucHV0W3R5cGU9J3RleHQnXVwiKTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGlucHV0TGlzdC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBpbnB1dExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMuYWRkRm9jdXNGdW5jKTtcclxuICAgICAgICAgICAgaW5wdXRMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c291dFwiLCB0aGlzLnJlbW92ZUZvY3VzRnVuYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FwcGVuZCBpdFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3NldHRpbmdzIHNob3dpbmcuIGNsb3NlIHRoZSBzZXR0aW5nc1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYWRkIHRoZSBzZXR0aW5nc1xyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIGFwcGVuZCB0b1xyXG4gKiBAcmV0dXJucyB7Kn0gLSB0aGUgZWxlbWVudFxyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRTZXR0aW5ncyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0ndXNlcm5hbWUnXVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCB0aGlzLnVzZXJuYW1lKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdzZXJ2ZXInXVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCB0aGlzLnNlcnZlcik7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nY2hhbm5lbCddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMuY2hhbm5lbCk7XHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9J2J1dHRvbiddXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNhdmVTZXR0aW5ncy5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2F2ZSB0aGUgc2V0dGluZ3MgYW5kIHJlb3BlbiBjaGF0IHdpdGggdGhlbVxyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5zYXZlU2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xvc2UgdGhlIGNoYXQtY29ubmVjdGlvblxyXG4gICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgIHRoaXMuY2hhdC5zb2NrZXQuY2xvc2UoKTtcclxuICAgICAgICB0aGlzLmNoYXQub25saW5lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZvcm0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy1mb3JtXCIpO1xyXG5cclxuICAgIC8vZ2V0IHRoZSB2YWx1ZXMgZnJvbSBzZXR0aW5ncy1mb3JtXHJcbiAgICB0aGlzLnVzZXJuYW1lID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0ndXNlcm5hbWUnXVwiKS52YWx1ZTtcclxuICAgIHRoaXMuc2VydmVyID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nc2VydmVyJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdjaGFubmVsJ11cIikudmFsdWU7XHJcblxyXG4gICAgLy9zaG93IG9mZmxpbmUgdG8gdGhlIHVzZXJcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LW9ubGluZVwiLCBcImNoYXQtY29ubmVjdGluZ1wiLCBcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcblxyXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcclxuXHJcbiAgICAvL3N0YXJ0IHRoZSBuZXcgY2hhdFxyXG4gICAgaWYgKHRoaXMudXNlcm5hbWUgPT09IFwiXCIpIHtcclxuICAgICAgICB0aGlzLnVzZXJuYW1lID0gXCJVc2VyXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy9zdGFydCB0aGUgbmV3IGNoYXRcclxuICAgIHRoaXMuY2hhdCA9IG5ldyBDaGF0KHRoaXMuZWxlbWVudCwgdGhpcy5zZXJ2ZXIsIHRoaXMuY2hhbm5lbCwgdGhpcy51c2VybmFtZSk7XHJcbiAgICB0aGlzLmNoYXQuaW5pdCgpO1xyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuc2V0Rm9jdXMoKTtcclxuXHJcbiAgICAvL3NhdmUgdGhlIHVzZXJuYW1lIHRvIHN0b3JhZ2VcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlcm5hbWVcIiwgdGhpcy51c2VybmFtZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gbWF4aW1pemUgdGhlIGFwcGxpY2F0aW9uXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLm1heGltaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUubWF4aW1pemUuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvL3Njcm9sbCB0byBib3R0b20gKG5vdCB3b3JraW5nPylcclxuICAgIHRoaXMuY2hhdC5zY3JvbGxUb0JvdHRvbShmYWxzZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYWRkIGZvY3VzIHRvIHRoZSB3aW5kb3dcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkRm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImZvY3VzZWQtd2luZG93XCIpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW1vdmUgZm9jdXMgZnJvbSB3aW5kb3dcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUucmVtb3ZlRm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZm9jdXNlZC13aW5kb3dcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNldCBmb2N1c1xyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5zZXRGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxuICAgIHRoaXMuZWxlbWVudC5mb2N1cygpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGF0QXBwbGljYXRpb247XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBNZW1vcnlHYW1lID0gcmVxdWlyZShcIi4vTWVtb3J5R2FtZVwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb250cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbWVtb3J5IGFwcGxpY2F0aW9ubVxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIHRoZSBzZXR0aW5nc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIE1lbW9yeUFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIHRoaXMuZ2FtZSA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuYm9hcmRTaXplID0gWzQsIDRdO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBNZW1vcnlBcHBsaWNhdGlvbjtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBpbml0IHRoZSBiYXNpY3NcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy9jcmVhdGUgbmV3IGdhbWUgYW5kIGluaXQgaXRcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCA0LCA0KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGFwcGxpY2F0aW9uXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktYXBwXCIpO1xyXG5cclxuICAgIC8vYWRkIHRoZSBtZW51IGFsdGVybmF0aXZlc1xyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIHZhciBhbHQxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDEucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmV3IEdhbWVcIikpO1xyXG5cclxuICAgIHZhciBhbHQyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDIucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiU2V0dGluZ3NcIikpO1xyXG5cclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0MSk7XHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgbWVudS1jbGlja2VkXHJcbiAqIEBwYXJhbSBldmVudCAtIGNsaWNrLWV2ZW50XHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudUNsaWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImFcIikge1xyXG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vY2hlY2sgd2hhdCB3YXMgY2xpY2tlZFxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICAvL29wZW4gdGhlIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJuZXcgZ2FtZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3Jlc3RhcnQgbmV3IGdhbWVcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVzdGFydCB0aGUgZ2FtZVxyXG4gKiBAcGFyYW0gdmFsdWUgLSB0aGUgYm9hcmQtc2l6ZSAoZWcuIDR4NClcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIC8vc3BsaXQgdmFsdWUgdG8gZ2V0IHgveVxyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5ib2FyZFNpemUgPSB2YWx1ZS5zcGxpdChcInhcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9maW5kIHkgYW5kIHggZnJvbSBzcGxpdFxyXG4gICAgdmFyIHkgPSB0aGlzLmJvYXJkU2l6ZVsxXTtcclxuICAgIHZhciB4ID0gdGhpcy5ib2FyZFNpemVbMF07XHJcblxyXG4gICAgLy9jbGVhciB0aGUgY29udGVudFxyXG4gICAgdGhpcy5jbGVhckNvbnRlbnQoKTtcclxuXHJcbiAgICAvL3JlbW92ZSBvbGQgZXZlbnRoYW5kbGVyc1xyXG4gICAgdGhpcy5nYW1lLnJlbW92ZUV2ZW50cygpO1xyXG5cclxuICAgIC8vY3JlYXRlIG5ldyBnYW1lIGFuZCBpbml0IGl0XHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgeCwgeSk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNob3cvaGlkZSB0aGUgc2V0dGluZ3NcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5zZXR0aW5nc09wZW4pIHtcclxuICAgICAgICAvL3Nob3cgdGhlIHNldHRpbmdzXHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmNsYXNzTGlzdC5hZGQoXCJtZW1vcnktc2V0dGluZ3NcIik7XHJcblxyXG4gICAgICAgIHRlbXBsYXRlID0gdGhpcy5hZGRTZXR0aW5ncyh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vaGlkZSB0aGUgc2V0dGluZ3NcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy13cmFwcGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLnJlbW92ZUNoaWxkKHNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCB0aGUgc2V0dGluZ3NcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byBwcmludCB0b1xyXG4gKiBAcmV0dXJucyB7Kn0gLSB0aGUgZWxlbWVudFxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tZW1vcnktc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9J2J1dHRvbiddXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNhdmVTZXR0aW5ncy5iaW5kKHRoaXMpKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIHNldHRpbmdzIGFuZCBydW4gbmV3IGdhbWVcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5zYXZlU2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB2YWx1ZSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwic2VsZWN0W25hbWU9J2JvYXJkLXNpemUnXVwiKS52YWx1ZTtcclxuXHJcbiAgICAvL3Jlc3RhcnQgd2l0aCB0aGUgbmV3IHNldHRpbmdzXHJcbiAgICB0aGlzLnJlc3RhcnQodmFsdWUpO1xyXG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGtleSBpbnB1dFxyXG4gKiBAcGFyYW0ga2V5IC0ga2V5Y29kZSB0byBoYW5kbGVcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgaWYgKCF0aGlzLm1hcmtlZENhcmQpIHtcclxuICAgICAgICAvL25vIGNhcmQgaXMgbWFya2VkLCBtYXJrIHRoZSB0b3AgbGVmdFxyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmRcIik7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdC5hZGQoXCJtYXJrZWRcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL3Rvb2dsZSB0aGUgbWFya2VkQ2FyZCBiZWZvcmUgY2hhbmdpbmcgbWFya2VkQ2FyZFxyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QudG9nZ2xlKFwibWFya2VkXCIpO1xyXG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgICAgIGNhc2UgMzk6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5UmlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIDM3OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleUxlZnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIDM4OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVVwKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSA0MDoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlEb3duKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSAxMzoge1xyXG4gICAgICAgICAgICAgICAgLy9lbnRlciAuIHR1cm4gdGhlIG1hcmtlZCBjYXJkXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUudHVybkNhcmQodGhpcy5tYXJrZWRDYXJkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgaWYga2V5IHJpZ2h0IHByZXNzZWRcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlSaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIG5leHQgY2FyZFxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL3Jlc3RhcnQgZnJvbSB0b3BcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIGtleSBsZWZ0IHByZXNzZWRcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgcHJldmlvdXMgY2FyZFxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL3Jlc3RhcnQgZnJvbSBib3R0b20gcmlnaHRcclxuICAgICAgICAgICAgdmFyIHJvd3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yb3dcIik7XHJcbiAgICAgICAgICAgIHZhciBsYXN0Um93ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSBsYXN0Um93Lmxhc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiBrZXkgdXAgcHJlc3NlZFxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcclxuICAgIHZhciByb3c7XHJcbiAgICB2YXIgcm93WTtcclxuXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHZhciBpZCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTIpO1xyXG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpIC0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vYmVnaW4gZnJvbSBib3R0b21cclxuICAgICAgICB2YXIgcm93cyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJvd1wiKTtcclxuICAgICAgICByb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgcm93WSA9IHJvd3MubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgICAvL2ZpbmQgd2hhdCB4LXBvc2l0aW9uIGluIHRoZSByb3cgdGhlIG1hcmtlZCBjYXJkIGlzIG9uXHJcbiAgICB2YXIgY2FyZFggPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0xKTtcclxuICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyByb3dZICsgY2FyZFgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiBrZXkgZG93biBwcmVzc2VkXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIG5leHQgcm93IGFuZCBjYXJkXHJcbiAgICB2YXIgcm93WTtcclxuXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdmFyIGlkID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMik7XHJcbiAgICAgICAgcm93WSA9IHBhcnNlSW50KGlkLmNoYXJBdCgwKSkgKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcm93WSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy9maW5kIHdoYXQgeC1wb3NpdGlvbiBpbiB0aGUgcm93IHRoZSBtYXJrZWQgY2FyZCBpcyBvblxyXG4gICAgdmFyIGNhcmRYID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMSk7XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgcm93WSArIGNhcmRYKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5QXBwbGljYXRpb247XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciBtZW1vcnkgYm9hcmRcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byBwcmludCB0b1xyXG4gKiBAcGFyYW0geCAtIHRoZSBhbW91bnQgb2YgY29sc1xyXG4gKiBAcGFyYW0geSAtIHRoZSBhbW91bnQgb2Ygcm93c1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIE1lbW9yeUJvYXJkKGVsZW1lbnQsIHgsIHkpIHtcclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHJcbiAgICAvL2NhbGwgdGhlIHByaW50ZnVuY3Rpb25cclxuICAgIHRoaXMucHJpbnRDYXJkcygpO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGNhcmRzXHJcbiAqL1xyXG5NZW1vcnlCb2FyZC5wcm90b3R5cGUucHJpbnRDYXJkcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcblxyXG4gICAgdmFyIHJvd0RpdjtcclxuICAgIHZhciBjYXJkRGl2O1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpXHJcbiAgICB7XHJcbiAgICAgICAgcm93RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICByb3dEaXYuY2xhc3NMaXN0LmFkZChcInJvd1wiKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLng7IGogKz0gMSkge1xyXG4gICAgICAgICAgICBjYXJkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICAgICAgY2FyZERpdi5jbGFzc0xpc3QuYWRkKFwiY2FyZC1cIiArIGkgKyBqLCBcImNhcmRcIik7XHJcbiAgICAgICAgICAgIHJvd0Rpdi5hcHBlbmRDaGlsZChjYXJkRGl2KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQocm93RGl2KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZnJhZyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUJvYXJkO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgbWVtb3J5IGNhcmRcclxuICogQHBhcmFtIGlkIC0gaWQgb2YgY2FyZFxyXG4gKiBAcGFyYW0gaW1nTnIgLSBpbWFnZSBudW1iZXJcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBNZW1vcnlDYXJkKGlkLCBpbWdOcikge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5pbWdOciA9IGltZ05yO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUNhcmQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE1lbW9yeUJvYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Qm9hcmRcIik7XHJcbnZhciBNZW1vcnlDYXJkID0gcmVxdWlyZShcIi4vTWVtb3J5Q2FyZFwiKTtcclxudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3JmdW5jdGlvbiBmb3IgdGhlIG1lbW9yeWdhbWVcclxuICogQHBhcmFtIGVsZW1lbnQgLSBlbGVtZW50IHRvIHByaW50IHRvXHJcbiAqIEBwYXJhbSB4IC0gYW1vdW50IG9mIGNvbHNcclxuICogQHBhcmFtIHkgLSBhbW91bnQgb2Ygcm93c1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIE1lbW9yeUdhbWUoZWxlbWVudCwgeCwgeSkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMueCA9IHBhcnNlSW50KHgpO1xyXG4gICAgdGhpcy55ID0gcGFyc2VJbnQoeSk7XHJcbiAgICB0aGlzLmxheW91dCA9IG5ldyBNZW1vcnlCb2FyZChlbGVtZW50LCB0aGlzLngsIHRoaXMueSk7XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG4gICAgdGhpcy50dXJucyA9IDA7XHJcbiAgICB0aGlzLmNvcnJlY3RDb3VudCA9IDA7XHJcbiAgICB0aGlzLmltYWdlTGlzdCA9IFswLCAwLCAxLCAxLCAyLCAyLCAzLCAzLCA0LCA0LCA1LCA1LCA2LCA2LCA3LCA3XTtcclxuICAgIHRoaXMuaW1hZ2VzID0gdGhpcy5pbWFnZUxpc3Quc2xpY2UoMCwgKHRoaXMueSAqIHRoaXMueCkpO1xyXG4gICAgdGhpcy5jbGlja0Z1bmMgPSB0aGlzLmNsaWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy9zdGFydCBuZXcgdGltZXJcclxuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoKTtcclxuICAgIHRoaXMudGltZXIuc3RhcnQoKTtcclxuXHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XHJcblxyXG4gICAgLy9zaHVmZmxlIGFuZCBhZGQgZXZlbnRsaXN0ZW5lcnNcclxuICAgIHRoaXMuc2h1ZmZsZUltYWdlcygpO1xyXG4gICAgdGhpcy5hZGRFdmVudHMoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluaXQgdGhlIGdhbWVcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICAvL2luaXQgdGhlIGVtcHR5IGJvYXJkLWFycmF5XHJcbiAgICB0aGlzLmJvYXJkID0gW107XHJcbiAgICBpZiAodGhpcy54ID4gdGhpcy55KSB7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMueDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkodGhpcy55KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgQXJyYXkodGhpcy54KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcblxyXG4gICAgLy9wdXNoIG5ldyBjYXJkcyB0byB0aGUgYm9hcmQtYXJyYXlcclxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy54IC0gMTsgaiArPSAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1bal0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIGosIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqICsgMV0gPSBuZXcgTWVtb3J5Q2FyZChcIlwiICsgaSArIChqICsgMSksIHRoaXMuaW1hZ2VzLnBvcCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2h1ZmZsZSB0aGUgaW1hZ2VzLWFycmF5XHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5zaHVmZmxlSW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcDtcclxuICAgIHZhciByYW5kO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmltYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRlbXAgPSB0aGlzLmltYWdlc1tpXTtcclxuICAgICAgICByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5pbWFnZXMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLmltYWdlc1tpXSA9IHRoaXMuaW1hZ2VzW3JhbmRdO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzW3JhbmRdID0gdGVtcDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBhZGQgdGhlIGV2ZW50cyBuZWVkZWRcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrRnVuYyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBldmVudHNcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLnJlbW92ZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrRnVuYyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBjbGlja3NcclxuICogQHBhcmFtIGV2ZW50IC0gdGhlIGNsaWNrLWV2ZW50XHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB0aGlzLnR1cm5DYXJkKGV2ZW50LnRhcmdldCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gdHVybiB0aGUgZ2l2ZW4gY2FyZGVcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgY2FyZCB0byB0dXJuXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS50dXJuQ2FyZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGlmICh0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPCAyICYmICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVcIikpIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJjYXJkXCIpKSB7XHJcbiAgICAgICAgICAgIHZhciB5eCA9IGVsZW1lbnQuY2xhc3NMaXN0WzBdLnNwbGl0KFwiLVwiKVsxXTtcclxuICAgICAgICAgICAgdmFyIHkgPSB5eC5jaGFyQXQoMCk7XHJcbiAgICAgICAgICAgIHZhciB4ID0geXguY2hhckF0KDEpO1xyXG5cclxuICAgICAgICAgICAgLy9hZGQgY2xhc3NlcyB0byBzaG93IHRoZSBjYXJkXHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImltZy1cIiArIHRoaXMuYm9hcmRbeV1beF0uaW1nTnIpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbWdcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDYXJkcy5wdXNoKHRoaXMuYm9hcmRbeV1beF0pO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBjYXJkIHRoYXQgZ290IGNsaWNrZWRcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMuYm9hcmRbeV1beF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgLy9jaGVjayBmaSB0aGUgcGFpciBpcyB0aGUgc2FtZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0lmQ29ycmVjdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBwYWlyIGlzIHRoZSBzYW1lXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5jaGVja0lmQ29ycmVjdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50dXJucyArPSAxO1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzWzBdLmltZ05yID09PSB0aGlzLnZpc2libGVDYXJkc1sxXS5pbWdOcikge1xyXG4gICAgICAgIC8vaXQgd2FzIHRoZSBzYW1lIGltYWdlLCBzaG93IGl0IHRvIHRoZSB1c2VyXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzWzBdLmlkKS5jbGFzc0xpc3QuYWRkKFwicmlnaHRcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzWzFdLmlkKS5jbGFzc0xpc3QuYWRkKFwicmlnaHRcIik7XHJcblxyXG4gICAgICAgIC8vcmVzZXQgdGhlIHZpc2libGUtY2FyZHMgYXJyYXlcclxuICAgICAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNvcnJlY3RDb3VudCArPSAxO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3JyZWN0Q291bnQgPT09ICh0aGlzLnggKiB0aGlzLnkgLyAyKSkge1xyXG4gICAgICAgICAgICAvL3RoZSBnYW1lIGlzIG92ZXIgc2luY2UgdGhlIGNvcnJlY3Rjb3VudCBpcyB0aGUgYW1vdW50IG9mIGNhcmRzXHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2l0IHdhcyBub3QgY29ycmVjdCwgc2V0IHRoZSBjbGFzc2VzXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbaV0uaWQpLmNsYXNzTGlzdC5hZGQoXCJ3cm9uZ1wiKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdHVybiBiYWNrIHRoZSBjYXJkc1xyXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy50dXJuQmFja0NhcmRzLmJpbmQodGhpcyksIDEwMDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHR1cm4gYmFjayBjYXJkcyB3aGVuIHdyb25nXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS50dXJuQmFja0NhcmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGVtcENhcmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGVtcENhcmQgPSB0aGlzLnZpc2libGVDYXJkc1tpXTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGVtcENhcmQuaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJ3cm9uZ1wiLCBcImltZ1wiLCBcImltZy1cIiArIHRlbXBDYXJkLmltZ05yKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3Jlc2V0IHRoZSBhcnJheVxyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSBnYW1lIG92ZXJcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tZW1vcnktZ2FtZW92ZXJcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10dXJuc1wiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnR1cm5zKSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeS10aW1lXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudG90YWxUaW1lKSk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5R2FtZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogVGltZXIgY29uc3RydWN0b3JcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUaW1lcigpIHtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdGFydHMgYW4gaW50ZXJ2YWwgZm9yIHRoZSB0aW1lclxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RvcHMgdGhlIHRpbWVyIGJlZm9yZSBpdHMgb3ZlclxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSwgdGhlIGRpZmZlcmVuY2UgaW4gc2Vjb25kc1xyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICByZXR1cm4gKG5vdyAtIHRoaXMuc3RhcnRUaW1lKSAvIDEwMDA7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdyB0aGUgdGltZXIgYXQgdGhlIGdpdmVuIGVsZW1lbnRcclxuICogQHBhcmFtIGRpZmZ7TnVtYmVyfSB0aGUgdGltZSB0byBiZSBwcmludGVkXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbihkaWZmKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50Lmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZiksIHRoaXMuZWxlbWVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIElCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzYsIDYsIDYsIDZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNiwgNiwgNiwgNl1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtNCxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSUJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gSkJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAxXSxcclxuICAgICAgICAgICAgWzAsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDAsIDBdLFxyXG4gICAgICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDFdLFxyXG4gICAgICAgICAgICBbMSwgMF0sXHJcbiAgICAgICAgICAgIFsxLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMSwgMV0sXHJcbiAgICAgICAgICAgIFswLCAwLCAxXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0zLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBMQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzIsIDBdLFxyXG4gICAgICAgICAgICBbMiwgMF0sXHJcbiAgICAgICAgICAgIFsyLCAyXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMiwgMCwgMF0sXHJcbiAgICAgICAgICAgIFsyLCAyLCAyXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMiwgMl0sXHJcbiAgICAgICAgICAgIFswLCAyXSxcclxuICAgICAgICAgICAgWzAsIDJdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsyLCAyLCAyXSxcclxuICAgICAgICAgICAgWzIsIDAsIDBdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTMsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNCwgNF0sXHJcbiAgICAgICAgICAgIFs0LCA0LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNCwgMF0sXHJcbiAgICAgICAgICAgIFs0LCA0XSxcclxuICAgICAgICAgICAgWzAsIDRdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA0LCA0XSxcclxuICAgICAgICAgICAgWzQsIDQsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs0LCAwXSxcclxuICAgICAgICAgICAgWzQsIDRdLFxyXG4gICAgICAgICAgICBbMCwgNF1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU0Jsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gU3F1YXJlQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3F1YXJlQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDMsIDBdLFxyXG4gICAgICAgICAgICBbMywgMywgM11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDBdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFszLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMywgMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgM10sXHJcbiAgICAgICAgICAgIFszLCAzXSxcclxuICAgICAgICAgICAgWzAsIDNdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4uL0Jhc2ljV2luZG93XCIpO1xyXG52YXIgVGV0cmlzR2FtZSA9IHJlcXVpcmUoXCIuL1RldHJpc0dhbWVcIik7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSB0ZXRyaXMtYXBwXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gdGhlIHNldHRpbmdzLW9iamVjdFxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRldHJpc0FwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5nYW1lID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBUZXRyaXNBcHBsaWNhdGlvbjtcclxuXHJcbi8qKlxyXG4gKiBJbml0IHRoZSBiYXNpY3NcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgLy9jcmVhdGUgbmV3IGdhbWVcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBUZXRyaXNHYW1lKHRoaXMuZWxlbWVudCk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG5cclxuICAgIC8vYWRkIGV2ZW50bGlzdGVuZXIgZm9yIHRoZSBtZW51XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgYXBwXHJcbiAqL1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtYXBwXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpXCIpLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtaWNvblwiKTtcclxuXHJcbiAgICAvL2FkZCB0aGUgbWVudVxyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIHZhciBhbHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQ7XHJcbiAgICB2YXIgYWx0MSA9IGFsdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5ldyBHYW1lXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgbWVudS1jbGlja3NcclxuICogQHBhcmFtIGV2ZW50IC0gY2xpY2stZXZlbnRcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJuZXcgZ2FtZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBrZXktaW5wdXRzXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUga2V5LWNvZGVcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgLy9JZiBnYW1lIGlzIFwiYWxpdmVcIiBhbmQgbm90IHBhdXNlZCwgY2FsbCB0aGUgY29ycmVjdCBmdW5jdGlvbnMgaW4gZ2FtZVxyXG4gICAgaWYgKHRoaXMuZ2FtZS5hbGl2ZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5nYW1lLnBhdXNlZCkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAzNykge1xyXG4gICAgICAgICAgICAgICAgLy9sZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAzOSkge1xyXG4gICAgICAgICAgICAgICAgLy9yaWdodFxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLm1vdmVGYWxsaW5nQmxvY2soMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAzOCkge1xyXG4gICAgICAgICAgICAgICAgLy91cFxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJvdGF0ZUZhbGxpbmdCbG9jaygxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IDQwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2Rvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUuZmFsbEJsb2NrVG9Cb3R0b20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChrZXkgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAvL2VudGVyOiBwbGF5L3BhdXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUucGF1c2VHYW1lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vdGhlIGdhbWUgaXMgcGF1c2VkIHJlc3VtZSBnYW1lIGlmIGVudGVyXHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUucmVzdW1lR2FtZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9nYW1lIGlzIG5vdCBydW5uaW5nLCBzdGFydCBvbiBlbnRlclxyXG4gICAgICAgIGlmIChrZXkgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGFydCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBkZXN0cm95IHRoZSBhcHBcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5nYW1lLmZhbGxpbmdCbG9ja0ludGVydmFsKSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5nYW1lLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV0cmlzQXBwbGljYXRpb247XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgSkJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9KQmxvY2tTaGFwZVwiKTtcclxudmFyIExCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vTEJsb2NrU2hhcGVcIik7XHJcbnZhciBTQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1NCbG9ja1NoYXBlXCIpO1xyXG52YXIgWkJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9aQmxvY2tTaGFwZVwiKTtcclxudmFyIElCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vSUJsb2NrU2hhcGVcIik7XHJcbnZhciBTcXVhcmVCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vU3F1YXJlQmxvY2tTaGFwZVwiKTtcclxudmFyIFRCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vVEJsb2NrU2hhcGVcIik7XHJcbi8qKlxyXG4gKiBUbyBjcmVhdGUgdGhpcyBtb2R1bGUgSSBoYXZlIHJlYWQgdGhlIGZvbGxvd2luZyBndWlkZTpcclxuICogaHR0cDovL2dhbWVkZXZlbG9wbWVudC50dXRzcGx1cy5jb20vdHV0b3JpYWxzL2ltcGxlbWVudGluZy10ZXRyaXMtY29sbGlzaW9uLWRldGVjdGlvbi0tZ2FtZWRldi04NTJcclxuICovXHJcblxyXG4vKipcclxuICogQ29udHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHRldHJpcyBnYW1lXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGRvbS1lbGVtZW50IHRvIGJlIHByaW50ZWQgdG9cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUZXRyaXNHYW1lKGVsZW1lbnQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLmZhbGxpbmdCbG9jayA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuZmllbGQgPSBbXTtcclxuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuZnVsbFJvd3MgPSBbXTtcclxuICAgIHRoaXMuYmFzZVBvaW50cyA9IDEwMDtcclxuICAgIHRoaXMuZmFsbFNwZWVkID0gNjAwO1xyXG4gICAgdGhpcy5sZXZlbCA9IDE7XHJcbiAgICB0aGlzLnJvd0NvdW50ID0gMDtcclxuICAgIHRoaXMucG9pbnRzID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gMDtcclxuICAgIHRoaXMubmV4dEJsb2NrID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZWQgdGhlIGJhc2ljcyBvZiB0aGUgbW9kdWxlXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmluaXRGaWVsZCgpO1xyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIC8vYWRkIGxpc3RlbmVyIHRvIHBhdXNlIGlmIGZvY3VzIGlzIGxvc3RcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5wYXVzZUdhbWUuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcGF1c2UgdGhlIGdhbWVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnBhdXNlR2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9wYXVzZSB0aGUgZ2FtZVxyXG4gICAgaWYgKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgJiYgdGhpcy5hbGl2ZSkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlc3VtZSB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVzdW1lR2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9zdGFydCB0aGUgZHJvcC1pbnRlcnZhbCBhZ2FpblxyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmZhbGxCbG9jay5iaW5kKHRoaXMpLCB0aGlzLmZhbGxTcGVlZCk7XHJcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTdGFydCB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9zZXQgYWxsIHRoZSB2YXJpYWJsZXMgdG8gdGhlIHN0YXJ0LXN0YXRlXHJcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcclxuICAgIHRoaXMubGV2ZWwgPSAxO1xyXG4gICAgdGhpcy5wb2ludHMgPSAwO1xyXG4gICAgdGhpcy5mYWxsU3BlZWQgPSA2MDA7XHJcbiAgICB0aGlzLnJvd0NvdW50ID0gMDtcclxuICAgIHRoaXMucmVhZEhpZ2hTY29yZSgpO1xyXG5cclxuICAgIC8vbWFrZSBzdXJlIHRoZSBjbGFzc2VzIGlzIHJlc2V0dGVkXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJnYW1lLW92ZXJcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJuZXctaGlnaHNjb3JlXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1zcGxhc2gtc2NyZWVuXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xyXG5cclxuICAgIC8vcnVuIGFsbCB0aGUgZnVuY3Rpb25zIHRvIG1ha2UgdGhlIG1hZ2ljIGhhcHBlblxyXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaW5pdEZpZWxkKCk7XHJcbiAgICB0aGlzLmNsZWFyRmllbGQoKTtcclxuICAgIHRoaXMucmVuZGVyUG9pbnRzKCk7XHJcbiAgICB0aGlzLm5ld05leHRCbG9jaygpO1xyXG4gICAgdGhpcy5kcm9wTmV3QmxvY2soKTtcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVhZCB0aGUgaGlnaCBzY29yZSBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlYWRIaWdoU2NvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRldHJpcy1oc1wiKSkge1xyXG4gICAgICAgIHRoaXMuaGlnaFNjb3JlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0ZXRyaXMtaHNcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2F2ZSB0aGUgaGlnaCBzY29yZSB0byBsb2NhbCBzdG9yYWdlXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5zYXZlSGlnaFNjb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5wb2ludHMgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGV0cmlzLWhzXCIsIHRoaXMucG9pbnRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBmYWxsIHRoZSBibG9jayBvbmUgcm93IGRvd25cclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmZhbGxCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuaXNGYWxsYWJsZSgpKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKz0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vYmxvY2sgaGFzIGNvbGxpZGVkLCBsYW5kIHRoZSBibG9jayBhbmQgZHJvcCBuZXdcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgICAgICB0aGlzLmxhbmRGYWxsaW5nQmxvY2soKTtcclxuICAgICAgICB0aGlzLmRyb3BOZXdCbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmVuZGVyIHRoZSBjaGFuZ2VcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZmFsbCBibG9jayB0byBib3R0b20gZGlyZWN0bHlcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmZhbGxCbG9ja1RvQm90dG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aGlsZSAodGhpcy5pc0ZhbGxhYmxlKCkpIHtcclxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmVuZGVyIHRoZSBjaGFuZ2VcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmFuZG9taXplIGEgbmV3IGJsb2NrXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5uZXdOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzaGFwZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG5cclxuICAgIC8vY3JlYXRlIG5ldyBibG9jayBmcm9tIHRoZSByYW5kb20gbnVtYmVyXHJcbiAgICBzd2l0Y2ggKHNoYXBlKSB7XHJcbiAgICAgICAgY2FzZSAwOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IEpCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IExCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFNCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAzOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFpCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSA0OiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IElCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSA1OiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFNxdWFyZUJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDY6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgVEJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGRyb3AgbmV3IGJsb2NrXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5kcm9wTmV3QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZ2V0IHRoZSBibG9jayBmcm9tIG5leHQtYmxvY2tcclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrID0gdGhpcy5uZXh0QmxvY2s7XHJcblxyXG4gICAgLy9nZXQgYSBuZXcgbmV4dCBibG9ja1xyXG4gICAgdGhpcy5jbGVhck5leHRCbG9jaygpO1xyXG4gICAgdGhpcy5uZXdOZXh0QmxvY2soKTtcclxuXHJcbiAgICAvL2FkZCBmYWxsaW50ZXJ2YWwgd2l0aCBjdXJyZW50IHNwZWVkXHJcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuZmFsbEJsb2NrLmJpbmQodGhpcyksIHRoaXMuZmFsbFNwZWVkKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc0NvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgLy90aGUgbmV3IGJsb2NrIGNvbGxpZGVkIGF0IGxhdW5jaCwgZ2FtZSBvdmVyXHJcbiAgICAgICAgdGhpcy5zYXZlSGlnaFNjb3JlKCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5jbGFzc0xpc3QuYWRkKFwiZ2FtZS1vdmVyXCIpO1xyXG4gICAgICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBsYW5kIHRoZSBmYWxsaW5nIGJsb2NrIHRvIHRoZSBmaWVsZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUubGFuZEZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmllbGRbcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3ddW2NvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sXSA9IHNoYXBlW3Jvd11bY29sXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZXJlIGFyZSBmdWxsIHJvd3MgYWZ0ZXIgbGFuZGluZ1xyXG4gICAgdGhpcy5maW5kRnVsbFJvd3MoKTtcclxuXHJcbiAgICBpZiAodGhpcy5mdWxsUm93cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy9lcmFzZSB0aGUgcm93c1xyXG4gICAgICAgIHRoaXMuZXJhc2VGdWxsUm93cygpO1xyXG5cclxuICAgICAgICAvL2NvdW50IHBvaW50c1xyXG4gICAgICAgIHRoaXMucG9pbnRzICs9IHRoaXMuY291bnRSb3dQb2ludHMoKTtcclxuXHJcbiAgICAgICAgLy9pZiBuZXcgSFMgYWRkIGNsYXNzIHRvIHNob3cgaXQgdG8gdGhlIHVzZXJcclxuICAgICAgICBpZiAodGhpcy5wb2ludHMgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpLmNsYXNzTGlzdC5hZGQoXCJuZXctaGlnaHNjb3JlXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9yZXNldCB0aGUgZnVsbFJvd3MgYXJyYXlcclxuICAgICAgICB0aGlzLmZ1bGxSb3dzID0gW107XHJcblxyXG4gICAgICAgIC8vcmVuZGVyIHRoZSBwb2ludHNcclxuICAgICAgICB0aGlzLnJlbmRlclBvaW50cygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyRmllbGQoKTtcclxuXHJcbiAgICAvLyBDaGFuZ2UgdGhlIGNsYXNzZXMgdG8gcmVuZGVyIHRoZSBibG9ja3MgdG8gdXNlclxyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkIHRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdGRcIik7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZmllbGRbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2FkZCB0aGUgY2xhc3MgdG8gc2hvdyBibG9jay1wYXJ0XHJcbiAgICAgICAgICAgICAgICB0ZHNbY29sXS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWJsb2NrLXBhcnRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW5kZXIgdGhlIGZhbGxpbmcgYmxvY2sgYW5kIG5leHRibG9ja1xyXG4gICAgdGhpcy5yZW5kZXJGYWxsaW5nQmxvY2soKTtcclxuICAgIHRoaXMucmVuZGVyTmV4dEJsb2NrKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBwb2ludHNcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlclBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBvaW50c0VsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xyXG4gICAgdmFyIGxldmVsRWxlbSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1sZXZlbFwiKTtcclxuICAgIHZhciBwb2ludE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnBvaW50cyk7XHJcbiAgICB2YXIgbGV2ZWxOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5sZXZlbCk7XHJcblxyXG4gICAgLy9yZXBsYWNlIHRoZSB0ZXh0bm9kZXMgdG8gdGhlIG5ldyBvbmVzXHJcbiAgICBwb2ludHNFbGVtLnJlcGxhY2VDaGlsZChwb2ludE5vZGUsIHBvaW50c0VsZW0uZmlyc3RDaGlsZCk7XHJcbiAgICBsZXZlbEVsZW0ucmVwbGFjZUNoaWxkKGxldmVsTm9kZSwgbGV2ZWxFbGVtLmZpcnN0Q2hpbGQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgZmFsbGluZyBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIGNvbDtcclxuXHJcbiAgICAvL2dldCB0aGUgbm9kZXNcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0clwiKTtcclxuICAgIHZhciB0ZHMgPSBbXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZHJhdyBibG9jayBhdCBwb3NpdGlvbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBzaGFwZXMgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgIHZhciB5ID0gcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3c7XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vYWRkIGNsYXNzIHRvIHRoZSBjb3JyZWN0IGJsb2NrLXBhcnRcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGRzW3ldW3hdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgbmV4dCBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyTmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIGNvbDtcclxuXHJcbiAgICAvL2dldCB0aGUgbm9kZXNcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtbmV4dC1ibG9jayB0Ym9keSB0clwiKTtcclxuICAgIHZhciB0ZHMgPSBbXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgdHJzLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ZHMucHVzaCh0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaGFwZSA9IHRoaXMubmV4dEJsb2NrLnNoYXBlc1t0aGlzLm5leHRCbG9jay5yb3RhdGlvbl07XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICB0ZHNbcm93XVtjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIHRoZSBuZXh0LWJsb2NrLWNvbnRhaW5lclxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXIgbmV4dC1ibG9ja1xyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1uZXh0LWJsb2NrIHRib2R5IHRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRycy5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRkcy5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vY2xlYXIgdGhlIGNvbHVtblxyXG4gICAgICAgICAgICB0ZHNbY29sXS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGZhbGxpbmdibG9jayBjb2xsaWRlZCBhdCBsYXVuY2hcclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gY29sbGlzaW9uIG9yIG5vdFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXHJcbiAgICAgICAgICAgICAgICBpZiAocm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSB0aGlzLmZpZWxkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgYmVsb3cgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5maWVsZFtyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvd11bY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlIHNwYWNlIGlzIHRha2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29sbGlzaW9uO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyBmYWxsYWJsZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBmYWxsYWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzRmFsbGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmYWxsYWJsZSA9IHRydWU7XHJcblxyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKyAxLFxyXG4gICAgICAgIGNvbDogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xcclxuICAgIH07XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSBiZWxvdyB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbGxhYmxlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIG1vdmUgdGhlIGZhbGxpbmcgYmxvY2tcclxuICogQHBhcmFtIGRpclxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUubW92ZUZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKGRpcikge1xyXG4gICAgaWYgKHRoaXMuaXNNb3ZhYmxlKGRpcikpIHtcclxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCArPSBkaXI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiBibG9jayBpcyBtb3ZhYmxlXHJcbiAqIEBwYXJhbSBkaXIgLSBuZWdhdGl2ZSBvciBwb3NpdGl2ZSBudW1iZXJcclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gbW92YWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzTW92YWJsZSA9IGZ1bmN0aW9uKGRpcikge1xyXG4gICAgdmFyIG1vdmFibGUgPSB0cnVlO1xyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xyXG4gICAgICAgICAgICByb3c6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93LFxyXG4gICAgICAgICAgICBjb2w6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sICsgZGlyXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vY2hlY2sgdGhhdCB0aGUgc2hhcGUgaXMgbm90IGFib3ZlIHRoZSBmaWVsZFxyXG4gICAgICAgICAgICBpZiAocm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3cgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbCA+PSB0aGlzLmZpZWxkWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW92YWJsZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByb3RhdGUgZmFsbGluZyBibG9ja1xyXG4gKiBAcGFyYW0gZGlyIC0gcG9zaXRpdmUgb3IgbmVnYXRpdmUgbnVtYmVyIHRvIGhhbmRsZSBsZWZ0L1JpZ2h0XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yb3RhdGVGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbihkaXIpIHtcclxuICAgIGlmICh0aGlzLmlzUm90YXRhYmxlKGRpcikpIHtcclxuICAgICAgICB2YXIgbmV3Um90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcclxuICAgICAgICBpZiAobmV3Um90YXRpb24gPiAzKSB7XHJcbiAgICAgICAgICAgIG5ld1JvdGF0aW9uID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobmV3Um90YXRpb24gPCAwKSB7XHJcbiAgICAgICAgICAgIG5ld1JvdGF0aW9uID0gMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uID0gbmV3Um90YXRpb247XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyByb3RhdGFibGVcclxuICogQHBhcmFtIGRpciAtIG5lZyBvciBwb3MgbnVtYmVyXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIHJvdGF0YWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzUm90YXRhYmxlID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICB2YXIgcm90YXRhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgcG90ZW50aWFsUm90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcclxuICAgIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA+IDMpIHtcclxuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA8IDApIHtcclxuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jcmVhdGUgcG90ZW50aWFsIHNoYXBlXHJcbiAgICB2YXIgcG90ZW50aWFsU2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbcG90ZW50aWFsUm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHBvdGVudGlhbFNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBwb3RlbnRpYWxTaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXHJcbiAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocG90ZW50aWFsU2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIGxlZnQgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgPj0gdGhpcy5maWVsZFswXS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByb3RhdGFibGU7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xlYXIgYWxsIHRoZSB0YWJsZXJvd3MgaW4gZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJGaWVsZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jbGVhciBmaWVsZFxyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidHJcIik7XHJcbiAgICB2YXIgdGRzO1xyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGNsYXNzZXNcclxuICAgICAgICAgICAgdGRzW2NvbF0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGZpbmQgdGhlIGZ1bGxyb3dzIG9uIHRoZSBmaWVsZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmluZEZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgZnVsbCByb3dzXHJcbiAgICB2YXIgZnVsbCA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aCAtIDE7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3Jvd10uaW5kZXhPZigwKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vcm93IGlzIGZ1bGxcclxuICAgICAgICAgICAgICAgIGZ1bGwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZnVsbCkge1xyXG4gICAgICAgICAgICAvL2FkZCB0aGVtIHRvIHRoZSBhcnJheSBvcyBmdWxsIHJvd3NcclxuICAgICAgICAgICAgdGhpcy5mdWxsUm93cy5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgIHRoaXMucm93Q291bnQgKz0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJvd0NvdW50ICUgNSA9PT0gMCAmJiB0aGlzLmZhbGxTcGVlZCA+IDE1MCkge1xyXG4gICAgICAgICAgICAgICAgLy9zcGVlZCB1cCB0aGUgZ2FtZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsU3BlZWQgLT0gMzU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxldmVsICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bGwgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZXJhc2UgdGhlIGZ1bGwgcm93cyBmcm9tIGZpZWxkXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5lcmFzZUZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnVsbFJvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAvL3JlbW92ZSB0aGUgZnVsbCByb3cgZnJvbSBmaWVsZFxyXG4gICAgICAgIHRoaXMuZmllbGQuc3BsaWNlKHRoaXMuZnVsbFJvd3NbaV0sIDEpO1xyXG5cclxuICAgICAgICAvL2FkZCBhIG5ldyBlbXB0eSBvbiB0b3Agb2YgZmllbGRcclxuICAgICAgICB2YXIgbmV3Um93ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xyXG5cclxuICAgICAgICAvL2FkZCBpdCB0byB0aGUgYmVnaW5uaW5nIG9mIGFycmF5XHJcbiAgICAgICAgdGhpcy5maWVsZC51bnNoaWZ0KG5ld1Jvdyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY291bnQgdGhlIHBvaW50c1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIHRoZSBuZXcgcG9pbnRzXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5jb3VudFJvd1BvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8xMDBwIGZvciBvbmUgcm93LCBhZGQgYWRkaXRpb25hbCAyMCUgcGVyIGV4dHJhIHJvd1xyXG4gICAgcmV0dXJuIHRoaXMuYmFzZVBvaW50cyArICgodGhpcy5mdWxsUm93cy5sZW5ndGggLSAxKSAqIHRoaXMuYmFzZVBvaW50cykgKiAxLjI7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGdhbWVib2FyZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcHJpbnQgdGhlIGNoYXQtdGVtcGxhdGUgdG8gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXRldHJpcy1hcHBsaWNhdGlvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIHZhciB0cjtcclxuICAgIHZhciB0ZDtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIik7XHJcbiAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5hcHBlbmRDaGlsZChmcmFnKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgZmllbGQtYXJyYXlcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmluaXRGaWVsZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWVsZCA9IFtcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cclxuICAgIF07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0dhbWU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gU0Jsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs1LCA1LCAwXSxcclxuICAgICAgICAgICAgWzAsIDUsIDVdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA1XSxcclxuICAgICAgICAgICAgWzUsIDVdLFxyXG4gICAgICAgICAgICBbNSwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzUsIDUsIDBdLFxyXG4gICAgICAgICAgICBbMCwgNSwgNV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDVdLFxyXG4gICAgICAgICAgICBbNSwgNV0sXHJcbiAgICAgICAgICAgIFs1LCAwXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0yLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTQmxvY2tTaGFwZTtcclxuIl19

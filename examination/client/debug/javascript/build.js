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

    if (!this.isFallable()) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5R2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSUJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9KQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0xCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU0Jsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9TcXVhcmVCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVEJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RldHJpc0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9aQmxvY2tTaGFwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgYmFzaWMgd2luZG93XHJcbiAqIEBwYXJhbSBvcHRpb25zLCBvYmplY3Qgd2l0aCB0aGUgc2V0dGluZ3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBCYXNpY1dpbmRvdyhvcHRpb25zKSB7XHJcbiAgICB0aGlzLmlkID0gb3B0aW9ucy5pZCB8fCBcIlwiICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnggPSBvcHRpb25zLnggfHwgMTA7XHJcbiAgICB0aGlzLnkgPSBvcHRpb25zLnkgfHwgMTA7XHJcbiAgICB0aGlzLnRhYkluZGV4ID0gb3B0aW9ucy50YWJJbmRleCB8fCAwO1xyXG4gICAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGUgfHwgdGhpcy5pZDtcclxuICAgIHRoaXMuaWNvbiA9IG9wdGlvbnMuaWNvbiB8fCBcImJ1Z19yZXBvcnRcIjtcclxuICAgIHRoaXMubWF4aW1pemFibGUgPSBvcHRpb25zLm1heGltaXphYmxlIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5rZXlBY3RpdmF0ZWQgPSBvcHRpb25zLmtleUFjdGl2YXRlZCB8fCBmYWxzZTtcclxuICAgIHRoaXMuekluZGV4ID0gb3B0aW9ucy56SW5kZXg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95IHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcmludCB0aGUgd2luZG93XHJcbiAqL1xyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZ2V0IHRoZSB0ZW1wbGF0ZSBhbmQgbW9kaWZ5IGl0IHRvIHRoZSBwYXJhbXNcclxuICAgIHZhciB0ZW1wbGF0ZSAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvd1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB0ZW1wbGF0ZVdpbmRvdyA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0aGlzLmlkKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS56SW5kZXggPSB0aGlzLnpJbmRleDtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRoaXMudGFiSW5kZXgpO1xyXG5cclxuICAgIC8vaW5zZXJ0IHRoZSBuZXcgd2luZG93IGJlZm9yZSBsYXVuY2hlciBpbiB0aGUgRE9NXHJcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKTtcclxuICAgIHZhciBsYXVuY2hlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGF1bmNoZXJcIik7XHJcbiAgICBlbGVtZW50Lmluc2VydEJlZm9yZSh0ZW1wbGF0ZSwgbGF1bmNoZXIpO1xyXG5cclxuICAgIC8vc2F2ZSB0aGUgZWxlbWVudCB0byB0aGUgb2JqZWN0XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCk7XHJcblxyXG4gICAgLy9hZGQgdGl0bGUgYW5kIGljb24gdG8gdGhlIHdpbmRvd1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LXRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGl0bGUpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuaWNvbikpO1xyXG5cclxuICAgIC8vYWRkIG1heGltaXplLWJ1dHRvblxyXG4gICAgaWYgKHRoaXMubWF4aW1pemFibGUpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tYXhpbWl6ZS1idXR0b25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdmFyIHdpbmRvd0J1dHRvbnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICB2YXIgcmVtb3ZlQnV0dG9uID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWluaW1pemUtYnV0dG9uXCIpO1xyXG4gICAgICAgIHdpbmRvd0J1dHRvbnMuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgcmVtb3ZlQnV0dG9uKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBNaW5pbWl6ZSB0aGUgd2luZG93XHJcbiAqL1xyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwibWluaW1pemVkXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1heGltaXplIHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtYXhpbWl6ZWRcIik7XHJcblxyXG4gICAgdmFyIGljb24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1pY29uIGlcIik7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtYXhpbWl6ZWRcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgICAgIGljb24ucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiY3JvcF9kaW5cIiksIGljb24uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWF4aW1pemUtYnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIFwiTWF4aW1pemVcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJmaWx0ZXJfbm9uZVwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1idXR0b25cIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgXCJSZXNpemVcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuY2xlYXJDb250ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpO1xyXG4gICAgd2hpbGUgKGNvbnRlbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChjb250ZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTGF1bmNoZXIgPSByZXF1aXJlKFwiLi9MYXVuY2hlclwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgdGhlIERlc2t0b3AgbW9kdWxlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gRGVza3RvcCgpIHtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdXNlTW92ZUZ1bmMgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5tb3VzZVVwRnVuYyA9IHRoaXMubW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLmNsaWNrWCA9IDA7XHJcbiAgICB0aGlzLmNsaWNrWSA9IDA7XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLnpJbmRleCA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAxO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMTtcclxuICAgIHRoaXMubGF1bmNoZXIgPSBuZXcgTGF1bmNoZXIodGhpcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGJhc2ljIGZlYXR1cmVzIG9mIHRoZSBkZXNrdG9wXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmxhdW5jaGVyLmluaXQoKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlEb3duLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB3aGF0IHdpbGwgaGFwcGVuIGlmIG1vdXNlIHVwXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibW92aW5nXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB3aGF0IHdpbGwgaGFwcGVuIHdoZW4gbW91c2UgaXMgZG93blxyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlRG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICAvL2dldCB0aGUgY2xpY2tlZC13aW5kb3dzIFwibWFpbi1kaXZcIlxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJtYWluLWZyYW1lXCIpKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvd1wiKSkge1xyXG4gICAgICAgIC8vY2xpY2tlZCBET00gaXMgYSB3aW5kb3cgLSBkbyBzdHVmZlxyXG4gICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LnN0eWxlLnpJbmRleCkgIT09IHRoaXMuekluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXMoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FkZCB0aGUgbGlzdGVuZXJzIHRvIGNoZWNrIGZvciBtb3ZlbWVudCBpZiBjbGljayB3ZXJlIGluIHRoZSB3aW5kb3ctdG9wIG9mIHdpbmRvd1xyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LXRvcFwiKSkge1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5hY3RpdmVXaW5kb3cueDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuYWN0aXZlV2luZG93Lnk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtb3ZpbmdcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBtb3VzZSBtb3ZlXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBuZXdYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdmFyIG5ld1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG4gICAgLy9jaGVjayB3aGVyZSB0aGUgbmV3IG1pZGRsZSBzaG91bGQgYmVcclxuICAgIHZhciBuZXdNaWRkbGVYID0gbmV3WCArIHBhcnNlSW50KHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQub2Zmc2V0V2lkdGgpIC8gMjtcclxuICAgIHZhciBuZXdNaWRkbGVZID0gbmV3WSArIHBhcnNlSW50KHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQub2Zmc2V0SGVpZ2h0KSAvIDI7XHJcblxyXG4gICAgdmFyIHdpbmRvd1cgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciB3aW5kb3dIID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIC8vaWYgdGhlIG1vdmUgaXMgbm90IG91dCBvZiBib3VuZHMgdGhlbiBtb3ZlIGl0XHJcbiAgICBpZiAobmV3TWlkZGxlWCA8IHdpbmRvd1cgJiYgbmV3TWlkZGxlWCA+IDAgJiYgbmV3TWlkZGxlWSA8IHdpbmRvd0ggJiYgbmV3WSA+IDApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LnkgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLmFjdGl2ZVdpbmRvdy54ICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5hY3RpdmVXaW5kb3cueSArIFwicHhcIjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgY2xpY2tzIG9uIHdpbmRvd3NcclxuICogQHBhcmFtIGV2ZW50XHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS53aW5kb3dCdXR0b25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdDtcclxuXHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICAvL2dldCB0aGUgJ3BhcmVudCcgd2luZG93LWVsZW1lbnRcclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvL2ZpbmQgd2hhdCB3aW5kb3cgZ290IGNsaWNrZWRcclxuICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIC8vc2V0IGZvY3VzIHRvIHRoZSB3aW5kb3dcclxuICAgICAgICB0aGlzLnNldEZvY3VzKHRoaXMud2luZG93c1tpbmRleF0uZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vY2hlY2sgd2hhdCBhY3Rpb24gdG8gdGFrZVxyXG4gICAgICAgIGlmIChhY3Rpb24uY29udGFpbnMoXCJleGl0LWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL2Nsb3MgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KHRoaXMud2luZG93c1tpbmRleF0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhY3Rpb24uY29udGFpbnMoXCJtaW5pbWl6ZS1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9taW5pbWl6ZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWluaW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWF4aW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWF4aW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsb3NlIGEgd2luZG93IGFuZCBkZXN0cm95IHRoZSBhcHBcclxuICogQHBhcmFtIGlkXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5jbG9zZVdpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICB2YXIgcmVtb3ZlZCA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoICYmICFyZW1vdmVkOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIFwicnVubmluZy1hcHBzXCJcclxuICAgICAgICAgICAgdmFyIGNsaWNrZWRUb29sdGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIlt2YWx1ZT0naWQ6XCIgKyB0aGlzLndpbmRvd3NbaV0uaWQgKyBcIiddXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gY2xpY2tlZFRvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgd2hpbGUgKCFjb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwidG9vbHRpcC1jb250YWluZXJcIikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY2xpY2tlZFRvb2x0aXAucGFyZW50Tm9kZSk7XHJcblxyXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIHdpbmRvdy1saXN0IGFuZCBkZXN0cm95IHRoZSBhcHBcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIGFuZCByZXNldCB0aGUgZGVza3RvcFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUuY2xlYXJEZXNrdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgIHZhciB3aW5kb3dUb29sdGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIlt2YWx1ZT0naWQ6XCIgKyB0aGlzLndpbmRvd3NbaV0uaWQgKyBcIiddXCIpO1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB3aW5kb3dUb29sdGlwLnBhcmVudE5vZGU7XHJcbiAgICAgICAgd2hpbGUgKCFjb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwidG9vbHRpcC1jb250YWluZXJcIikpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQod2luZG93VG9vbHRpcC5wYXJlbnROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuICAgIHRoaXMub2Zmc2V0WCA9IDE7XHJcbiAgICB0aGlzLm9mZnNldFkgPSAxO1xyXG4gICAgdGhpcy56SW5kZXggPSAwO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiBrZXkgaXMgcHJlc3NlZFxyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuaWQgPT09IHRoaXMuYWN0aXZlV2luZG93LmlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlV2luZG93LmtleUFjdGl2YXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5rZXlJbnB1dChldmVudC5rZXlDb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGZvY3VzIHRvIGFuIGVsZW1lbnRcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byBzZXQgZm9jdXMgb25cclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG5cclxuICAgIC8vZmluZCB0aGUgd2luZG93IGluIHdpbmRvdy1hcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdGhpcy53aW5kb3dzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCArPSAxO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG4vKipcclxuICogUHJpbnQgdGhlIGV4YW1wbGUgYXBwXHJcbiAqL1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKS5jbGFzc0xpc3QuYWRkKFwiZXhhbXBsZS1hcHBcIik7XHJcblxyXG59O1xyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgY29uc29sZS5sb2coa2V5KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhhbXBsZUFwcGxpY2F0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIE1lbW9yeUFwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgQ2hhdEFwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vY2hhdGFwcC9DaGF0QXBwbGljYXRpb25cIik7XHJcbnZhciBUZXRyaXNBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvblwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgdGhlIGxhdW5jaGVyXHJcbiAqIEBwYXJhbSBkZXNrdG9wLCB0aGUgcGFyZW50IERlc2t0b3Agb2JqZWN0XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTGF1bmNoZXIoZGVza3RvcCkge1xyXG4gICAgdGhpcy5kZXNrdG9wID0gZGVza3RvcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGluaXRpYWxpemUgdGhlIGJhc2ljc1xyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpVGFnO1xyXG4gICAgdmFyIGFwcExpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmxhdW5jaGVyIGxpXCIpO1xyXG5cclxuICAgIC8vQWRkIGV2ZW50bGlzdGVuZXJzIHRvIHRoZSBsYXVuY2hlci1idXR0b25zXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFwcExpc3QubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpVGFnID0gYXBwTGlzdFtpXS5xdWVyeVNlbGVjdG9yKFwiaVwiKTtcclxuICAgICAgICBhcHBMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmxhdW5jaGVyQ2xpY2suYmluZCh0aGlzKSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgY2xpY2tzIGluIHRoZSBsYXVuY2hlclxyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5sYXVuY2hlckNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB2YWx1ZTtcclxuICAgIHZhciBpY29uO1xyXG4gICAgdmFyIHRpdGxlO1xyXG5cclxuICAgIC8vR2V0IHRoZSBlbGVtZW50IHRoYXQgZ290IGNsaWNrZWRcclxuICAgIHZhciBlbGVtZW50ID0gdGhpcy5nZXRDbGlja2VkTGF1bmNoZXJFbGVtZW50KGV2ZW50LnRhcmdldCk7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQpIHtcclxuICAgICAgICAvL2dldCB2YWx1ZSBmcm9tIHRoZSBlbGVtZW50XHJcbiAgICAgICAgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcInZhbHVlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBzd2l0Y2hUbyA9IHZhbHVlLnNwbGl0KFwiOlwiKTtcclxuXHJcbiAgICAgICAgLy9jaGVjayBpZiB0aGUgY2xpY2sgaXMgaW4gdGhlIFwicnVubmluZy1hcHBzXCItc2VjdGlvbi5cclxuICAgICAgICBpZiAoc3dpdGNoVG9bMF0gPT09IFwiaWRcIikge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ0b29sdGlwLWNsb3NlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAvL2Nsb3NlIHByZXNzZWQsIGNsb3NlIHdpbmRvd1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNrdG9wLmNsb3NlV2luZG93KHN3aXRjaFRvWzFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vcnVubmluZy1hcHBzLXRhYiBjbGlja2VkLCBzd2l0Y2ggdG8gdGhhdCBhcHBcclxuICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVG9XaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3N0YXJ0IHRoZSBhcHAgdGhhdCBnb3QgY2xpY2tlZFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpY29uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaVwiKS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgdGl0bGUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC10aXRsZVwiKS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEFwcGxpY2F0aW9uKHZhbHVlLCBpY29uLCB0aXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGdldCB3aGF0IGVsZW1lbnQgZ290IGNsaWNrZWQgaW4gdGhlIGxhdW5jaGVyXHJcbiAqIEBwYXJhbSB0YXJnZXQgLSB0aGUgZXZlbnQtdGFyZ2V0IGZyb20gY2xpY2tcclxuICogQHJldHVybnMgRE9NLWVsZW1lbnRcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5nZXRDbGlja2VkTGF1bmNoZXJFbGVtZW50ID0gZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICB2YXIgZWxlbWVudDtcclxuXHJcbiAgICBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZShcInZhbHVlXCIpKSB7XHJcbiAgICAgICAgZWxlbWVudCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpKSB7XHJcbiAgICAgICAgLy9pcyB0aGUgaS10YWcgaW4gdGhlIGxpXHJcbiAgICAgICAgZWxlbWVudCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHN0YXJ0IG5ldyBhcHBsaWNhdGlvblxyXG4gKiBAcGFyYW0gdmFsdWUgLSB3aGF0IGFwcCBzaG91bGQgYmUgc3RhcnRlZFxyXG4gKiBAcGFyYW0gaWNvbiAtIHdoYXQgaWNvbiB0byB1c2VcclxuICogQHBhcmFtIHRpdGxlIC0gd2hhdCB0aXRsZSB0byB1c2VcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5zdGFydEFwcGxpY2F0aW9uID0gZnVuY3Rpb24odmFsdWUsIGljb24sIHRpdGxlKSB7XHJcbiAgICB2YXIgbmV3QXBwID0gZmFsc2U7XHJcbiAgICB2YXIgbWFyZ2luWCA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRYKTtcclxuICAgIHZhciBtYXJnaW5ZID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFkpO1xyXG5cclxuICAgIC8vY3JlYXRlIHRoZSBzZXR0aW5ncy1vYmplY3RcclxuICAgIHZhciBhcHBPcHRpb25zID0ge1xyXG4gICAgICAgIGlkOiBcIndpbi1cIiArIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgeDogbWFyZ2luWCxcclxuICAgICAgICB5OiBtYXJnaW5ZLFxyXG4gICAgICAgIHRhYkluZGV4OiB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyLFxyXG4gICAgICAgIHpJbmRleDogdGhpcy5kZXNrdG9wLnpJbmRleCxcclxuICAgICAgICBpY29uOiBpY29uLFxyXG4gICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICBtYXhpbWl6YWJsZTogZmFsc2UsXHJcbiAgICAgICAga2V5QWN0aXZhdGVkOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvL2NoZWNrIHdoYXQgYXBwIHRvIHN0YXJ0IGFuZCBzdGFydCBpdCwgYWRkIGV2ZW50dWFsbHkgbWF4aW1pemFibGUgYW5kIGtleUFjdGl2YXRlZFxyXG4gICAgc3dpdGNoICh2YWx1ZSkge1xyXG4gICAgICAgIGNhc2UgXCJleGFtcGxlXCI6IHtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMua2V5QWN0aXZhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IEV4QShhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLnByaW50KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgXCJtZW1vcnlcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vc2V0IHNldHRpbmcgdG8gbGlzdGVuIG9uIGtleXNcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgTWVtb3J5QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgXCJjaGF0XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL3NldCBvcHRpb24gdG8gYmUgYWJsZSB0byBtYXhpbWl6ZSB3aW5kb3dcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5tYXhpbWl6YWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBDaGF0QXBwbGljYXRpb24oYXBwT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG5ld0FwcC5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgXCJ0ZXRyaXNcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vc2V0IG9wdGlvbiB0byBsaXN0ZW4gb24ga2V5c1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLmtleUFjdGl2YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBUZXRyaXNBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcInJlc2V0XCI6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL3Jlc2V0IHRoZSBkZXNrdG9wXHJcbiAgICAgICAgICAgIHRoaXMuZGVza3RvcC5jbGVhckRlc2t0b3AoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZXdBcHApIHtcclxuICAgICAgICAvL2FkZCBsaXN0ZW5lciB0byB0aGUgd2luZG93LWJ1dHRvbnNcclxuICAgICAgICB2YXIgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBuZXdBcHAuaWQgKyBcIiAud2luZG93LWJ1dHRvbnNcIik7XHJcbiAgICAgICAgYnV0dG9ucy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZXNrdG9wLndpbmRvd0J1dHRvbkNsaWNrLmJpbmQodGhpcy5kZXNrdG9wKSk7XHJcblxyXG4gICAgICAgIC8vc2F2ZSB0aGUgb2JqZWN0IHRvIHdpbmRvd3MtYXJyYXlcclxuICAgICAgICB0aGlzLmRlc2t0b3Aud2luZG93cy5wdXNoKG5ld0FwcCk7XHJcblxyXG4gICAgICAgIC8vYWRkIHRvIHRoZSBydW5uaW5nLWFwcHMtbGlzdFxyXG4gICAgICAgIHRoaXMuYWRkUnVubmluZ0FwcCh2YWx1ZSwgbmV3QXBwKTtcclxuXHJcbiAgICAgICAgLy9pbmNyZWFzZSB0aGUgc2VyaWFsbnVtYmVyIGFuZCBzdWNoXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlciArPSAxO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRYICs9IDE7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFkgKz0gMTtcclxuXHJcbiAgICAgICAgLy9zZXQgZm9jdXMgdG8gdGhlIG5ldyBhcHAgYW5kIGNoZWNrIGJvdW5kc1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXRGb2N1cyhuZXdBcHAuZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5jaGVja0JvdW5kcyhuZXdBcHApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiB0aGUgbmV3IHdpbmRvdyBpcyBvdXQgb2YgYm91bmRzXHJcbiAqIEBwYXJhbSBhcHAgLSB0aGUgYXBwLW9iamVjdCB0byBiZSBjaGVja2VkXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuY2hlY2tCb3VuZHMgPSBmdW5jdGlvbihhcHApIHtcclxuICAgIHZhciB3aW5kb3dXID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB2YXIgd2luZG93SCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICB2YXIgYXBwUmlnaHQgPSBhcHAueCArIHBhcnNlSW50KGFwcC5lbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgIHZhciBhcHBCb3R0b20gPSBhcHAueSArIHBhcnNlSW50KGFwcC5lbGVtZW50Lm9mZnNldEhlaWdodCk7XHJcblxyXG4gICAgLy9jaGVjayBpZiB0aGUgYXBwLXdpbmRvdyBpcyBvdXQgb2YgYm91bmRzIGFuZCBnZXQgaXQgaW50byBib3VuZHNcclxuICAgIGlmIChhcHBSaWdodCA+IHdpbmRvd1cgfHwgYXBwLnggPCAwKSB7XHJcbiAgICAgICAgLy9yZXNldCB0aGUgb2Zmc2V0XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggPSAxO1xyXG5cclxuICAgICAgICAvL3NldCBuZXcgcG9zaXRpb25zXHJcbiAgICAgICAgYXBwLnggPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WCk7XHJcbiAgICAgICAgYXBwLmVsZW1lbnQuc3R5bGUubGVmdCA9IGFwcC54ICsgXCJweFwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXBwQm90dG9tID4gd2luZG93SCB8fCBhcHAueSA8IDApIHtcclxuICAgICAgICAvL3Jlc2V0IHRoZSBvZmZzZXRcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSA9IDE7XHJcblxyXG4gICAgICAgIC8vc2V0IG5ldyBwb3NpdGlvbnNcclxuICAgICAgICBhcHAueSA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRZKTtcclxuICAgICAgICBhcHAuZWxlbWVudC5zdHlsZS50b3AgPSBhcHAueSArIFwicHhcIjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZm9jdXMgb24gY2FsbCwgYW5kIHNob3cgbWluaW1pemVkIHdpbmRvdyBhZ2FpblxyXG4gKiBAcGFyYW0gaWQgLSB0aGUgd2luZG93LWlkIHRvIHNldCBmb2N1cyBvblxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLnN3aXRjaFRvV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciB3aW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgaWQpO1xyXG4gICAgaWYgKHdpbmRvdykge1xyXG4gICAgICAgIC8vaWYgbWluaW1pemVkLCBzaG93IGl0IGFnYWluXHJcbiAgICAgICAgaWYgKHdpbmRvdy5jbGFzc0xpc3QuY29udGFpbnMoXCJtaW5pbWl6ZWRcIikpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsYXNzTGlzdC5yZW1vdmUoXCJtaW5pbWl6ZWRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3NldCBmb2N1c1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXRGb2N1cyh3aW5kb3cpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCBhIG5ldyBhcHAgdG8gdGhlIHJ1bm5pbmctYXBwLWxpc3RcclxuICogQHBhcmFtIHR5cGUgLSB3aGF0IHR5cGUgaXMgdGhlIGFwcCAod2hhdCBsaXN0IHRvIGFkZCB0bylcclxuICogQHBhcmFtIGFwcCAtIHRoZSBhcHAtb2JqZWN0IHRvIGJlIGFkZGVkXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xyXG4gICAgLy9nZXQgdGhlIHRvb2x0aXAtY29udGFpbmVyIGZvciB0aGUgYXBwIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3RcclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibGlbdmFsdWU9J1wiICsgdHlwZSArIFwiJ10gLnRvb2x0aXAtY29udGFpbmVyXCIpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10b29sdGlwXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC50aXRsZSArIFwiKFwiICsgYXBwLmlkICsgXCIpXCIpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC1jbG9zZVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF1bmNoZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIERlc2t0b3AgPSByZXF1aXJlKFwiLi9EZXNrdG9wXCIpO1xyXG5cclxudmFyIGQgPSBuZXcgRGVza3RvcCgpO1xyXG5kLmluaXQoKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3IgZm9yIHRoZSBjaGF0XHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGVsZW1udCB0byBwcmludCB0b1xyXG4gKiBAcGFyYW0gc2VydmVyIC0gdGhlIHNlcnZlclxyXG4gKiBAcGFyYW0gY2hhbm5lbCAtIHRoZSBjaGFubmVsLCBkZWZhdWx0IGVtcHR5XHJcbiAqIEBwYXJhbSB1c2VybmFtZSAtIHVzZXJuYW1lXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQ2hhdChlbGVtZW50LCBzZXJ2ZXIsIGNoYW5uZWwsIHVzZXJuYW1lKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsIHx8IFwiXCI7XHJcbiAgICB0aGlzLnVzZXJuYW1lID0gdXNlcm5hbWU7XHJcbiAgICB0aGlzLnNvY2tldCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMua2V5ID0gXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiO1xyXG4gICAgdGhpcy5vbmxpbmUgPSBmYWxzZTtcclxuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHJcbiAgICAvL3RoZSB0aW1lc3RhbXBvcHRpb25zIHRvIHVzZVxyXG4gICAgdGhpcy50aW1lU3RhbXBPcHRpb25zID0ge1xyXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLCBtb250aDogXCJudW1lcmljXCIsXHJcbiAgICAgICAgZGF5OiBcIm51bWVyaWNcIiwgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCJcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBpbml0IHRoZSBiYXNpY3NcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICAvL2dldCB0aGUgc3RvcmVkIG1lc3NhZ2VzXHJcbiAgICB0aGlzLnJlYWRTdG9yZWRNZXNzYWdlcygpO1xyXG5cclxuICAgIC8vY29ubmVjdFxyXG4gICAgdGhpcy5jb25uZWN0VG9TZXJ2ZXIoKTtcclxuXHJcbiAgICAvL2FkZCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMubmV3TWVzc2FnZUZyb21TZXJ2ZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuZm9ybVN1Ym1pdC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdGhpcy5jaGVja0lucHV0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLnRvZ2dsZUZvY3VzLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBjaGF0XHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9wcmludCB0aGUgY2hhdC10ZW1wbGF0ZSB0byB0aGlzLmVsZW1lbnRcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1hcHBsaWNhdGlvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuXHJcbiAgICAvL3ByaW50IGluZm9cclxuICAgIHZhciBpbmZvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1pbmZvXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIGNoYW5uZWxJbmZvID0gXCJcIjtcclxuXHJcbiAgICAvL2hhbmRsZSB0aGUgY2hhbm5lbHNcclxuICAgIGlmICh0aGlzLmNoYW5uZWwgPT09IFwiXCIpIHtcclxuICAgICAgICBjaGFubmVsSW5mbyA9IFwiTm9uLXNwZWNpZmllZFwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEluZm8gPSB0aGlzLmNoYW5uZWw7XHJcbiAgICB9XHJcblxyXG4gICAgLy9zaG93IGluZm9cclxuICAgIHZhciBpbmZvTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiI1wiICsgY2hhbm5lbEluZm8uc2xpY2UoMCwgMTgpICsgXCIvXCIgKyB0aGlzLnVzZXJuYW1lLnNsaWNlKDAsIDEwKSk7XHJcbiAgICBpbmZvLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pbmZvXCIpLmFwcGVuZENoaWxkKGluZm9Ob2RlKTtcclxuXHJcbiAgICB2YXIgbWVudUluZm8gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWluZm9cIik7XHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgaWYgKG1lbnVJbmZvKSB7XHJcbiAgICAgICAgbWVudS5yZXBsYWNlQ2hpbGQoaW5mbywgbWVudUluZm8pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbWVudS5hcHBlbmRDaGlsZChpbmZvKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBjb25uZWN0IHRvIHRoZSBzZXJ2ZXJcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmNvbm5lY3RUb1NlcnZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jaGFuZ2UgdGhlIGNsYXNzZXMgdG8gc2hvdyB3aGF0cyBoYXBwZW5pbmdcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LW9mZmxpbmVcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG5cclxuICAgIC8vc3RhcnQgbmV3IHdlYnNvY2tldFxyXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9cIiArIHRoaXMuc2VydmVyLCBcImNoYXJjb3Jkc1wiKTtcclxuXHJcbiAgICAvL2FkZCBsaXN0ZW5lcnMgdG8gdGhlIHNvY2tldFxyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgdGhpcy5zZXRPbmxpbmUuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgdGhpcy5zZXRPZmZsaW5lLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLy9mdW5jdGlvbiB0byBzZXQgY2hhdCBvZmZsaW5lIGlmIGVycm9yXHJcbkNoYXQucHJvdG90eXBlLnNldE9mZmxpbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJjaGF0LWNvbm5lY3RpbmdcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5vbmxpbmUgPSBmYWxzZTtcclxuXHJcbiAgICAvL3ByaW50IG1lc3NhZ2UgaW4gdGhlIGNoYXQgZnJvbSBcImdsYWRvc1wiIHRvIHNob3cgdGhhdCB0aGUgY29ubmVjdGlvbiBmYWlsZWRcclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIHVzZXJuYW1lOiBcIkdsYURvc1wiLFxyXG4gICAgICAgIGRhdGE6IFwiQ291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyLi4uIFlvdSBjYW4gc3RpbGwgcmVhZCB5b3VyIGNoYXQgaGlzdG9yeVwiXHJcbiAgICB9O1xyXG4gICAgdGhpcy5wcmludE5ld01lc3NhZ2UoZGF0YSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2V0IGNoYXQgb25saW5lIGlmIGNvbm5lY3RlZFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuc2V0T25saW5lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm9ubGluZSA9IHRydWU7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb25saW5lXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgbWVzc2FnZXMgZnJvbSBzZXJ2ZXJcclxuICogQHBhcmFtIGV2ZW50IC0gdGhlIGRhdGFzdHJpbmcgZnJvbSBzZXJ2ZXJcclxuICovXHJcbkNoYXQucHJvdG90eXBlLm5ld01lc3NhZ2VGcm9tU2VydmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XHJcbiAgICAgICAgLy9hZGQgdGltZXN0YW1wIHRvIGRhdGEtb2JqZWN0XHJcbiAgICAgICAgZGF0YS50aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlRGF0ZVN0cmluZyhcInN2LXNlXCIsIHRoaXMudGltZVN0YW1wT3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKCFkYXRhLmNoYW5uZWwpIHtcclxuICAgICAgICAgICAgZGF0YS5jaGFubmVsID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vY2hlY2sgdGhlIGNoYW5uZWwgYW5kIGF0dCB0aGUgbWVzc2FnZSBpZiBpdHMgdGhlIHNhbWVcclxuICAgICAgICBpZiAoZGF0YS5jaGFubmVsID09PSB0aGlzLmNoYW5uZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmludE5ld01lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5ld01lc3NhZ2UoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHN1Ym1pdCBhIG1lc3NhZ2VcclxuICogQHBhcmFtIGV2ZW50IC0gdGhlIGV2ZW50IGZyb20gZm9ybVxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuZm9ybVN1Ym1pdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQpIHtcclxuICAgICAgICAvL2RvbnQgc3VibWl0IHRoZSBmb3JtIHN0YW5kYXJkLXdheVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMub25saW5lKSB7XHJcbiAgICAgICAgLy9nZXQgdGhlIGlucHV0IGZyb20gZm9ybVxyXG4gICAgICAgIHZhciBpbnB1dCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtaW5wdXRGaWVsZFwiKS52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgLy90aGUgbWVzc2FnZSBpcyBhdCBsZWFzdCBvbmUgY2hhciwgY3JlYXRlIG9iamVjdCB0byBzZW5kXHJcbiAgICAgICAgICAgIHZhciBtc2cgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IGlucHV0LFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWwsXHJcbiAgICAgICAgICAgICAgICBrZXk6IHRoaXMua2V5XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL3NlbmQgdGhlIG9iamVjdCB0byBzZXJ2ZXJcclxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuXHJcbiAgICAgICAgICAgIC8vZGlzYWJsZSB0aGUgYnV0dG9uIGFuZCByZXNldCB0aGUgZm9ybVxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IG1lc3NhZ2UgdG8gdGhlIHdpbmRvd1xyXG4gKiBAcGFyYW0gZGF0YSAtIHRoZSBkYXRhLXN0cmluZyB0byBwcmludFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUucHJpbnROZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgLy9nZXQgdGhlIGNvbnRhaW5lciB0byBjaGVjayBzY3JvbGxlZFxyXG4gICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0XCIpO1xyXG4gICAgdmFyIHNjcm9sbGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy9jaGVjayBpZiB0aGUgdXNlciBoYXMgc2Nyb2xsZWQgdXBcclxuICAgIGlmIChjb250YWluZXIuc2Nyb2xsVG9wICE9PSAoY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5vZmZzZXRIZWlnaHQpKSB7XHJcbiAgICAgICAgc2Nyb2xsZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZ2V0IHRoZSB0ZW1wbGF0ZSBmb3IgbmV3IG1lc3NhZ2UgYW5kIG1vZGlmeSBpdFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LW1lc3NhZ2UtbGluZVwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB1c2VybmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLnVzZXJuYW1lICsgXCI6IFwiKTtcclxuICAgIHZhciBtZXNzYWdlTm9kZSA9IHRoaXMucGFyc2VNZXNzYWdlV2l0aExpbmtzKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2VcIikuYXBwZW5kQ2hpbGQobWVzc2FnZU5vZGUpO1xyXG4gICAgaWYgKGRhdGEudGltZXN0YW1wKSB7XHJcbiAgICAgICAgLy9hZGQgdGhlIHRpbWVzdGFtcCBhcyB0aXRsZVxyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpbmVcIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgZGF0YS50aW1lc3RhbXApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnVzZXJuYW1lID09PSBkYXRhLnVzZXJuYW1lKSB7XHJcbiAgICAgICAgLy9pdCdzIG15IG1lc3NhZ2UgLSBhZGQgY2xhc3MgdG8gc2hvdyB0aGF0XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImxpXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWJ1YmJsZS1tZVwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vbWVzc2FnZSBpc24ndCBtaW5lLCBzaG93IHRoYXQgdmlhIGNsYXNzXHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImxpXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LWJ1YmJsZVwiKTtcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtdXNlcm5hbWVcIikuYXBwZW5kQ2hpbGQodXNlcm5hbWVOb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2FwcGVuZCB0aGUgbmV3IG1lc3NhZ2VcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0IHVsXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuXHJcbiAgICAvL2F1dG9zY3JvbGwgdG8gYm90dG9tXHJcbiAgICB0aGlzLnNjcm9sbFRvQm90dG9tKHNjcm9sbGVkKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBhdXRvc2Nyb2xsIHdoZW4gbmV3IG1lc3NhZ2VcclxuICogQHBhcmFtIHNjcm9sbGVkXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5zY3JvbGxUb0JvdHRvbSA9IGZ1bmN0aW9uKHNjcm9sbGVkKSB7XHJcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICBpZiAoIXNjcm9sbGVkKSB7XHJcbiAgICAgICAgLy9JZiB1c2VyIHdhcyBhdCBib3R0b20sIGF1dG8tc2Nyb2xsIGRvd24gdG8gdGhlIG5ldyBib3R0b20gYWZ0ZXIgbmV3IG1lc3NhZ2VcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzYXZlIHRoZSBuZXcgbWVzc2FnZSB0byBsb2NhbCBzdG9yYWdlIGZvciBoaXN0b3J5XHJcbiAqIEBwYXJhbSBkYXRhXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5zYXZlTmV3TWVzc2FnZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHZhciBuZXdNc2cgPSB7XHJcbiAgICAgICAgdXNlcm5hbWU6IGRhdGEudXNlcm5hbWUsXHJcbiAgICAgICAgZGF0YTogZGF0YS5kYXRhLFxyXG4gICAgICAgIHRpbWVzdGFtcDogZGF0YS50aW1lc3RhbXBcclxuICAgIH07XHJcblxyXG4gICAgLy9hZGQgdGhlIG5ldyBtZXNzYWdlIHRvIHRoZSBhcnJheSBhbmQgc2F2ZSBpdFxyXG4gICAgdGhpcy5tZXNzYWdlcy5wdXNoKG5ld01zZyk7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwsIEpTT04uc3RyaW5naWZ5KHRoaXMubWVzc2FnZXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZWFkIHRoZSBzdG9yZWQgbWVzc2FnZXMgZnJvbSBsb2NhbCBzdG9yYWdlIGFuZCBwcmludCB0aGVtXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5yZWFkU3RvcmVkTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gSlNPTi5wYXJzZShtZXNzYWdlcyk7XHJcblxyXG4gICAgICAgIC8vcHJpbnQgYWxsIHRoZSBtZXNzYWdlcyBmcm9tIGhpc3RvcnlcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWVzc2FnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmludE5ld01lc3NhZ2UodGhpcy5tZXNzYWdlc1tpXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FkZCBlbmQtb2YtaGlzdG9yeSBzZXBhcmF0b3JcclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBzZXBhcmF0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtaGlzdG9yeS1zZXBhcmF0b3JcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0IHVsXCIpLmFwcGVuZENoaWxkKHNlcGFyYXRvcik7XHJcblxyXG4gICAgICAgICAgICAvL3Njcm9sbCB0byBib3R0b21cclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZS1saXN0XCIpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gdG9nZ2xlIHRoZSBmb2N1c1xyXG4gKiBuZWVkZWQgc2luY2UgdGhlIHdpbmRvdyBkcm9wcyBmb2N1cyB3aGVuIGZvcm0gaW4gd2luZG93IGlzIGZvY3VzZWRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnRvZ2dsZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImZvY3VzZWQtd2luZG93XCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIHRoZSBpbnB1dCBpbiB0ZXh0YXJlYVxyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmNoZWNrSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgLy9nZXQgdGhlIGlucHV0XHJcbiAgICB2YXIgaW5wdXQgPSBldmVudC50YXJnZXQudmFsdWU7XHJcblxyXG4gICAgLy9oYW5kbGUgdGhhdCB0aGUgYnV0dG9uIHNob3VsZCBvbmx5IGJlIGNsaWNrYWJsZSBpZiBpbnB1dCBpcyBvbmUgb3IgbW9yZSBjaGFyc1xyXG4gICAgaWYgKGlucHV0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZSBsYXN0IGNoYXIgd2FzIGVudGVyLCBhbmQgc3VibWl0XHJcbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSA9PT0gMTApIHtcclxuICAgICAgICB0aGlzLmZvcm1TdWJtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdCgwKSA9PT0gMTApIHtcclxuICAgICAgICAvL2ZpcnN0IGNoYXIgaXMgZW50ZXIsIHJlc2V0IGZvcm0gYW5kIGRpc2FibGUgc2VuZC1idXR0b25cclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVzZXQoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LXNlbmRCdXR0b25cIikuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBmaW5kIGFuZCBwYXJzZSBsaW5rcyBpbiBtZXNzYWdlIHRvIGNsaWNrYWJsZSBub2Rlc1xyXG4gKiBAcGFyYW0gdGV4dCAtIHRoZSBtZXNzYWdlXHJcbiAqIEByZXR1cm5zIHsqfSAtIGRvY3VtZW50RnJhZ21lbnQgdG8gYXBwZW5kIGFzIG1lc3NhZ2VcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnBhcnNlTWVzc2FnZVdpdGhMaW5rcyA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgdmFyIGxpbms7XHJcbiAgICB2YXIgYVRhZztcclxuICAgIHZhciBsaW5rTm9kZTtcclxuICAgIHZhciB0ZXh0Tm9kZTtcclxuXHJcbiAgICAvL3NwbGl0IG1lc3NhZ2UgaW50byB3b3Jkc1xyXG4gICAgdmFyIHdvcmRzID0gdGV4dC5zcGxpdChcIiBcIik7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIC8vc2VhcmNoIGZvciBsaW5rc1xyXG4gICAgICAgIGlmICh3b3Jkc1tpXS5zbGljZSgwLCA3KSA9PT0gXCJodHRwOi8vXCIpIHtcclxuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh3b3Jkc1tpXS5zbGljZSgwLCA4KSA9PT0gXCJodHRwczovL1wiKSB7XHJcbiAgICAgICAgICAgIGxpbmsgPSB3b3Jkc1tpXS5zbGljZSg3KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaW5rKSB7XHJcbiAgICAgICAgICAgIC8vbGluayBmb3VuZCwgY3JlYXRlIGEtZWxlbWVudFxyXG4gICAgICAgICAgICBhVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgICAgIGFUYWcuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIi8vXCIgKyBsaW5rKTtcclxuICAgICAgICAgICAgYVRhZy5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XHJcbiAgICAgICAgICAgIGxpbmtOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGluayk7XHJcblxyXG4gICAgICAgICAgICBhVGFnLmFwcGVuZENoaWxkKGxpbmtOb2RlKTtcclxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiBcIik7XHJcblxyXG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGFUYWcpO1xyXG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vcmVzZXQgbGlua1xyXG4gICAgICAgICAgICBsaW5rID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy9hcHBlbmQgdGhlIHdvcmQgYXMgaXQgaXNcclxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh3b3Jkc1tpXSArIFwiIFwiKTtcclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcmFnO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIHRoZSBoaXN0b3J5XHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5jbGVhckhpc3RvcnkgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcmVtb3ZlIGZyb20gc3RvcmFnZSBhbmQgcmVzZXQgYXJyYXlcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCk7XHJcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XHJcblxyXG4gICAgLy9yZW1vdmUgZWxlbWVudHMgZnJvbSBET01cclxuICAgIHZhciBsaXN0RWxlbWVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwidWxcIik7XHJcbiAgICB3aGlsZSAobGlzdEVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgbGlzdEVsZW1lbnQucmVtb3ZlQ2hpbGQobGlzdEVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNXaW5kb3cgPSByZXF1aXJlKFwiLi4vQmFzaWNXaW5kb3dcIik7XHJcbnZhciBDaGF0ID0gcmVxdWlyZShcIi4vQ2hhdFwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIGNoYXQgYXBwbGljYXRpb25cclxuICogQHBhcmFtIG9wdGlvbnMgLSB0aGUgc2V0dGluZ3Mtb2JqZWN0XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQ2hhdEFwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcbiAgICB0aGlzLmNoYXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IFwiXCI7XHJcbiAgICB0aGlzLnNlcnZlciA9IFwidmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCI7XHJcbiAgICB0aGlzLmNoYW5uZWwgPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuYWRkRm9jdXNGdW5jID0gdGhpcy5hZGRGb2N1cy5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5yZW1vdmVGb2N1c0Z1bmMgPSB0aGlzLnJlbW92ZUZvY3VzLmJpbmQodGhpcyk7XHJcbn1cclxuXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgQ2hhdEFwcGxpY2F0aW9uO1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGluaXQgdGhlIGJhc2ljc1xyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VybmFtZVwiKSkge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJuYW1lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICAvL2FkZCBsaXN0ZW5lciB0byB0aGUgbWVudVxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGFwcGxpY2F0aW9uXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImNoYXQtYXBwXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb2ZmbGluZVwiKTtcclxuXHJcbiAgICAvL2FkZCB0aGUgbWVudVxyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIHZhciBhbHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQ7XHJcbiAgICB2YXIgYWx0MSA9IGFsdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkNsZWFyIEhpc3RvcnlcIikpO1xyXG5cclxuICAgIHZhciBhbHQyID0gYWx0LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIGFsdDIucXVlcnlTZWxlY3RvcihcIi5tZW51LWFsdGVybmF0aXZlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiU2V0dGluZ3NcIikpO1xyXG5cclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0MSk7XHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDIpO1xyXG5cclxuICAgIC8vcHJpbnQgdGhlIHNldHRpbmdzXHJcbiAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGRlc3Ryb3kgdGhlIGFwcGxpY2F0aW9uXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBtZW51LWNsaWNrXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgLy9nZXQgdGhlIHRhcmdldCB0ZXh0IGFuZCBtYWtlIGl0IGxvd2VyIGNhc2VcclxuICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgLy9tYWtlIHRoZSBjb3JyZWN0IGNhbGxcclxuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSBcImNsZWFyIGhpc3RvcnlcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhdC5jbGVhckhpc3RvcnkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSBzZXR0aW5nc1xyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpO1xyXG4gICAgdmFyIGlucHV0TGlzdDtcclxuXHJcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgLy9zaG93IHRoZSBzZXR0aW5nc1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgLy9nZXQgdGhlIHNldHRpbmdzXHJcbiAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmFkZFNldHRpbmdzKHRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgaW5wdXRMaXN0ID0gIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFt0eXBlPSd0ZXh0J11cIik7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnB1dExpc3QubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgaW5wdXRMaXN0W2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCB0aGlzLmFkZEZvY3VzRnVuYyk7XHJcbiAgICAgICAgICAgIGlucHV0TGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgdGhpcy5yZW1vdmVGb2N1c0Z1bmMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9hcHBlbmQgaXRcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9zZXR0aW5ncyBzaG93aW5nLiBjbG9zZSB0aGUgc2V0dGluZ3NcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5ncy13cmFwcGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLnJlbW92ZUNoaWxkKHNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCB0aGUgc2V0dGluZ3NcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byBhcHBlbmQgdG9cclxuICogQHJldHVybnMgeyp9IC0gdGhlIGVsZW1lbnRcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2V0dGluZ3MgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3VzZXJuYW1lJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy51c2VybmFtZSk7XHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nc2VydmVyJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy5zZXJ2ZXIpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J2NoYW5uZWwnXVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCB0aGlzLmNoYW5uZWwpO1xyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzXCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIHNldHRpbmdzIGFuZCByZW9wZW4gY2hhdCB3aXRoIHRoZW1cclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2Nsb3NlIHRoZSBjaGF0LWNvbm5lY3Rpb25cclxuICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICB0aGlzLmNoYXQuc29ja2V0LmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5jaGF0Lm9ubGluZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmb3JtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3MtZm9ybVwiKTtcclxuXHJcbiAgICAvL2dldCB0aGUgdmFsdWVzIGZyb20gc2V0dGluZ3MtZm9ybVxyXG4gICAgdGhpcy51c2VybmFtZSA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3VzZXJuYW1lJ11cIikudmFsdWU7XHJcbiAgICB0aGlzLnNlcnZlciA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5jaGFubmVsID0gZm9ybS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbbmFtZT0nY2hhbm5lbCddXCIpLnZhbHVlO1xyXG5cclxuICAgIC8vc2hvdyBvZmZsaW5lIHRvIHRoZSB1c2VyXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1vbmxpbmVcIiwgXCJjaGF0LWNvbm5lY3RpbmdcIiwgXCJjaGF0LW9mZmxpbmVcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG5cclxuICAgIHRoaXMuY2xlYXJDb250ZW50KCk7XHJcblxyXG4gICAgLy9zdGFydCB0aGUgbmV3IGNoYXRcclxuICAgIGlmICh0aGlzLnVzZXJuYW1lID09PSBcIlwiKSB7XHJcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IFwiVXNlclwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vc3RhcnQgdGhlIG5ldyBjaGF0XHJcbiAgICB0aGlzLmNoYXQgPSBuZXcgQ2hhdCh0aGlzLmVsZW1lbnQsIHRoaXMuc2VydmVyLCB0aGlzLmNoYW5uZWwsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgdGhpcy5jaGF0LmluaXQoKTtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnNldEZvY3VzKCk7XHJcblxyXG4gICAgLy9zYXZlIHRoZSB1c2VybmFtZSB0byBzdG9yYWdlXHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJuYW1lXCIsIHRoaXMudXNlcm5hbWUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIG1heGltaXplIHRoZSBhcHBsaWNhdGlvblxyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLm1heGltaXplLmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy9zY3JvbGwgdG8gYm90dG9tIChub3Qgd29ya2luZz8pXHJcbiAgICB0aGlzLmNoYXQuc2Nyb2xsVG9Cb3R0b20oZmFsc2UpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCBmb2N1cyB0byB0aGUgd2luZG93XHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZEZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVtb3ZlIGZvY3VzIGZyb20gd2luZG93XHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnJlbW92ZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImZvY3VzZWQtd2luZG93XCIpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb2N1c2VkLXdpbmRvd1wiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzZXQgZm9jdXNcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2V0Rm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdEFwcGxpY2F0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4uL0Jhc2ljV2luZG93XCIpO1xyXG52YXIgTWVtb3J5R2FtZSA9IHJlcXVpcmUoXCIuL01lbW9yeUdhbWVcIik7XHJcblxyXG4vKipcclxuICogQ29udHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG1lbW9yeSBhcHBsaWNhdGlvbm1cclxuICogQHBhcmFtIG9wdGlvbnMgLSB0aGUgc2V0dGluZ3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBNZW1vcnlBcHBsaWNhdGlvbihvcHRpb25zKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLmdhbWUgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmJvYXJkU2l6ZSA9IFs0LCA0XTtcclxuICAgIHRoaXMubWFya2VkQ2FyZCA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgTWVtb3J5QXBwbGljYXRpb247XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdCB0aGUgYmFzaWNzXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1lbnVDbGlja2VkLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vY3JlYXRlIG5ldyBnYW1lIGFuZCBpbml0IGl0XHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgTWVtb3J5R2FtZSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKSwgNCwgNCk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBhcHBsaWNhdGlvblxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LWFwcFwiKTtcclxuXHJcbiAgICAvL2FkZCB0aGUgbWVudSBhbHRlcm5hdGl2ZXNcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0MSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5ldyBHYW1lXCIpKTtcclxuXHJcbiAgICB2YXIgYWx0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtYWx0ZXJuYXRpdmVcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIG1lbnUtY2xpY2tlZFxyXG4gKiBAcGFyYW0gZXZlbnQgLSBjbGljay1ldmVudFxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciB0YXJnZXQ7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJhXCIpIHtcclxuICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2NoZWNrIHdoYXQgd2FzIGNsaWNrZWRcclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0dGluZ3NcIjoge1xyXG4gICAgICAgICAgICAgICAgLy9vcGVuIHRoZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIFwibmV3IGdhbWVcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIHRoZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9yZXN0YXJ0IG5ldyBnYW1lXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlc3RhcnQgdGhlIGdhbWVcclxuICogQHBhcmFtIHZhbHVlIC0gdGhlIGJvYXJkLXNpemUgKGVnLiA0eDQpXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUucmVzdGFydCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAvL3NwbGl0IHZhbHVlIHRvIGdldCB4L3lcclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuYm9hcmRTaXplID0gdmFsdWUuc3BsaXQoXCJ4XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB5IGFuZCB4IGZyb20gc3BsaXRcclxuICAgIHZhciB5ID0gdGhpcy5ib2FyZFNpemVbMV07XHJcbiAgICB2YXIgeCA9IHRoaXMuYm9hcmRTaXplWzBdO1xyXG5cclxuICAgIC8vY2xlYXIgdGhlIGNvbnRlbnRcclxuICAgIHRoaXMuY2xlYXJDb250ZW50KCk7XHJcblxyXG4gICAgLy9yZW1vdmUgb2xkIGV2ZW50aGFuZGxlcnNcclxuICAgIHRoaXMuZ2FtZS5yZW1vdmVFdmVudHMoKTtcclxuXHJcbiAgICAvL2NyZWF0ZSBuZXcgZ2FtZSBhbmQgaW5pdCBpdFxyXG4gICAgdGhpcy5nYW1lID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIHgsIHkpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93L2hpZGUgdGhlIHNldHRpbmdzXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3NPcGVuKSB7XHJcbiAgICAgICAgLy9zaG93IHRoZSBzZXR0aW5nc1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtc2V0dGluZ3NcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5jbGFzc0xpc3QuYWRkKFwibWVtb3J5LXNldHRpbmdzXCIpO1xyXG5cclxuICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMuYWRkU2V0dGluZ3ModGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2hpZGUgdGhlIHNldHRpbmdzXHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3Mtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5yZW1vdmVDaGlsZChzZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBhZGQgdGhlIHNldHRpbmdzXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gcHJpbnQgdG9cclxuICogQHJldHVybnMgeyp9IC0gdGhlIGVsZW1lbnRcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRTZXR0aW5ncyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWVtb3J5LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFt0eXBlPSdidXR0b24nXVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zYXZlU2V0dGluZ3MuYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzYXZlIHRoZSBzZXR0aW5ncyBhbmQgcnVuIG5ldyBnYW1lXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcInNlbGVjdFtuYW1lPSdib2FyZC1zaXplJ11cIikudmFsdWU7XHJcblxyXG4gICAgLy9yZXN0YXJ0IHdpdGggdGhlIG5ldyBzZXR0aW5nc1xyXG4gICAgdGhpcy5yZXN0YXJ0KHZhbHVlKTtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBrZXkgaW5wdXRcclxuICogQHBhcmFtIGtleSAtIGtleWNvZGUgdG8gaGFuZGxlXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5SW5wdXQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIGlmICghdGhpcy5tYXJrZWRDYXJkKSB7XHJcbiAgICAgICAgLy9ubyBjYXJkIGlzIG1hcmtlZCwgbWFyayB0aGUgdG9wIGxlZnRcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QuYWRkKFwibWFya2VkXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy90b29nbGUgdGhlIG1hcmtlZENhcmQgYmVmb3JlIGNoYW5naW5nIG1hcmtlZENhcmRcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LnRvZ2dsZShcIm1hcmtlZFwiKTtcclxuICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICBjYXNlIDM5OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleVJpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSAzNzoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlMZWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSAzODoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlVcCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgNDA6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5RG93bigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IHtcclxuICAgICAgICAgICAgICAgIC8vZW50ZXIgLiB0dXJuIHRoZSBtYXJrZWQgY2FyZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnR1cm5DYXJkKHRoaXMubWFya2VkQ2FyZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdC50b2dnbGUoXCJtYXJrZWRcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIGtleSByaWdodCBwcmVzc2VkXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5UmlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBuZXh0IGNhcmRcclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLm5leHRFbGVtZW50U2libGluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nLmZpcnN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy9yZXN0YXJ0IGZyb20gdG9wXHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiBrZXkgbGVmdCBwcmVzc2VkXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5TGVmdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIHByZXZpb3VzIGNhcmRcclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucHJldmlvdXNFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUucHJldmlvdXNFbGVtZW50U2libGluZy5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy9yZXN0YXJ0IGZyb20gYm90dG9tIHJpZ2h0XHJcbiAgICAgICAgICAgIHZhciByb3dzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucm93XCIpO1xyXG4gICAgICAgICAgICB2YXIgbGFzdFJvdyA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gbGFzdFJvdy5sYXN0RWxlbWVudENoaWxkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgaWYga2V5IHVwIHByZXNzZWRcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlVcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIG5leHQgcm93IGFuZCBjYXJkXHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIHJvd1k7XHJcblxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB2YXIgaWQgPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0yKTtcclxuICAgICAgICByb3dZID0gcGFyc2VJbnQoaWQuY2hhckF0KDApKSAtIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2JlZ2luIGZyb20gYm90dG9tXHJcbiAgICAgICAgdmFyIHJvd3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yb3dcIik7XHJcbiAgICAgICAgcm93ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIHJvd1kgPSByb3dzLmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgLy9maW5kIHdoYXQgeC1wb3NpdGlvbiBpbiB0aGUgcm93IHRoZSBtYXJrZWQgY2FyZCBpcyBvblxyXG4gICAgdmFyIGNhcmRYID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMSk7XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgcm93WSArIGNhcmRYKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgaWYga2V5IGRvd24gcHJlc3NlZFxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBuZXh0IHJvdyBhbmQgY2FyZFxyXG4gICAgdmFyIHJvd1k7XHJcblxyXG4gICAgaWYgKHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHZhciBpZCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTIpO1xyXG4gICAgICAgIHJvd1kgPSBwYXJzZUludChpZC5jaGFyQXQoMCkpICsgMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJvd1kgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB3aGF0IHgtcG9zaXRpb24gaW4gdGhlIHJvdyB0aGUgbWFya2VkIGNhcmQgaXMgb25cclxuICAgIHZhciBjYXJkWCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTEpO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHJvd1kgKyBjYXJkWCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUFwcGxpY2F0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgbWVtb3J5IGJvYXJkXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gcHJpbnQgdG9cclxuICogQHBhcmFtIHggLSB0aGUgYW1vdW50IG9mIGNvbHNcclxuICogQHBhcmFtIHkgLSB0aGUgYW1vdW50IG9mIHJvd3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBNZW1vcnlCb2FyZChlbGVtZW50LCB4LCB5KSB7XHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgLy9jYWxsIHRoZSBwcmludGZ1bmN0aW9uXHJcbiAgICB0aGlzLnByaW50Q2FyZHMoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBjYXJkc1xyXG4gKi9cclxuTWVtb3J5Qm9hcmQucHJvdG90eXBlLnByaW50Q2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuICAgIHZhciByb3dEaXY7XHJcbiAgICB2YXIgY2FyZERpdjtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKVxyXG4gICAge1xyXG4gICAgICAgIHJvd0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgcm93RGl2LmNsYXNzTGlzdC5hZGQoXCJyb3dcIik7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy54OyBqICs9IDEpIHtcclxuICAgICAgICAgICAgY2FyZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgIGNhcmREaXYuY2xhc3NMaXN0LmFkZChcImNhcmQtXCIgKyBpICsgaiwgXCJjYXJkXCIpO1xyXG4gICAgICAgICAgICByb3dEaXYuYXBwZW5kQ2hpbGQoY2FyZERpdik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJvd0Rpdik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlCb2FyZDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3IgZm9yIG1lbW9yeSBjYXJkXHJcbiAqIEBwYXJhbSBpZCAtIGlkIG9mIGNhcmRcclxuICogQHBhcmFtIGltZ05yIC0gaW1hZ2UgbnVtYmVyXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTWVtb3J5Q2FyZChpZCwgaW1nTnIpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuaW1nTnIgPSBpbWdOcjtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlDYXJkO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNZW1vcnlCb2FyZCA9IHJlcXVpcmUoXCIuL01lbW9yeUJvYXJkXCIpO1xyXG52YXIgTWVtb3J5Q2FyZCA9IHJlcXVpcmUoXCIuL01lbW9yeUNhcmRcIik7XHJcbnZhciBUaW1lciA9IHJlcXVpcmUoXCIuL1RpbWVyXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yZnVuY3Rpb24gZm9yIHRoZSBtZW1vcnlnYW1lXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gZWxlbWVudCB0byBwcmludCB0b1xyXG4gKiBAcGFyYW0geCAtIGFtb3VudCBvZiBjb2xzXHJcbiAqIEBwYXJhbSB5IC0gYW1vdW50IG9mIHJvd3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBNZW1vcnlHYW1lKGVsZW1lbnQsIHgsIHkpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnggPSBwYXJzZUludCh4KTtcclxuICAgIHRoaXMueSA9IHBhcnNlSW50KHkpO1xyXG4gICAgdGhpcy5sYXlvdXQgPSBuZXcgTWVtb3J5Qm9hcmQoZWxlbWVudCwgdGhpcy54LCB0aGlzLnkpO1xyXG4gICAgdGhpcy5ib2FyZCA9IFtdO1xyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuICAgIHRoaXMudHVybnMgPSAwO1xyXG4gICAgdGhpcy5jb3JyZWN0Q291bnQgPSAwO1xyXG4gICAgdGhpcy5pbWFnZUxpc3QgPSBbMCwgMCwgMSwgMSwgMiwgMiwgMywgMywgNCwgNCwgNSwgNSwgNiwgNiwgNywgN107XHJcbiAgICB0aGlzLmltYWdlcyA9IHRoaXMuaW1hZ2VMaXN0LnNsaWNlKDAsICh0aGlzLnkgKiB0aGlzLngpKTtcclxuICAgIHRoaXMuY2xpY2tGdW5jID0gdGhpcy5jbGljay5iaW5kKHRoaXMpO1xyXG5cclxuICAgIC8vc3RhcnQgbmV3IHRpbWVyXHJcbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyKCk7XHJcbiAgICB0aGlzLnRpbWVyLnN0YXJ0KCk7XHJcblxyXG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG5cclxuICAgIC8vc2h1ZmZsZSBhbmQgYWRkIGV2ZW50bGlzdGVuZXJzXHJcbiAgICB0aGlzLnNodWZmbGVJbWFnZXMoKTtcclxuICAgIHRoaXMuYWRkRXZlbnRzKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0IHRoZSBnYW1lXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgLy9pbml0IHRoZSBlbXB0eSBib2FyZC1hcnJheVxyXG4gICAgdGhpcy5ib2FyZCA9IFtdO1xyXG4gICAgaWYgKHRoaXMueCA+IHRoaXMueSkge1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLng7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IEFycmF5KHRoaXMueCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG5cclxuICAgIC8vcHVzaCBuZXcgY2FyZHMgdG8gdGhlIGJvYXJkLWFycmF5XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMueCAtIDE7IGogKz0gMikge1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkW2ldW2pdID0gbmV3IE1lbW9yeUNhcmQoXCJcIiArIGkgKyBqLCB0aGlzLmltYWdlcy5wb3AoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbaV1baiArIDFdID0gbmV3IE1lbW9yeUNhcmQoXCJcIiArIGkgKyAoaiArIDEpLCB0aGlzLmltYWdlcy5wb3AoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNodWZmbGUgdGhlIGltYWdlcy1hcnJheVxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuc2h1ZmZsZUltYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRlbXA7XHJcbiAgICB2YXIgcmFuZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbWFnZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wID0gdGhpcy5pbWFnZXNbaV07XHJcbiAgICAgICAgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuaW1hZ2VzLmxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZXNbaV0gPSB0aGlzLmltYWdlc1tyYW5kXTtcclxuICAgICAgICB0aGlzLmltYWdlc1tyYW5kXSA9IHRlbXA7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYWRkIHRoZSBldmVudHMgbmVlZGVkXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5hZGRFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgZXZlbnRzXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5yZW1vdmVFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja0Z1bmMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgY2xpY2tzXHJcbiAqIEBwYXJhbSBldmVudCAtIHRoZSBjbGljay1ldmVudFxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy50dXJuQ2FyZChldmVudC50YXJnZXQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHR1cm4gdGhlIGdpdmVuIGNhcmRlXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGNhcmQgdG8gdHVyblxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUudHVybkNhcmQgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoIDwgMiAmJiAhZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJkaXNhYmxlXCIpKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZFwiKSkge1xyXG4gICAgICAgICAgICB2YXIgeXggPSBlbGVtZW50LmNsYXNzTGlzdFswXS5zcGxpdChcIi1cIilbMV07XHJcbiAgICAgICAgICAgIHZhciB5ID0geXguY2hhckF0KDApO1xyXG4gICAgICAgICAgICB2YXIgeCA9IHl4LmNoYXJBdCgxKTtcclxuXHJcbiAgICAgICAgICAgIC8vYWRkIGNsYXNzZXMgdG8gc2hvdyB0aGUgY2FyZFxyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpbWctXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmltZ05yKTtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaW1nXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlQ2FyZHMucHVzaCh0aGlzLmJvYXJkW3ldW3hdKTtcclxuXHJcbiAgICAgICAgICAgIC8vZGlzYWJsZSB0aGUgY2FyZCB0aGF0IGdvdCBjbGlja2VkXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLmJvYXJkW3ldW3hdLmlkKS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZVwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGVDYXJkcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIC8vY2hlY2sgZmkgdGhlIHBhaXIgaXMgdGhlIHNhbWVcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tJZkNvcnJlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgcGFpciBpcyB0aGUgc2FtZVxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuY2hlY2tJZkNvcnJlY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudHVybnMgKz0gMTtcclxuICAgIGlmICh0aGlzLnZpc2libGVDYXJkc1swXS5pbWdOciA9PT0gdGhpcy52aXNpYmxlQ2FyZHNbMV0uaW1nTnIpIHtcclxuICAgICAgICAvL2l0IHdhcyB0aGUgc2FtZSBpbWFnZSwgc2hvdyBpdCB0byB0aGUgdXNlclxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1swXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1sxXS5pZCkuY2xhc3NMaXN0LmFkZChcInJpZ2h0XCIpO1xyXG5cclxuICAgICAgICAvL3Jlc2V0IHRoZSB2aXNpYmxlLWNhcmRzIGFycmF5XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb3JyZWN0Q291bnQgKz0gMTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29ycmVjdENvdW50ID09PSAodGhpcy54ICogdGhpcy55IC8gMikpIHtcclxuICAgICAgICAgICAgLy90aGUgZ2FtZSBpcyBvdmVyIHNpbmNlIHRoZSBjb3JyZWN0Y291bnQgaXMgdGhlIGFtb3VudCBvZiBjYXJkc1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9pdCB3YXMgbm90IGNvcnJlY3QsIHNldCB0aGUgY2xhc3Nlc1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRoaXMudmlzaWJsZUNhcmRzW2ldLmlkKS5jbGFzc0xpc3QuYWRkKFwid3JvbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3R1cm4gYmFjayB0aGUgY2FyZHNcclxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMudHVybkJhY2tDYXJkcy5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byB0dXJuIGJhY2sgY2FyZHMgd2hlbiB3cm9uZ1xyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUudHVybkJhY2tDYXJkcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRlbXBDYXJkO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRlbXBDYXJkID0gdGhpcy52aXNpYmxlQ2FyZHNbaV07XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHRlbXBDYXJkLmlkKS5jbGFzc0xpc3QucmVtb3ZlKFwid3JvbmdcIiwgXCJpbWdcIiwgXCJpbWctXCIgKyB0ZW1wQ2FyZC5pbWdOcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZXNldCB0aGUgYXJyYXlcclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdyB0aGUgZ2FtZSBvdmVyXHJcbiAqL1xyXG5NZW1vcnlHYW1lLnByb3RvdHlwZS5nYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtbWVtb3J5LWdhbWVvdmVyXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5tZW1vcnktdHVybnNcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50dXJucykpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5tZW1vcnktdGltZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLnRvdGFsVGltZSkpO1xyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUdhbWU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIFRpbWVyIGNvbnN0cnVjdG9yXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gVGltZXIoKSB7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRoYXQgc3RhcnRzIGFuIGludGVydmFsIGZvciB0aGUgdGltZXJcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0b3BzIHRoZSB0aW1lciBiZWZvcmUgaXRzIG92ZXJcclxuICogQHJldHVybnMge251bWJlcn0sIHRoZSBkaWZmZXJlbmNlIGluIHNlY29uZHNcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgcmV0dXJuIChub3cgLSB0aGlzLnN0YXJ0VGltZSkgLyAxMDAwO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNob3cgdGhlIHRpbWVyIGF0IHRoZSBnaXZlbiBlbGVtZW50XHJcbiAqIEBwYXJhbSBkaWZme051bWJlcn0gdGhlIHRpbWUgdG8gYmUgcHJpbnRlZFxyXG4gKi9cclxuVGltZXIucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oZGlmZikge1xyXG4gICAgaWYgKHRoaXMuZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpLCB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGlmZikpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBJQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2LCA2LCA2LCA2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzYsIDYsIDYsIDZdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTQsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IElCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIEpCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgMV0sXHJcbiAgICAgICAgICAgIFswLCAxXSxcclxuICAgICAgICAgICAgWzEsIDFdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsxLCAwLCAwXSxcclxuICAgICAgICAgICAgWzEsIDEsIDFdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsxLCAxXSxcclxuICAgICAgICAgICAgWzEsIDBdLFxyXG4gICAgICAgICAgICBbMSwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzEsIDEsIDFdLFxyXG4gICAgICAgICAgICBbMCwgMCwgMV1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMyxcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSkJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gTEJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsyLCAwXSxcclxuICAgICAgICAgICAgWzIsIDBdLFxyXG4gICAgICAgICAgICBbMiwgMl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzIsIDAsIDBdLFxyXG4gICAgICAgICAgICBbMiwgMiwgMl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzIsIDJdLFxyXG4gICAgICAgICAgICBbMCwgMl0sXHJcbiAgICAgICAgICAgIFswLCAyXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMiwgMiwgMl0sXHJcbiAgICAgICAgICAgIFsyLCAwLCAwXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0zLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBTQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDQsIDRdLFxyXG4gICAgICAgICAgICBbNCwgNCwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzQsIDBdLFxyXG4gICAgICAgICAgICBbNCwgNF0sXHJcbiAgICAgICAgICAgIFswLCA0XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNCwgNF0sXHJcbiAgICAgICAgICAgIFs0LCA0LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNCwgMF0sXHJcbiAgICAgICAgICAgIFs0LCA0XSxcclxuICAgICAgICAgICAgWzAsIDRdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNxdWFyZUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs3LCA3XSxcclxuICAgICAgICAgICAgWzcsIDddXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNxdWFyZUJsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gVEJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCAzLCAwXSxcclxuICAgICAgICAgICAgWzMsIDMsIDNdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFszLCAwXSxcclxuICAgICAgICAgICAgWzMsIDNdLFxyXG4gICAgICAgICAgICBbMywgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDMsIDNdLFxyXG4gICAgICAgICAgICBbMCwgMywgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDNdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0yLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIFRldHJpc0dhbWUgPSByZXF1aXJlKFwiLi9UZXRyaXNHYW1lXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgdGV0cmlzLWFwcFxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIHRoZSBzZXR0aW5ncy1vYmplY3RcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUZXRyaXNBcHBsaWNhdGlvbihvcHRpb25zKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuICAgIHRoaXMuZ2FtZSA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSAgVGV0cmlzQXBwbGljYXRpb247XHJcblxyXG4vKipcclxuICogSW5pdCB0aGUgYmFzaWNzXHJcbiAqL1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wcmludCgpO1xyXG5cclxuICAgIC8vY3JlYXRlIG5ldyBnYW1lXHJcbiAgICB0aGlzLmdhbWUgPSBuZXcgVGV0cmlzR2FtZSh0aGlzLmVsZW1lbnQpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxuXHJcbiAgICAvL2FkZCBldmVudGxpc3RlbmVyIGZvciB0aGUgbWVudVxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMubWVudUNsaWNrZWQuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGFwcFxyXG4gKi9cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaVwiKS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWljb25cIik7XHJcblxyXG4gICAgLy9hZGQgdGhlIG1lbnVcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50O1xyXG4gICAgdmFyIGFsdDEgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0MS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOZXcgR2FtZVwiKSk7XHJcblxyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIG1lbnUtY2xpY2tzXHJcbiAqIEBwYXJhbSBldmVudCAtIGNsaWNrLWV2ZW50XHJcbiAqL1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudUNsaWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImFcIikge1xyXG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlIFwibmV3IGdhbWVcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2FtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGFydCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUga2V5LWlucHV0c1xyXG4gKiBAcGFyYW0ga2V5IC0gdGhlIGtleS1jb2RlXHJcbiAqL1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5SW5wdXQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIC8vSWYgZ2FtZSBpcyBcImFsaXZlXCIgYW5kIG5vdCBwYXVzZWQsIGNhbGwgdGhlIGNvcnJlY3QgZnVuY3Rpb25zIGluIGdhbWVcclxuICAgIGlmICh0aGlzLmdhbWUuYWxpdmUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZ2FtZS5wYXVzZWQpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gMzcpIHtcclxuICAgICAgICAgICAgICAgIC8vbGVmdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLm1vdmVGYWxsaW5nQmxvY2soLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gMzkpIHtcclxuICAgICAgICAgICAgICAgIC8vcmlnaHRcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5tb3ZlRmFsbGluZ0Jsb2NrKDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gMzgpIHtcclxuICAgICAgICAgICAgICAgIC8vdXBcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5yb3RhdGVGYWxsaW5nQmxvY2soMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgLy9kb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUuZmFsbEJsb2NrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAzMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLmZhbGxCbG9ja1RvQm90dG9tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgLy9lbnRlcjogcGxheS9wYXVzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnBhdXNlR2FtZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvL3RoZSBnYW1lIGlzIHBhdXNlZCByZXN1bWUgZ2FtZSBpZiBlbnRlclxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJlc3VtZUdhbWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vZ2FtZSBpcyBub3QgcnVubmluZywgc3RhcnQgb24gZW50ZXJcclxuICAgICAgICBpZiAoa2V5ID09PSAxMykge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUuc3RhcnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZGVzdHJveSB0aGUgYXBwXHJcbiAqL1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZ2FtZS5mYWxsaW5nQmxvY2tJbnRlcnZhbCkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZ2FtZS5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluLWZyYW1lXCIpLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0FwcGxpY2F0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEpCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vSkJsb2NrU2hhcGVcIik7XHJcbnZhciBMQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL0xCbG9ja1NoYXBlXCIpO1xyXG52YXIgU0Jsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9TQmxvY2tTaGFwZVwiKTtcclxudmFyIFpCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vWkJsb2NrU2hhcGVcIik7XHJcbnZhciBJQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL0lCbG9ja1NoYXBlXCIpO1xyXG52YXIgU3F1YXJlQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1NxdWFyZUJsb2NrU2hhcGVcIik7XHJcbnZhciBUQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1RCbG9ja1NoYXBlXCIpO1xyXG4vKipcclxuICogVG8gY3JlYXRlIHRoaXMgbW9kdWxlIEkgaGF2ZSByZWFkIHRoZSBmb2xsb3dpbmcgZ3VpZGU6XHJcbiAqIGh0dHA6Ly9nYW1lZGV2ZWxvcG1lbnQudHV0c3BsdXMuY29tL3R1dG9yaWFscy9pbXBsZW1lbnRpbmctdGV0cmlzLWNvbGxpc2lvbi1kZXRlY3Rpb24tLWdhbWVkZXYtODUyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENvbnRydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSB0ZXRyaXMgZ2FtZVxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBkb20tZWxlbWVudCB0byBiZSBwcmludGVkIHRvXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gVGV0cmlzR2FtZShlbGVtZW50KSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2sgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmZpZWxkID0gW107XHJcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmZ1bGxSb3dzID0gW107XHJcbiAgICB0aGlzLmJhc2VQb2ludHMgPSAxMDA7XHJcbiAgICB0aGlzLmZhbGxTcGVlZCA9IDYwMDtcclxuICAgIHRoaXMubGV2ZWwgPSAxO1xyXG4gICAgdGhpcy5yb3dDb3VudCA9IDA7XHJcbiAgICB0aGlzLnBvaW50cyA9IDA7XHJcbiAgICB0aGlzLmhpZ2hTY29yZSA9IDA7XHJcbiAgICB0aGlzLm5leHRCbG9jayA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVkIHRoZSBiYXNpY3Mgb2YgdGhlIG1vZHVsZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pbml0RmllbGQoKTtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICAvL2FkZCBsaXN0ZW5lciB0byBwYXVzZSBpZiBmb2N1cyBpcyBsb3N0XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMucGF1c2VHYW1lLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHBhdXNlIHRoZSBnYW1lXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5wYXVzZUdhbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcGF1c2UgdGhlIGdhbWVcclxuICAgIGlmICh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsICYmIHRoaXMuYWxpdmUpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZXN1bWUgdGhlIGdhbWVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlc3VtZUdhbWUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vc3RhcnQgdGhlIGRyb3AtaW50ZXJ2YWwgYWdhaW5cclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5mYWxsQmxvY2suYmluZCh0aGlzKSwgdGhpcy5mYWxsU3BlZWQpO1xyXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wYXVzZWRcIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogU3RhcnQgdGhlIGdhbWVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vc2V0IGFsbCB0aGUgdmFyaWFibGVzIHRvIHRoZSBzdGFydC1zdGF0ZVxyXG4gICAgdGhpcy5hbGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLmxldmVsID0gMTtcclxuICAgIHRoaXMucG9pbnRzID0gMDtcclxuICAgIHRoaXMuZmFsbFNwZWVkID0gNjAwO1xyXG4gICAgdGhpcy5yb3dDb3VudCA9IDA7XHJcbiAgICB0aGlzLnJlYWRIaWdoU2NvcmUoKTtcclxuXHJcbiAgICAvL21ha2Ugc3VyZSB0aGUgY2xhc3NlcyBpcyByZXNldHRlZFxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ2FtZS1vdmVyXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwibmV3LWhpZ2hzY29yZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wYXVzZWRcIikuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtc3BsYXNoLXNjcmVlblwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcclxuXHJcbiAgICAvL3J1biBhbGwgdGhlIGZ1bmN0aW9ucyB0byBtYWtlIHRoZSBtYWdpYyBoYXBwZW5cclxuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLmluaXRGaWVsZCgpO1xyXG4gICAgdGhpcy5jbGVhckZpZWxkKCk7XHJcbiAgICB0aGlzLnJlbmRlclBvaW50cygpO1xyXG4gICAgdGhpcy5uZXdOZXh0QmxvY2soKTtcclxuICAgIHRoaXMuZHJvcE5ld0Jsb2NrKCk7XHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlYWQgdGhlIGhpZ2ggc2NvcmUgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZWFkSGlnaFNjb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0ZXRyaXMtaHNcIikpIHtcclxuICAgICAgICB0aGlzLmhpZ2hTY29yZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidGV0cmlzLWhzXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIGhpZ2ggc2NvcmUgdG8gbG9jYWwgc3RvcmFnZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuc2F2ZUhpZ2hTY29yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMucG9pbnRzID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRldHJpcy1oc1wiLCB0aGlzLnBvaW50cyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZmFsbCB0aGUgYmxvY2sgb25lIHJvdyBkb3duXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5mYWxsQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmlzRmFsbGFibGUoKSkge1xyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ICs9IDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvL2Jsb2NrIGhhcyBjb2xsaWRlZCwgbGFuZCB0aGUgYmxvY2sgYW5kIGRyb3AgbmV3XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XHJcbiAgICAgICAgdGhpcy5sYW5kRmFsbGluZ0Jsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5kcm9wTmV3QmxvY2soKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3JlbmRlciB0aGUgY2hhbmdlXHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGZhbGwgYmxvY2sgdG8gYm90dG9tIGRpcmVjdGx5XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5mYWxsQmxvY2tUb0JvdHRvbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgd2hpbGUgKHRoaXMuaXNGYWxsYWJsZSgpKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICAvL3JlbmRlciB0aGUgY2hhbmdlXHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJhbmRvbWl6ZSBhIG5ldyBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUubmV3TmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2hhcGUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KTtcclxuXHJcbiAgICAvL2NyZWF0ZSBuZXcgYmxvY2sgZnJvbSB0aGUgcmFuZG9tIG51bWJlclxyXG4gICAgc3dpdGNoIChzaGFwZSkge1xyXG4gICAgICAgIGNhc2UgMDoge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBKQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgMToge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBMQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBTQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBaQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgNDoge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBJQmxvY2tTaGFwZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgNToge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBTcXVhcmVCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSA2OiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFRCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBkcm9wIG5ldyBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZHJvcE5ld0Jsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2dldCB0aGUgYmxvY2sgZnJvbSBuZXh0LWJsb2NrXHJcbiAgICB0aGlzLmZhbGxpbmdCbG9jayA9IHRoaXMubmV4dEJsb2NrO1xyXG5cclxuICAgIC8vZ2V0IGEgbmV3IG5leHQgYmxvY2tcclxuICAgIHRoaXMuY2xlYXJOZXh0QmxvY2soKTtcclxuICAgIHRoaXMubmV3TmV4dEJsb2NrKCk7XHJcblxyXG4gICAgLy9hZGQgZmFsbGludGVydmFsIHdpdGggY3VycmVudCBzcGVlZFxyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmZhbGxCbG9jay5iaW5kKHRoaXMpLCB0aGlzLmZhbGxTcGVlZCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLmlzRmFsbGFibGUoKSkge1xyXG4gICAgICAgIC8vdGhlIG5ldyBibG9jayBjb2xsaWRlZCBhdCBsYXVuY2gsIGdhbWUgb3ZlclxyXG4gICAgICAgIHRoaXMuc2F2ZUhpZ2hTY29yZSgpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuY2xhc3NMaXN0LmFkZChcImdhbWUtb3ZlclwiKTtcclxuICAgICAgICB0aGlzLmFsaXZlID0gZmFsc2U7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gbGFuZCB0aGUgZmFsbGluZyBibG9jayB0byB0aGUgZmllbGRcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmxhbmRGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gPSBzaGFwZVtyb3ddW2NvbF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9jaGVjayBpZiB0aGVyZSBhcmUgZnVsbCByb3dzIGFmdGVyIGxhbmRpbmdcclxuICAgIHRoaXMuZmluZEZ1bGxSb3dzKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuZnVsbFJvd3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vZXJhc2UgdGhlIHJvd3NcclxuICAgICAgICB0aGlzLmVyYXNlRnVsbFJvd3MoKTtcclxuXHJcbiAgICAgICAgLy9jb3VudCBwb2ludHNcclxuICAgICAgICB0aGlzLnBvaW50cyArPSB0aGlzLmNvdW50Um93UG9pbnRzKCk7XHJcblxyXG4gICAgICAgIC8vaWYgbmV3IEhTIGFkZCBjbGFzcyB0byBzaG93IGl0IHRvIHRoZSB1c2VyXHJcbiAgICAgICAgaWYgKHRoaXMucG9pbnRzID4gdGhpcy5oaWdoU2NvcmUpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKS5jbGFzc0xpc3QuYWRkKFwibmV3LWhpZ2hzY29yZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vcmVzZXQgdGhlIGZ1bGxSb3dzIGFycmF5XHJcbiAgICAgICAgdGhpcy5mdWxsUm93cyA9IFtdO1xyXG5cclxuICAgICAgICAvL3JlbmRlciB0aGUgcG9pbnRzXHJcbiAgICAgICAgdGhpcy5yZW5kZXJQb2ludHMoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW5kZXIgdGhlIGdhbWVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jbGVhckZpZWxkKCk7XHJcblxyXG4gICAgLy8gQ2hhbmdlIHRoZSBjbGFzc2VzIHRvIHJlbmRlciB0aGUgYmxvY2tzIHRvIHVzZXJcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0clwiKTtcclxuICAgIHZhciB0ZHM7XHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ZHMgPSB0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1ncmlkIHRkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9hZGQgdGhlIGNsYXNzIHRvIHNob3cgYmxvY2stcGFydFxyXG4gICAgICAgICAgICAgICAgdGRzW2NvbF0uY2xhc3NMaXN0LmFkZChcInRldHJpcy1ibG9jay1wYXJ0XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vcmVuZGVyIHRoZSBmYWxsaW5nIGJsb2NrIGFuZCBuZXh0YmxvY2tcclxuICAgIHRoaXMucmVuZGVyRmFsbGluZ0Jsb2NrKCk7XHJcbiAgICB0aGlzLnJlbmRlck5leHRCbG9jaygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgcG9pbnRzXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXJQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBwb2ludHNFbGVtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBvaW50c1wiKTtcclxuICAgIHZhciBsZXZlbEVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtbGV2ZWxcIik7XHJcbiAgICB2YXIgcG9pbnROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5wb2ludHMpO1xyXG4gICAgdmFyIGxldmVsTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMubGV2ZWwpO1xyXG5cclxuICAgIC8vcmVwbGFjZSB0aGUgdGV4dG5vZGVzIHRvIHRoZSBuZXcgb25lc1xyXG4gICAgcG9pbnRzRWxlbS5yZXBsYWNlQ2hpbGQocG9pbnROb2RlLCBwb2ludHNFbGVtLmZpcnN0Q2hpbGQpO1xyXG4gICAgbGV2ZWxFbGVtLnJlcGxhY2VDaGlsZChsZXZlbE5vZGUsIGxldmVsRWxlbS5maXJzdENoaWxkKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW5kZXIgdGhlIGZhbGxpbmcgYmxvY2tcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlckZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJvdztcclxuICAgIHZhciBjb2w7XHJcblxyXG4gICAgLy9nZXQgdGhlIG5vZGVzXHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdHJcIik7XHJcbiAgICB2YXIgdGRzID0gW107XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcy5wdXNoKHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdGRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1t0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbl07XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93O1xyXG4gICAgICAgICAgICAgICAgdmFyIHggPSBjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL2FkZCBjbGFzcyB0byB0aGUgY29ycmVjdCBibG9jay1wYXJ0XHJcbiAgICAgICAgICAgICAgICBpZiAocm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRkc1t5XVt4XS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWZhbGxpbmctYmxvY2stcGFydFwiLCBcImNvbG9yLVwiICsgc2hhcGVbcm93XVtjb2xdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIG5leHQgYmxvY2tcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlbmRlck5leHRCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJvdztcclxuICAgIHZhciBjb2w7XHJcblxyXG4gICAgLy9nZXQgdGhlIG5vZGVzXHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLW5leHQtYmxvY2sgdGJvZHkgdHJcIik7XHJcbiAgICB2YXIgdGRzID0gW107XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHRycy5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLm5leHRCbG9jay5zaGFwZXNbdGhpcy5uZXh0QmxvY2sucm90YXRpb25dO1xyXG4gICAgZm9yIChyb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9kcmF3IGJsb2NrIGF0IHBvc2l0aW9uIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNoYXBlcyBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgdGRzW3Jvd11bY29sXS5jbGFzc0xpc3QuYWRkKFwidGV0cmlzLWZhbGxpbmctYmxvY2stcGFydFwiLCBcImNvbG9yLVwiICsgc2hhcGVbcm93XVtjb2xdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBjbGVhciB0aGUgbmV4dC1ibG9jay1jb250YWluZXJcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyTmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2NsZWFyIG5leHQtYmxvY2tcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtbmV4dC1ibG9jayB0Ym9keSB0clwiKTtcclxuICAgIHZhciB0ZHM7XHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0cnMubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0ZHMubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICAvL2NsZWFyIHRoZSBjb2x1bW5cclxuICAgICAgICAgICAgdGRzW2NvbF0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyBmYWxsYWJsZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBmYWxsYWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzRmFsbGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmYWxsYWJsZSA9IHRydWU7XHJcblxyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKyAxLFxyXG4gICAgICAgIGNvbDogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xcclxuICAgIH07XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IHRoaXMuZmllbGQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBibG9jayB3b3VsZCBiZSBiZWxvdyB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbGxhYmxlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIG1vdmUgdGhlIGZhbGxpbmcgYmxvY2tcclxuICogQHBhcmFtIGRpclxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUubW92ZUZhbGxpbmdCbG9jayA9IGZ1bmN0aW9uKGRpcikge1xyXG4gICAgaWYgKHRoaXMuaXNNb3ZhYmxlKGRpcikpIHtcclxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbCArPSBkaXI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBjaGVjayBpZiBibG9jayBpcyBtb3ZhYmxlXHJcbiAqIEBwYXJhbSBkaXIgLSBuZWdhdGl2ZSBvciBwb3NpdGl2ZSBudW1iZXJcclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gbW92YWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzTW92YWJsZSA9IGZ1bmN0aW9uKGRpcikge1xyXG4gICAgdmFyIG1vdmFibGUgPSB0cnVlO1xyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIHZhciBwb3RlbnRpYWxUb3BMZWZ0ID0ge1xyXG4gICAgICAgICAgICByb3c6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93LFxyXG4gICAgICAgICAgICBjb2w6IHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sICsgZGlyXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vY2hlY2sgdGhhdCB0aGUgc2hhcGUgaXMgbm90IGFib3ZlIHRoZSBmaWVsZFxyXG4gICAgICAgICAgICBpZiAocm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3cgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbCA+PSB0aGlzLmZpZWxkWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHBvdGVudGlhbFRvcExlZnQucm93XVtjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW92YWJsZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByb3RhdGUgZmFsbGluZyBibG9ja1xyXG4gKiBAcGFyYW0gZGlyIC0gcG9zaXRpdmUgb3IgbmVnYXRpdmUgbnVtYmVyIHRvIGhhbmRsZSBsZWZ0L1JpZ2h0XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yb3RhdGVGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbihkaXIpIHtcclxuICAgIGlmICh0aGlzLmlzUm90YXRhYmxlKGRpcikpIHtcclxuICAgICAgICB2YXIgbmV3Um90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcclxuICAgICAgICBpZiAobmV3Um90YXRpb24gPiAzKSB7XHJcbiAgICAgICAgICAgIG5ld1JvdGF0aW9uID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobmV3Um90YXRpb24gPCAwKSB7XHJcbiAgICAgICAgICAgIG5ld1JvdGF0aW9uID0gMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uID0gbmV3Um90YXRpb247XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBibG9jayBpcyByb3RhdGFibGVcclxuICogQHBhcmFtIGRpciAtIG5lZyBvciBwb3MgbnVtYmVyXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIHJvdGF0YWJsZSBvciBub3RcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmlzUm90YXRhYmxlID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICB2YXIgcm90YXRhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgcG90ZW50aWFsUm90YXRpb24gPSB0aGlzLmZhbGxpbmdCbG9jay5yb3RhdGlvbiArIGRpcjtcclxuICAgIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA+IDMpIHtcclxuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChwb3RlbnRpYWxSb3RhdGlvbiA8IDApIHtcclxuICAgICAgICBwb3RlbnRpYWxSb3RhdGlvbiA9IDM7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jcmVhdGUgcG90ZW50aWFsIHNoYXBlXHJcbiAgICB2YXIgcG90ZW50aWFsU2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbcG90ZW50aWFsUm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHBvdGVudGlhbFNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBwb3RlbnRpYWxTaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgLy9jaGVjayB0aGF0IHRoZSBzaGFwZSBpcyBub3QgYWJvdmUgdGhlIGZpZWxkXHJcbiAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocG90ZW50aWFsU2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIGxlZnQgb2YgdGhlIHBsYXlpbmcgZmllbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgPj0gdGhpcy5maWVsZFswXS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGUgc3BhY2UgaXMgdGFrZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByb3RhdGFibGU7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xlYXIgYWxsIHRoZSB0YWJsZXJvd3MgaW4gZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJGaWVsZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jbGVhciBmaWVsZFxyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidHJcIik7XHJcbiAgICB2YXIgdGRzO1xyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGNsYXNzZXNcclxuICAgICAgICAgICAgdGRzW2NvbF0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGZpbmQgdGhlIGZ1bGxyb3dzIG9uIHRoZSBmaWVsZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZmluZEZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgZnVsbCByb3dzXHJcbiAgICB2YXIgZnVsbCA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aCAtIDE7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpZWxkW3Jvd10uaW5kZXhPZigwKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vcm93IGlzIGZ1bGxcclxuICAgICAgICAgICAgICAgIGZ1bGwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZnVsbCkge1xyXG4gICAgICAgICAgICAvL2FkZCB0aGVtIHRvIHRoZSBhcnJheSBvcyBmdWxsIHJvd3NcclxuICAgICAgICAgICAgdGhpcy5mdWxsUm93cy5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgIHRoaXMucm93Q291bnQgKz0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJvd0NvdW50ICUgNSA9PT0gMCAmJiB0aGlzLmZhbGxTcGVlZCA+IDE1MCkge1xyXG4gICAgICAgICAgICAgICAgLy9zcGVlZCB1cCB0aGUgZ2FtZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mYWxsU3BlZWQgLT0gMzU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxldmVsICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bGwgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZXJhc2UgdGhlIGZ1bGwgcm93cyBmcm9tIGZpZWxkXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5lcmFzZUZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnVsbFJvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAvL3JlbW92ZSB0aGUgZnVsbCByb3cgZnJvbSBmaWVsZFxyXG4gICAgICAgIHRoaXMuZmllbGQuc3BsaWNlKHRoaXMuZnVsbFJvd3NbaV0sIDEpO1xyXG5cclxuICAgICAgICAvL2FkZCBhIG5ldyBlbXB0eSBvbiB0b3Agb2YgZmllbGRcclxuICAgICAgICB2YXIgbmV3Um93ID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xyXG5cclxuICAgICAgICAvL2FkZCBpdCB0byB0aGUgYmVnaW5uaW5nIG9mIGFycmF5XHJcbiAgICAgICAgdGhpcy5maWVsZC51bnNoaWZ0KG5ld1Jvdyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY291bnQgdGhlIHBvaW50c1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIHRoZSBuZXcgcG9pbnRzXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5jb3VudFJvd1BvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8xMDBwIGZvciBvbmUgcm93LCBhZGQgYWRkaXRpb25hbCAyMCUgcGVyIGV4dHJhIHJvd1xyXG4gICAgcmV0dXJuIHRoaXMuYmFzZVBvaW50cyArICgodGhpcy5mdWxsUm93cy5sZW5ndGggLSAxKSAqIHRoaXMuYmFzZVBvaW50cykgKiAxLjI7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgdGhlIGdhbWVib2FyZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcHJpbnQgdGhlIGNoYXQtdGVtcGxhdGUgdG8gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXRldHJpcy1hcHBsaWNhdGlvblwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIHZhciB0cjtcclxuICAgIHZhciB0ZDtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmZpZWxkLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5maWVsZFtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIik7XHJcbiAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5hcHBlbmRDaGlsZChmcmFnKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgZmllbGQtYXJyYXlcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmluaXRGaWVsZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWVsZCA9IFtcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cclxuICAgIF07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRldHJpc0dhbWU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gU0Jsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs1LCA1LCAwXSxcclxuICAgICAgICAgICAgWzAsIDUsIDVdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA1XSxcclxuICAgICAgICAgICAgWzUsIDVdLFxyXG4gICAgICAgICAgICBbNSwgMF1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzUsIDUsIDBdLFxyXG4gICAgICAgICAgICBbMCwgNSwgNV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDVdLFxyXG4gICAgICAgICAgICBbNSwgNV0sXHJcbiAgICAgICAgICAgIFs1LCAwXVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC0yLFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTQmxvY2tTaGFwZTtcclxuIl19

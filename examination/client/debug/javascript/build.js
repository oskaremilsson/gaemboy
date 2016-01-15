(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var BasicWindow = require("./BasicWindow");

function AboutApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

AboutApplication.prototype = Object.create(BasicWindow.prototype);
AboutApplication.prototype.constructor =  AboutApplication;

/**
 * Print the about app
 */
AboutApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("about-app");

    var template = document.querySelector("#template-about-application").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

};

module.exports = AboutApplication;

},{"./BasicWindow":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./Launcher":5}],4:[function(require,module,exports){
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

},{"./BasicWindow":2}],5:[function(require,module,exports){
"use strict";
var ExA = require("./ExampleApplication");
var MemoryApplication = require("./memory/MemoryApplication");
var ChatApplication = require("./chatapp/ChatApplication");
var TetrisApplication = require("./tetris/TetrisApplication");
var AboutApplication = require("./AboutApplication");

/**
 * Constructor for the launcher
 * @param desktop, the parent Desktop object
 * @constructor
 */
function Launcher(desktop) {
    this.desktop = desktop;

    //the datestampoptions to use
    this.dateStampOptions = {
        year: "numeric", month: "numeric",
        day: "numeric"
    };

    //the timestampoptions to use
    this.timeStampOptions = {
        hour: "2-digit", minute: "2-digit"
    };
}

/**
 * Function to initialize the basics
 */
Launcher.prototype.init = function() {
    document.querySelector(".launcher").addEventListener("click", this.launcherClick.bind(this), true);

    this.updateClock();
    window.setInterval(this.updateClock.bind(this), 1000);
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
 * @param type - what app should be started
 * @param icon - what icon to use
 * @param title - what title to use
 */
Launcher.prototype.startApplication = function(type, icon, title) {
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

    var newApp = this.createApplication(type, appOptions);

    if (newApp) {
        //add listener to the window-buttons
        var buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.windowButtonClick.bind(this.desktop));

        //save the object to windows-array
        this.desktop.windows.push(newApp);

        //add to the running-apps-list
        this.addRunningApp(type, newApp);

        //increase the serialnumber and such
        this.desktop.serialNumber += 1;
        this.desktop.offsetX += 1;
        this.desktop.offsetY += 1;

        //set focus to the new app and check bounds
        this.desktop.setFocus(newApp.element);
        this.checkBounds(newApp);
    }
};

Launcher.prototype.createApplication = function(type, appOptions) {
    var newApp;

    //check what app to start and start it, add eventually maximizable and keyActivated
    switch (type) {
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

        case "about":
        {
            appOptions.maximizable = true;
            newApp = new AboutApplication(appOptions);
            newApp.print();

            break;
        }

        case "reset":
        {
            //reset the desktop
            this.desktop.clearDesktop();
            break;
        }
    }

    return newApp;
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

/**
 * Function to update the clock
 */
Launcher.prototype.updateClock = function() {
    var dateObj = new Date();
    var date = dateObj.toLocaleDateString("sv-se", this.dateStampOptions);
    var time = dateObj.toLocaleTimeString("sv-se", this.timeStampOptions);

    var timeElem = document.querySelector(".launcher-clock-time");
    var dateElem = document.querySelector(".launcher-clock-date");

    var timeNode = document.createTextNode(time);
    var dateNode = document.createTextNode(date);

    timeElem.replaceChild(timeNode, timeElem.firstChild);
    dateElem.replaceChild(dateNode, dateElem.firstChild);
};

module.exports = Launcher;

},{"./AboutApplication":1,"./ExampleApplication":4,"./chatapp/ChatApplication":8,"./memory/MemoryApplication":9,"./tetris/TetrisApplication":20}],6:[function(require,module,exports){
"use strict";

var Desktop = require("./Desktop");

var d = new Desktop();
d.init();

},{"./Desktop":3}],7:[function(require,module,exports){
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
            //check if the last char was enter, remove it
            if (input.charCodeAt(input.length - 1) === 10) {
                input = input.slice(0, -1);
            }

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
    var messageNode = this.parseMessage(data.data);

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
 * Function to find and parse message to clickable links and emojis
 * @param text - the message
 * @returns {*} - documentFragment to append as message
 */
Chat.prototype.parseMessage = function(text) {
    var frag = document.createDocumentFragment();
    var link;
    var emoji;
    var textNode;

    //split message into words
    var words = text.split(" ");

    for (var i = 0; i < words.length; i += 1) {
        //search for links
        if (words[i].slice(0, 7) === "http://") {
            link = words[i].slice(7);
            frag = this.addLinkOrEmojiToFragment(frag, "link", link);
        }
        else if (words[i].slice(0, 8) === "https://") {
            link = words[i].slice(7);
            frag = this.addLinkOrEmojiToFragment(frag, "link", link);
        }
        else if (words[i].charAt(0) === ":" || words[i].charAt(0) === ";") {
            emoji = words[i];
            frag = this.addLinkOrEmojiToFragment(frag, "emoji", emoji);
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
 * Function to add the links or emoji to fragment
 * @param frag, the fragment
 * @param type, type of the thing to parse
 * @param data, data to parse
 * @returns {*}, the fragment
 */
Chat.prototype.addLinkOrEmojiToFragment = function(frag, type, data) {
    var textNode;
    if (type === "link") {
        //link found, create a-element
        var aTag = document.createElement("a");
        aTag.setAttribute("href", "//" + data);
        aTag.setAttribute("target", "_blank");
        var linkNode = document.createTextNode(data);

        aTag.appendChild(linkNode);
        textNode = document.createTextNode(" ");

        frag.appendChild(aTag);
        frag.appendChild(textNode);

    }
    else if (type === "emoji") {
        //emoji found, create it
        var spanTag = this.parseEmojis(data);

        textNode = document.createTextNode(" ");

        frag.appendChild(spanTag);
        frag.appendChild(textNode);
    }

    return frag;
};

/**
 * Function to parse the emoji
 * @param emoji
 * @returns {Element} the emoji-element
 */
Chat.prototype.parseEmojis = function(emoji) {
    var template = document.querySelector("#template-chat-emoji").content.cloneNode(true);
    var elem = template.querySelector(".emoji");
    switch (emoji) {
        case ":)":
        case ":-)": {
            elem.classList.add("emoji-smiley");
            break;
        }

        case ":D":
        case ":-D": {
            elem.classList.add("emoji-happy");
            break;
        }

        case ";)":
        case ";-)": {
            elem.classList.add("emoji-flirt");
            break;
        }

        case ":O":
        case ":-O": {
            elem.classList.add("emoji-surprised");
            break;
        }

        case ":P":
        case ":-P": {
            elem.classList.add("emoji-tounge");
            break;
        }

        case ":@": {
            elem.classList.add("emoji-angry");
            break;
        }

        case ":S":
        case ":-S": {
            elem.classList.add("emoji-confused");
            break;
        }

        case ":(":
        case ":-(": {
            elem.classList.add("emoji-sad");
            break;
        }

        case ":'(":
        case ":'-(": {
            elem.classList.add("emoji-crying");
            break;
        }

        case ":L": {
            elem.classList.add("emoji-heart");
            break;
        }

        case ":3": {
            elem.classList.add("emoji-cat");
            break;
        }

        default: {
            elem = document.createTextNode(emoji);
        }
    }

    return elem;
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

},{}],8:[function(require,module,exports){
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
    this.server = "pwd.oskaremilsson.se:20080";
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

},{"../BasicWindow":2,"./Chat":7}],9:[function(require,module,exports){
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

},{"../BasicWindow":2,"./MemoryGame":12}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./MemoryBoard":10,"./MemoryCard":11,"./Timer":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
"use strict";

function LBlockShape() {
    this.shapes = [
        [
            [2, 0],
            [2, 0],
            [2, 2]
        ],
        [
            [0, 0, 2],
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
    if (this.game.alive && !this.game.paused) {
        this.inputToGameHandler(key);
    }
    else {
        if (key === 13) {
            if (this.game.paused) {
                this.game.resumeGame();
            }
            else {
                this.game.start();
            }
        }
    }
};

TetrisApplication.prototype.inputToGameHandler = function(key) {
    switch (key) {
        case 37: {
            //left
            this.game.moveFallingBlock(-1);
            break;
        }

        case 39: {
            //right
            this.game.moveFallingBlock(1);
            break;
        }

        case 38: {
            //up
            this.game.rotateFallingBlock(1);
            break;
        }

        case 40: {
            //down
            this.game.fallBlock();
            break;
        }

        case 32: {
            //space
            this.game.fallBlockToBottom();
            break;
        }

        case 13: {
            //enter
            this.game.pauseGame();
            break;
        }

        case 68: {
            //d
            this.game.demoGame();
            break;
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

    if (this.game.bgMusic) {
        //stop background music
        this.game.bgMusic.pause();
    }

    document.querySelector("#main-frame").removeChild(this.element);
};

module.exports = TetrisApplication;

},{"../BasicWindow":2,"./TetrisGame":21}],21:[function(require,module,exports){
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
    this.FXsounds = false;
    this.BGsounds = false;
    this.bgMusic = new Audio("//root.oskaremilsson.se/tetris-sounds/tetris.mp3");
    this.rotateSound = new Audio("//root.oskaremilsson.se/tetris-sounds/rotate-block.mp3");
    this.landSound = new Audio("//root.oskaremilsson.se/tetris-sounds/land-block.mp3");
    this.lineSound = new Audio("//root.oskaremilsson.se/tetris-sounds/line-remove.mp3");
    this.moveSound = new Audio("//root.oskaremilsson.se/tetris-sounds/move-block.mp3");
    this.gameoverSound = new Audio("//root.oskaremilsson.se/tetris-sounds/game-over.mp3");
    this.fourRowSound = new Audio("//root.oskaremilsson.se/tetris-sounds/four-rows.mp3");

    this.fallingBlockInterval = undefined;
}

/**
 * Initialized the basics of the module
 */
TetrisGame.prototype.init = function() {
    this.initField();
    this.print();

    //add listener to pause if focus is lost
    this.element.addEventListener("blur", this.pauseGame.bind(this));

    //add listener for the sounds toggle
    this.element.querySelector(".tetris-side-info").addEventListener("click", this.soundToggle.bind(this));

    //read sound-settings from local
    if (localStorage.getItem("FXsounds")) {
        var FXsounds = localStorage.getItem("FXsounds");
        if (FXsounds === "true") {
            this.FXsounds = true;
            this.element.querySelector("#tetris-sound-toggle").classList.add("sounds");
        }
    }

    if (localStorage.getItem("BGsounds")) {
        var BGsounds = localStorage.getItem("BGsounds");
        if (BGsounds === "true") {
            this.BGsounds = true;
            this.element.querySelector("#tetris-music-toggle").classList.add("sounds");
        }
    }
};

/**
 * Function to pause the game
 */
TetrisGame.prototype.pauseGame = function() {
    if (this.BGsounds) {
        //play background music
        this.bgMusic.pause();
    }

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
    if (this.BGsounds) {
        //play background music
        this.bgMusic.play();
    }

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

    if (this.BGsounds) {
        //play background music
        this.bgMusic.play();
        this.bgMusic.addEventListener("ended", this.playBackgroundMusic.bind(this), false);
    }
};

TetrisGame.prototype.playBackgroundMusic = function() {
    this.bgMusic.currentTime = 0;
    this.bgMusic.play();
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

        if (this.BGsounds) {
            //stop background music
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }

        window.setTimeout(this.playGameOverSound.bind(this), 500);
    }
};

TetrisGame.prototype.playGameOverSound = function() {
    if (this.FXsounds) {
        //play gameover sound
        this.gameoverSound.currentTime = 0;
        this.gameoverSound.play();
    }
};

/**
 * Function to land the falling block to the field
 */
TetrisGame.prototype.landFallingBlock = function() {
    if (this.FXsounds) {
        //play sound
        this.landSound.currentTime = 0;
        this.landSound.play();
    }

    var shape = this.fallingBlock.shapes[this.fallingBlock.rotation];

    for (var row = 0; row < shape.length; row += 1) {
        for (var col = 0; col < shape[row].length; col += 1) {
            if (shape[row][col] !== 0) {
                if (row + this.fallingBlock.topLeft.row >= 0) {
                    this.field[row + this.fallingBlock.topLeft.row][col + this.fallingBlock.topLeft.col] = shape[row][col];
                }
            }
        }
    }

    //reset the fullRows array
    this.fullRows = [];

    //check if there are full rows after landing
    this.findFullRows();

    if (this.fullRows.length > 0) {
        //call function to make animations
        this.animateFullRows();

        //erase the animation
        window.setTimeout(this.clearAnimation.bind(this), 600);

        //erase the rows
        window.setTimeout(this.eraseFullRows.bind(this), 350);

        //count points
        this.points += this.countRowPoints();

        //if new HS add class to show it to the user
        if (this.points > this.highScore) {
            this.element.querySelector(".tetris-points").classList.add("new-highscore");
        }

        //reset the fullRows array
        //this.fullRows = [];

        //render the points
        this.renderPoints();
    }
};

/**
 * Function to erase animation-classes
 */
TetrisGame.prototype.clearAnimation = function() {
    var trs = this.element.querySelectorAll(".tetris-grid-body tr");

    for (var i = 0; i < trs.length; i += 1) {
        trs[i].classList.remove("full-row");
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
    var pointNode = document.createTextNode(this.points.toString());
    var levelNode = document.createTextNode(this.level.toString());

    //replace the textnodes to the new ones
    pointsElem.replaceChild(pointNode, pointsElem.firstChild);
    levelElem.replaceChild(levelNode, levelElem.firstChild);

    this.animateNewPoints();
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
        if (this.FXsounds) {
            //play sound
            this.moveSound.currentTime = 0;
            this.moveSound.play();
        }

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
            if (col + potentialTopLeft.col < 0) {
                //this block would be to the left of the playing field
                movable = false;
            }

            if (col + potentialTopLeft.col >= this.field[0].length) {
                //this block would be to the right of the playing field
                movable = false;
            }

            //check that the shape is not above the field
            if (row + potentialTopLeft.row >= 0) {
                if (shape[row][col] !== 0) {
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
        if (this.FXsounds) {
            //play sound
            this.rotateSound.currentTime = 0;
            this.rotateSound.play();
        }

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
            if (col + this.fallingBlock.topLeft.col < 0) {
                //this block would be to the left of the playing field
                rotatable = false;
            }

            if (col + this.fallingBlock.topLeft.col >= this.field[0].length) {
                //this block would be to the right of the playing field
                rotatable = false;
            }

            if (row + this.fallingBlock.topLeft.row >= 0) {
                if (potentialShape[row][col] !== 0) {
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
 * Function to aminate the full rows
 */
TetrisGame.prototype.animateFullRows = function() {
    var trs = this.element.querySelectorAll(".tetris-grid-body tr");

    for (var i = 0; i < this.fullRows.length; i += 1) {
        trs[this.fullRows[i]].classList.add("full-row");
    }
};

/**
 * Function to erase the full rows from field
 */
TetrisGame.prototype.eraseFullRows = function() {
    if (this.FXsounds) {
        //play sound
        if (this.fullRows.length === 4) {
            this.fourRowSound.currentTime = 0;
            this.fourRowSound.play();
        }
        else {
            this.lineSound.currentTime = 0;
            this.lineSound.play();
        }
    }

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

/**
 * Function to animate new points
 */
TetrisGame.prototype.animateNewPoints = function() {
    var elem = this.element.querySelector(".tetris-points");

    elem.classList.add("tetris-new-points");

    window.setTimeout(this.clearNewPointsAnimation.bind(this), 550);
};

/**
 * Function to remove the class set by the animate new points
 */
TetrisGame.prototype.clearNewPointsAnimation = function() {
    var elem = this.element.querySelector(".tetris-points");

    elem.classList.remove("tetris-new-points");
};

/**
 * Function to toggle the sounds
 */
TetrisGame.prototype.soundToggle = function(event) {
    if (event.target.id === "tetris-music-toggle") {
        event.target.classList.toggle("sounds");
        this.BGsounds = !this.BGsounds;

        //dave to local storage
        localStorage.setItem("BGsounds", this.BGsounds);

        if (this.BGsounds && this.alive) {
            this.bgMusic.play();
        }
        else {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }
    else if (event.target.id === "tetris-sound-toggle") {
        event.target.classList.toggle("sounds");
        this.FXsounds = !this.FXsounds;

        //save to local storage
        localStorage.setItem("FXsounds", this.FXsounds);
    }
};

/**
 * Function to create a demo-game for presentation
 *
 */
TetrisGame.prototype.demoGame = function() {
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
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
    ];

    this.nextBlock = new IBlockShape();
    this.clearNextBlock();
    this.render();
};

module.exports = TetrisGame;

},{"./IBlockShape":14,"./JBlockShape":15,"./LBlockShape":16,"./SBlockShape":17,"./SquareBlockShape":18,"./TBlockShape":19,"./ZBlockShape":22}],22:[function(require,module,exports){
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

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWJvdXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvQmFzaWNXaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL0Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL0V4YW1wbGVBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvTGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY2hhdGFwcC9DaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jaGF0YXBwL0NoYXRBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5Qm9hcmQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS9NZW1vcnlDYXJkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnkvTWVtb3J5R2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5L1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvSUJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9KQmxvY2tTaGFwZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL0xCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvU0Jsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9TcXVhcmVCbG9ja1NoYXBlLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90ZXRyaXMvVEJsb2NrU2hhcGUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvbi5qcyIsImNsaWVudC9zb3VyY2UvanMvdGV0cmlzL1RldHJpc0dhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL3RldHJpcy9aQmxvY2tTaGFwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2gxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gQWJvdXRBcHBsaWNhdGlvbihpZCwgeCwgeSkge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBpZCwgeCwgeSk7XHJcbn1cclxuXHJcbkFib3V0QXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5BYm91dEFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBBYm91dEFwcGxpY2F0aW9uO1xyXG5cclxuLyoqXHJcbiAqIFByaW50IHRoZSBhYm91dCBhcHBcclxuICovXHJcbkFib3V0QXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYWJvdXQtYXBwXCIpO1xyXG5cclxuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtYWJvdXQtYXBwbGljYXRpb25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBYm91dEFwcGxpY2F0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgYmFzaWMgd2luZG93XHJcbiAqIEBwYXJhbSBvcHRpb25zLCBvYmplY3Qgd2l0aCB0aGUgc2V0dGluZ3NcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBCYXNpY1dpbmRvdyhvcHRpb25zKSB7XHJcbiAgICB0aGlzLmlkID0gb3B0aW9ucy5pZCB8fCBcIlwiICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLnggPSBvcHRpb25zLnggfHwgMTA7XHJcbiAgICB0aGlzLnkgPSBvcHRpb25zLnkgfHwgMTA7XHJcbiAgICB0aGlzLnRhYkluZGV4ID0gb3B0aW9ucy50YWJJbmRleCB8fCAwO1xyXG4gICAgdGhpcy50aXRsZSA9IG9wdGlvbnMudGl0bGUgfHwgdGhpcy5pZDtcclxuICAgIHRoaXMuaWNvbiA9IG9wdGlvbnMuaWNvbiB8fCBcImJ1Z19yZXBvcnRcIjtcclxuICAgIHRoaXMubWF4aW1pemFibGUgPSBvcHRpb25zLm1heGltaXphYmxlIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5rZXlBY3RpdmF0ZWQgPSBvcHRpb25zLmtleUFjdGl2YXRlZCB8fCBmYWxzZTtcclxuICAgIHRoaXMuekluZGV4ID0gb3B0aW9ucy56SW5kZXg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95IHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcmludCB0aGUgd2luZG93XHJcbiAqL1xyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZ2V0IHRoZSB0ZW1wbGF0ZSBhbmQgbW9kaWZ5IGl0IHRvIHRoZSBwYXJhbXNcclxuICAgIHZhciB0ZW1wbGF0ZSAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvd1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciB0ZW1wbGF0ZVdpbmRvdyA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0aGlzLmlkKTtcclxuICAgIHRlbXBsYXRlV2luZG93LnN0eWxlLmxlZnQgPSB0aGlzLnggKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS50b3AgPSB0aGlzLnkgKyBcInB4XCI7XHJcbiAgICB0ZW1wbGF0ZVdpbmRvdy5zdHlsZS56SW5kZXggPSB0aGlzLnpJbmRleDtcclxuICAgIHRlbXBsYXRlV2luZG93LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHRoaXMudGFiSW5kZXgpO1xyXG5cclxuICAgIC8vaW5zZXJ0IHRoZSBuZXcgd2luZG93IGJlZm9yZSBsYXVuY2hlciBpbiB0aGUgRE9NXHJcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKTtcclxuICAgIHZhciBsYXVuY2hlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGF1bmNoZXJcIik7XHJcbiAgICBlbGVtZW50Lmluc2VydEJlZm9yZSh0ZW1wbGF0ZSwgbGF1bmNoZXIpO1xyXG5cclxuICAgIC8vc2F2ZSB0aGUgZWxlbWVudCB0byB0aGUgb2JqZWN0XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5pZCk7XHJcblxyXG4gICAgLy9hZGQgdGl0bGUgYW5kIGljb24gdG8gdGhlIHdpbmRvd1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LXRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudGl0bGUpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMuaWNvbikpO1xyXG5cclxuICAgIC8vYWRkIG1heGltaXplLWJ1dHRvblxyXG4gICAgaWYgKHRoaXMubWF4aW1pemFibGUpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1tYXhpbWl6ZS1idXR0b25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdmFyIHdpbmRvd0J1dHRvbnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctYnV0dG9uc1wiKTtcclxuICAgICAgICB2YXIgcmVtb3ZlQnV0dG9uID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWluaW1pemUtYnV0dG9uXCIpO1xyXG4gICAgICAgIHdpbmRvd0J1dHRvbnMuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgcmVtb3ZlQnV0dG9uKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBNaW5pbWl6ZSB0aGUgd2luZG93XHJcbiAqL1xyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwibWluaW1pemVkXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1heGltaXplIHRoZSB3aW5kb3dcclxuICovXHJcbkJhc2ljV2luZG93LnByb3RvdHlwZS5tYXhpbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJtYXhpbWl6ZWRcIik7XHJcblxyXG4gICAgdmFyIGljb24gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1pY29uIGlcIik7XHJcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtYXhpbWl6ZWRcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHRoaXMueCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy55ICsgXCJweFwiO1xyXG4gICAgICAgIGljb24ucmVwbGFjZUNoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiY3JvcF9kaW5cIiksIGljb24uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWF4aW1pemUtYnV0dG9uXCIpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIFwiTWF4aW1pemVcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gXCIwcHhcIjtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMHB4XCI7XHJcbiAgICAgICAgaWNvbi5yZXBsYWNlQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJmaWx0ZXJfbm9uZVwiKSwgaWNvbi5maXJzdENoaWxkKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tYXhpbWl6ZS1idXR0b25cIikuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgXCJSZXNpemVcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5CYXNpY1dpbmRvdy5wcm90b3R5cGUuY2xlYXJDb250ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpO1xyXG4gICAgd2hpbGUgKGNvbnRlbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgY29udGVudC5yZW1vdmVDaGlsZChjb250ZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1dpbmRvdztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTGF1bmNoZXIgPSByZXF1aXJlKFwiLi9MYXVuY2hlclwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvciBmb3IgdGhlIERlc2t0b3AgbW9kdWxlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gRGVza3RvcCgpIHtcclxuICAgIHRoaXMuYWN0aXZlV2luZG93ID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdXNlTW92ZUZ1bmMgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5tb3VzZVVwRnVuYyA9IHRoaXMubW91c2VVcC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy53aW5kb3dzID0gW107XHJcbiAgICB0aGlzLmNsaWNrWCA9IDA7XHJcbiAgICB0aGlzLmNsaWNrWSA9IDA7XHJcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IDA7XHJcbiAgICB0aGlzLnpJbmRleCA9IDA7XHJcbiAgICB0aGlzLm9mZnNldFggPSAxO1xyXG4gICAgdGhpcy5vZmZzZXRZID0gMTtcclxuICAgIHRoaXMubGF1bmNoZXIgPSBuZXcgTGF1bmNoZXIodGhpcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGJhc2ljIGZlYXR1cmVzIG9mIHRoZSBkZXNrdG9wXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmxhdW5jaGVyLmluaXQoKTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VEb3duLmJpbmQodGhpcykpO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlEb3duLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB3aGF0IHdpbGwgaGFwcGVuIGlmIG1vdXNlIHVwXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5tb3VzZVVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZUZ1bmMpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VVcEZ1bmMpO1xyXG4gICAgdGhpcy5hY3RpdmVXaW5kb3cuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibW92aW5nXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB3aGF0IHdpbGwgaGFwcGVuIHdoZW4gbW91c2UgaXMgZG93blxyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLm1vdXNlRG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICAvL2dldCB0aGUgY2xpY2tlZC13aW5kb3dzIFwibWFpbi1kaXZcIlxyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJtYWluLWZyYW1lXCIpKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIndpbmRvd1wiKSkge1xyXG4gICAgICAgIC8vY2xpY2tlZCBET00gaXMgYSB3aW5kb3cgLSBkbyBzdHVmZlxyXG4gICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LnN0eWxlLnpJbmRleCkgIT09IHRoaXMuekluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9jdXMoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FkZCB0aGUgbGlzdGVuZXJzIHRvIGNoZWNrIGZvciBtb3ZlbWVudCBpZiBjbGljayB3ZXJlIGluIHRoZSB3aW5kb3ctdG9wIG9mIHdpbmRvd1xyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwid2luZG93LXRvcFwiKSkge1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm1heGltaXplZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5hY3RpdmVXaW5kb3cueDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuYWN0aXZlV2luZG93Lnk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtb3ZpbmdcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmVGdW5jKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlVXBGdW5jKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBtb3VzZSBtb3ZlXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHZhciBuZXdYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgdmFyIG5ld1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG4gICAgLy9jaGVjayB3aGVyZSB0aGUgbmV3IG1pZGRsZSBzaG91bGQgYmVcclxuICAgIHZhciBuZXdNaWRkbGVYID0gbmV3WCArIHBhcnNlSW50KHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQub2Zmc2V0V2lkdGgpIC8gMjtcclxuICAgIHZhciBuZXdNaWRkbGVZID0gbmV3WSArIHBhcnNlSW50KHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQub2Zmc2V0SGVpZ2h0KSAvIDI7XHJcblxyXG4gICAgdmFyIHdpbmRvd1cgPSB3aW5kb3cuaW5uZXJXaWR0aDtcclxuICAgIHZhciB3aW5kb3dIID0gd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgIC8vaWYgdGhlIG1vdmUgaXMgbm90IG91dCBvZiBib3VuZHMgdGhlbiBtb3ZlIGl0XHJcbiAgICBpZiAobmV3TWlkZGxlWCA8IHdpbmRvd1cgJiYgbmV3TWlkZGxlWCA+IDAgJiYgbmV3TWlkZGxlWSA8IHdpbmRvd0ggJiYgbmV3WSA+IDApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy54ID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpY2tYO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LnkgPSBldmVudC5jbGllbnRZIC0gdGhpcy5jbGlja1k7XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInJlc2V0LXdpbmRvd1wiKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5lbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLmFjdGl2ZVdpbmRvdy54ICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlV2luZG93LmVsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5hY3RpdmVXaW5kb3cueSArIFwicHhcIjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgY2xpY2tzIG9uIHdpbmRvd3NcclxuICogQHBhcmFtIGV2ZW50XHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS53aW5kb3dCdXR0b25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgYWN0aW9uID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdDtcclxuXHJcbiAgICB2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICAvL2dldCB0aGUgJ3BhcmVudCcgd2luZG93LWVsZW1lbnRcclxuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcclxuICAgICAgICB3aGlsZSAoIWVsZW1lbnQucGFyZW50Tm9kZS5pZCkge1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvL2ZpbmQgd2hhdCB3aW5kb3cgZ290IGNsaWNrZWRcclxuICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIC8vc2V0IGZvY3VzIHRvIHRoZSB3aW5kb3dcclxuICAgICAgICB0aGlzLnNldEZvY3VzKHRoaXMud2luZG93c1tpbmRleF0uZWxlbWVudCk7XHJcblxyXG4gICAgICAgIC8vY2hlY2sgd2hhdCBhY3Rpb24gdG8gdGFrZVxyXG4gICAgICAgIGlmIChhY3Rpb24uY29udGFpbnMoXCJleGl0LWJ1dHRvblwiKSkge1xyXG4gICAgICAgICAgICAvL2Nsb3MgdGhlIGFwcFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KHRoaXMud2luZG93c1tpbmRleF0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhY3Rpb24uY29udGFpbnMoXCJtaW5pbWl6ZS1idXR0b25cIikpIHtcclxuICAgICAgICAgICAgLy9taW5pbWl6ZSB0aGUgYXBwXHJcbiAgICAgICAgICAgIHRoaXMud2luZG93c1tpbmRleF0ubWluaW1pemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYWN0aW9uLmNvbnRhaW5zKFwibWF4aW1pemUtYnV0dG9uXCIpKSB7XHJcbiAgICAgICAgICAgIC8vbWF4aW1pemUgdGhlIGFwcFxyXG4gICAgICAgICAgICBpZiAodGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aW5kb3dzW2luZGV4XS5tYXhpbWl6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsb3NlIGEgd2luZG93IGFuZCBkZXN0cm95IHRoZSBhcHBcclxuICogQHBhcmFtIGlkXHJcbiAqL1xyXG5EZXNrdG9wLnByb3RvdHlwZS5jbG9zZVdpbmRvdyA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICB2YXIgcmVtb3ZlZCA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoICYmICFyZW1vdmVkOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIFwicnVubmluZy1hcHBzXCJcclxuICAgICAgICAgICAgdmFyIGNsaWNrZWRUb29sdGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIlt2YWx1ZT0naWQ6XCIgKyB0aGlzLndpbmRvd3NbaV0uaWQgKyBcIiddXCIpO1xyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gY2xpY2tlZFRvb2x0aXAucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgd2hpbGUgKCFjb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwidG9vbHRpcC1jb250YWluZXJcIikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY2xpY2tlZFRvb2x0aXAucGFyZW50Tm9kZSk7XHJcblxyXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIHdpbmRvdy1saXN0IGFuZCBkZXN0cm95IHRoZSBhcHBcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy53aW5kb3dzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIGFuZCByZXNldCB0aGUgZGVza3RvcFxyXG4gKi9cclxuRGVza3RvcC5wcm90b3R5cGUuY2xlYXJEZXNrdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRoaXMud2luZG93c1tpXS5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIC8vcmVtb3ZlIGZyb20gXCJydW5uaW5nLWFwcHNcIlxyXG4gICAgICAgIHZhciB3aW5kb3dUb29sdGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIlt2YWx1ZT0naWQ6XCIgKyB0aGlzLndpbmRvd3NbaV0uaWQgKyBcIiddXCIpO1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB3aW5kb3dUb29sdGlwLnBhcmVudE5vZGU7XHJcbiAgICAgICAgd2hpbGUgKCFjb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwidG9vbHRpcC1jb250YWluZXJcIikpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQod2luZG93VG9vbHRpcC5wYXJlbnROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLndpbmRvd3MgPSBbXTtcclxuICAgIHRoaXMuc2VyaWFsTnVtYmVyID0gMDtcclxuICAgIHRoaXMub2Zmc2V0WCA9IDE7XHJcbiAgICB0aGlzLm9mZnNldFkgPSAxO1xyXG4gICAgdGhpcy56SW5kZXggPSAwO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiBrZXkgaXMgcHJlc3NlZFxyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuaWQgPT09IHRoaXMuYWN0aXZlV2luZG93LmlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlV2luZG93LmtleUFjdGl2YXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVdpbmRvdy5rZXlJbnB1dChldmVudC5rZXlDb2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGZvY3VzIHRvIGFuIGVsZW1lbnRcclxuICogQHBhcmFtIGVsZW1lbnQgLSB0aGUgZWxlbWVudCB0byBzZXQgZm9jdXMgb25cclxuICovXHJcbkRlc2t0b3AucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG5cclxuICAgIC8vZmluZCB0aGUgd2luZG93IGluIHdpbmRvdy1hcnJheVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAodGhpcy53aW5kb3dzW2ldLmlkID09PSBlbGVtZW50LmlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlV2luZG93ID0gdGhpcy53aW5kb3dzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnpJbmRleCArPSAxO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuekluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuL0Jhc2ljV2luZG93XCIpO1xyXG5cclxuZnVuY3Rpb24gRXhhbXBsZUFwcGxpY2F0aW9uKGlkLCB4LCB5KSB7XHJcbiAgICBCYXNpY1dpbmRvdy5jYWxsKHRoaXMsIGlkLCB4LCB5KTtcclxufVxyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBFeGFtcGxlQXBwbGljYXRpb247XHJcblxyXG4vKipcclxuICogUHJpbnQgdGhlIGV4YW1wbGUgYXBwXHJcbiAqL1xyXG5FeGFtcGxlQXBwbGljYXRpb24ucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBCYXNpY1dpbmRvdy5wcm90b3R5cGUucHJpbnQuY2FsbCh0aGlzKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLmlkKS5jbGFzc0xpc3QuYWRkKFwiZXhhbXBsZS1hcHBcIik7XHJcblxyXG59O1xyXG5cclxuRXhhbXBsZUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgY29uc29sZS5sb2coa2V5KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhhbXBsZUFwcGxpY2F0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEV4QSA9IHJlcXVpcmUoXCIuL0V4YW1wbGVBcHBsaWNhdGlvblwiKTtcclxudmFyIE1lbW9yeUFwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vbWVtb3J5L01lbW9yeUFwcGxpY2F0aW9uXCIpO1xyXG52YXIgQ2hhdEFwcGxpY2F0aW9uID0gcmVxdWlyZShcIi4vY2hhdGFwcC9DaGF0QXBwbGljYXRpb25cIik7XHJcbnZhciBUZXRyaXNBcHBsaWNhdGlvbiA9IHJlcXVpcmUoXCIuL3RldHJpcy9UZXRyaXNBcHBsaWNhdGlvblwiKTtcclxudmFyIEFib3V0QXBwbGljYXRpb24gPSByZXF1aXJlKFwiLi9BYm91dEFwcGxpY2F0aW9uXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgbGF1bmNoZXJcclxuICogQHBhcmFtIGRlc2t0b3AsIHRoZSBwYXJlbnQgRGVza3RvcCBvYmplY3RcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBMYXVuY2hlcihkZXNrdG9wKSB7XHJcbiAgICB0aGlzLmRlc2t0b3AgPSBkZXNrdG9wO1xyXG5cclxuICAgIC8vdGhlIGRhdGVzdGFtcG9wdGlvbnMgdG8gdXNlXHJcbiAgICB0aGlzLmRhdGVTdGFtcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsIG1vbnRoOiBcIm51bWVyaWNcIixcclxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiXHJcbiAgICB9O1xyXG5cclxuICAgIC8vdGhlIHRpbWVzdGFtcG9wdGlvbnMgdG8gdXNlXHJcbiAgICB0aGlzLnRpbWVTdGFtcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCJcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBpbml0aWFsaXplIHRoZSBiYXNpY3NcclxuICovXHJcbkxhdW5jaGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxhdW5jaGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmxhdW5jaGVyQ2xpY2suYmluZCh0aGlzKSwgdHJ1ZSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVDbG9jaygpO1xyXG4gICAgd2luZG93LnNldEludGVydmFsKHRoaXMudXBkYXRlQ2xvY2suYmluZCh0aGlzKSwgMTAwMCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBjbGlja3MgaW4gdGhlIGxhdW5jaGVyXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmxhdW5jaGVyQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgdmFyIGljb247XHJcbiAgICB2YXIgdGl0bGU7XHJcblxyXG4gICAgLy9HZXQgdGhlIGVsZW1lbnQgdGhhdCBnb3QgY2xpY2tlZFxyXG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcclxuXHJcbiAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgIC8vZ2V0IHZhbHVlIGZyb20gdGhlIGVsZW1lbnRcclxuICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIHN3aXRjaFRvID0gdmFsdWUuc3BsaXQoXCI6XCIpO1xyXG5cclxuICAgICAgICAvL2NoZWNrIGlmIHRoZSBjbGljayBpcyBpbiB0aGUgXCJydW5uaW5nLWFwcHNcIi1zZWN0aW9uLlxyXG4gICAgICAgIGlmIChzd2l0Y2hUb1swXSA9PT0gXCJpZFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInRvb2x0aXAtY2xvc2VcIikpIHtcclxuICAgICAgICAgICAgICAgIC8vY2xvc2UgcHJlc3NlZCwgY2xvc2Ugd2luZG93XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xvc2VXaW5kb3coc3dpdGNoVG9bMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9ydW5uaW5nLWFwcHMtdGFiIGNsaWNrZWQsIHN3aXRjaCB0byB0aGF0IGFwcFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1dpbmRvdyhzd2l0Y2hUb1sxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vc3RhcnQgdGhlIGFwcCB0aGF0IGdvdCBjbGlja2VkXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGljb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB0aXRsZSA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50b29sdGlwLXRpdGxlXCIpLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0QXBwbGljYXRpb24odmFsdWUsIGljb24sIHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZ2V0IHdoYXQgZWxlbWVudCBnb3QgY2xpY2tlZCBpbiB0aGUgbGF1bmNoZXJcclxuICogQHBhcmFtIHRhcmdldCAtIHRoZSBldmVudC10YXJnZXQgZnJvbSBjbGlja1xyXG4gKiBAcmV0dXJucyBET00tZWxlbWVudFxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLmdldENsaWNrZWRMYXVuY2hlckVsZW1lbnQgPSBmdW5jdGlvbih0YXJnZXQpIHtcclxuICAgIHZhciBlbGVtZW50O1xyXG5cclxuICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwidmFsdWVcIikpIHtcclxuICAgICAgICAvL2lzIHRoZSBpLXRhZyBpbiB0aGUgbGlcclxuICAgICAgICBlbGVtZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc3RhcnQgbmV3IGFwcGxpY2F0aW9uXHJcbiAqIEBwYXJhbSB0eXBlIC0gd2hhdCBhcHAgc2hvdWxkIGJlIHN0YXJ0ZWRcclxuICogQHBhcmFtIGljb24gLSB3aGF0IGljb24gdG8gdXNlXHJcbiAqIEBwYXJhbSB0aXRsZSAtIHdoYXQgdGl0bGUgdG8gdXNlXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuc3RhcnRBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKHR5cGUsIGljb24sIHRpdGxlKSB7XHJcbiAgICB2YXIgbWFyZ2luWCA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRYKTtcclxuICAgIHZhciBtYXJnaW5ZID0gMTAgKiAodGhpcy5kZXNrdG9wLm9mZnNldFkpO1xyXG5cclxuICAgIC8vY3JlYXRlIHRoZSBzZXR0aW5ncy1vYmplY3RcclxuICAgIHZhciBhcHBPcHRpb25zID0ge1xyXG4gICAgICAgIGlkOiBcIndpbi1cIiArIHRoaXMuZGVza3RvcC5zZXJpYWxOdW1iZXIsXHJcbiAgICAgICAgeDogbWFyZ2luWCxcclxuICAgICAgICB5OiBtYXJnaW5ZLFxyXG4gICAgICAgIHRhYkluZGV4OiB0aGlzLmRlc2t0b3Auc2VyaWFsTnVtYmVyLFxyXG4gICAgICAgIHpJbmRleDogdGhpcy5kZXNrdG9wLnpJbmRleCxcclxuICAgICAgICBpY29uOiBpY29uLFxyXG4gICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICBtYXhpbWl6YWJsZTogZmFsc2UsXHJcbiAgICAgICAga2V5QWN0aXZhdGVkOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbmV3QXBwID0gdGhpcy5jcmVhdGVBcHBsaWNhdGlvbih0eXBlLCBhcHBPcHRpb25zKTtcclxuXHJcbiAgICBpZiAobmV3QXBwKSB7XHJcbiAgICAgICAgLy9hZGQgbGlzdGVuZXIgdG8gdGhlIHdpbmRvdy1idXR0b25zXHJcbiAgICAgICAgdmFyIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgbmV3QXBwLmlkICsgXCIgLndpbmRvdy1idXR0b25zXCIpO1xyXG4gICAgICAgIGJ1dHRvbnMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZGVza3RvcC53aW5kb3dCdXR0b25DbGljay5iaW5kKHRoaXMuZGVza3RvcCkpO1xyXG5cclxuICAgICAgICAvL3NhdmUgdGhlIG9iamVjdCB0byB3aW5kb3dzLWFycmF5XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLndpbmRvd3MucHVzaChuZXdBcHApO1xyXG5cclxuICAgICAgICAvL2FkZCB0byB0aGUgcnVubmluZy1hcHBzLWxpc3RcclxuICAgICAgICB0aGlzLmFkZFJ1bm5pbmdBcHAodHlwZSwgbmV3QXBwKTtcclxuXHJcbiAgICAgICAgLy9pbmNyZWFzZSB0aGUgc2VyaWFsbnVtYmVyIGFuZCBzdWNoXHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNlcmlhbE51bWJlciArPSAxO1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5vZmZzZXRYICs9IDE7XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFkgKz0gMTtcclxuXHJcbiAgICAgICAgLy9zZXQgZm9jdXMgdG8gdGhlIG5ldyBhcHAgYW5kIGNoZWNrIGJvdW5kc1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXRGb2N1cyhuZXdBcHAuZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5jaGVja0JvdW5kcyhuZXdBcHApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTGF1bmNoZXIucHJvdG90eXBlLmNyZWF0ZUFwcGxpY2F0aW9uID0gZnVuY3Rpb24odHlwZSwgYXBwT3B0aW9ucykge1xyXG4gICAgdmFyIG5ld0FwcDtcclxuXHJcbiAgICAvL2NoZWNrIHdoYXQgYXBwIHRvIHN0YXJ0IGFuZCBzdGFydCBpdCwgYWRkIGV2ZW50dWFsbHkgbWF4aW1pemFibGUgYW5kIGtleUFjdGl2YXRlZFxyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcImV4YW1wbGVcIjoge1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXBwT3B0aW9ucy5rZXlBY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgRXhBKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAucHJpbnQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIm1lbW9yeVwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9zZXQgc2V0dGluZyB0byBsaXN0ZW4gb24ga2V5c1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLmtleUFjdGl2YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0FwcCA9IG5ldyBNZW1vcnlBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImNoYXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vc2V0IG9wdGlvbiB0byBiZSBhYmxlIHRvIG1heGltaXplIHdpbmRvd1xyXG4gICAgICAgICAgICBhcHBPcHRpb25zLm1heGltaXphYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IENoYXRBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLmluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcInRldHJpc1wiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9zZXQgb3B0aW9uIHRvIGxpc3RlbiBvbiBrZXlzXHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMua2V5QWN0aXZhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmV3QXBwID0gbmV3IFRldHJpc0FwcGxpY2F0aW9uKGFwcE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBuZXdBcHAuaW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwiYWJvdXRcIjpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMubWF4aW1pemFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdBcHAgPSBuZXcgQWJvdXRBcHBsaWNhdGlvbihhcHBPcHRpb25zKTtcclxuICAgICAgICAgICAgbmV3QXBwLnByaW50KCk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgXCJyZXNldFwiOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9yZXNldCB0aGUgZGVza3RvcFxyXG4gICAgICAgICAgICB0aGlzLmRlc2t0b3AuY2xlYXJEZXNrdG9wKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3QXBwO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiB0aGUgbmV3IHdpbmRvdyBpcyBvdXQgb2YgYm91bmRzXHJcbiAqIEBwYXJhbSBhcHAgLSB0aGUgYXBwLW9iamVjdCB0byBiZSBjaGVja2VkXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuY2hlY2tCb3VuZHMgPSBmdW5jdGlvbihhcHApIHtcclxuICAgIHZhciB3aW5kb3dXID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB2YXIgd2luZG93SCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuXHJcbiAgICB2YXIgYXBwUmlnaHQgPSBhcHAueCArIHBhcnNlSW50KGFwcC5lbGVtZW50Lm9mZnNldFdpZHRoKTtcclxuICAgIHZhciBhcHBCb3R0b20gPSBhcHAueSArIHBhcnNlSW50KGFwcC5lbGVtZW50Lm9mZnNldEhlaWdodCk7XHJcblxyXG4gICAgLy9jaGVjayBpZiB0aGUgYXBwLXdpbmRvdyBpcyBvdXQgb2YgYm91bmRzIGFuZCBnZXQgaXQgaW50byBib3VuZHNcclxuICAgIGlmIChhcHBSaWdodCA+IHdpbmRvd1cgfHwgYXBwLnggPCAwKSB7XHJcbiAgICAgICAgLy9yZXNldCB0aGUgb2Zmc2V0XHJcbiAgICAgICAgdGhpcy5kZXNrdG9wLm9mZnNldFggPSAxO1xyXG5cclxuICAgICAgICAvL3NldCBuZXcgcG9zaXRpb25zXHJcbiAgICAgICAgYXBwLnggPSAxMCAqICh0aGlzLmRlc2t0b3Aub2Zmc2V0WCk7XHJcbiAgICAgICAgYXBwLmVsZW1lbnQuc3R5bGUubGVmdCA9IGFwcC54ICsgXCJweFwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXBwQm90dG9tID4gd2luZG93SCB8fCBhcHAueSA8IDApIHtcclxuICAgICAgICAvL3Jlc2V0IHRoZSBvZmZzZXRcclxuICAgICAgICB0aGlzLmRlc2t0b3Aub2Zmc2V0WSA9IDE7XHJcblxyXG4gICAgICAgIC8vc2V0IG5ldyBwb3NpdGlvbnNcclxuICAgICAgICBhcHAueSA9IDEwICogKHRoaXMuZGVza3RvcC5vZmZzZXRZKTtcclxuICAgICAgICBhcHAuZWxlbWVudC5zdHlsZS50b3AgPSBhcHAueSArIFwicHhcIjtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgZm9jdXMgb24gY2FsbCwgYW5kIHNob3cgbWluaW1pemVkIHdpbmRvdyBhZ2FpblxyXG4gKiBAcGFyYW0gaWQgLSB0aGUgd2luZG93LWlkIHRvIHNldCBmb2N1cyBvblxyXG4gKi9cclxuTGF1bmNoZXIucHJvdG90eXBlLnN3aXRjaFRvV2luZG93ID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciB3aW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgaWQpO1xyXG4gICAgaWYgKHdpbmRvdykge1xyXG4gICAgICAgIC8vaWYgbWluaW1pemVkLCBzaG93IGl0IGFnYWluXHJcbiAgICAgICAgaWYgKHdpbmRvdy5jbGFzc0xpc3QuY29udGFpbnMoXCJtaW5pbWl6ZWRcIikpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsYXNzTGlzdC5yZW1vdmUoXCJtaW5pbWl6ZWRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3NldCBmb2N1c1xyXG4gICAgICAgIHRoaXMuZGVza3RvcC5zZXRGb2N1cyh3aW5kb3cpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCBhIG5ldyBhcHAgdG8gdGhlIHJ1bm5pbmctYXBwLWxpc3RcclxuICogQHBhcmFtIHR5cGUgLSB3aGF0IHR5cGUgaXMgdGhlIGFwcCAod2hhdCBsaXN0IHRvIGFkZCB0bylcclxuICogQHBhcmFtIGFwcCAtIHRoZSBhcHAtb2JqZWN0IHRvIGJlIGFkZGVkXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUuYWRkUnVubmluZ0FwcCA9IGZ1bmN0aW9uKHR5cGUsIGFwcCkge1xyXG4gICAgLy9nZXQgdGhlIHRvb2x0aXAtY29udGFpbmVyIGZvciB0aGUgYXBwIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3RcclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibGlbdmFsdWU9J1wiICsgdHlwZSArIFwiJ10gLnRvb2x0aXAtY29udGFpbmVyXCIpO1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10b29sdGlwXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi50b29sdGlwXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC50aXRsZSArIFwiKFwiICsgYXBwLmlkICsgXCIpXCIpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcFwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIudG9vbHRpcC1jbG9zZVwiKS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBcImlkOlwiICsgYXBwLmlkKTtcclxuXHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byB1cGRhdGUgdGhlIGNsb2NrXHJcbiAqL1xyXG5MYXVuY2hlci5wcm90b3R5cGUudXBkYXRlQ2xvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkYXRlT2JqID0gbmV3IERhdGUoKTtcclxuICAgIHZhciBkYXRlID0gZGF0ZU9iai50b0xvY2FsZURhdGVTdHJpbmcoXCJzdi1zZVwiLCB0aGlzLmRhdGVTdGFtcE9wdGlvbnMpO1xyXG4gICAgdmFyIHRpbWUgPSBkYXRlT2JqLnRvTG9jYWxlVGltZVN0cmluZyhcInN2LXNlXCIsIHRoaXMudGltZVN0YW1wT3B0aW9ucyk7XHJcblxyXG4gICAgdmFyIHRpbWVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlci1jbG9jay10aW1lXCIpO1xyXG4gICAgdmFyIGRhdGVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sYXVuY2hlci1jbG9jay1kYXRlXCIpO1xyXG5cclxuICAgIHZhciB0aW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRpbWUpO1xyXG4gICAgdmFyIGRhdGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0ZSk7XHJcblxyXG4gICAgdGltZUVsZW0ucmVwbGFjZUNoaWxkKHRpbWVOb2RlLCB0aW1lRWxlbS5maXJzdENoaWxkKTtcclxuICAgIGRhdGVFbGVtLnJlcGxhY2VDaGlsZChkYXRlTm9kZSwgZGF0ZUVsZW0uZmlyc3RDaGlsZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExhdW5jaGVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBEZXNrdG9wID0gcmVxdWlyZShcIi4vRGVza3RvcFwiKTtcclxuXHJcbnZhciBkID0gbmV3IERlc2t0b3AoKTtcclxuZC5pbml0KCk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgY2hhdFxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBlbGVtbnQgdG8gcHJpbnQgdG9cclxuICogQHBhcmFtIHNlcnZlciAtIHRoZSBzZXJ2ZXJcclxuICogQHBhcmFtIGNoYW5uZWwgLSB0aGUgY2hhbm5lbCwgZGVmYXVsdCBlbXB0eVxyXG4gKiBAcGFyYW0gdXNlcm5hbWUgLSB1c2VybmFtZVxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIENoYXQoZWxlbWVudCwgc2VydmVyLCBjaGFubmVsLCB1c2VybmFtZSkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xyXG4gICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbCB8fCBcIlwiO1xyXG4gICAgdGhpcy51c2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgdGhpcy5zb2NrZXQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmtleSA9IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIjtcclxuICAgIHRoaXMub25saW5lID0gZmFsc2U7XHJcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XHJcblxyXG4gICAgLy90aGUgdGltZXN0YW1wb3B0aW9ucyB0byB1c2VcclxuICAgIHRoaXMudGltZVN0YW1wT3B0aW9ucyA9IHtcclxuICAgICAgICB5ZWFyOiBcIm51bWVyaWNcIiwgbW9udGg6IFwibnVtZXJpY1wiLFxyXG4gICAgICAgIGRheTogXCJudW1lcmljXCIsIGhvdXI6IFwiMi1kaWdpdFwiLCBtaW51dGU6IFwiMi1kaWdpdFwiXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaW5pdCB0aGUgYmFzaWNzXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgLy9nZXQgdGhlIHN0b3JlZCBtZXNzYWdlc1xyXG4gICAgdGhpcy5yZWFkU3RvcmVkTWVzc2FnZXMoKTtcclxuXHJcbiAgICAvL2Nvbm5lY3RcclxuICAgIHRoaXMuY29ubmVjdFRvU2VydmVyKCk7XHJcblxyXG4gICAgLy9hZGQgbGlzdGVuZXJzXHJcbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm5ld01lc3NhZ2VGcm9tU2VydmVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1zZW5kQnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmZvcm1TdWJtaXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLmZvcm1TdWJtaXQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMudG9nZ2xlRm9jdXMuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMuY2hlY2tJbnB1dC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy50b2dnbGVGb2N1cy5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgY2hhdFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vcHJpbnQgdGhlIGNoYXQtdGVtcGxhdGUgdG8gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtYXBwbGljYXRpb25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgLy9wcmludCBpbmZvXHJcbiAgICB2YXIgaW5mbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtd2luZG93LW1lbnUtaW5mb1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHZhciBjaGFubmVsSW5mbyA9IFwiXCI7XHJcblxyXG4gICAgLy9oYW5kbGUgdGhlIGNoYW5uZWxzXHJcbiAgICBpZiAodGhpcy5jaGFubmVsID09PSBcIlwiKSB7XHJcbiAgICAgICAgY2hhbm5lbEluZm8gPSBcIk5vbi1zcGVjaWZpZWRcIjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNoYW5uZWxJbmZvID0gdGhpcy5jaGFubmVsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vc2hvdyBpbmZvXHJcbiAgICB2YXIgaW5mb05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIiNcIiArIGNoYW5uZWxJbmZvLnNsaWNlKDAsIDE4KSArIFwiL1wiICsgdGhpcy51c2VybmFtZS5zbGljZSgwLCAxMCkpO1xyXG4gICAgaW5mby5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaW5mb1wiKS5hcHBlbmRDaGlsZChpbmZvTm9kZSk7XHJcblxyXG4gICAgdmFyIG1lbnVJbmZvID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pbmZvXCIpO1xyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIGlmIChtZW51SW5mbykge1xyXG4gICAgICAgIG1lbnUucmVwbGFjZUNoaWxkKGluZm8sIG1lbnVJbmZvKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIG1lbnUuYXBwZW5kQ2hpbGQoaW5mbyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY29ubmVjdCB0byB0aGUgc2VydmVyXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5jb25uZWN0VG9TZXJ2ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2hhbmdlIHRoZSBjbGFzc2VzIHRvIHNob3cgd2hhdHMgaGFwcGVuaW5nXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuXHJcbiAgICAvL3N0YXJ0IG5ldyB3ZWJzb2NrZXRcclxuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChcIndzOi8vXCIgKyB0aGlzLnNlcnZlciwgXCJjaGFyY29yZHNcIik7XHJcblxyXG4gICAgLy9hZGQgbGlzdGVuZXJzIHRvIHRoZSBzb2NrZXRcclxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIHRoaXMuc2V0T25saW5lLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIHRoaXMuc2V0T2ZmbGluZS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8vZnVuY3Rpb24gdG8gc2V0IGNoYXQgb2ZmbGluZSBpZiBlcnJvclxyXG5DaGF0LnByb3RvdHlwZS5zZXRPZmZsaW5lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctaWNvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiY2hhdC1jb25uZWN0aW5nXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb2ZmbGluZVwiKTtcclxuICAgIHRoaXMub25saW5lID0gZmFsc2U7XHJcblxyXG4gICAgLy9wcmludCBtZXNzYWdlIGluIHRoZSBjaGF0IGZyb20gXCJnbGFkb3NcIiB0byBzaG93IHRoYXQgdGhlIGNvbm5lY3Rpb24gZmFpbGVkXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICB1c2VybmFtZTogXCJHbGFEb3NcIixcclxuICAgICAgICBkYXRhOiBcIkNvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlci4uLiBZb3UgY2FuIHN0aWxsIHJlYWQgeW91ciBjaGF0IGhpc3RvcnlcIlxyXG4gICAgfTtcclxuICAgIHRoaXMucHJpbnROZXdNZXNzYWdlKGRhdGEpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNldCBjaGF0IG9ubGluZSBpZiBjb25uZWN0ZWRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnNldE9ubGluZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5vbmxpbmUgPSB0cnVlO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtY29ubmVjdGluZ1wiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9ubGluZVwiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIG1lc3NhZ2VzIGZyb20gc2VydmVyXHJcbiAqIEBwYXJhbSBldmVudCAtIHRoZSBkYXRhc3RyaW5nIGZyb20gc2VydmVyXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5uZXdNZXNzYWdlRnJvbVNlcnZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICBpZiAoZGF0YS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG4gICAgICAgIC8vYWRkIHRpbWVzdGFtcCB0byBkYXRhLW9iamVjdFxyXG4gICAgICAgIGRhdGEudGltZXN0YW1wID0gbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoXCJzdi1zZVwiLCB0aGlzLnRpbWVTdGFtcE9wdGlvbnMpO1xyXG4gICAgICAgIGlmICghZGF0YS5jaGFubmVsKSB7XHJcbiAgICAgICAgICAgIGRhdGEuY2hhbm5lbCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2NoZWNrIHRoZSBjaGFubmVsIGFuZCBhdHQgdGhlIG1lc3NhZ2UgaWYgaXRzIHRoZSBzYW1lXHJcbiAgICAgICAgaWYgKGRhdGEuY2hhbm5lbCA9PT0gdGhpcy5jaGFubmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJpbnROZXdNZXNzYWdlKGRhdGEpO1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVOZXdNZXNzYWdlKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzdWJtaXQgYSBtZXNzYWdlXHJcbiAqIEBwYXJhbSBldmVudCAtIHRoZSBldmVudCBmcm9tIGZvcm1cclxuICovXHJcbkNoYXQucHJvdG90eXBlLmZvcm1TdWJtaXQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgaWYgKGV2ZW50KSB7XHJcbiAgICAgICAgLy9kb250IHN1Ym1pdCB0aGUgZm9ybSBzdGFuZGFyZC13YXlcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm9ubGluZSkge1xyXG4gICAgICAgIC8vZ2V0IHRoZSBpbnB1dCBmcm9tIGZvcm1cclxuICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LWlucHV0RmllbGRcIikudmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIC8vY2hlY2sgaWYgdGhlIGxhc3QgY2hhciB3YXMgZW50ZXIsIHJlbW92ZSBpdFxyXG4gICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgICAgIGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgLTEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL3RoZSBtZXNzYWdlIGlzIGF0IGxlYXN0IG9uZSBjaGFyLCBjcmVhdGUgb2JqZWN0IHRvIHNlbmRcclxuICAgICAgICAgICAgdmFyIG1zZyA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCxcclxuICAgICAgICAgICAgICAgIGtleTogdGhpcy5rZXlcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vc2VuZCB0aGUgb2JqZWN0IHRvIHNlcnZlclxyXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1zZykpO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIHRoZSBidXR0b24gYW5kIHJlc2V0IHRoZSBmb3JtXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcImZvcm1cIikucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcHJpbnQgbWVzc2FnZSB0byB0aGUgd2luZG93XHJcbiAqIEBwYXJhbSBkYXRhIC0gdGhlIGRhdGEtc3RyaW5nIHRvIHByaW50XHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5wcmludE5ld01lc3NhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAvL2dldCB0aGUgY29udGFpbmVyIHRvIGNoZWNrIHNjcm9sbGVkXHJcbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICB2YXIgc2Nyb2xsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZSB1c2VyIGhhcyBzY3JvbGxlZCB1cFxyXG4gICAgaWYgKGNvbnRhaW5lci5zY3JvbGxUb3AgIT09IChjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLm9mZnNldEhlaWdodCkpIHtcclxuICAgICAgICBzY3JvbGxlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy9nZXQgdGhlIHRlbXBsYXRlIGZvciBuZXcgbWVzc2FnZSBhbmQgbW9kaWZ5IGl0XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtbWVzc2FnZS1saW5lXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgdmFyIHVzZXJuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUgKyBcIjogXCIpO1xyXG4gICAgdmFyIG1lc3NhZ2VOb2RlID0gdGhpcy5wYXJzZU1lc3NhZ2UoZGF0YS5kYXRhKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtbWVzc2FnZVwiKS5hcHBlbmRDaGlsZChtZXNzYWdlTm9kZSk7XHJcbiAgICBpZiAoZGF0YS50aW1lc3RhbXApIHtcclxuICAgICAgICAvL2FkZCB0aGUgdGltZXN0YW1wIGFzIHRpdGxlXHJcbiAgICAgICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGluZVwiKS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBkYXRhLnRpbWVzdGFtcCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMudXNlcm5hbWUgPT09IGRhdGEudXNlcm5hbWUpIHtcclxuICAgICAgICAvL2l0J3MgbXkgbWVzc2FnZSAtIGFkZCBjbGFzcyB0byBzaG93IHRoYXRcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlLW1lXCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9tZXNzYWdlIGlzbid0IG1pbmUsIHNob3cgdGhhdCB2aWEgY2xhc3NcclxuICAgICAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwibGlcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtYnViYmxlXCIpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC11c2VybmFtZVwiKS5hcHBlbmRDaGlsZCh1c2VybmFtZU5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXBwZW5kIHRoZSBuZXcgbWVzc2FnZVxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG5cclxuICAgIC8vYXV0b3Njcm9sbCB0byBib3R0b21cclxuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oc2Nyb2xsZWQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGF1dG9zY3JvbGwgd2hlbiBuZXcgbWVzc2FnZVxyXG4gKiBAcGFyYW0gc2Nyb2xsZWRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnNjcm9sbFRvQm90dG9tID0gZnVuY3Rpb24oc2Nyb2xsZWQpIHtcclxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jaGF0LW1lc3NhZ2UtbGlzdFwiKTtcclxuICAgIGlmICghc2Nyb2xsZWQpIHtcclxuICAgICAgICAvL0lmIHVzZXIgd2FzIGF0IGJvdHRvbSwgYXV0by1zY3JvbGwgZG93biB0byB0aGUgbmV3IGJvdHRvbSBhZnRlciBuZXcgbWVzc2FnZVxyXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNhdmUgdGhlIG5ldyBtZXNzYWdlIHRvIGxvY2FsIHN0b3JhZ2UgZm9yIGhpc3RvcnlcclxuICogQHBhcmFtIGRhdGFcclxuICovXHJcbkNoYXQucHJvdG90eXBlLnNhdmVOZXdNZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIG5ld01zZyA9IHtcclxuICAgICAgICB1c2VybmFtZTogZGF0YS51c2VybmFtZSxcclxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXHJcbiAgICAgICAgdGltZXN0YW1wOiBkYXRhLnRpbWVzdGFtcFxyXG4gICAgfTtcclxuXHJcbiAgICAvL2FkZCB0aGUgbmV3IG1lc3NhZ2UgdG8gdGhlIGFycmF5IGFuZCBzYXZlIGl0XHJcbiAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobmV3TXNnKTtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCwgSlNPTi5zdHJpbmdpZnkodGhpcy5tZXNzYWdlcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlYWQgdGhlIHN0b3JlZCBtZXNzYWdlcyBmcm9tIGxvY2FsIHN0b3JhZ2UgYW5kIHByaW50IHRoZW1cclxuICovXHJcbkNoYXQucHJvdG90eXBlLnJlYWRTdG9yZWRNZXNzYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY2hhdC1cIiArIHRoaXMuY2hhbm5lbCkpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNoYXQtXCIgKyB0aGlzLmNoYW5uZWwpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBKU09OLnBhcnNlKG1lc3NhZ2VzKTtcclxuXHJcbiAgICAgICAgLy9wcmludCBhbGwgdGhlIG1lc3NhZ2VzIGZyb20gaGlzdG9yeVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tZXNzYWdlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByaW50TmV3TWVzc2FnZSh0aGlzLm1lc3NhZ2VzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYWRkIGVuZC1vZi1oaXN0b3J5IHNlcGFyYXRvclxyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUtY2hhdC1oaXN0b3J5LXNlcGFyYXRvclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3QgdWxcIikuYXBwZW5kQ2hpbGQoc2VwYXJhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIC8vc2Nyb2xsIHRvIGJvdHRvbVxyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdC1tZXNzYWdlLWxpc3RcIik7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byB0b2dnbGUgdGhlIGZvY3VzXHJcbiAqIG5lZWRlZCBzaW5jZSB0aGUgd2luZG93IGRyb3BzIGZvY3VzIHdoZW4gZm9ybSBpbiB3aW5kb3cgaXMgZm9jdXNlZFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUudG9nZ2xlRm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgdGhlIGlucHV0IGluIHRleHRhcmVhXHJcbiAqIEBwYXJhbSBldmVudFxyXG4gKi9cclxuQ2hhdC5wcm90b3R5cGUuY2hlY2tJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAvL2dldCB0aGUgaW5wdXRcclxuICAgIHZhciBpbnB1dCA9IGV2ZW50LnRhcmdldC52YWx1ZTtcclxuXHJcbiAgICAvL2hhbmRsZSB0aGF0IHRoZSBidXR0b24gc2hvdWxkIG9ubHkgYmUgY2xpY2thYmxlIGlmIGlucHV0IGlzIG9uZSBvciBtb3JlIGNoYXJzXHJcbiAgICBpZiAoaW5wdXQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vY2hlY2sgaWYgdGhlIGxhc3QgY2hhciB3YXMgZW50ZXIsIGFuZCBzdWJtaXRcclxuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KGlucHV0Lmxlbmd0aCAtIDEpID09PSAxMCkge1xyXG4gICAgICAgIHRoaXMuZm9ybVN1Ym1pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KDApID09PSAxMCkge1xyXG4gICAgICAgIC8vZmlyc3QgY2hhciBpcyBlbnRlciwgcmVzZXQgZm9ybSBhbmQgZGlzYWJsZSBzZW5kLWJ1dHRvblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKS5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNoYXQtc2VuZEJ1dHRvblwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGZpbmQgYW5kIHBhcnNlIG1lc3NhZ2UgdG8gY2xpY2thYmxlIGxpbmtzIGFuZCBlbW9qaXNcclxuICogQHBhcmFtIHRleHQgLSB0aGUgbWVzc2FnZVxyXG4gKiBAcmV0dXJucyB7Kn0gLSBkb2N1bWVudEZyYWdtZW50IHRvIGFwcGVuZCBhcyBtZXNzYWdlXHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5wYXJzZU1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIHZhciBsaW5rO1xyXG4gICAgdmFyIGVtb2ppO1xyXG4gICAgdmFyIHRleHROb2RlO1xyXG5cclxuICAgIC8vc3BsaXQgbWVzc2FnZSBpbnRvIHdvcmRzXHJcbiAgICB2YXIgd29yZHMgPSB0ZXh0LnNwbGl0KFwiIFwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgLy9zZWFyY2ggZm9yIGxpbmtzXHJcbiAgICAgICAgaWYgKHdvcmRzW2ldLnNsaWNlKDAsIDcpID09PSBcImh0dHA6Ly9cIikge1xyXG4gICAgICAgICAgICBsaW5rID0gd29yZHNbaV0uc2xpY2UoNyk7XHJcbiAgICAgICAgICAgIGZyYWcgPSB0aGlzLmFkZExpbmtPckVtb2ppVG9GcmFnbWVudChmcmFnLCBcImxpbmtcIiwgbGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdvcmRzW2ldLnNsaWNlKDAsIDgpID09PSBcImh0dHBzOi8vXCIpIHtcclxuICAgICAgICAgICAgbGluayA9IHdvcmRzW2ldLnNsaWNlKDcpO1xyXG4gICAgICAgICAgICBmcmFnID0gdGhpcy5hZGRMaW5rT3JFbW9qaVRvRnJhZ21lbnQoZnJhZywgXCJsaW5rXCIsIGxpbmspO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh3b3Jkc1tpXS5jaGFyQXQoMCkgPT09IFwiOlwiIHx8IHdvcmRzW2ldLmNoYXJBdCgwKSA9PT0gXCI7XCIpIHtcclxuICAgICAgICAgICAgZW1vamkgPSB3b3Jkc1tpXTtcclxuICAgICAgICAgICAgZnJhZyA9IHRoaXMuYWRkTGlua09yRW1vamlUb0ZyYWdtZW50KGZyYWcsIFwiZW1vamlcIiwgZW1vamkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy9hcHBlbmQgdGhlIHdvcmQgYXMgaXQgaXNcclxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh3b3Jkc1tpXSArIFwiIFwiKTtcclxuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcmFnO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCB0aGUgbGlua3Mgb3IgZW1vamkgdG8gZnJhZ21lbnRcclxuICogQHBhcmFtIGZyYWcsIHRoZSBmcmFnbWVudFxyXG4gKiBAcGFyYW0gdHlwZSwgdHlwZSBvZiB0aGUgdGhpbmcgdG8gcGFyc2VcclxuICogQHBhcmFtIGRhdGEsIGRhdGEgdG8gcGFyc2VcclxuICogQHJldHVybnMgeyp9LCB0aGUgZnJhZ21lbnRcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmFkZExpbmtPckVtb2ppVG9GcmFnbWVudCA9IGZ1bmN0aW9uKGZyYWcsIHR5cGUsIGRhdGEpIHtcclxuICAgIHZhciB0ZXh0Tm9kZTtcclxuICAgIGlmICh0eXBlID09PSBcImxpbmtcIikge1xyXG4gICAgICAgIC8vbGluayBmb3VuZCwgY3JlYXRlIGEtZWxlbWVudFxyXG4gICAgICAgIHZhciBhVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgYVRhZy5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiLy9cIiArIGRhdGEpO1xyXG4gICAgICAgIGFUYWcuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgIHZhciBsaW5rTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpO1xyXG5cclxuICAgICAgICBhVGFnLmFwcGVuZENoaWxkKGxpbmtOb2RlKTtcclxuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiKTtcclxuXHJcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChhVGFnKTtcclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHROb2RlKTtcclxuXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0eXBlID09PSBcImVtb2ppXCIpIHtcclxuICAgICAgICAvL2Vtb2ppIGZvdW5kLCBjcmVhdGUgaXRcclxuICAgICAgICB2YXIgc3BhblRhZyA9IHRoaXMucGFyc2VFbW9qaXMoZGF0YSk7XHJcblxyXG4gICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgXCIpO1xyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHNwYW5UYWcpO1xyXG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcmFnO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHBhcnNlIHRoZSBlbW9qaVxyXG4gKiBAcGFyYW0gZW1vamlcclxuICogQHJldHVybnMge0VsZW1lbnR9IHRoZSBlbW9qaS1lbGVtZW50XHJcbiAqL1xyXG5DaGF0LnByb3RvdHlwZS5wYXJzZUVtb2ppcyA9IGZ1bmN0aW9uKGVtb2ppKSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLWNoYXQtZW1vamlcIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB2YXIgZWxlbSA9IHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuZW1vamlcIik7XHJcbiAgICBzd2l0Y2ggKGVtb2ppKSB7XHJcbiAgICAgICAgY2FzZSBcIjopXCI6XHJcbiAgICAgICAgY2FzZSBcIjotKVwiOiB7XHJcbiAgICAgICAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLXNtaWxleVwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwiOkRcIjpcclxuICAgICAgICBjYXNlIFwiOi1EXCI6IHtcclxuICAgICAgICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktaGFwcHlcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIjspXCI6XHJcbiAgICAgICAgY2FzZSBcIjstKVwiOiB7XHJcbiAgICAgICAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLWZsaXJ0XCIpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgXCI6T1wiOlxyXG4gICAgICAgIGNhc2UgXCI6LU9cIjoge1xyXG4gICAgICAgICAgICBlbGVtLmNsYXNzTGlzdC5hZGQoXCJlbW9qaS1zdXJwcmlzZWRcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIjpQXCI6XHJcbiAgICAgICAgY2FzZSBcIjotUFwiOiB7XHJcbiAgICAgICAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLXRvdW5nZVwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwiOkBcIjoge1xyXG4gICAgICAgICAgICBlbGVtLmNsYXNzTGlzdC5hZGQoXCJlbW9qaS1hbmdyeVwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwiOlNcIjpcclxuICAgICAgICBjYXNlIFwiOi1TXCI6IHtcclxuICAgICAgICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktY29uZnVzZWRcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIjooXCI6XHJcbiAgICAgICAgY2FzZSBcIjotKFwiOiB7XHJcbiAgICAgICAgICAgIGVsZW0uY2xhc3NMaXN0LmFkZChcImVtb2ppLXNhZFwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwiOicoXCI6XHJcbiAgICAgICAgY2FzZSBcIjonLShcIjoge1xyXG4gICAgICAgICAgICBlbGVtLmNsYXNzTGlzdC5hZGQoXCJlbW9qaS1jcnlpbmdcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIjpMXCI6IHtcclxuICAgICAgICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktaGVhcnRcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIjozXCI6IHtcclxuICAgICAgICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKFwiZW1vamktY2F0XCIpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGVtb2ppKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW07XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2xlYXIgdGhlIGhpc3RvcnlcclxuICovXHJcbkNoYXQucHJvdG90eXBlLmNsZWFySGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9yZW1vdmUgZnJvbSBzdG9yYWdlIGFuZCByZXNldCBhcnJheVxyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJjaGF0LVwiICsgdGhpcy5jaGFubmVsKTtcclxuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcclxuXHJcbiAgICAvL3JlbW92ZSBlbGVtZW50cyBmcm9tIERPTVxyXG4gICAgdmFyIGxpc3RFbGVtZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKTtcclxuICAgIHdoaWxlIChsaXN0RWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICBsaXN0RWxlbWVudC5yZW1vdmVDaGlsZChsaXN0RWxlbWVudC5maXJzdENoaWxkKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIENoYXQgPSByZXF1aXJlKFwiLi9DaGF0XCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgY2hhdCBhcHBsaWNhdGlvblxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIHRoZSBzZXR0aW5ncy1vYmplY3RcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDaGF0QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuICAgIHRoaXMuY2hhdCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB0aGlzLnVzZXJuYW1lID0gXCJcIjtcclxuICAgIHRoaXMuc2VydmVyID0gXCJwd2Qub3NrYXJlbWlsc3Nvbi5zZToyMDA4MFwiO1xyXG4gICAgdGhpcy5jaGFubmVsID0gXCJcIjtcclxuXHJcbiAgICB0aGlzLmFkZEZvY3VzRnVuYyA9IHRoaXMuYWRkRm9jdXMuYmluZCh0aGlzKTtcclxuICAgIHRoaXMucmVtb3ZlRm9jdXNGdW5jID0gdGhpcy5yZW1vdmVGb2N1cy5iaW5kKHRoaXMpO1xyXG59XHJcblxyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpY1dpbmRvdy5wcm90b3R5cGUpO1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIENoYXRBcHBsaWNhdGlvbjtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBpbml0IHRoZSBiYXNpY3NcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIikpIHtcclxuICAgICAgICB0aGlzLnVzZXJuYW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VybmFtZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgLy9hZGQgbGlzdGVuZXIgdG8gdGhlIG1lbnVcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm1lbnVDbGlja2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBhcHBsaWNhdGlvblxyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjaGF0LWFwcFwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1pY29uXCIpLmNsYXNzTGlzdC5hZGQoXCJjaGF0LW9mZmxpbmVcIik7XHJcblxyXG4gICAgLy9hZGQgdGhlIG1lbnVcclxuICAgIHZhciBtZW51ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LW1lbnVcIik7XHJcbiAgICB2YXIgYWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS13aW5kb3ctbWVudS1hbHRlcm5hdGl2ZVwiKS5jb250ZW50O1xyXG4gICAgdmFyIGFsdDEgPSBhbHQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0MS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJDbGVhciBIaXN0b3J5XCIpKTtcclxuXHJcbiAgICB2YXIgYWx0MiA9IGFsdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQyLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlNldHRpbmdzXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQyKTtcclxuXHJcbiAgICAvL3ByaW50IHRoZSBzZXR0aW5nc1xyXG4gICAgdGhpcy5tZW51U2V0dGluZ3MoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBkZXN0cm95IHRoZSBhcHBsaWNhdGlvblxyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5jaGF0KSB7XHJcbiAgICAgICAgdGhpcy5jaGF0LnNvY2tldC5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbi1mcmFtZVwiKS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgbWVudS1jbGlja1xyXG4gKiBAcGFyYW0gZXZlbnRcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudUNsaWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcImFcIikge1xyXG4gICAgICAgIC8vZ2V0IHRoZSB0YXJnZXQgdGV4dCBhbmQgbWFrZSBpdCBsb3dlciBjYXNlXHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIC8vbWFrZSB0aGUgY29ycmVjdCBjYWxsXHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXR0aW5nc1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgXCJjbGVhciBoaXN0b3J5XCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYXQuY2xlYXJIaXN0b3J5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdyB0aGUgc2V0dGluZ3NcclxuICovXHJcbkNoYXRBcHBsaWNhdGlvbi5wcm90b3R5cGUubWVudVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciBpbnB1dExpc3Q7XHJcblxyXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgIC8vc2hvdyB0aGUgc2V0dGluZ3NcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuY2xhc3NMaXN0LmFkZChcImNoYXQtc2V0dGluZ3NcIik7XHJcblxyXG4gICAgICAgIC8vZ2V0IHRoZSBzZXR0aW5nc1xyXG4gICAgICAgIHRlbXBsYXRlID0gdGhpcy5hZGRTZXR0aW5ncyh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIGlucHV0TGlzdCA9ICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIpO1xyXG5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5wdXRMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGlucHV0TGlzdFtpXS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy5hZGRGb2N1c0Z1bmMpO1xyXG4gICAgICAgICAgICBpbnB1dExpc3RbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImZvY3Vzb3V0XCIsIHRoaXMucmVtb3ZlRm9jdXNGdW5jKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYXBwZW5kIGl0XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vc2V0dGluZ3Mgc2hvd2luZy4gY2xvc2UgdGhlIHNldHRpbmdzXHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3Mtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5yZW1vdmVDaGlsZChzZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBhZGQgdGhlIHNldHRpbmdzXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGVsZW1lbnQgdG8gYXBwZW5kIHRvXHJcbiAqIEByZXR1cm5zIHsqfSAtIHRoZSBlbGVtZW50XHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLmFkZFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS1jaGF0LXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSd1c2VybmFtZSddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMudXNlcm5hbWUpO1xyXG4gICAgdGVtcGxhdGUucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J3NlcnZlciddXCIpLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHRoaXMuc2VydmVyKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdjaGFubmVsJ11cIikuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgdGhpcy5jaGFubmVsKTtcclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbdHlwZT0nYnV0dG9uJ11cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2F2ZVNldHRpbmdzLmJpbmQodGhpcykpO1xyXG5cclxuICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZXR0aW5nc1wiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzYXZlIHRoZSBzZXR0aW5ncyBhbmQgcmVvcGVuIGNoYXQgd2l0aCB0aGVtXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jbG9zZSB0aGUgY2hhdC1jb25uZWN0aW9uXHJcbiAgICBpZiAodGhpcy5jaGF0KSB7XHJcbiAgICAgICAgdGhpcy5jaGF0LnNvY2tldC5jbG9zZSgpO1xyXG4gICAgICAgIHRoaXMuY2hhdC5vbmxpbmUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZm9ybSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLWZvcm1cIik7XHJcblxyXG4gICAgLy9nZXQgdGhlIHZhbHVlcyBmcm9tIHNldHRpbmdzLWZvcm1cclxuICAgIHRoaXMudXNlcm5hbWUgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSd1c2VybmFtZSddXCIpLnZhbHVlO1xyXG4gICAgdGhpcy5zZXJ2ZXIgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPSdzZXJ2ZXInXVwiKS52YWx1ZTtcclxuICAgIHRoaXMuY2hhbm5lbCA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J2NoYW5uZWwnXVwiKS52YWx1ZTtcclxuXHJcbiAgICAvL3Nob3cgb2ZmbGluZSB0byB0aGUgdXNlclxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LnJlbW92ZShcImNoYXQtb25saW5lXCIsIFwiY2hhdC1jb25uZWN0aW5nXCIsIFwiY2hhdC1vZmZsaW5lXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWljb25cIikuY2xhc3NMaXN0LmFkZChcImNoYXQtb2ZmbGluZVwiKTtcclxuXHJcbiAgICB0aGlzLmNsZWFyQ29udGVudCgpO1xyXG5cclxuICAgIC8vc3RhcnQgdGhlIG5ldyBjaGF0XHJcbiAgICBpZiAodGhpcy51c2VybmFtZSA9PT0gXCJcIikge1xyXG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBcIlVzZXJcIjtcclxuICAgIH1cclxuXHJcbiAgICAvL3N0YXJ0IHRoZSBuZXcgY2hhdFxyXG4gICAgdGhpcy5jaGF0ID0gbmV3IENoYXQodGhpcy5lbGVtZW50LCB0aGlzLnNlcnZlciwgdGhpcy5jaGFubmVsLCB0aGlzLnVzZXJuYW1lKTtcclxuICAgIHRoaXMuY2hhdC5pbml0KCk7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZXRGb2N1cygpO1xyXG5cclxuICAgIC8vc2F2ZSB0aGUgdXNlcm5hbWUgdG8gc3RvcmFnZVxyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VybmFtZVwiLCB0aGlzLnVzZXJuYW1lKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBhZGQgZm9jdXMgdG8gdGhlIHdpbmRvd1xyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5hZGRGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZm9jdXNlZC13aW5kb3dcIikpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlbW92ZSBmb2N1cyBmcm9tIHdpbmRvd1xyXG4gKi9cclxuQ2hhdEFwcGxpY2F0aW9uLnByb3RvdHlwZS5yZW1vdmVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJmb2N1c2VkLXdpbmRvd1wiKSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9jdXNlZC13aW5kb3dcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2V0IGZvY3VzXHJcbiAqL1xyXG5DaGF0QXBwbGljYXRpb24ucHJvdG90eXBlLnNldEZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZvY3VzZWQtd2luZG93XCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmZvY3VzKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXRBcHBsaWNhdGlvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1dpbmRvdyA9IHJlcXVpcmUoXCIuLi9CYXNpY1dpbmRvd1wiKTtcclxudmFyIE1lbW9yeUdhbWUgPSByZXF1aXJlKFwiLi9NZW1vcnlHYW1lXCIpO1xyXG5cclxuLyoqXHJcbiAqIENvbnRydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBtZW1vcnkgYXBwbGljYXRpb25tXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gdGhlIHNldHRpbmdzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTWVtb3J5QXBwbGljYXRpb24ob3B0aW9ucykge1xyXG4gICAgQmFzaWNXaW5kb3cuY2FsbCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5ib2FyZFNpemUgPSBbNCwgNF07XHJcbiAgICB0aGlzLm1hcmtlZENhcmQgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWNXaW5kb3cucHJvdG90eXBlKTtcclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gIE1lbW9yeUFwcGxpY2F0aW9uO1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGluaXQgdGhlIGJhc2ljc1xyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvL2NyZWF0ZSBuZXcgZ2FtZSBhbmQgaW5pdCBpdFxyXG4gICAgdGhpcy5nYW1lID0gbmV3IE1lbW9yeUdhbWUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIiksIDQsIDQpO1xyXG4gICAgdGhpcy5nYW1lLmluaXQoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgYXBwbGljYXRpb25cclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgQmFzaWNXaW5kb3cucHJvdG90eXBlLnByaW50LmNhbGwodGhpcyk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1hcHBcIik7XHJcblxyXG4gICAgLy9hZGQgdGhlIG1lbnUgYWx0ZXJuYXRpdmVzXHJcbiAgICB2YXIgbWVudSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1tZW51XCIpO1xyXG4gICAgdmFyIGFsdDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0MS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOZXcgR2FtZVwiKSk7XHJcblxyXG4gICAgdmFyIGFsdDIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgYWx0Mi5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYWx0ZXJuYXRpdmVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJTZXR0aW5nc1wiKSk7XHJcblxyXG4gICAgbWVudS5hcHBlbmRDaGlsZChhbHQxKTtcclxuICAgIG1lbnUuYXBwZW5kQ2hpbGQoYWx0Mik7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBtZW51LWNsaWNrZWRcclxuICogQHBhcmFtIGV2ZW50IC0gY2xpY2stZXZlbnRcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jaGVjayB3aGF0IHdhcyBjbGlja2VkXHJcbiAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6IHtcclxuICAgICAgICAgICAgICAgIC8vb3BlbiB0aGUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSBcIm5ldyBnYW1lXCI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vcmVzdGFydCBuZXcgZ2FtZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZXN0YXJ0IHRoZSBnYW1lXHJcbiAqIEBwYXJhbSB2YWx1ZSAtIHRoZSBib2FyZC1zaXplIChlZy4gNHg0KVxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgLy9zcGxpdCB2YWx1ZSB0byBnZXQgeC95XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmJvYXJkU2l6ZSA9IHZhbHVlLnNwbGl0KFwieFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2ZpbmQgeSBhbmQgeCBmcm9tIHNwbGl0XHJcbiAgICB2YXIgeSA9IHRoaXMuYm9hcmRTaXplWzFdO1xyXG4gICAgdmFyIHggPSB0aGlzLmJvYXJkU2l6ZVswXTtcclxuXHJcbiAgICAvL2NsZWFyIHRoZSBjb250ZW50XHJcbiAgICB0aGlzLmNsZWFyQ29udGVudCgpO1xyXG5cclxuICAgIC8vcmVtb3ZlIG9sZCBldmVudGhhbmRsZXJzXHJcbiAgICB0aGlzLmdhbWUucmVtb3ZlRXZlbnRzKCk7XHJcblxyXG4gICAgLy9jcmVhdGUgbmV3IGdhbWUgYW5kIGluaXQgaXRcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBNZW1vcnlHYW1lKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1jb250ZW50XCIpLCB4LCB5KTtcclxuICAgIHRoaXMuZ2FtZS5pbml0KCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2hvdy9oaWRlIHRoZSBzZXR0aW5nc1xyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLm1lbnVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzT3Blbikge1xyXG4gICAgICAgIC8vc2hvdyB0aGUgc2V0dGluZ3NcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXNldHRpbmdzXCIpLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuY2xhc3NMaXN0LmFkZChcIm1lbW9yeS1zZXR0aW5nc1wiKTtcclxuXHJcbiAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmFkZFNldHRpbmdzKHRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctY29udGVudFwiKS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc09wZW4gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9oaWRlIHRoZSBzZXR0aW5nc1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnNldHRpbmdzLXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikucmVtb3ZlQ2hpbGQoc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gYWRkIHRoZSBzZXR0aW5nc1xyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHByaW50IHRvXHJcbiAqIEByZXR1cm5zIHsqfSAtIHRoZSBlbGVtZW50XHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUuYWRkU2V0dGluZ3MgPSBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1lbW9yeS1zZXR0aW5nc1wiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2V0dGluZ3NcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG4gICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXRbdHlwZT0nYnV0dG9uJ11cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2F2ZVNldHRpbmdzLmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2F2ZSB0aGUgc2V0dGluZ3MgYW5kIHJ1biBuZXcgZ2FtZVxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZhbHVlID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RbbmFtZT0nYm9hcmQtc2l6ZSddXCIpLnZhbHVlO1xyXG5cclxuICAgIC8vcmVzdGFydCB3aXRoIHRoZSBuZXcgc2V0dGluZ3NcclxuICAgIHRoaXMucmVzdGFydCh2YWx1ZSk7XHJcbiAgICB0aGlzLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUga2V5IGlucHV0XHJcbiAqIEBwYXJhbSBrZXkgLSBrZXljb2RlIHRvIGhhbmRsZVxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleUlucHV0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICBpZiAoIXRoaXMubWFya2VkQ2FyZCkge1xyXG4gICAgICAgIC8vbm8gY2FyZCBpcyBtYXJrZWQsIG1hcmsgdGhlIHRvcCBsZWZ0XHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZFwiKTtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0LmFkZChcIm1hcmtlZFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vdG9vZ2xlIHRoZSBtYXJrZWRDYXJkIGJlZm9yZSBjaGFuZ2luZyBtYXJrZWRDYXJkXHJcbiAgICAgICAgdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdC50b2dnbGUoXCJtYXJrZWRcIik7XHJcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgICAgICAgY2FzZSAzOToge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlSaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgMzc6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5TGVmdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgMzg6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5VXAoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIDQwOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleURvd24oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIDEzOiB7XHJcbiAgICAgICAgICAgICAgICAvL2VudGVyIC4gdHVybiB0aGUgbWFya2VkIGNhcmRcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS50dXJuQ2FyZCh0aGlzLm1hcmtlZENhcmQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3QudG9nZ2xlKFwibWFya2VkXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBpZiBrZXkgcmlnaHQgcHJlc3NlZFxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCBjYXJkXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLm5leHRFbGVtZW50U2libGluZykge1xyXG4gICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZy5maXJzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vcmVzdGFydCBmcm9tIHRvcFxyXG4gICAgICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgaWYga2V5IGxlZnQgcHJlc3NlZFxyXG4gKi9cclxuTWVtb3J5QXBwbGljYXRpb24ucHJvdG90eXBlLmtleUxlZnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBwcmV2aW91cyBjYXJkXHJcbiAgICBpZiAodGhpcy5tYXJrZWRDYXJkLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB0aGlzLm1hcmtlZENhcmQgPSB0aGlzLm1hcmtlZENhcmQucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMubWFya2VkQ2FyZC5wYXJlbnROb2RlLnByZXZpb3VzRWxlbWVudFNpYmxpbmcubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vcmVzdGFydCBmcm9tIGJvdHRvbSByaWdodFxyXG4gICAgICAgICAgICB2YXIgcm93cyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJvd1wiKTtcclxuICAgICAgICAgICAgdmFyIGxhc3RSb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIHRoaXMubWFya2VkQ2FyZCA9IGxhc3RSb3cubGFzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIGtleSB1cCBwcmVzc2VkXHJcbiAqL1xyXG5NZW1vcnlBcHBsaWNhdGlvbi5wcm90b3R5cGUua2V5VXAgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZmluZCBuZXh0IHJvdyBhbmQgY2FyZFxyXG4gICAgdmFyIHJvdztcclxuICAgIHZhciByb3dZO1xyXG5cclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XHJcbiAgICAgICAgdmFyIGlkID0gdGhpcy5tYXJrZWRDYXJkLmNsYXNzTGlzdFswXS5zbGljZSgtMik7XHJcbiAgICAgICAgcm93WSA9IHBhcnNlSW50KGlkLmNoYXJBdCgwKSkgLSAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy9iZWdpbiBmcm9tIGJvdHRvbVxyXG4gICAgICAgIHZhciByb3dzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucm93XCIpO1xyXG4gICAgICAgIHJvdyA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXTtcclxuICAgICAgICByb3dZID0gcm93cy5sZW5ndGggLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZmluZCB3aGF0IHgtcG9zaXRpb24gaW4gdGhlIHJvdyB0aGUgbWFya2VkIGNhcmQgaXMgb25cclxuICAgIHZhciBjYXJkWCA9IHRoaXMubWFya2VkQ2FyZC5jbGFzc0xpc3RbMF0uc2xpY2UoLTEpO1xyXG4gICAgdGhpcy5tYXJrZWRDYXJkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1cIiArIHJvd1kgKyBjYXJkWCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIGlmIGtleSBkb3duIHByZXNzZWRcclxuICovXHJcbk1lbW9yeUFwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL2ZpbmQgbmV4dCByb3cgYW5kIGNhcmRcclxuICAgIHZhciByb3dZO1xyXG5cclxuICAgIGlmICh0aGlzLm1hcmtlZENhcmQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpIHtcclxuICAgICAgICB2YXIgaWQgPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0yKTtcclxuICAgICAgICByb3dZID0gcGFyc2VJbnQoaWQuY2hhckF0KDApKSArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByb3dZID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvL2ZpbmQgd2hhdCB4LXBvc2l0aW9uIGluIHRoZSByb3cgdGhlIG1hcmtlZCBjYXJkIGlzIG9uXHJcbiAgICB2YXIgY2FyZFggPSB0aGlzLm1hcmtlZENhcmQuY2xhc3NMaXN0WzBdLnNsaWNlKC0xKTtcclxuICAgIHRoaXMubWFya2VkQ2FyZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyByb3dZICsgY2FyZFgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlBcHBsaWNhdGlvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIG1lbW9yeSBib2FyZFxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBlbGVtZW50IHRvIHByaW50IHRvXHJcbiAqIEBwYXJhbSB4IC0gdGhlIGFtb3VudCBvZiBjb2xzXHJcbiAqIEBwYXJhbSB5IC0gdGhlIGFtb3VudCBvZiByb3dzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTWVtb3J5Qm9hcmQoZWxlbWVudCwgeCwgeSkge1xyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgIC8vY2FsbCB0aGUgcHJpbnRmdW5jdGlvblxyXG4gICAgdGhpcy5wcmludENhcmRzKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgY2FyZHNcclxuICovXHJcbk1lbW9yeUJvYXJkLnByb3RvdHlwZS5wcmludENhcmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuXHJcbiAgICB2YXIgcm93RGl2O1xyXG4gICAgdmFyIGNhcmREaXY7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnk7IGkgKz0gMSlcclxuICAgIHtcclxuICAgICAgICByb3dEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHJvd0Rpdi5jbGFzc0xpc3QuYWRkKFwicm93XCIpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMueDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgIGNhcmREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICBjYXJkRGl2LmNsYXNzTGlzdC5hZGQoXCJjYXJkLVwiICsgaSArIGosIFwiY2FyZFwiKTtcclxuICAgICAgICAgICAgcm93RGl2LmFwcGVuZENoaWxkKGNhcmREaXYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyb3dEaXYpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChmcmFnKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5Qm9hcmQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yIGZvciBtZW1vcnkgY2FyZFxyXG4gKiBAcGFyYW0gaWQgLSBpZCBvZiBjYXJkXHJcbiAqIEBwYXJhbSBpbWdOciAtIGltYWdlIG51bWJlclxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIE1lbW9yeUNhcmQoaWQsIGltZ05yKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmltZ05yID0gaW1nTnI7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5Q2FyZDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTWVtb3J5Qm9hcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlCb2FyZFwiKTtcclxudmFyIE1lbW9yeUNhcmQgPSByZXF1aXJlKFwiLi9NZW1vcnlDYXJkXCIpO1xyXG52YXIgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvcmZ1bmN0aW9uIGZvciB0aGUgbWVtb3J5Z2FtZVxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIGVsZW1lbnQgdG8gcHJpbnQgdG9cclxuICogQHBhcmFtIHggLSBhbW91bnQgb2YgY29sc1xyXG4gKiBAcGFyYW0geSAtIGFtb3VudCBvZiByb3dzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTWVtb3J5R2FtZShlbGVtZW50LCB4LCB5KSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy54ID0gcGFyc2VJbnQoeCk7XHJcbiAgICB0aGlzLnkgPSBwYXJzZUludCh5KTtcclxuICAgIHRoaXMubGF5b3V0ID0gbmV3IE1lbW9yeUJvYXJkKGVsZW1lbnQsIHRoaXMueCwgdGhpcy55KTtcclxuICAgIHRoaXMuYm9hcmQgPSBbXTtcclxuICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcbiAgICB0aGlzLnR1cm5zID0gMDtcclxuICAgIHRoaXMuY29ycmVjdENvdW50ID0gMDtcclxuICAgIHRoaXMuaW1hZ2VMaXN0ID0gWzAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDddO1xyXG4gICAgdGhpcy5pbWFnZXMgPSB0aGlzLmltYWdlTGlzdC5zbGljZSgwLCAodGhpcy55ICogdGhpcy54KSk7XHJcbiAgICB0aGlzLmNsaWNrRnVuYyA9IHRoaXMuY2xpY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAvL3N0YXJ0IG5ldyB0aW1lclxyXG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigpO1xyXG4gICAgdGhpcy50aW1lci5zdGFydCgpO1xyXG5cclxuICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuXHJcbiAgICAvL3NodWZmbGUgYW5kIGFkZCBldmVudGxpc3RlbmVyc1xyXG4gICAgdGhpcy5zaHVmZmxlSW1hZ2VzKCk7XHJcbiAgICB0aGlzLmFkZEV2ZW50cygpO1xyXG59XHJcblxyXG4vKipcclxuICogSW5pdCB0aGUgZ2FtZVxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIC8vaW5pdCB0aGUgZW1wdHkgYm9hcmQtYXJyYXlcclxuICAgIHRoaXMuYm9hcmQgPSBbXTtcclxuICAgIGlmICh0aGlzLnggPiB0aGlzLnkpIHtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy54OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBBcnJheSh0aGlzLnkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy55OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBBcnJheSh0aGlzLngpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aXNpYmxlQ2FyZHMgPSBbXTtcclxuXHJcbiAgICAvL3B1c2ggbmV3IGNhcmRzIHRvIHRoZSBib2FyZC1hcnJheVxyXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMueTsgaSArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnggLSAxOyBqICs9IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZFtpXVtqXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgaiwgdGhpcy5pbWFnZXMucG9wKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmJvYXJkW2ldW2ogKyAxXSA9IG5ldyBNZW1vcnlDYXJkKFwiXCIgKyBpICsgKGogKyAxKSwgdGhpcy5pbWFnZXMucG9wKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaHVmZmxlIHRoZSBpbWFnZXMtYXJyYXlcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLnNodWZmbGVJbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0ZW1wO1xyXG4gICAgdmFyIHJhbmQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW1hZ2VzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdGVtcCA9IHRoaXMuaW1hZ2VzW2ldO1xyXG4gICAgICAgIHJhbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmltYWdlcy5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzW2ldID0gdGhpcy5pbWFnZXNbcmFuZF07XHJcbiAgICAgICAgdGhpcy5pbWFnZXNbcmFuZF0gPSB0ZW1wO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFkZCB0aGUgZXZlbnRzIG5lZWRlZFxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuYWRkRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tGdW5jKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW1vdmUgdGhlIGV2ZW50c1xyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tGdW5jKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBoYW5kbGUgdGhlIGNsaWNrc1xyXG4gKiBAcGFyYW0gZXZlbnQgLSB0aGUgY2xpY2stZXZlbnRcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIHRoaXMudHVybkNhcmQoZXZlbnQudGFyZ2V0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byB0dXJuIHRoZSBnaXZlbiBjYXJkZVxyXG4gKiBAcGFyYW0gZWxlbWVudCAtIHRoZSBjYXJkIHRvIHR1cm5cclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLnR1cm5DYXJkID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgaWYgKHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aCA8IDIgJiYgIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGlzYWJsZVwiKSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImNhcmRcIikpIHtcclxuICAgICAgICAgICAgdmFyIHl4ID0gZWxlbWVudC5jbGFzc0xpc3RbMF0uc3BsaXQoXCItXCIpWzFdO1xyXG4gICAgICAgICAgICB2YXIgeSA9IHl4LmNoYXJBdCgwKTtcclxuICAgICAgICAgICAgdmFyIHggPSB5eC5jaGFyQXQoMSk7XHJcblxyXG4gICAgICAgICAgICAvL2FkZCBjbGFzc2VzIHRvIHNob3cgdGhlIGNhcmRcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaW1nLVwiICsgdGhpcy5ib2FyZFt5XVt4XS5pbWdOcik7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImltZ1wiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZUNhcmRzLnB1c2godGhpcy5ib2FyZFt5XVt4XSk7XHJcblxyXG4gICAgICAgICAgICAvL2Rpc2FibGUgdGhlIGNhcmQgdGhhdCBnb3QgY2xpY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy5ib2FyZFt5XVt4XS5pZCkuY2xhc3NMaXN0LmFkZChcImRpc2FibGVcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NoZWNrIGZpIHRoZSBwYWlyIGlzIHRoZSBzYW1lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSWZDb3JyZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIHBhaXIgaXMgdGhlIHNhbWVcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLmNoZWNrSWZDb3JyZWN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnR1cm5zICs9IDE7XHJcbiAgICBpZiAodGhpcy52aXNpYmxlQ2FyZHNbMF0uaW1nTnIgPT09IHRoaXMudmlzaWJsZUNhcmRzWzFdLmltZ05yKSB7XHJcbiAgICAgICAgLy9pdCB3YXMgdGhlIHNhbWUgaW1hZ2UsIHNob3cgaXQgdG8gdGhlIHVzZXJcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbMF0uaWQpLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbMV0uaWQpLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcclxuXHJcbiAgICAgICAgLy9yZXNldCB0aGUgdmlzaWJsZS1jYXJkcyBhcnJheVxyXG4gICAgICAgIHRoaXMudmlzaWJsZUNhcmRzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29ycmVjdENvdW50ICs9IDE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvcnJlY3RDb3VudCA9PT0gKHRoaXMueCAqIHRoaXMueSAvIDIpKSB7XHJcbiAgICAgICAgICAgIC8vdGhlIGdhbWUgaXMgb3ZlciBzaW5jZSB0aGUgY29ycmVjdGNvdW50IGlzIHRoZSBhbW91bnQgb2YgY2FyZHNcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vaXQgd2FzIG5vdCBjb3JyZWN0LCBzZXQgdGhlIGNsYXNzZXNcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0aGlzLnZpc2libGVDYXJkc1tpXS5pZCkuY2xhc3NMaXN0LmFkZChcIndyb25nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLVwiICsgdGhpcy52aXNpYmxlQ2FyZHNbaV0uaWQpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90dXJuIGJhY2sgdGhlIGNhcmRzXHJcbiAgICAgICAgc2V0VGltZW91dCh0aGlzLnR1cm5CYWNrQ2FyZHMuYmluZCh0aGlzKSwgMTAwMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gdHVybiBiYWNrIGNhcmRzIHdoZW4gd3JvbmdcclxuICovXHJcbk1lbW9yeUdhbWUucHJvdG90eXBlLnR1cm5CYWNrQ2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0ZW1wQ2FyZDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ2FyZHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0ZW1wQ2FyZCA9IHRoaXMudmlzaWJsZUNhcmRzW2ldO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtXCIgKyB0ZW1wQ2FyZC5pZCkuY2xhc3NMaXN0LnJlbW92ZShcIndyb25nXCIsIFwiaW1nXCIsIFwiaW1nLVwiICsgdGVtcENhcmQuaW1nTnIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmVzZXQgdGhlIGFycmF5XHJcbiAgICB0aGlzLnZpc2libGVDYXJkcyA9IFtdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHNob3cgdGhlIGdhbWUgb3ZlclxyXG4gKi9cclxuTWVtb3J5R2FtZS5wcm90b3R5cGUuZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudG90YWxUaW1lID0gdGhpcy50aW1lci5zdG9wKCk7XHJcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLW1lbW9yeS1nYW1lb3ZlclwiKS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIubWVtb3J5LXR1cm5zXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudHVybnMpKTtcclxuICAgIHRlbXBsYXRlLnF1ZXJ5U2VsZWN0b3IoXCIubWVtb3J5LXRpbWVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy50b3RhbFRpbWUpKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlHYW1lO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBUaW1lciBjb25zdHJ1Y3RvclxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRpbWVyKCkge1xyXG4gICAgdGhpcy5zdGFydFRpbWUgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IHN0YXJ0cyBhbiBpbnRlcnZhbCBmb3IgdGhlIHRpbWVyXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdGhhdCBzdG9wcyB0aGUgdGltZXIgYmVmb3JlIGl0cyBvdmVyXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9LCB0aGUgZGlmZmVyZW5jZSBpbiBzZWNvbmRzXHJcbiAqL1xyXG5UaW1lci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgIHJldHVybiAobm93IC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBzaG93IHRoZSB0aW1lciBhdCB0aGUgZ2l2ZW4gZWxlbWVudFxyXG4gKiBAcGFyYW0gZGlmZntOdW1iZXJ9IHRoZSB0aW1lIHRvIGJlIHByaW50ZWRcclxuICovXHJcblRpbWVyLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKGRpZmYpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlcGxhY2VDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkaWZmKSwgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRpZmYpKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gSUJsb2NrU2hhcGUoKSB7XHJcbiAgICB0aGlzLnNoYXBlcyA9IFtcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNiwgNiwgNiwgNl1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzZdLFxyXG4gICAgICAgICAgICBbNl0sXHJcbiAgICAgICAgICAgIFs2XSxcclxuICAgICAgICAgICAgWzZdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs2LCA2LCA2LCA2XVxyXG4gICAgICAgIF1cclxuICAgIF07XHJcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcclxuICAgIHRoaXMudG9wTGVmdCA9IHtcclxuICAgICAgICByb3c6IC00LFxyXG4gICAgICAgIGNvbDogNFxyXG4gICAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBKQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDFdLFxyXG4gICAgICAgICAgICBbMCwgMV0sXHJcbiAgICAgICAgICAgIFsxLCAxXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMCwgMF0sXHJcbiAgICAgICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMSwgMV0sXHJcbiAgICAgICAgICAgIFsxLCAwXSxcclxuICAgICAgICAgICAgWzEsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFsxLCAxLCAxXSxcclxuICAgICAgICAgICAgWzAsIDAsIDFdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTMsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEpCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gTEJsb2NrU2hhcGUoKSB7XG4gICAgdGhpcy5zaGFwZXMgPSBbXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsyLCAwXSxcbiAgICAgICAgICAgIFsyLCAwXSxcbiAgICAgICAgICAgIFsyLCAyXVxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBbMCwgMCwgMl0sXG4gICAgICAgICAgICBbMiwgMiwgMl1cbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgWzIsIDJdLFxuICAgICAgICAgICAgWzAsIDJdLFxuICAgICAgICAgICAgWzAsIDJdXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsyLCAyLCAyXSxcbiAgICAgICAgICAgIFsyLCAwLCAwXVxuICAgICAgICBdXG4gICAgXTtcbiAgICB0aGlzLnJvdGF0aW9uID0gMDtcbiAgICB0aGlzLnRvcExlZnQgPSB7XG4gICAgICAgIHJvdzogLTMsXG4gICAgICAgIGNvbDogNFxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTEJsb2NrU2hhcGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIFNCbG9ja1NoYXBlKCkge1xyXG4gICAgdGhpcy5zaGFwZXMgPSBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNCwgNF0sXHJcbiAgICAgICAgICAgIFs0LCA0LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNCwgMF0sXHJcbiAgICAgICAgICAgIFs0LCA0XSxcclxuICAgICAgICAgICAgWzAsIDRdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFswLCA0LCA0XSxcclxuICAgICAgICAgICAgWzQsIDQsIDBdXHJcbiAgICAgICAgXSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIFs0LCAwXSxcclxuICAgICAgICAgICAgWzQsIDRdLFxyXG4gICAgICAgICAgICBbMCwgNF1cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU0Jsb2NrU2hhcGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuZnVuY3Rpb24gU3F1YXJlQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzcsIDddLFxyXG4gICAgICAgICAgICBbNywgN11cclxuICAgICAgICBdXHJcbiAgICBdO1xyXG4gICAgdGhpcy5yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiAtMixcclxuICAgICAgICBjb2w6IDRcclxuICAgIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3F1YXJlQmxvY2tTaGFwZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBUQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDMsIDBdLFxyXG4gICAgICAgICAgICBbMywgMywgM11cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzMsIDBdLFxyXG4gICAgICAgICAgICBbMywgM10sXHJcbiAgICAgICAgICAgIFszLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMywgMywgM10sXHJcbiAgICAgICAgICAgIFswLCAzLCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgM10sXHJcbiAgICAgICAgICAgIFszLCAzXSxcclxuICAgICAgICAgICAgWzAsIDNdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRCbG9ja1NoYXBlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljV2luZG93ID0gcmVxdWlyZShcIi4uL0Jhc2ljV2luZG93XCIpO1xyXG52YXIgVGV0cmlzR2FtZSA9IHJlcXVpcmUoXCIuL1RldHJpc0dhbWVcIik7XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSB0ZXRyaXMtYXBwXHJcbiAqIEBwYXJhbSBvcHRpb25zIC0gdGhlIHNldHRpbmdzLW9iamVjdFxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRldHJpc0FwcGxpY2F0aW9uKG9wdGlvbnMpIHtcclxuICAgIEJhc2ljV2luZG93LmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5nYW1lID0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljV2luZG93LnByb3RvdHlwZSk7XHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9ICBUZXRyaXNBcHBsaWNhdGlvbjtcclxuXHJcbi8qKlxyXG4gKiBJbml0IHRoZSBiYXNpY3NcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnByaW50KCk7XHJcblxyXG4gICAgLy9jcmVhdGUgbmV3IGdhbWVcclxuICAgIHRoaXMuZ2FtZSA9IG5ldyBUZXRyaXNHYW1lKHRoaXMuZWxlbWVudCk7XHJcbiAgICB0aGlzLmdhbWUuaW5pdCgpO1xyXG5cclxuICAgIC8vYWRkIGV2ZW50bGlzdGVuZXIgZm9yIHRoZSBtZW51XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5tZW51Q2xpY2tlZC5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwcmludCB0aGUgYXBwXHJcbiAqL1xyXG5UZXRyaXNBcHBsaWNhdGlvbi5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIEJhc2ljV2luZG93LnByb3RvdHlwZS5wcmludC5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtYXBwXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpXCIpLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtaWNvblwiKTtcclxuXHJcbiAgICAvL2FkZCB0aGUgbWVudVxyXG4gICAgdmFyIG1lbnUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctbWVudVwiKTtcclxuICAgIHZhciBhbHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlLXdpbmRvdy1tZW51LWFsdGVybmF0aXZlXCIpLmNvbnRlbnQ7XHJcbiAgICB2YXIgYWx0MSA9IGFsdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICBhbHQxLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hbHRlcm5hdGl2ZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5ldyBHYW1lXCIpKTtcclxuXHJcbiAgICBtZW51LmFwcGVuZENoaWxkKGFsdDEpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgbWVudS1jbGlja3NcclxuICogQHBhcmFtIGV2ZW50IC0gY2xpY2stZXZlbnRcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5tZW51Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICB2YXIgdGFyZ2V0O1xyXG4gICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiYVwiKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJuZXcgZ2FtZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBrZXktaW5wdXRzXHJcbiAqIEBwYXJhbSBrZXkgLSB0aGUga2V5LWNvZGVcclxuICovXHJcblRldHJpc0FwcGxpY2F0aW9uLnByb3RvdHlwZS5rZXlJbnB1dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgLy9JZiBnYW1lIGlzIFwiYWxpdmVcIiBhbmQgbm90IHBhdXNlZCwgY2FsbCB0aGUgY29ycmVjdCBmdW5jdGlvbnMgaW4gZ2FtZVxyXG4gICAgaWYgKHRoaXMuZ2FtZS5hbGl2ZSAmJiAhdGhpcy5nYW1lLnBhdXNlZCkge1xyXG4gICAgICAgIHRoaXMuaW5wdXRUb0dhbWVIYW5kbGVyKGtleSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAoa2V5ID09PSAxMykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nYW1lLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJlc3VtZUdhbWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGFydCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmlucHV0VG9HYW1lSGFuZGxlciA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgICBjYXNlIDM3OiB7XHJcbiAgICAgICAgICAgIC8vbGVmdFxyXG4gICAgICAgICAgICB0aGlzLmdhbWUubW92ZUZhbGxpbmdCbG9jaygtMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAzOToge1xyXG4gICAgICAgICAgICAvL3JpZ2h0XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5tb3ZlRmFsbGluZ0Jsb2NrKDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgMzg6IHtcclxuICAgICAgICAgICAgLy91cFxyXG4gICAgICAgICAgICB0aGlzLmdhbWUucm90YXRlRmFsbGluZ0Jsb2NrKDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgNDA6IHtcclxuICAgICAgICAgICAgLy9kb3duXHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5mYWxsQmxvY2soKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDMyOiB7XHJcbiAgICAgICAgICAgIC8vc3BhY2VcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmZhbGxCbG9ja1RvQm90dG9tKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAxMzoge1xyXG4gICAgICAgICAgICAvL2VudGVyXHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5wYXVzZUdhbWUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDY4OiB7XHJcbiAgICAgICAgICAgIC8vZFxyXG4gICAgICAgICAgICB0aGlzLmdhbWUuZGVtb0dhbWUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGRlc3Ryb3kgdGhlIGFwcFxyXG4gKi9cclxuVGV0cmlzQXBwbGljYXRpb24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmdhbWUuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmdhbWUuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdhbWUuYmdNdXNpYykge1xyXG4gICAgICAgIC8vc3RvcCBiYWNrZ3JvdW5kIG11c2ljXHJcbiAgICAgICAgdGhpcy5nYW1lLmJnTXVzaWMucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW4tZnJhbWVcIikucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV0cmlzQXBwbGljYXRpb247XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgSkJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9KQmxvY2tTaGFwZVwiKTtcclxudmFyIExCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vTEJsb2NrU2hhcGVcIik7XHJcbnZhciBTQmxvY2tTaGFwZSA9IHJlcXVpcmUoXCIuL1NCbG9ja1NoYXBlXCIpO1xyXG52YXIgWkJsb2NrU2hhcGUgPSByZXF1aXJlKFwiLi9aQmxvY2tTaGFwZVwiKTtcclxudmFyIElCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vSUJsb2NrU2hhcGVcIik7XHJcbnZhciBTcXVhcmVCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vU3F1YXJlQmxvY2tTaGFwZVwiKTtcclxudmFyIFRCbG9ja1NoYXBlID0gcmVxdWlyZShcIi4vVEJsb2NrU2hhcGVcIik7XHJcbi8qKlxyXG4gKiBUbyBjcmVhdGUgdGhpcyBtb2R1bGUgSSBoYXZlIHJlYWQgdGhlIGZvbGxvd2luZyBndWlkZTpcclxuICogaHR0cDovL2dhbWVkZXZlbG9wbWVudC50dXRzcGx1cy5jb20vdHV0b3JpYWxzL2ltcGxlbWVudGluZy10ZXRyaXMtY29sbGlzaW9uLWRldGVjdGlvbi0tZ2FtZWRldi04NTJcclxuICovXHJcblxyXG4vKipcclxuICogQ29udHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIHRldHJpcyBnYW1lXHJcbiAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIGRvbS1lbGVtZW50IHRvIGJlIHByaW50ZWQgdG9cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBUZXRyaXNHYW1lKGVsZW1lbnQpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLmZhbGxpbmdCbG9jayA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuZmllbGQgPSBbXTtcclxuICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuZnVsbFJvd3MgPSBbXTtcclxuICAgIHRoaXMuYmFzZVBvaW50cyA9IDEwMDtcclxuICAgIHRoaXMuZmFsbFNwZWVkID0gNjAwO1xyXG4gICAgdGhpcy5sZXZlbCA9IDE7XHJcbiAgICB0aGlzLnJvd0NvdW50ID0gMDtcclxuICAgIHRoaXMucG9pbnRzID0gMDtcclxuICAgIHRoaXMuaGlnaFNjb3JlID0gMDtcclxuICAgIHRoaXMubmV4dEJsb2NrID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuRlhzb3VuZHMgPSBmYWxzZTtcclxuICAgIHRoaXMuQkdzb3VuZHMgPSBmYWxzZTtcclxuICAgIHRoaXMuYmdNdXNpYyA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvdGV0cmlzLm1wM1wiKTtcclxuICAgIHRoaXMucm90YXRlU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL3JvdGF0ZS1ibG9jay5tcDNcIik7XHJcbiAgICB0aGlzLmxhbmRTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvbGFuZC1ibG9jay5tcDNcIik7XHJcbiAgICB0aGlzLmxpbmVTb3VuZCA9IG5ldyBBdWRpbyhcIi8vcm9vdC5vc2thcmVtaWxzc29uLnNlL3RldHJpcy1zb3VuZHMvbGluZS1yZW1vdmUubXAzXCIpO1xyXG4gICAgdGhpcy5tb3ZlU291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL21vdmUtYmxvY2subXAzXCIpO1xyXG4gICAgdGhpcy5nYW1lb3ZlclNvdW5kID0gbmV3IEF1ZGlvKFwiLy9yb290Lm9za2FyZW1pbHNzb24uc2UvdGV0cmlzLXNvdW5kcy9nYW1lLW92ZXIubXAzXCIpO1xyXG4gICAgdGhpcy5mb3VyUm93U291bmQgPSBuZXcgQXVkaW8oXCIvL3Jvb3Qub3NrYXJlbWlsc3Nvbi5zZS90ZXRyaXMtc291bmRzL2ZvdXItcm93cy5tcDNcIik7XHJcblxyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVkIHRoZSBiYXNpY3Mgb2YgdGhlIG1vZHVsZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pbml0RmllbGQoKTtcclxuICAgIHRoaXMucHJpbnQoKTtcclxuXHJcbiAgICAvL2FkZCBsaXN0ZW5lciB0byBwYXVzZSBpZiBmb2N1cyBpcyBsb3N0XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgdGhpcy5wYXVzZUdhbWUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy9hZGQgbGlzdGVuZXIgZm9yIHRoZSBzb3VuZHMgdG9nZ2xlXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtc2lkZS1pbmZvXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLnNvdW5kVG9nZ2xlLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vcmVhZCBzb3VuZC1zZXR0aW5ncyBmcm9tIGxvY2FsXHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJGWHNvdW5kc1wiKSkge1xyXG4gICAgICAgIHZhciBGWHNvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiRlhzb3VuZHNcIik7XHJcbiAgICAgICAgaWYgKEZYc291bmRzID09PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICB0aGlzLkZYc291bmRzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV0cmlzLXNvdW5kLXRvZ2dsZVwiKS5jbGFzc0xpc3QuYWRkKFwic291bmRzXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJCR3NvdW5kc1wiKSkge1xyXG4gICAgICAgIHZhciBCR3NvdW5kcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiQkdzb3VuZHNcIik7XHJcbiAgICAgICAgaWYgKEJHc291bmRzID09PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICB0aGlzLkJHc291bmRzID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV0cmlzLW11c2ljLXRvZ2dsZVwiKS5jbGFzc0xpc3QuYWRkKFwic291bmRzXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBwYXVzZSB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucGF1c2VHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5CR3NvdW5kcykge1xyXG4gICAgICAgIC8vcGxheSBiYWNrZ3JvdW5kIG11c2ljXHJcbiAgICAgICAgdGhpcy5iZ011c2ljLnBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9wYXVzZSB0aGUgZ2FtZVxyXG4gICAgaWYgKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwgJiYgdGhpcy5hbGl2ZSkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuZmFsbGluZ0Jsb2NrSW50ZXJ2YWwpO1xyXG4gICAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcGF1c2VkXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlc3VtZSB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVzdW1lR2FtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcclxuICAgICAgICAvL3BsYXkgYmFja2dyb3VuZCBtdXNpY1xyXG4gICAgICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9zdGFydCB0aGUgZHJvcC1pbnRlcnZhbCBhZ2FpblxyXG4gICAgdGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmZhbGxCbG9jay5iaW5kKHRoaXMpLCB0aGlzLmZhbGxTcGVlZCk7XHJcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTdGFydCB0aGUgZ2FtZVxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5mYWxsaW5nQmxvY2tJbnRlcnZhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9zZXQgYWxsIHRoZSB2YXJpYWJsZXMgdG8gdGhlIHN0YXJ0LXN0YXRlXHJcbiAgICB0aGlzLmFsaXZlID0gdHJ1ZTtcclxuICAgIHRoaXMubGV2ZWwgPSAxO1xyXG4gICAgdGhpcy5wb2ludHMgPSAwO1xyXG4gICAgdGhpcy5mYWxsU3BlZWQgPSA2MDA7XHJcbiAgICB0aGlzLnJvd0NvdW50ID0gMDtcclxuICAgIHRoaXMucmVhZEhpZ2hTY29yZSgpO1xyXG5cclxuICAgIC8vbWFrZSBzdXJlIHRoZSBjbGFzc2VzIGlzIHJlc2V0dGVkXHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtZ3JpZC1ib2R5XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJnYW1lLW92ZXJcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJuZXctaGlnaHNjb3JlXCIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLXBhdXNlZFwiKS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1zcGxhc2gtc2NyZWVuXCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xyXG5cclxuICAgIC8vcnVuIGFsbCB0aGUgZnVuY3Rpb25zIHRvIG1ha2UgdGhlIG1hZ2ljIGhhcHBlblxyXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuaW5pdEZpZWxkKCk7XHJcbiAgICB0aGlzLmNsZWFyRmllbGQoKTtcclxuICAgIHRoaXMucmVuZGVyUG9pbnRzKCk7XHJcbiAgICB0aGlzLm5ld05leHRCbG9jaygpO1xyXG4gICAgdGhpcy5kcm9wTmV3QmxvY2soKTtcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcclxuICAgICAgICAvL3BsYXkgYmFja2dyb3VuZCBtdXNpY1xyXG4gICAgICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XHJcbiAgICAgICAgdGhpcy5iZ011c2ljLmFkZEV2ZW50TGlzdGVuZXIoXCJlbmRlZFwiLCB0aGlzLnBsYXlCYWNrZ3JvdW5kTXVzaWMuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucGxheUJhY2tncm91bmRNdXNpYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5iZ011c2ljLmN1cnJlbnRUaW1lID0gMDtcclxuICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVhZCB0aGUgaGlnaCBzY29yZSBmcm9tIGxvY2FsIHN0b3JhZ2VcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnJlYWRIaWdoU2NvcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRldHJpcy1oc1wiKSkge1xyXG4gICAgICAgIHRoaXMuaGlnaFNjb3JlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0ZXRyaXMtaHNcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gc2F2ZSB0aGUgaGlnaCBzY29yZSB0byBsb2NhbCBzdG9yYWdlXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5zYXZlSGlnaFNjb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5wb2ludHMgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGV0cmlzLWhzXCIsIHRoaXMucG9pbnRzKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBmYWxsIHRoZSBibG9jayBvbmUgcm93IGRvd25cclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmZhbGxCbG9jayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuaXNGYWxsYWJsZSgpKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3cgKz0gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vYmxvY2sgaGFzIGNvbGxpZGVkLCBsYW5kIHRoZSBibG9jayBhbmQgZHJvcCBuZXdcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuICAgICAgICB0aGlzLmxhbmRGYWxsaW5nQmxvY2soKTtcclxuICAgICAgICB0aGlzLmRyb3BOZXdCbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmVuZGVyIHRoZSBjaGFuZ2VcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZmFsbCBibG9jayB0byBib3R0b20gZGlyZWN0bHlcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmZhbGxCbG9ja1RvQm90dG9tID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aGlsZSAodGhpcy5pc0ZhbGxhYmxlKCkpIHtcclxuICAgICAgICB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmVuZGVyIHRoZSBjaGFuZ2VcclxuICAgIHRoaXMucmVuZGVyKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmFuZG9taXplIGEgbmV3IGJsb2NrXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5uZXdOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzaGFwZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpO1xyXG5cclxuICAgIC8vY3JlYXRlIG5ldyBibG9jayBmcm9tIHRoZSByYW5kb20gbnVtYmVyXHJcbiAgICBzd2l0Y2ggKHNoYXBlKSB7XHJcbiAgICAgICAgY2FzZSAwOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IEpCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IExCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFNCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAzOiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFpCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSA0OiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IElCbG9ja1NoYXBlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSA1OiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dEJsb2NrID0gbmV3IFNxdWFyZUJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIDY6IHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0QmxvY2sgPSBuZXcgVEJsb2NrU2hhcGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGRyb3AgbmV3IGJsb2NrXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5kcm9wTmV3QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vZ2V0IHRoZSBibG9jayBmcm9tIG5leHQtYmxvY2tcclxuICAgIHRoaXMuZmFsbGluZ0Jsb2NrID0gdGhpcy5uZXh0QmxvY2s7XHJcblxyXG4gICAgLy9nZXQgYSBuZXcgbmV4dCBibG9ja1xyXG4gICAgdGhpcy5jbGVhck5leHRCbG9jaygpO1xyXG4gICAgdGhpcy5uZXdOZXh0QmxvY2soKTtcclxuXHJcbiAgICAvL2FkZCBmYWxsaW50ZXJ2YWwgd2l0aCBjdXJyZW50IHNwZWVkXHJcbiAgICB0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuZmFsbEJsb2NrLmJpbmQodGhpcyksIHRoaXMuZmFsbFNwZWVkKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuaXNGYWxsYWJsZSgpKSB7XHJcbiAgICAgICAgLy90aGUgbmV3IGJsb2NrIGNvbGxpZGVkIGF0IGxhdW5jaCwgZ2FtZSBvdmVyXHJcbiAgICAgICAgdGhpcy5zYXZlSGlnaFNjb3JlKCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWdyaWQtYm9keVwiKS5jbGFzc0xpc3QuYWRkKFwiZ2FtZS1vdmVyXCIpO1xyXG4gICAgICAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmZhbGxpbmdCbG9ja0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuQkdzb3VuZHMpIHtcclxuICAgICAgICAgICAgLy9zdG9wIGJhY2tncm91bmQgbXVzaWNcclxuICAgICAgICAgICAgdGhpcy5iZ011c2ljLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYmdNdXNpYy5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnBsYXlHYW1lT3ZlclNvdW5kLmJpbmQodGhpcyksIDUwMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5wbGF5R2FtZU92ZXJTb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcclxuICAgICAgICAvL3BsYXkgZ2FtZW92ZXIgc291bmRcclxuICAgICAgICB0aGlzLmdhbWVvdmVyU291bmQuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZW92ZXJTb3VuZC5wbGF5KCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gbGFuZCB0aGUgZmFsbGluZyBibG9jayB0byB0aGUgZmllbGRcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmxhbmRGYWxsaW5nQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLkZYc291bmRzKSB7XHJcbiAgICAgICAgLy9wbGF5IHNvdW5kXHJcbiAgICAgICAgdGhpcy5sYW5kU291bmQuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMubGFuZFNvdW5kLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKHNoYXBlW3Jvd11bY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpZWxkW3JvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93XVtjb2wgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbF0gPSBzaGFwZVtyb3ddW2NvbF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZXNldCB0aGUgZnVsbFJvd3MgYXJyYXlcclxuICAgIHRoaXMuZnVsbFJvd3MgPSBbXTtcclxuXHJcbiAgICAvL2NoZWNrIGlmIHRoZXJlIGFyZSBmdWxsIHJvd3MgYWZ0ZXIgbGFuZGluZ1xyXG4gICAgdGhpcy5maW5kRnVsbFJvd3MoKTtcclxuXHJcbiAgICBpZiAodGhpcy5mdWxsUm93cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy9jYWxsIGZ1bmN0aW9uIHRvIG1ha2UgYW5pbWF0aW9uc1xyXG4gICAgICAgIHRoaXMuYW5pbWF0ZUZ1bGxSb3dzKCk7XHJcblxyXG4gICAgICAgIC8vZXJhc2UgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuY2xlYXJBbmltYXRpb24uYmluZCh0aGlzKSwgNjAwKTtcclxuXHJcbiAgICAgICAgLy9lcmFzZSB0aGUgcm93c1xyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuZXJhc2VGdWxsUm93cy5iaW5kKHRoaXMpLCAzNTApO1xyXG5cclxuICAgICAgICAvL2NvdW50IHBvaW50c1xyXG4gICAgICAgIHRoaXMucG9pbnRzICs9IHRoaXMuY291bnRSb3dQb2ludHMoKTtcclxuXHJcbiAgICAgICAgLy9pZiBuZXcgSFMgYWRkIGNsYXNzIHRvIHNob3cgaXQgdG8gdGhlIHVzZXJcclxuICAgICAgICBpZiAodGhpcy5wb2ludHMgPiB0aGlzLmhpZ2hTY29yZSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpLmNsYXNzTGlzdC5hZGQoXCJuZXctaGlnaHNjb3JlXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9yZXNldCB0aGUgZnVsbFJvd3MgYXJyYXlcclxuICAgICAgICAvL3RoaXMuZnVsbFJvd3MgPSBbXTtcclxuXHJcbiAgICAgICAgLy9yZW5kZXIgdGhlIHBvaW50c1xyXG4gICAgICAgIHRoaXMucmVuZGVyUG9pbnRzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gZXJhc2UgYW5pbWF0aW9uLWNsYXNzZXNcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyQW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQtYm9keSB0clwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRycy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHRyc1tpXS5jbGFzc0xpc3QucmVtb3ZlKFwiZnVsbC1yb3dcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcmVuZGVyIHRoZSBnYW1lXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2xlYXJGaWVsZCgpO1xyXG5cclxuICAgIC8vIENoYW5nZSB0aGUgY2xhc3NlcyB0byByZW5kZXIgdGhlIGJsb2NrcyB0byB1c2VyXHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQgdHJcIik7XHJcbiAgICB2YXIgdGRzO1xyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjbGFzcyB0byBzaG93IGJsb2NrLXBhcnRcclxuICAgICAgICAgICAgICAgIHRkc1tjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtYmxvY2stcGFydFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL3JlbmRlciB0aGUgZmFsbGluZyBibG9jayBhbmQgbmV4dGJsb2NrXHJcbiAgICB0aGlzLnJlbmRlckZhbGxpbmdCbG9jaygpO1xyXG4gICAgdGhpcy5yZW5kZXJOZXh0QmxvY2soKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW5kZXIgdGhlIHBvaW50c1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcG9pbnRzRWxlbSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1wb2ludHNcIik7XHJcbiAgICB2YXIgbGV2ZWxFbGVtID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV0cmlzLWxldmVsXCIpO1xyXG4gICAgdmFyIHBvaW50Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMucG9pbnRzLnRvU3RyaW5nKCkpO1xyXG4gICAgdmFyIGxldmVsTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMubGV2ZWwudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgLy9yZXBsYWNlIHRoZSB0ZXh0bm9kZXMgdG8gdGhlIG5ldyBvbmVzXHJcbiAgICBwb2ludHNFbGVtLnJlcGxhY2VDaGlsZChwb2ludE5vZGUsIHBvaW50c0VsZW0uZmlyc3RDaGlsZCk7XHJcbiAgICBsZXZlbEVsZW0ucmVwbGFjZUNoaWxkKGxldmVsTm9kZSwgbGV2ZWxFbGVtLmZpcnN0Q2hpbGQpO1xyXG5cclxuICAgIHRoaXMuYW5pbWF0ZU5ld1BvaW50cygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgZmFsbGluZyBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIGNvbDtcclxuXHJcbiAgICAvL2dldCB0aGUgbm9kZXNcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0clwiKTtcclxuICAgIHZhciB0ZHMgPSBbXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzLnB1c2godHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtZ3JpZCB0ZFwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5mYWxsaW5nQmxvY2suc2hhcGVzW3RoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgc2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vZHJhdyBibG9jayBhdCBwb3NpdGlvbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBzaGFwZXMgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgIHZhciB5ID0gcm93ICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3c7XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vYWRkIGNsYXNzIHRvIHRoZSBjb3JyZWN0IGJsb2NrLXBhcnRcclxuICAgICAgICAgICAgICAgIGlmIChyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGRzW3ldW3hdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgbmV4dCBibG9ja1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucmVuZGVyTmV4dEJsb2NrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93O1xyXG4gICAgdmFyIGNvbDtcclxuXHJcbiAgICAvL2dldCB0aGUgbm9kZXNcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50ZXRyaXMtbmV4dC1ibG9jayB0Ym9keSB0clwiKTtcclxuICAgIHZhciB0ZHMgPSBbXTtcclxuICAgIGZvciAocm93ID0gMDsgcm93IDwgdHJzLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICB0ZHMucHVzaCh0cnNbcm93XS5xdWVyeVNlbGVjdG9yQWxsKFwidGRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaGFwZSA9IHRoaXMubmV4dEJsb2NrLnNoYXBlc1t0aGlzLm5leHRCbG9jay5yb3RhdGlvbl07XHJcbiAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IHNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoc2hhcGVbcm93XVtjb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2RyYXcgYmxvY2sgYXQgcG9zaXRpb24gY29ycmVzcG9uZGluZyB0byB0aGUgc2hhcGVzIHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICB0ZHNbcm93XVtjb2xdLmNsYXNzTGlzdC5hZGQoXCJ0ZXRyaXMtZmFsbGluZy1ibG9jay1wYXJ0XCIsIFwiY29sb3ItXCIgKyBzaGFwZVtyb3ddW2NvbF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIHRoZSBuZXh0LWJsb2NrLWNvbnRhaW5lclxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY2xlYXJOZXh0QmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXIgbmV4dC1ibG9ja1xyXG4gICAgdmFyIHRycyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRldHJpcy1uZXh0LWJsb2NrIHRib2R5IHRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRycy5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdGRzID0gdHJzW3Jvd10ucXVlcnlTZWxlY3RvckFsbChcInRkXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRkcy5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIC8vY2xlYXIgdGhlIGNvbHVtblxyXG4gICAgICAgICAgICB0ZHNbY29sXS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGJsb2NrIGlzIGZhbGxhYmxlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIGZhbGxhYmxlIG9yIG5vdFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNGYWxsYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZhbGxhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG4gICAgdmFyIHBvdGVudGlhbFRvcExlZnQgPSB7XHJcbiAgICAgICAgcm93OiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvdyArIDEsXHJcbiAgICAgICAgY29sOiB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LmNvbFxyXG4gICAgfTtcclxuXHJcbiAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBzaGFwZS5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgc2hhcGVbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vY2hlY2sgdGhhdCB0aGUgc2hhcGUgaXMgbm90IGFib3ZlIHRoZSBmaWVsZFxyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3cgPj0gdGhpcy5maWVsZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIGJlbG93IHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmllbGRbcm93ICsgcG90ZW50aWFsVG9wTGVmdC5yb3ddW2NvbCArIHBvdGVudGlhbFRvcExlZnQuY29sXSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoZSBzcGFjZSBpcyB0YWtlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsbGFibGU7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gbW92ZSB0aGUgZmFsbGluZyBibG9ja1xyXG4gKiBAcGFyYW0gZGlyXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5tb3ZlRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICBpZiAodGhpcy5pc01vdmFibGUoZGlyKSkge1xyXG4gICAgICAgIGlmICh0aGlzLkZYc291bmRzKSB7XHJcbiAgICAgICAgICAgIC8vcGxheSBzb3VuZFxyXG4gICAgICAgICAgICB0aGlzLm1vdmVTb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZVNvdW5kLnBsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sICs9IGRpcjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGJsb2NrIGlzIG1vdmFibGVcclxuICogQHBhcmFtIGRpciAtIG5lZ2F0aXZlIG9yIHBvc2l0aXZlIG51bWJlclxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBtb3ZhYmxlIG9yIG5vdFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNNb3ZhYmxlID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICB2YXIgbW92YWJsZSA9IHRydWU7XHJcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmZhbGxpbmdCbG9jay5zaGFwZXNbdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb25dO1xyXG4gICAgdmFyIHBvdGVudGlhbFRvcExlZnQgPSB7XHJcbiAgICAgICAgICAgIHJvdzogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5yb3csXHJcbiAgICAgICAgICAgIGNvbDogdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2wgKyBkaXJcclxuICAgICAgICB9O1xyXG5cclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHNoYXBlLmxlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBzaGFwZVtyb3ddLmxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKGNvbCArIHBvdGVudGlhbFRvcExlZnQuY29sIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICBtb3ZhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb2wgKyBwb3RlbnRpYWxUb3BMZWZ0LmNvbCA+PSB0aGlzLmZpZWxkWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSByaWdodCBvZiB0aGUgcGxheWluZyBmaWVsZFxyXG4gICAgICAgICAgICAgICAgbW92YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcclxuICAgICAgICAgICAgaWYgKHJvdyArIHBvdGVudGlhbFRvcExlZnQucm93ID49IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChzaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3cgKyBwb3RlbnRpYWxUb3BMZWZ0LnJvd11bY29sICsgcG90ZW50aWFsVG9wTGVmdC5jb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlIHNwYWNlIGlzIHRha2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1vdmFibGU7XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gcm90YXRlIGZhbGxpbmcgYmxvY2tcclxuICogQHBhcmFtIGRpciAtIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIG51bWJlciB0byBoYW5kbGUgbGVmdC9SaWdodFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUucm90YXRlRmFsbGluZ0Jsb2NrID0gZnVuY3Rpb24oZGlyKSB7XHJcbiAgICBpZiAodGhpcy5pc1JvdGF0YWJsZShkaXIpKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcclxuICAgICAgICAgICAgLy9wbGF5IHNvdW5kXHJcbiAgICAgICAgICAgIHRoaXMucm90YXRlU291bmQuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnJvdGF0ZVNvdW5kLnBsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBuZXdSb3RhdGlvbiA9IHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uICsgZGlyO1xyXG4gICAgICAgIGlmIChuZXdSb3RhdGlvbiA+IDMpIHtcclxuICAgICAgICAgICAgbmV3Um90YXRpb24gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuZXdSb3RhdGlvbiA8IDApIHtcclxuICAgICAgICAgICAgbmV3Um90YXRpb24gPSAzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mYWxsaW5nQmxvY2sucm90YXRpb24gPSBuZXdSb3RhdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGJsb2NrIGlzIHJvdGF0YWJsZVxyXG4gKiBAcGFyYW0gZGlyIC0gbmVnIG9yIHBvcyBudW1iZXJcclxuICogQHJldHVybnMge2Jvb2xlYW59IC0gcm90YXRhYmxlIG9yIG5vdFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuaXNSb3RhdGFibGUgPSBmdW5jdGlvbihkaXIpIHtcclxuICAgIHZhciByb3RhdGFibGUgPSB0cnVlO1xyXG5cclxuICAgIHZhciBwb3RlbnRpYWxSb3RhdGlvbiA9IHRoaXMuZmFsbGluZ0Jsb2NrLnJvdGF0aW9uICsgZGlyO1xyXG4gICAgaWYgKHBvdGVudGlhbFJvdGF0aW9uID4gMykge1xyXG4gICAgICAgIHBvdGVudGlhbFJvdGF0aW9uID0gMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHBvdGVudGlhbFJvdGF0aW9uIDwgMCkge1xyXG4gICAgICAgIHBvdGVudGlhbFJvdGF0aW9uID0gMztcclxuICAgIH1cclxuXHJcbiAgICAvL2NyZWF0ZSBwb3RlbnRpYWwgc2hhcGVcclxuICAgIHZhciBwb3RlbnRpYWxTaGFwZSA9IHRoaXMuZmFsbGluZ0Jsb2NrLnNoYXBlc1twb3RlbnRpYWxSb3RhdGlvbl07XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgcG90ZW50aWFsU2hhcGUubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHBvdGVudGlhbFNoYXBlW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICAvL2NoZWNrIHRoYXQgdGhlIHNoYXBlIGlzIG5vdCBhYm92ZSB0aGUgZmllbGRcclxuICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgLy90aGlzIGJsb2NrIHdvdWxkIGJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbCArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQuY29sID49IHRoaXMuZmllbGRbMF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMgYmxvY2sgd291bGQgYmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwbGF5aW5nIGZpZWxkXHJcbiAgICAgICAgICAgICAgICByb3RhdGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHJvdyArIHRoaXMuZmFsbGluZ0Jsb2NrLnRvcExlZnQucm93ID49IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChwb3RlbnRpYWxTaGFwZVtyb3ddW2NvbF0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3cgKyB0aGlzLmZhbGxpbmdCbG9jay50b3BMZWZ0LnJvd11bY29sICsgdGhpcy5mYWxsaW5nQmxvY2sudG9wTGVmdC5jb2xdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlIHNwYWNlIGlzIHRha2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0YWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcm90YXRhYmxlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNsZWFyIGFsbCB0aGUgdGFibGVyb3dzIGluIGdhbWVcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmNsZWFyRmllbGQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vY2xlYXIgZmllbGRcclxuICAgIHZhciB0cnMgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcInRyXCIpO1xyXG4gICAgdmFyIHRkcztcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIHRkcyA9IHRyc1tyb3ddLnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZFwiKTtcclxuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmZpZWxkW3Jvd10ubGVuZ3RoOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICAvL3Jlc2V0IHRoZSBjbGFzc2VzXHJcbiAgICAgICAgICAgIHRkc1tjb2xdLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byBmaW5kIHRoZSBmdWxscm93cyBvbiB0aGUgZmllbGRcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmZpbmRGdWxsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9maW5kIGZ1bGwgcm93c1xyXG4gICAgdmFyIGZ1bGwgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuZmllbGQubGVuZ3RoOyByb3cgKz0gMSkge1xyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGggLSAxOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWVsZFtyb3ddLmluZGV4T2YoMCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvL3JvdyBpcyBmdWxsXHJcbiAgICAgICAgICAgICAgICBmdWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZ1bGwpIHtcclxuICAgICAgICAgICAgLy9hZGQgdGhlbSB0byB0aGUgYXJyYXkgb3MgZnVsbCByb3dzXHJcbiAgICAgICAgICAgIHRoaXMuZnVsbFJvd3MucHVzaChyb3cpO1xyXG4gICAgICAgICAgICB0aGlzLnJvd0NvdW50ICs9IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yb3dDb3VudCAlIDUgPT09IDAgJiYgdGhpcy5mYWxsU3BlZWQgPiAxNTApIHtcclxuICAgICAgICAgICAgICAgIC8vc3BlZWQgdXAgdGhlIGdhbWVcclxuICAgICAgICAgICAgICAgIHRoaXMuZmFsbFNwZWVkIC09IDM1O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sZXZlbCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdWxsID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFtaW5hdGUgdGhlIGZ1bGwgcm93c1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuYW5pbWF0ZUZ1bGxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdHJzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGV0cmlzLWdyaWQtYm9keSB0clwiKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnVsbFJvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB0cnNbdGhpcy5mdWxsUm93c1tpXV0uY2xhc3NMaXN0LmFkZChcImZ1bGwtcm93XCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGVyYXNlIHRoZSBmdWxsIHJvd3MgZnJvbSBmaWVsZFxyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuZXJhc2VGdWxsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuRlhzb3VuZHMpIHtcclxuICAgICAgICAvL3BsYXkgc291bmRcclxuICAgICAgICBpZiAodGhpcy5mdWxsUm93cy5sZW5ndGggPT09IDQpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3VyUm93U291bmQuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmZvdXJSb3dTb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxpbmVTb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubGluZVNvdW5kLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZ1bGxSb3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgLy9yZW1vdmUgdGhlIGZ1bGwgcm93IGZyb20gZmllbGRcclxuICAgICAgICB0aGlzLmZpZWxkLnNwbGljZSh0aGlzLmZ1bGxSb3dzW2ldLCAxKTtcclxuXHJcbiAgICAgICAgLy9hZGQgYSBuZXcgZW1wdHkgb24gdG9wIG9mIGZpZWxkXHJcbiAgICAgICAgdmFyIG5ld1JvdyA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTtcclxuXHJcbiAgICAgICAgLy9hZGQgaXQgdG8gdGhlIGJlZ2lubmluZyBvZiBhcnJheVxyXG4gICAgICAgIHRoaXMuZmllbGQudW5zaGlmdChuZXdSb3cpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGNvdW50IHRoZSBwb2ludHNcclxuICogQHJldHVybnMge251bWJlcn0gLSB0aGUgbmV3IHBvaW50c1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuY291bnRSb3dQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vMTAwcCBmb3Igb25lIHJvdywgYWRkIGFkZGl0aW9uYWwgMjAlIHBlciBleHRyYSByb3dcclxuICAgIHJldHVybiB0aGlzLmJhc2VQb2ludHMgKyAoKHRoaXMuZnVsbFJvd3MubGVuZ3RoIC0gMSkgKiB0aGlzLmJhc2VQb2ludHMpICogMS4yO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHByaW50IHRoZSBnYW1lYm9hcmRcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3ByaW50IHRoZSBjaGF0LXRlbXBsYXRlIHRvIHRoaXMuZWxlbWVudFxyXG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZS10ZXRyaXMtYXBwbGljYXRpb25cIikuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICB2YXIgdHI7XHJcbiAgICB2YXIgdGQ7XHJcblxyXG4gICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5maWVsZC5sZW5ndGg7IHJvdyArPSAxKSB7XHJcbiAgICAgICAgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIik7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuZmllbGRbcm93XS5sZW5ndGg7IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgIHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xyXG4gICAgICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRyKTtcclxuICAgIH1cclxuXHJcbiAgICB0ZW1wbGF0ZS5xdWVyeVNlbGVjdG9yKFwiLnRldHJpcy1ncmlkLWJvZHlcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWNvbnRlbnRcIikuYXBwZW5kQ2hpbGQodGVtcGxhdGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGluaXRpYWxpemUgdGhlIGZpZWxkLWFycmF5XHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5pbml0RmllbGQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmllbGQgPSBbXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXHJcbiAgICBdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIGFuaW1hdGUgbmV3IHBvaW50c1xyXG4gKi9cclxuVGV0cmlzR2FtZS5wcm90b3R5cGUuYW5pbWF0ZU5ld1BvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xyXG5cclxuICAgIGVsZW0uY2xhc3NMaXN0LmFkZChcInRldHJpcy1uZXctcG9pbnRzXCIpO1xyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuY2xlYXJOZXdQb2ludHNBbmltYXRpb24uYmluZCh0aGlzKSwgNTUwKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0byByZW1vdmUgdGhlIGNsYXNzIHNldCBieSB0aGUgYW5pbWF0ZSBuZXcgcG9pbnRzXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5jbGVhck5ld1BvaW50c0FuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVsZW0gPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXRyaXMtcG9pbnRzXCIpO1xyXG5cclxuICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZShcInRldHJpcy1uZXctcG9pbnRzXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZ1bmN0aW9uIHRvIHRvZ2dsZSB0aGUgc291bmRzXHJcbiAqL1xyXG5UZXRyaXNHYW1lLnByb3RvdHlwZS5zb3VuZFRvZ2dsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09PSBcInRldHJpcy1tdXNpYy10b2dnbGVcIikge1xyXG4gICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKFwic291bmRzXCIpO1xyXG4gICAgICAgIHRoaXMuQkdzb3VuZHMgPSAhdGhpcy5CR3NvdW5kcztcclxuXHJcbiAgICAgICAgLy9kYXZlIHRvIGxvY2FsIHN0b3JhZ2VcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkJHc291bmRzXCIsIHRoaXMuQkdzb3VuZHMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5CR3NvdW5kcyAmJiB0aGlzLmFsaXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmdNdXNpYy5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmJnTXVzaWMucGF1c2UoKTtcclxuICAgICAgICAgICAgdGhpcy5iZ011c2ljLmN1cnJlbnRUaW1lID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChldmVudC50YXJnZXQuaWQgPT09IFwidGV0cmlzLXNvdW5kLXRvZ2dsZVwiKSB7XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoXCJzb3VuZHNcIik7XHJcbiAgICAgICAgdGhpcy5GWHNvdW5kcyA9ICF0aGlzLkZYc291bmRzO1xyXG5cclxuICAgICAgICAvL3NhdmUgdG8gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiRlhzb3VuZHNcIiwgdGhpcy5GWHNvdW5kcyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgZGVtby1nYW1lIGZvciBwcmVzZW50YXRpb25cclxuICpcclxuICovXHJcblRldHJpc0dhbWUucHJvdG90eXBlLmRlbW9HYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmZpZWxkID0gW1xyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgIFsxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAwXSxcclxuICAgICAgICBbMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMF0sXHJcbiAgICAgICAgWzEsIDEsIDEsIDAsIDEsIDEsIDEsIDEsIDEsIDBdLFxyXG4gICAgICAgIFsxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAwXVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLm5leHRCbG9jayA9IG5ldyBJQmxvY2tTaGFwZSgpO1xyXG4gICAgdGhpcy5jbGVhck5leHRCbG9jaygpO1xyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV0cmlzR2FtZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBTQmxvY2tTaGFwZSgpIHtcclxuICAgIHRoaXMuc2hhcGVzID0gW1xyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzUsIDUsIDBdLFxyXG4gICAgICAgICAgICBbMCwgNSwgNV1cclxuICAgICAgICBdLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgWzAsIDVdLFxyXG4gICAgICAgICAgICBbNSwgNV0sXHJcbiAgICAgICAgICAgIFs1LCAwXVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbNSwgNSwgMF0sXHJcbiAgICAgICAgICAgIFswLCA1LCA1XVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBbMCwgNV0sXHJcbiAgICAgICAgICAgIFs1LCA1XSxcclxuICAgICAgICAgICAgWzUsIDBdXHJcbiAgICAgICAgXVxyXG4gICAgXTtcclxuICAgIHRoaXMucm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy50b3BMZWZ0ID0ge1xyXG4gICAgICAgIHJvdzogLTIsXHJcbiAgICAgICAgY29sOiA0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNCbG9ja1NoYXBlO1xyXG4iXX0=

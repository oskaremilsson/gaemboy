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

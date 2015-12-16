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
    var newApp = false;
    var exitButton;
    var newID = "win-" + this.desktop.serialNumber;
    var margin = 10 * (this.desktop.serialNumber + 1 );
    this.desktop.serialNumber += 1;

    console.log(event.target);
    var value;
    if (event.target.attributes["value"]) {
        value = event.target.attributes["value"].value;
    }
    else if (event.target.parentNode.attributes["value"]) {
        value = event.target.parentNode.attributes["value"].value;
    }

    switch (value) {
        case "example": {
            newApp = new ExA(newID, margin, margin, this.desktop.zIndex);
            newApp.print();

            break;
        }
        case "memory": {
            newApp = new MemoryApplication(newID, margin, margin, this.desktop.zIndex, "Memory", "memory");
            newApp.print();
            newApp.init();

            break;
        }
    }

    if (newApp) {
        exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
        exitButton.addEventListener("click", this.desktop.destroyWindow.bind(this.desktop));
        this.desktop.windows.push(newApp);
    }
};

module.exports = Launcher;
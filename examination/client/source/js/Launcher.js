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

    var margin = 10 * (this.desktop.serialNumber + 1);
    var appOptions = {
        id: "win-" + this.desktop.serialNumber,
        x: margin,
        y: margin,
        zIndex: this.desktop.zIndex
    };

    //var newID = "win-" + this.desktop.serialNumber;
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
            newApp = new ExA(appOptions);
            newApp.print();

            break;
        }
        case "memory": {
            appOptions.title = "Memory";
            appOptions.icon = "memory";
            newApp = new MemoryApplication(appOptions);
            newApp.print();
            newApp.init();

            break;
        }
    }

    if (newApp) {
        var buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.windowButtonClick.bind(this.desktop));
        this.desktop.windows.push(newApp);
    }
};

module.exports = Launcher;
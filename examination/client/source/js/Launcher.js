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
        case "memory":
        {
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
        this.addRunningApp(value, newApp);
        this.desktop.serialNumber += 1;
    }

    if (value) {
        var switchTo = value.split(":");
        if(switchTo[0] === "id") {
            console.log("byter till:" + switchTo[1]);
            this.switchToWindow(switchTo[1]);
        }
    }
};

Launcher.prototype.switchToWindow = function(id) {
    this.zIndex += 1;
    var window;

    //HITTA FÖNSTRET MED ID!!!

    if (window) {
        window.style.zIndex = this.desktop.zIndex;
    }
};

Launcher.prototype.addRunningApp = function(type, app) {
    //get the tooltip-container for the app and add it to the list
    var container = document.querySelector("li[value='" + type + "'] .tooltip-container");

    var template = document.querySelector("#template-tooltip").content.cloneNode(true);
    template.querySelector(".tooltip").appendChild(document.createTextNode(app.title));
    template.querySelector(".tooltip").setAttribute("value", "id:" + app.id);

    container.appendChild(template);

};

module.exports = Launcher;
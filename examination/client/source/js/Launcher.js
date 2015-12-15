"use strict";
var ExA = require("./ExampleApplication");
var MemoryApplication = require("./MemoryApplication");

function Launcher(desktop) {
    this.desktop = desktop;

    //this.startApplication("memory");
}

Launcher.prototype.init = function() {
    var appList = document.querySelectorAll(".launcher li");
    console.log(appList);
    for (var i = 0; i < appList.length; i += 1) {
        appList[i].addEventListener("click", this.startApplication.bind(this));
    }

};

Launcher.prototype.startApplication = function(event) {
    var newApp;
    var exitButton;
    var newID = "win-" + this.desktop.serialNumber;
    var margin = 10 * (this.desktop.serialNumber + 1 );
    this.desktop.serialNumber += 1;

    switch (event.target.attributes["value"].value) {
        case "example": {
            newApp = new ExA(newID, margin, margin);
            newApp.print();

            exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
            exitButton.addEventListener("click", this.desktop.destroyWindow.bind(this.desktop));
            this.desktop.windows.push(newApp);
            break;
        }
        case "memory": {
            newApp = new MemoryApplication(newID, margin, margin);
            newApp.print();
            newApp.init();

            exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
            exitButton.addEventListener("click", this.desktop.destroyWindow.bind(this.desktop));
            this.desktop.windows.push(newApp);
            console.log(this.desktop.windows);
            break;
        }
    }
};

module.exports = Launcher;
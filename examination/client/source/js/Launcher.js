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
    var newID = "win-" + this.desktop.windows.length;
    var margin = 10 * (this.desktop.windows.length +1 );

    switch (event.target.attributes["value"].value) {
        case "example": {
            newApp = new ExA(newID, margin, margin);
            newApp.print();

            exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
            exitButton.addEventListener("click", newApp.destroy.bind(newApp));
            this.desktop.windows.push(newApp);
            break;
        }
        case "memory": {
            newApp = new MemoryApplication(newID, margin, margin);
            newApp.print();
            newApp.init();

            exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
            exitButton.addEventListener("click", newApp.destroy.bind(newApp));
            this.desktop.windows.push(newApp);
            break;
        }
    }
};

module.exports = Launcher;
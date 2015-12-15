"use strict";
var ExA = require("./ExampleApplication");

function Launcher(desktop) {
    this.desktop = desktop;

    this.startApplication("example");
    this.startApplication("example");
    this.startApplication("example");
}

Launcher.prototype.startApplication = function(name) {
    var newApp;
    switch (name) {
        case "example": {
            newApp = new ExA("win-" + this.desktop.windows.length, 10 * (this.desktop.windows.length +1 ), 10 * (this.desktop.windows.length +1 ));
            newApp.print();

            var exitButton = document.querySelector("#" + newApp.id + " .exit-button ");
            exitButton.addEventListener("click", newApp.destroy.bind(newApp));
            this.desktop.windows.push(newApp);
        }
    }
};

module.exports = Launcher;
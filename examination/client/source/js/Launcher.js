"use strict";
var ExA = require("./ExampleApplication");

function Launcher(desktop) {
    this.desktop = desktop;
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
    switch (event.target.attributes["value"].value) {
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
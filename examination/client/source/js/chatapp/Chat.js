"use strict";

function Chat(element) {
    this.element = element;
}

Chat.prototype.init = function() {
    console.log("inits the chat");
    //add listeners
    //start the socket and stuff
    this.print();
};

Chat.prototype.print = function() {

};

module.exports = Chat;
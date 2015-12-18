"use strict";

function Chat(element, server, channel) {
    this.element = element;
    this.server = server;
    this.channel = channel || "dragonslayer_96";
    this.socket = undefined;
    //this.data = undefined;
    this.key = "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd";
    this.username = "Kitty";
    this.online = false;
}

Chat.prototype.init = function() {
    console.log("inits the chat");
    this.connectToServer();
    //add listeners
    this.socket.addEventListener("message", this.newMessageFromServer.bind(this));

    this.element.querySelector(".chat-sendButton").addEventListener("click", this.formSubmit.bind(this));
    this.element.querySelector("form").addEventListener("focusout", this.toggleFocus.bind(this));
    this.element.querySelector(".chat-inputField").addEventListener("focus", this.toggleFocus.bind(this));
    this.element.querySelector(".chat-sendButton").addEventListener("focus", this.toggleFocus.bind(this));
};

Chat.prototype.connectToServer = function() {
    this.socket = new WebSocket("ws://" + this.server, "charcords");

    this.socket.addEventListener("open", this.setOnline.bind(this));
};

Chat.prototype.setOnline = function() {
    //this.socket.send(JSON.stringify(this.data));
    console.log("online = true");
    this.online = true;
};

Chat.prototype.newMessageFromServer = function(event) {
    console.log(event.data);
    var data = JSON.parse(event.data);
    if (data.type === "message") {
        this.printNewMessage(data);
    }
};

Chat.prototype.formSubmit = function() {
    if (this.online) {
        var input = this.element.querySelector(".chat-inputField").value;
        var msg = {
            "type": "message",
            "data": input,
            "username": this.username,
            "channel": this.channel,
            "key": this.key
        };

        this.socket.send(JSON.stringify(msg));
    }
};

Chat.prototype.printNewMessage = function(data) {
    console.log(data);
    var template = document.querySelector("#template-chat-message-line").content.cloneNode(true);
    var usernameNode = document.createTextNode(data.username);
    var messageNode = document.createTextNode(data.data);

    template.querySelector(".chat-nickname").appendChild(usernameNode);
    template.querySelector(".chat-message").appendChild(messageNode);

    this.element.querySelector(".chat-message-list ul").appendChild(template);
    var container = this.element.querySelector(".chat-message-list");
    container.scrollTop = container.scrollHeight;
};

Chat.prototype.toggleFocus = function() {
    this.element.classList.toggle("focused-window");
};

module.exports = Chat;
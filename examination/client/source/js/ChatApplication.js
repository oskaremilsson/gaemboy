"use strict";
var BasicWindow = require("./BasicWindow");
var Chat = require("./chatapp/Chat");

function ChatApplication(options) {
    BasicWindow.call(this, options);
    this.chat = undefined;
}

ChatApplication.prototype = Object.create(BasicWindow.prototype);
ChatApplication.prototype.constructor =  ChatApplication;

ChatApplication.prototype.init = function(){
    this.print();

    this.chat = new Chat(this.element, "vhost3.lnu.se:20080/socket/", "dragonslayer_96");
    this.chat.init();
};

ChatApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing chat");
    //document.querySelector("#" + this.id).classList.add("chat-app");
    this.element.classList.add("chat-app");
    this.element.querySelector(".window-icon").classList.add("chat-offline");
    //print the chat-template to this.element
    var template = document.querySelector("#template-chat-application").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);
};

ChatApplication.prototype.destroy = function() {
    this.chat.socket.close();
    document.querySelector("#main-frame").removeChild(this.element);
};

module.exports = ChatApplication;
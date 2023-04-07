"use strict";

let ws = new WebSocket("ws://localhost:8080");
let webSocketOpen = false;

let user = document.getElementById("user");
let room = document.getElementById("room");
let msg = document.getElementById("msg");
let chatBoard = document.getElementById("chatBoard");

room.addEventListener("keypress", handleKeyPressCB);
msg.addEventListener("keypress", handleKeyPressMsg);

ws.onopen = handleOpen;
ws.onmessage = handleMsg;
ws.onerror = handleError;

function main() {
    // ws.close = handleClose;
}

window.onload = main;

document.getElementById('lightBtn').addEventListener('click', function () {
    document.body.style.backgroundColor = document.body.style.backgroundColor === "white" ? "gray" : "white";
});

function handleKeyPressCB(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
        
        for (let ch of room.value) {
            if (! (ch >= 'a' && ch <= 'z')) {
                alert("The room name should be lowercase only with no spaces");
                return;
            }
        }

        if (webSocketOpen) {
            ws.send(`join ${user.value} ${room.value}`);
        }
        else { 
            alert("Web Socket is not open..");
        }
    }
}

function handleKeyPressMsg (event) {
    if (event.keyCode == 13) {
        console.log("hit enter for message button");
        console.log(msg.value);

        ws.send(user.value + " " + msg.value);
        msg.value= "";

        event.preventDefault();
    }
}

function handleMsg(event) {
    let msgData = event.data;
    let msgObj = JSON.parse(msgData);
    let msgType = msgObj.type;

    let msgList = document.createElement('li');

    if (msgType == "join") {
        console.log("joint");
        let joinMsg = document.createTextNode(user.value + " joined the Room " + room.value);
        msgList.appendChild(joinMsg);
    }
    else if (msgType == "message") {
        let sentMsg = document.createTextNode(user.value + ": " + msgObj.message);
        msgList.appendChild(sentMsg);
    }
    else if (msgType == "leave") {
        let leaveMsg = document.createTextNode(user.value + " left the Room " + room.value);
        msgList.appendChild(leaveMsg);
    }
    
    chatBoard.appendChild(msgList);
}

function handleOpen() {
    console.log("Connected");
    webSocketOpen = true;
}

function handleClose(){
    console.log("Closing the web socket");
    chatBoard.value = "The Server has left the building. Bye!";
}

function handleError(event) {
    console.log("Web socket Error: ", event);
    alert("[error]");
};
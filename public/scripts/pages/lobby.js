$(document).ready(function () {

    var socket = io();

    socket.emit("new_message", "I am in the lobby");

    //new message received
    socket.on("new_message", function (message) {
        console.log("received message: "+message);
    });

});
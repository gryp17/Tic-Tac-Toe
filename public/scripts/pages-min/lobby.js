$(document).ready(function(){var e=io();e.emit("new_message","I am in the lobby"),e.on("new_message",function(e){console.log("received message: "+e)})});
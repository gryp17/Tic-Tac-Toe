$(document).ready(function () {

    var socket = io();

    socket.emit("new_message", "I am in the lobby");

    //new message received
    socket.on("new_message", function (message) {
        console.log("received message: "+message);
    });
	
	//update the users list
	socket.on("updateUsersList", function (users){
		console.log("received users: ");
		console.log(users);
		
		$("#users-count").html("");
		users.forEach(function (user){
			$("#users-count").append("<li>"+user.username+"</li>");
		});
		
	});

});
var _ = require("lodash");
var middleware = require("../../middleware");

module.exports = function (io) {
	//lobby namespace
	var lobby = io.of("/lobby");

	var connectedUsers = {};
	var games = {};

	//checks if the socket.io requests are authorized
	lobby.use(middleware.socketIsAuthorized);

	lobby.on("connection", function (socket) {

		//add the newly connected user to the connectedUsers list and emit the updateUsersList event
		connectedUsers[socket.session.user.id] = socket.session.user;
		lobby.emit("updateUsersList", _.values(connectedUsers));

		//create a system message and send it to notify all clients that the user has joined the lobby
		var data = {
			type: "system connected",
			message: socket.session.user.username + " joined the lobby",
			date: new Date()
		};

		lobby.emit("chatMessage", data);

		//lobby chat message handler
		socket.on("chatMessage", function (message) {
			//add the type, date and author attributes and emit the message to all clientes
			var data = {
				type: "user",
				message: message,
				date: new Date(),
				author: socket.session.user
			};

			lobby.emit("chatMessage", data);
		});
		
		//update avatar handler
		socket.on("updateAvatar", function (avatar){
			//update the user's avatar in the connectedUsers list and send the updated list to all clients
			connectedUsers[socket.session.user.id].avatar = avatar;
			lobby.emit("updateUsersList", _.values(connectedUsers));
		});

		//disconnect event handler
		socket.on("disconnect", function () {

			delete connectedUsers[socket.session.user.id];
			lobby.emit("updateUsersList", _.values(connectedUsers));

			//create a system message and send it to notify all clients that the user has left the lobby
			var data = {
				type: "system disconnected",
				message: socket.session.user.username + " left the lobby",
				date: new Date()
			};

			lobby.emit("chatMessage", data);
		});

	});

};
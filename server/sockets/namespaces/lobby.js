var _ = require("lodash");
var middleware = require("../../middleware");

module.exports = function (io) {
	//lobby namespace
	var lobby = io.of("/lobby");
	
	lobby.games = {};
	
	/**
	 * Helper function that returns an array of all connected users
	 * @returns {Array}
	 */
	lobby.getConnectedUsers = function () {
		var users = [];

		_.forOwn(this.connected, function (data, socketId) {
			users.push(data.session.user);
		});

		return users;
	};
	
	//checks if the socket.io requests are authorized
	lobby.use(middleware.socketIsAuthorized);

	lobby.on("connection", function (socket) {
										
		//update the connected users list
		lobby.emit("updateUsersList", lobby.getConnectedUsers());

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
		
		//lobby challenge user handler
		socket.on("challengeUser", function (challengedUserId){
			challengedUserId = parseInt(challengedUserId);
			
			//can't challenge your self obviously
			if (challengedUserId !== socket.session.user.id) {
				//find the correct socketId and send the challenge only to that user
				_.forOwn(lobby.connected, function (data, socketId) {
					if (data.session.user.id === challengedUserId) {
						//send the challenger data to the challenged user
						socket.broadcast.to(socketId).emit("challenge", socket.session.user);
					}
				});
			}

		});
		
		//disconnect event handler
		socket.on("disconnect", function () {

			//update the connected users list
			lobby.emit("updateUsersList", lobby.getConnectedUsers());

			//create a system message and send it to notify all clients that the user has left the lobby
			var data = {
				type: "system disconnected",
				message: socket.session.user.username + " left the lobby",
				date: new Date()
			};

			lobby.emit("chatMessage", data);
		});

	});
	
	return lobby;
};
var middleware = require("./middleware");

module.exports = function (server) {
	var io = require("socket.io")(server);
	
	//lobby namespace
	var lobby = io.of("/lobby");
	
	var connectedUsers = [];

	//checks if the socket.io requests are authorized
	lobby.use(middleware.socketIsAuthorized);

	lobby.on("connection", function (socket) {
		
		//add the newly connected user to the connectedUsers list and emit the updateUsersList event
		connectedUsers.push(socket.session.user);
		lobby.emit("updateUsersList", connectedUsers);
		
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

		//disconnect event handler
		socket.on("disconnect", function () {

			connectedUsers = connectedUsers.filter(function (user) {
				return user.id !== socket.session.user.id;
			});

			lobby.emit("updateUsersList", connectedUsers);
			
			//create a system message and send it to notify all clients that the user has left the lobby
			var data = {
				type: "system disconnected",
				message: socket.session.user.username + " left the lobby",
				date: new Date()
			};
			
			lobby.emit("chatMessage", data);
		});

	});

	return io;
};
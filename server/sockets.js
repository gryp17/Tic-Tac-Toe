var middleware = require("./middleware");

module.exports = function (server) {
	var io = require("socket.io")(server);
	
	var connectedUsers = [];

	//checks if the socket.io requests are authorized
	io.use(middleware.socketIsAuthorized);

	io.on("connection", function (socket) {
		console.log("@@@ a user connected");
		
		connectedUsers.push(socket.session.user);
		io.emit("updateUsersList", connectedUsers);

		//lobby chat message handler
		socket.on("lobbyMessage", function (message) {
			//add the date and author attributes and emit the message to all clientes
			var data = {
				message: message,
				date: new Date(),
				author: socket.session.user
			};
			io.emit("lobbyMessage", data);
		});

		//disconnect event handler
		socket.on("disconnect", function () {
			console.log("@@@ user disconnected");

			connectedUsers = connectedUsers.filter(function (user) {
				return user.id !== socket.session.user.id;
			});

			io.emit("updateUsersList", connectedUsers);
		});

	});

	return io;
};
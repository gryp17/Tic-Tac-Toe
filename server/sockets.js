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

		//disconnect event handler
		socket.on("disconnect", function (socket) {
			console.log("@@@ user disconnected");
			
			connectedUsers = connectedUsers.filter(function (user){
				return user.id !== socket.session.user.id;
			});
			
			io.emit("updateUsersList", connectedUsers);
		});

		//message event handler
		socket.on("new_message", function (message) {
			console.log("@@@ message: " + message);

			//send the message to everyone (including the sender)
			io.emit("new_message", message);
		});
	});

	return io;
};
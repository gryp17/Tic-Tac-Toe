var _ = require("lodash");
var middleware = require("../../middleware");

module.exports = function (io) {
	//game namespace
	var game = io.of("/game");

	//checks if the socket.io requests are authorized
	game.use(middleware.socketIsAuthorized);

	game.on("connection", function (socket) {
		
		console.log("@@@@@ user connected");
		
		//TODO:
		//join a room that is reserved only for the players in this game

		//disconnect event handler
		socket.on("disconnect", function () {

			console.log("@@@@@ user disconnected");
			
		});

	});

	return game;
};
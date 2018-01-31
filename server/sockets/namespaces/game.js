var _ = require("lodash");
var middleware = require("../../middleware");

module.exports = function (io, app) {
	//game namespace
	var game = io.of("/game");
	
	//checks if the socket.io requests are authorized
	game.use(middleware.socketIsAuthorized);

	game.on("connection", function (socket) {
		
		//lobby namespace
		var lobby = app.get("socketNamespaces").lobby;
		
		//find the game that this user belongs to
		var activeGame = lobby.findGameByUserId(socket.session.user.id, "active");		
		var gameRoomId = activeGame.players[0].id+"-"+activeGame.players[1].id;
		
		//join a room that is reserved only for the players in this game
		socket.join(gameRoomId);
		
		//emit the start game event to both players and indicate that it's the first player's turn
		activeGame.turn = activeGame.players[0].id;
		game.to(gameRoomId).emit("startGame", activeGame.turn);

		//disconnect event handler
		socket.on("disconnect", function () {

			console.log("@@@@@ user disconnected");
			
		});

	});

	return game;
};
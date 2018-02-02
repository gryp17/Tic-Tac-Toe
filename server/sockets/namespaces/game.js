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
		var myGame = game.getMyGame(lobby, socket);	
		var gameRoomId = myGame.players[0].id+"-"+myGame.players[1].id;
		
		//join a room that is reserved only for the players in this game
		socket.join(gameRoomId);
		
		//emit the update game event only to the player that has just connected
		game.initGame(socket, myGame);
		
		//make move handler
		socket.on("makeMove", function (coordinates){
			var myGame = game.getMyGame(lobby, socket);
			
			coordinates = coordinates.split("-");
			var x = coordinates[0];
			var y = coordinates[1];
			
			//check if the selected cell is empty and if it's the current player's turn
			if(myGame.gameMap[x][y] === 0 && myGame.playerTurn === socket.session.user.id){
				//make the move
				myGame.gameMap[x][y] = socket.session.user.id;
				
				//switc the player turn
				myGame = game.switchPlayerTurn(myGame);
				
				//update the game
				game.updateGame(myGame);
			}
		});

		//disconnect event handler
		socket.on("disconnect", function () {
			//TODO: send chat message
			console.log("@@@@@ user disconnected");
		});

	});
	
	/**
	 * Returns the active game that this socket/user belongs to
	 * @param {Object} lobbyNamespace
	 * @param {Object} socket
	 * @returns {Object}
	 */
	game.getMyGame = function (lobbyNamespace, socket){
		return lobbyNamespace.findGameByUserId(socket.session.user.id, "active");
	};
	
	/**
	 * Sends the game object only to the current user
	 * @param {Object} socket
	 * @param {Object} myGame
	 */
	game.initGame = function (socket, myGame){		
		//initialize an empty game map if the map is not set yet
		if(!myGame.gameMap){
			myGame.gameMap = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];
		}
		
		//if the player turn is not set - the first player always has the first turn
		if(!myGame.playerTurn){
			myGame.playerTurn = myGame.players[0].id;
		}
				
		game.to(socket.id).emit("updateGame", myGame);
	};
		
	/**
	 * Broadcasts the game object to all players in that game
	 * @param {Object} myGame
	 */
	game.updateGame = function (myGame){
		var gameRoomId = myGame.players[0].id+"-"+myGame.players[1].id;				
		game.to(gameRoomId).emit("updateGame", myGame);
	};
	
	/**
	 * Switches the current player turn
	 * @param {Object} myGame
	 * @returns {Object}
	 */
	game.switchPlayerTurn = function (myGame){
		var currentPlayer = myGame.playerTurn;
		
		myGame.players.forEach(function (player){
			if(currentPlayer !== player.id){
				myGame.playerTurn = player.id;
			}
		});
		
		return myGame;
	};

	return game;
};
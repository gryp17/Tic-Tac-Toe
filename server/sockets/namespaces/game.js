var _ = require("lodash");
var async = require("async");

var middleware = require("../../middleware");
var GameModel = require("../../models/game");
var PlayerModel = require("../../models/player");

module.exports = function (io, app) {
	//game namespace
	var game = io.of("/game");
	
	var disconnectTimeoutPeriod = 5; //seconds
	var disconnectTimeouts = {};
	
	//checks if the socket.io requests are authorized
	game.use(middleware.socketIsAuthorized);

	game.on("connection", function (socket) {
		
		//clear any disconnect timeouts for this user
		clearTimeout(disconnectTimeouts[socket.session.user.id]);
		
		//lobby namespace
		var lobby = app.get("socketNamespaces").lobby;
		
		//find the game that this user belongs to
		var myGame = game.getMyGame(lobby, socket);	
		var gameRoomId = myGame.players[0].id+"-"+myGame.players[1].id;
		
		//join a room that is reserved only for the players in this game
		socket.join(gameRoomId);
		
		//emit the update game event only to the player that has just connected
		game.initGame(socket, myGame);
		
		//game chat message handler
		socket.on("chatMessage", function (message) {
			//add the type, date and author attributes and emit the message to both players
			var data = {
				type: "user",
				message: message,
				date: new Date(),
				author: socket.session.user
			};

			game.to(gameRoomId).emit("chatMessage", data);
		});
		
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
		
		//player turn timeout handler
		socket.on("playerTurnTimeout", function (){
			//if the player hasn't made any moves (has timed out) mark the other player as winner
			var winner = _.find(myGame.players, function (player) {
				return player.id !== socket.session.user.id;
			});
				
			game.gameOver(lobby, winner, myGame);
		});

		//disconnect event handler
		socket.on("disconnect", function () {
			var myGame = game.getMyGame(lobby, socket);
			
			//don't do anything if the game has terminated already
			if(!myGame){
				return;
			}
			
			//schedule a timeout - if the player doesn't reconnect in X seconds the game is won by the other player
			disconnectTimeouts[socket.session.user.id] = setTimeout(function (){
				var winner = _.find(myGame.players, function (player) {
					return player.id !== socket.session.user.id;
				});
				
				game.gameOver(lobby, winner, myGame);
			}, disconnectTimeoutPeriod * 1000);
			
			//create a system message and send it to notify both players that the user has left the game
			var data = {
				type: "system disconnected",
				message: socket.session.user.username + " left the game",
				date: new Date()
			};

			game.to(gameRoomId).emit("chatMessage", data);			
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
		var gameRoomId = myGame.players[0].id+"-"+myGame.players[1].id;
		
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
		
		//create a system message and send it to notify both players that the user has joined the lobby
		var data = {
			type: "system connected",
			message: socket.session.user.username + " joined the game",
			date: new Date()
		};
		
		//send the message with some delay to make sure both players have joined the game
		setTimeout(function (){
			game.to(gameRoomId).emit("chatMessage", data);
		}, 1000);
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
	
	/**
	 * Notifies both player that the game has finished
	 * @param {Object} lobby
	 * @param {Object} winner
	 * @param {Object} myGame
	 */
	game.gameOver = function (lobby, winner, myGame){
		var gameRoomId = myGame.players[0].id+"-"+myGame.players[1].id;	
				
		gameModel = new GameModel();
		playerModel = new PlayerModel();
		
		//insert the "game" database record
		gameModel.create(winner.id, myGame.gameMap, function (err, result){
			if(err){
				console.log("failed to insert the game record");
				console.log(err);
				return;
			}
			
			var gameId = result.insertId;
			
			//insert both "player" records
			async.parallel([
				function (done){
					playerModel.create(myGame.players[0].id, gameId, done);
				},
				function (done){
					playerModel.create(myGame.players[1].id, gameId, done);
				}
			], function (err){
				if(err){
					console.log("failed to insert the player records");
					console.log(err);
					return;
				}
				
				//hide the game from the lobby view
				lobby.deleteGame(myGame);

				//send the game over event to the players (it redirects them to the lobby)
				game.to(gameRoomId).emit("gameOver", winner);
				
			});
		});
		
	};

	return game;
};
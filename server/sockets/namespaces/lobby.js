var _ = require("lodash");
var middleware = require("../../middleware");

module.exports = function (io) {
	//lobby namespace
	var lobby = io.of("/lobby");

	lobby.games = [];

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
		socket.on("challengeUser", function (challengedUserId) {
			var challengedUser = lobby.getUserById(challengedUserId);

			//can't challenge your self obviously and both users must be available
			if (challengedUser.id !== socket.session.user.id && challengedUser.status === "available" && socket.session.user.status === "available") {

				//update both user's status to busy
				lobby.updateUserStatus(socket.session.user.id, "busy");
				lobby.updateUserStatus(challengedUser.id, "busy");

				//send the challenger data to the challenged user
				socket.broadcast.to(challengedUser.socketId).emit("challenge", socket.session.user);
				
				var game = {
					status: "pending",
					players: [
						socket.session.user,
						challengedUser
					]
				};

				//add new pending game go the games list
				lobby.games.push(game);

				//update the connected users list
				lobby.emit("updateUsersList", lobby.getConnectedUsers());

			}

		});
		
		//cancel challenge event handler
		socket.on("cancelChallenge", function () {
			lobby.cancelChallenge(socket.session.user.id);
		});
		
		//accept challenge event handler
		socket.on("acceptChallenge", function () {
			var game = lobby.findGameByUserId(socket.session.user.id, "pending");
			
			//if the pending game has been found
			if(game){
				//set the game as active
				game.status = "active"; 
				
				//send an event to both users and set their status to in-game
				game.players.forEach(function (player){
					lobby.updateUserStatus(player.id, "in-game");
					lobby.to(player.socketId).emit("startGame");
				});
				
				//update the games list
				lobby.emit("updateGamesList", lobby.getActiveGames());
			}
		});

		//disconnect event handler
		socket.on("disconnect", function () {

			//cancel any challenges that the user is part of
			lobby.cancelChallenge(socket.session.user.id);

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

	/**
	 * Helper function that returns an array of all connected users
	 * @returns {Array}
	 */
	lobby.getConnectedUsers = function () {
		var users = [];

		_.forOwn(lobby.connected, function (data, socketId) {

			//if the status field is not set - set is as available
			if (!data.session.user.status) {
				data.session.user.status = "available";
			}

			//set the socketId parameter
			data.session.user.socketId = socketId;

			users.push(data.session.user);
		});

		return users;
	};
	
	/**
	 * Returns all active games
	 * @returns {Array}
	 */
	lobby.getActiveGames = function () {
		return lobby.games.filter(function (game){
			return game.status === "active";
		});
	};
	
	/**
	 * Returns the user object that matches the provided userId
	 * @param {Number} userId
	 * @returns {Object}
	 */
	lobby.getUserById = function (userId) {
		var connectedUsers = lobby.getConnectedUsers();
		return _.find(connectedUsers, {id: parseInt(userId)});
	};

	/**
	 * Updates the status of the user
	 * @param {Number} userId
	 * @param {String} status
	 */
	lobby.updateUserStatus = function (userId, status) {
		_.forOwn(lobby.connected, function (data, socketId) {
			if(data.session.user.id === userId){
				data.session.user.status = status;
			}
		});
	};

	/**
	 * Cancels the pending challenges that the provided userId participates in
	 * @param {Number} userId
	 */
	lobby.cancelChallenge = function (userId) {
		//var self = this;
		var canceledChallenge;

		//filter out the cancelled game
		lobby.games = _.filter(lobby.games, function (game) {
			var valid = true;

			if (game.status === "pending") {
				game.players.forEach(function (player) {
					if (player.id === userId) {
						canceledChallenge = game;
						valid = false;
					}
				});
			}

			return valid;
		});

		if (canceledChallenge) {
			//update the players status to available and notify all related players that the challenge has been canceled
			canceledChallenge.players.forEach(function (player) {
				lobby.updateUserStatus(player.id, "available");
				lobby.to(player.socketId).emit("cancelChallenge");
			});

			//update the users list
			lobby.emit("updateUsersList", lobby.getConnectedUsers());
		}

	};

	/**
	 * Returns the game/challenge that the user is part of
	 * @param {Number} userId
	 * @param {String} status (optional)
	 * @returns {Object}
	 */
	lobby.findGameByUserId = function (userId, status) {
		var game = _.find(lobby.games, function (game) {
			var valid = false;
			
			//check if one of the players matches the userId
			game.players.forEach(function (player) {
				if (player.id === userId && (!status || game.status === status)) {
					valid = true;
				}
			});
			
			return valid;
		});

		return game;
	};

	return lobby;
};
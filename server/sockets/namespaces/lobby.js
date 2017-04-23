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
			challengedUserId = parseInt(challengedUserId);

			//can't challenge your self obviously
			if (challengedUserId !== socket.session.user.id) {
				//find the correct socketId and send the challenge only to that user
				_.forOwn(lobby.connected, function (data, socketId) {
					if (data.session.user.id === challengedUserId) {
						//send the challenger data to the challenged user
						socket.broadcast.to(socketId).emit("challenge", socket.session.user);

						//add new pending game go the games list
						socket.session.user.socketId = lobby.getUserSocketId(socket.session.user.id);
						data.session.user.socketId = lobby.getUserSocketId(data.session.user.id);

						lobby.games.push({
							type: "pending",
							players: [
								socket.session.user,
								data.session.user
							]
						});

						//update the games list
						lobby.emit("updateGamesList", lobby.games);

						//wait 10 seconds and cancel the challenge
						setTimeout(function () {
							lobby.cancelChallenge(socket.session.user.id);
						}, 10000);

					}
				});
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

		_.forOwn(this.connected, function (data, socketId) {
			users.push(data.session.user);
		});

		return users;
	};

	/**
	 * Returns the socketId that matches the provided user id
	 * @param {Number} userId
	 * @returns {String}
	 */
	lobby.getUserSocketId = function (userId) {
		var result;

		_.forOwn(this.connected, function (data, socketId) {
			if (data.session.user.id === userId) {
				result = socketId;
			}
		});

		return result;
	};

	/**
	 * Cancels the pending challenges that the provided userId participates in
	 * @param {Number} userId
	 */
	lobby.cancelChallenge = function (userId) {
		var self = this;
		var canceledChallenge;
		
		//filter out the cancelled game
		this.games = _.filter(this.games, function (game) {
			var valid = true;

			if (game.type === "pending") {
				game.players.forEach(function (player) {
					if (player.id === userId) {
						canceledChallenge = game;
						valid = false;
					}
				});
			}

			return valid;
		});
		
		if(canceledChallenge){
			//notify all related players that the challenge has been canceled
			canceledChallenge.players.forEach(function (player){
				self.to(player.socketId).emit("cancelChallenge");
			});
			
			lobby.emit("updateGamesList", lobby.games);
		}
		
	};
	
	
	/**
	 * Returns the game/challenge that the user is part of
	 * @param {Number} userId
	 * @returns {Object}
	 */
	lobby.findGameByuser = function (userId) {
		//TODO: implement
		return {};
	};

	return lobby;
};
var _ = require('lodash');
var middleware = require('../../middleware');
var cache = require('memory-cache');

module.exports = function (io, app) {
	//lobby namespace
	var lobby = io.of('/lobby');

	//initialize the cache if necessary
	if(cache.get('games') === null) {
		cache.put('games', []);
	}
		
	//checks if the socket.io requests are authorized
	lobby.use(middleware.socketIsAuthorized);

	lobby.on('connection', function (socket) {

		//update the connected users list
		lobby.emit('updateUsersList', lobby.getConnectedUsers());
		
		//send the games list only to the recently connected user
		lobby.to(socket.id).emit('updateGamesList', lobby.getActiveGames());

		//create a system message and send it to notify all clients that the user has joined the lobby
		var data = {
			type: 'system connected',
			message: socket.session.user.username + ' joined the lobby',
			date: new Date()
		};

		lobby.emit('chatMessage', data);

		//lobby chat message handler
		socket.on('chatMessage', function (message) {
			//add the type, date and author attributes and emit the message to all clientes
			var data = {
				type: 'user',
				message: message,
				date: new Date(),
				author: socket.session.user
			};

			lobby.emit('chatMessage', data);
		});

		//lobby challenge user handler
		socket.on('challengeUser', function (challengedUserId) {
			var challengedUser = lobby.getUserById(challengedUserId);

			//can't challenge your self obviously and both users must be available
			if (challengedUser.id !== socket.session.user.id && challengedUser.status === 'available' && socket.session.user.status === 'available') {

				//update both user's status to busy
				lobby.updateUserStatus(socket.session.user.id, 'busy');
				lobby.updateUserStatus(challengedUser.id, 'busy');

				//send the challenger data to the challenged user
				socket.broadcast.to(challengedUser.socketId).emit('challenge', socket.session.user);
				
				var game = {
					status: 'pending',
					players: [
						socket.session.user,
						challengedUser
					]
				};

				//add new pending game go the games list
				var games = cache.get('games');
				games.push(game);
				cache.put('games', games);
				
				//update the connected users list
				lobby.emit('updateUsersList', lobby.getConnectedUsers());

			}

		});
		
		//cancel challenge event handler
		socket.on('cancelChallenge', function () {
			lobby.cancelChallenge(socket.session.user.id);
		});
		
		//accept challenge event handler
		socket.on('acceptChallenge', function () {
			var game = lobby.findGameByUserId(socket.session.user.id, 'pending');
			
			//if the pending game has been found
			if(game) {
				//set the game as active
				game.status = 'active'; 
				
				//send an event to both users and set their status to in-game
				game.players.forEach(function (player) {
					lobby.updateUserStatus(player.id, 'in-game');
					lobby.to(player.socketId).emit('startGame');
				});
				
				//update the games list
				lobby.emit('updateGamesList', lobby.getActiveGames());
			}
		});

		//disconnect event handler
		socket.on('disconnect', function () {

			//cancel any challenges that the user is part of
			lobby.cancelChallenge(socket.session.user.id);

			//update the connected users list
			lobby.emit('updateUsersList', lobby.getConnectedUsers());

			//create a system message and send it to notify all clients that the user has left the lobby
			var data = {
				type: 'system disconnected',
				message: socket.session.user.username + ' left the lobby',
				date: new Date()
			};

			lobby.emit('chatMessage', data);
		});

	});

	/**
	 * Kicks the user from the lobby
	 * Usually used when the user has logged out from another browser tab
	 * @param {Number} userId
	 */
	lobby.kickUser = function (userId) {
		lobby.emit('kickUser', userId);
	};

	/**
	 * Helper function that returns an array of all connected users
	 * @returns {Array}
	 */
	lobby.getConnectedUsers = function () {
		var users = [];

		_.forOwn(lobby.connected, function (data, socketId) {

			//if the status field is not set - set is as available
			if (!data.session.user.status) {
				data.session.user.status = 'available';
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
		var games = cache.get('games');
		return games.filter(function (game) {
			return game.status === 'active';
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
			if(data.session.user.id === userId) {
				data.session.user.status = status;
			}
		});
	};

	/**
	 * Cancels the pending challenges that the provided userId participates in
	 * @param {Number} userId
	 */
	lobby.cancelChallenge = function (userId) {
		var canceledChallenge;

		//filter out the cancelled game
		var games = cache.get('games');		
		games = _.filter(games, function (game) {
			var valid = true;

			if (game.status === 'pending') {
				game.players.forEach(function (player) {
					if (player.id === userId) {
						canceledChallenge = game;
						valid = false;
					}
				});
			}

			return valid;
		});
				
		//update the games cache
		cache.put('games', games);

		if (canceledChallenge) {
			//update the players status to available and notify all related players that the challenge has been canceled
			canceledChallenge.players.forEach(function (player) {
				lobby.updateUserStatus(player.id, 'available');
				lobby.to(player.socketId).emit('cancelChallenge');
			});

			//update the users list
			lobby.emit('updateUsersList', lobby.getConnectedUsers());
		}

	};
	
	/**
	 * Returns the game/challenge that the user is part of
	 * @param {Number} userId
	 * @param {String} status (optional)
	 * @returns {Object}
	 */
	lobby.findGameByUserId = function (userId, status) {
		var game = _.find(cache.get('games'), function (game) {
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
	
	/**
	 * Deletes the game from the games list
	 * @param {Object} game
	 */
	lobby.deleteGame = function (game) {
		//filter out the game
		var games = cache.get('games');		
		games = _.filter(games, function (item) {
			var valid = true;

			if (item.status === 'active') {
				item.players.forEach(function (player) {
					if (player.id === game.players[0].id) {
						valid = false;
					}
				});
			}

			return valid;
		});
				
		//update the games cache
		cache.put('games', games);
		
		//update the games list
		lobby.emit('updateGamesList', lobby.getActiveGames());
	};

	return lobby;
};
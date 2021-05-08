var mysql = require('mysql');
var app = require('../app');
var _ = require('lodash');

module.exports = function () {	
	var connection = mysql.createConnection(app.get('config').db);
	
	/**
	 * Inserts new game record
	 * @param {Number} winner (userId)
	 * @param {Array} map
	 * @param {Function} done
	 */
	this.create = function (winner, map, done) {
		connection.query('INSERT INTO game (winner, map, finished) VALUES (?, ?, now())', [winner, JSON.stringify(map)], done);
	};
	
	/**
	 * Returns the user game history
	 * @param {Number} userId
	 * @param {Function} done
	 */
	this.getGameHistory = function (userId, done) {
		
		//get the games that the user has participated in, but also return all the user data for both players
		var query = 'SELECT gameId, winner, map, finished, userId, user.username AS username, user.avatar AS avatar '
					+'FROM player, game, user ' 
					+'WHERE game.id = player.gameId '
					+'AND player.userId = user.id '
					+'AND gameId IN (select gameId from player where player.userId = ?) '
					+'ORDER BY finished DESC';
		
		connection.query(query, [userId], function (err, records) {
			if(err) {
				return done(err);
			}
			
			var historyMap = {};
			
			//loop thru all the results and merge them (there are 2 results per game - one for each player)
			records.forEach(function (record) {
				if(!historyMap[record.gameId]) {
					//parse the game map
					record.map = JSON.parse(record.map);
					
					historyMap[record.gameId] = record;
					historyMap[record.gameId].players = [];
				}
				
				//if there is no avatar set - use the default one
				if(!record.avatar) {
					record.avatar = app.get('config').uploads.defaultAvatar;
				}
				
				//fill the "players" array
				historyMap[record.gameId].players.push({
					id: record.userId,
					username: record.username,
					avatar: record.avatar
				});
				
				//delete the unnecessary parameters (they have been moved to the "players" array)
				delete historyMap[record.gameId].userId;
				delete historyMap[record.gameId].username;
				delete historyMap[record.gameId].avatar;
				
			});
						
			//convert the object into array and return it (also order by date because we have lost the order in the historyMap object...)
			done(null, _.orderBy(_.values(historyMap), ['finished'], ['desc']));
		});
	};	
};
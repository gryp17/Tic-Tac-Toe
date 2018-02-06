var mysql = require("mysql");
var app = require("../app");

module.exports = function () {	
	var connection = mysql.createConnection(app.get("config").db);
	
	/**
	 * Inserts new game record
	 * @param {Number} winner (userId)
	 * @param {Array} map
	 * @param {Function} done
	 */
	this.create = function (winner, map, done){
		connection.query("INSERT INTO game (winner, map, finished) VALUES (?, ?, now())", [winner, JSON.stringify(map)], done);
	};
	
	/**
	 * Returns the user game history
	 * @param {Number} userId
	 * @param {Function} done
	 */
	this.getGameHistory = function (userId, done){
		connection.query("SELECT gameId, winner, map, finished FROM player, game WHERE game.id = player.gameId AND userId = ? ORDER BY finished DESC", [userId], done);
	};
};
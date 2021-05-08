var mysql = require('mysql');
var app = require('../app');

module.exports = function () {	
	var connection = mysql.createConnection(app.get('config').db);
	
	/**
	 * Inserts new player record
	 * @param {Number} userId
	 * @param {Number} gameId
	 * @param {Function} done
	 */
	this.create = function (userId, gameId, done) {
		connection.query('INSERT INTO player (userId, gameId) VALUES (?, ?)', [userId, gameId], done);
	};
};
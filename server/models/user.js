var mysql = require("mysql");
var md5 = require("md5");

module.exports = function (config) {	
	var connection = mysql.createConnection(config.db);

	/**
	 * Returns the user that matches the provided username and password
	 * @param {String} username
	 * @param {String} password
	 * @param {Function} done
	 */
	this.find = function (username, password, done) {
		connection.query("SELECT * FROM user WHERE username = ? AND password = ?", [username, md5(password)], function (err, rows) {
			if (err) {
				return done(err);
			}

			if (!rows.length) {
				done(null);
			} else {
				done(null, rows[0]);
			}
		});
	};
	
	
}; 
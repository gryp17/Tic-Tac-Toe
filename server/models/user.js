var mysql = require("mysql");
var md5 = require("md5");
var app = require("../app");

module.exports = function () {	
	var connection = mysql.createConnection(app.get("config").db);
	
	/**
	 * Returns the user that matches the provided username
	 * @param {String} username
	 * @param {String} password
	 * @param {Function} done
	 */
	this.findByUsername = function (username, done) {
		connection.query("SELECT * FROM user WHERE username = ?", [username], function (err, rows) {
			if (err) {
				return done(err);
			}

			if (!rows.length) {
				done(null);
			} else {
				var user = rows[0];
				done(null, user);
			}
		});
	};
	
	/**
	 * Adds a new user record and returns the inserted record
	 * @param {String} username
	 * @param {String} password
	 * @param {Function} done
	 */
	this.create = function (username, password, done) {
		var self = this;
		
		connection.query("INSERT INTO user (username, password, created) VALUES (?, ?, now())", [username, md5(password)], function (err, result) {
			if (err) {
				return done(err);
			}

			//return the inserted record
			self.findByUsername(username, function (err, userInstance){
				if (err) {
					return done(err);
				}
				
				done(null, userInstance);
			});
			
		});
	};
	
	
}; 
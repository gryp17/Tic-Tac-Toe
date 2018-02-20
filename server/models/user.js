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
				
				//if there is no avatar use the default one
				if(!user.avatar){
					user.avatar = app.get("config").uploads.defaultAvatar;
				}
				
				done(null, user);
			}
		});
	};
	
	/**
	 * Returns the user that matches the provided user id
	 * @param {Number} id
	 * @param {String} password
	 * @param {Function} done
	 */
	this.findById = function (id, done) {
		connection.query("SELECT * FROM user WHERE id = ?", [id], function (err, rows) {
			if (err) {
				return done(err);
			}

			if (!rows.length) {
				done(null);
			} else {
				var user = rows[0];
				
				//if there is no avatar use the default one
				if(!user.avatar){
					user.avatar = app.get("config").uploads.defaultAvatar;
				}
				
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
	this.create = function (username, password, avatar, done) {
		var self = this;
		
		connection.query("INSERT INTO user (username, password, avatar, created) VALUES (?, ?, ?, now())", [username, md5(password), avatar], function (err, result) {
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
	
	/**
	 * Updates any of the user attributes
	 * @param {Number} id
	 * @param {Object} data
	 * @param {Function} done
	 */
	this.update = function (id, data, done){
		
		//delete the fields that shouldn't be changed
		delete data.id;
		delete data.username;
		delete data.created;
		
		connection.query("UPDATE user SET ? WHERE ?", [data, {id: id}], function (err, result){
			done(err, result);
		});
	};
	
}; 
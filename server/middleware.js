var app = require("./app");
var cookie = require("cookie");
var cookieParser = require("cookie-parser");

module.exports = {
	/**
	 * Checks if the user is logged in
	 * @param {Object} req
	 * @param {Object} res
	 * @param {Function} next
	 */
	isLoggedIn: function (req, res, next) {
		if (req.session.user) {
			next();
		} else {
			res.redirect("/");
		}
	},
	/**
	 * Checks if the socket session token is valid.
	 * It also sets the session data in the socket instance.
	 * @param {Object} socket
	 * @param {Function} next
	 */
	socketIsAuthorized: function (socket, next) {
		var config = app.get("config");

		//parse all cookies
		var cookies = cookie.parse(socket.handshake.headers.cookie);

		var sessionToken = cookies[config.sessionId];

		//check if the session token is valid
		if (sessionToken) {
			var unsignedToken = cookieParser.signedCookie(sessionToken, config.secret);

			//if the signed and unsigned tokens match then the token is not valid
			if (sessionToken === unsignedToken) {
				next("Invalid session token");
			} else {
				
				//find the session data that matches this token and attach it to the socket
				var sessionStore = app.get("sessionStore");
				sessionStore.get(unsignedToken, function (err, session) {
					socket.session = session;
					next();
				});
				
			}

		} else {
			next("Invalid session token");
		}

	}
};
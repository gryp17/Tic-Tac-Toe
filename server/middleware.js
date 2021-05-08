var app = require('./app');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var async = require('async');

var UserModel = require('./models/user');

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
			res.redirect('/');
		}
	},
	/**
	 * Checks if the socket session token is valid.
	 * It also sets the session data in the socket instance.
	 * @param {Object} socket
	 * @param {Function} next
	 */
	socketIsAuthorized: function (socket, next) {
		var config = app.get('config');

		//parse all cookies
		var cookies = cookie.parse(socket.handshake.headers.cookie);

		var sessionToken = cookies[config.session.sessionId];

		//check if the session token is valid
		if (sessionToken) {
			var unsignedToken = cookieParser.signedCookie(sessionToken, config.session.secret);

			//if the signed and unsigned tokens match then the token is not valid
			if (sessionToken === unsignedToken) {
				next('Invalid session token');
			} else {

				//find the session data that matches this token and attach it to the socket
				var sessionStore = app.get('sessionStore');
				sessionStore.get(unsignedToken, function (err, session) {
					if (err) {
						return next(err);
					}
					
					socket.session = session;
					next();
				});

			}

		} else {
			next('Invalid session token');
		}

	},
	/**
	 * Checks the submited signup data
	 * @param {Object} req
	 * @param {Object} res
	 * @param {Function} next
	 */
	checkSignupData: function (req, res, next) {
		var userModel = new UserModel();
		var data = req.body;

		if (!data.username || data.username.trim() === '') {
			return res.send('Username is required');
		}

		if (data.username.length > 20) {
			return res.send('The username is too long');
		}

		if (!data.password || data.password.trim() === '') {
			return res.send('Password is required');
		}

		if (data.password !== data.repeatPassword) {
			return res.send("The passwords don't match");
		}

		//check if the username is in use
		userModel.findByUsername(data.username.trim(), function (err, result) {
			if (err) {
				return next(err);
			}

			if (result) {
				res.send('The username is taken');
			} else {
				next();
			}
		});

	},
	/**
	 * Checks if the new password is valid and if the old password is correct for that user
	 * @param {Object} req
	 * @param {Object} res
	 * @param {Function} next
	 */
	checkPasswords: function (req, res, next) {
		var userModel = new UserModel();
		var data = req.body;
		
		if(!data.currentPassword) {
			return res.send('Current Password is required');
		}
		
		//get the user data and check if the provided password is correct
		userModel.findById(req.session.user.id, function (err, user) {
			if(err) {
				return next(err);
			}
			
			if(md5(data.currentPassword) !== user.password) {
				return res.send('Wrong password');
			}
			
			if (!data.newPassword || data.newPassword.trim() === '') {
				return res.send('New Password is required');
			}

			if (data.newPassword !== data.repeatNewPassword) {
				return res.send("The passwords don't match");
			}
			
			next();
		});
		
	},
	/**
	 * Checks if the submited file is valid and uploads it to the avatars directory
	 * It modifies the req object adding the new avatar filename in req.files.avatar.uploadedTo
	 * @param {Object} req
	 * @param {Object} res
	 * @param {Function} next
	 */
	uploadAvatar: function (req, res, next) {
		var asyncTasks = [];
		var config = req.app.get('config');
		var validExtensions = config.uploads.validAvatarExtensions;

		var file = req.files.avatar;
		var extension = path.extname(file.originalFilename).replace('.', '').toLowerCase();

		//if no file has been submited
		if (file.originalFilename.length === 0) {
			return next(null, null);
		}

		//max file size
		if (file.size > config.uploads.maxAvatarSize) {
			return res.send('The avatar is too big');
		}

		//valid extensions
		if (validExtensions.indexOf(extension) === -1) {
			return res.send('Invalid avatar extension');
		}

		//if the user is logged in (trying to update his avatar) and doesn't use the default avatar
		//add the "unlink" task before the "rename" one
		if (req.session && req.session.user && req.session.user.avatar !== config.uploads.defaultAvatar) {

			asyncTasks.push(function (done) {
				var oldAvatar = config.uploads.avatarsDirectory + req.session.user.avatar;

				//remove all GET parameters from the path (if any)
				oldAvatar = oldAvatar.replace(/\?.+/, '');
				
				//delete the old avatar
				fs.unlink(oldAvatar, function (err) {
					if (err) {
						return done('Failed to delete the old avatar');
					}
					
					done();
				});
			});
		}
		
		//add the "rename/move" task
		asyncTasks.push(function (done) {
			var avatar = md5(req.body.username) + '.' + extension;
			var destination = config.uploads.avatarsDirectory + avatar;
			
			//move the temporal file to the real avatars directory
			fs.rename(file.path, destination, function (err) {
				if (err) {
					return done('Failed to upload the avatar');
				}

				//append the uploaded avatar to the files object
				req.files.avatar.uploadedTo = avatar + '?updated=' + new Date().getTime();

				done(null);
			});
		});

		//run all tasks
		async.series(asyncTasks, function (err) {
			if(err) {
				return res.send(err);
			}
			
			next();
		});

	}
};
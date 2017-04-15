module.exports = {
	port: 3000,
	session: {
		secret: "whatamieven",
		sessionId: "tictactoe.sid",
		tableName: "session"
	},
	db: {
		host: "127.0.0.1",
		database: "tic-tac-toe",
		user: "root",
		password: "1234"
	},
	uploads: {
		avatarsDirectory: "./public/upload/avatars/",
		maxAvatarSize: 1000000,
		validAvatarExtensions: ["png", "jpg", "jpeg"]
	}
};

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
	}
};

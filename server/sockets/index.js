module.exports = function (io) {
	return {
		lobby: require("./namespaces/lobby")(io),
		game: require("./namespaces/game")(io)
	};
};
module.exports = function (io, app) {
	return {
		lobby: require("./namespaces/lobby")(io, app),
		game: require("./namespaces/game")(io, app)
	};
};
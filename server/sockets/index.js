module.exports = function (io) {
	return {
		//lobby namespace
		lobby: require("./namespaces/lobby")(io)

		//TODO: 
		//game namespace
	};
};
var _ = require("lodash");
var middleware = require("../middleware");

module.exports = function (server) {
	var io = require("socket.io")(server);

	//lobby namespace
	require("./namespaces/lobby")(io);
	
	//TODO: 
	//game namespace

	return io;
};
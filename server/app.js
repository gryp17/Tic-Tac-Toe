var http = require("http");
var express = require("express");
var session = require("express-session");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var app = module.exports = express();
var middleware = require("./middleware");

//get the environment 
var environment = process.env.NODE_ENV || "development";

//get config from the environment 
var config = require("./config/" + environment);

//store the config
app.set("config", config);

var server = app.listen(config.port, function () {
	console.log("listening on port " + config.port);
});

var io = require("socket.io")(server);

app.use(session({
	secret: config.secret,
	key: config.sessionId,
	resave: true,
	saveUninitialized: true
}));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static("./public"));

//routes
var index = require("./routes/index");
var lobby = require("./routes/lobby");

app.use("/", index);
app.use("/lobby", lobby);

//checks if the socket.io requests are authorized
io.use(middleware.socketIsAuthorized);

io.on("connection", function (socket) {
	console.log("@@@ a user connected");

	//disconnect event handler
	socket.on("disconnect", function () {
		console.log("@@@ user disconnected");
	});

	//message event handler
	socket.on("new_message", function (message) {
		console.log("@@@ message: " + message);

		//send the message to everyone (including the sender)
		io.emit("new_message", message);
	});
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});
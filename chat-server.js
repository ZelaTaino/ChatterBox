// Require the packages we will use:
var users = [];
var socketids = {};
var rooms = {};
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.

	fs.readFile("client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.

		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.

	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.

		console.log("message: "+data["message"]); // log it to the Node.JS output
		io.sockets.emit("message_to_client",{message:data["message"], messagewriter:data["messagewriter"] }) // broadcast the message to other users
	});
	socket.on('user_entering', function(data) {
		console.log("new user: "+data["newuser"]);
		socketids[socket.id] = data["newuser"];
		users.push(data["newuser"]);
		io.sockets.emit("user_entering",{newuser:socketids})
	});
	socket.on("create_chat", function(data) {
		console.log("creator: "+data["creator"]);
		console.log("room name: "+data["roomname"]);
		io.sockets.emit("room_created", {roomname: data["roomname"]});

	});
	socket.on("disconnect", function() {
		console.log("disconnecting from server");
		console.log(socket.id);
		var name = socketids[socket.id];
		delete socketids[socket.id];
		io.sockets.emit("change_message", {message:name + " has left the room", roomlist:socketids});
		//io.sockets.emit("userchange", {roomlist:socketids});



	});
});

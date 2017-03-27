// Require the packages we will use:
var users = [];
var socketids = {};
var rooms = {};
var http = require("http"),
	socketio = require("socket.io")
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	fs = require('fs');

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	var filename = path.join(__dirname, "chatroom", url.parse(req.url).pathname);
	(fs.exists || path.exists)(filename, function(exists){
		if (exists) {
			fs.readFile(filename, function(err, data){
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}

				// File exists and is readable
				var mimetype = mime.lookup(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
				return;
			});
		}else{
			// File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("Requested file not found: "+filename);
			resp.end();
			return;
		}
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
		var name = data["roomname"];
		console.log("room name: "+data["roomname"]);
		createRoom(data["roomname"], data["creator"]);
		//console.log(rooms);
		io.sockets.emit("room_created", {roomname: rooms[name]});

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

function createRoom(roomname, maker) {
	var room = {
		roomname: roomname,
		creator: maker,
		users: [maker]
	}
	rooms[roomname] = room
}

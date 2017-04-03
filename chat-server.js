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
createRoom("lobby", "xoxox");
socket.on('message_to_server', function(data) {
	// This callback runs when the server receives a new message from the client.

	console.log("message: "+data["room"]); // log it to the Node.JS output
	io.sockets.emit("message_to_client",{message:data["message"], messagewriter:data["messagewriter"], room: data["room"] }) // broadcast the message to other users
});







socket.on("user_logging_in", function(data){
	var new_user = data["user"];
	var lobby = data["room"];

	socketids[socket.id] = new_user;
	
	//add user to lobby list
	var lobby_users = rooms[lobby].users;
	lobby_users.push(new_user);

	console.log("List of users: " + lobby_users);

	//send user list to newuser to display
	io.sockets.emit("display_list_to_user", {userList: lobby_users, user: new_user});

	//send new user list to all users in lobby
	io.sockets.emit("send_new_user_list", {room: lobby, userList: lobby_users});
});








socket.on("switching_rooms", function(data){
	console.log("SWITCHING ROOMS");
	var user = data["user"];
	var old_room = data["old_room"];
	var new_room = data["new_room"];

	//remove user from old room list
	var old_room_user_list = rooms[old_room].users;
	var index = old_room_user_list.indexOf(user);
	old_room_user_list.splice(index, 1);

	//update old room user list
	io.sockets.emit("send_new_user_list",{room:old_room, userList: old_room_user_list});
	console.log("List to show on staying user: " + old_room_user_list);

	//add user to new room list
	var new_room_user_list = rooms[new_room].users;
	new_room_user_list.push(user);
	
	console.log("List to show on to switching user: " + new_room_user_list);
	//get new room user list to display
	io.sockets.emit("display_list_to_user", {userList: new_room_user_list, user: user});

	//send new user list to others in same room
	io.sockets.emit("send_new_user_list", {room: new_room, userList: new_room_user_list, user: user});

});











//USER ENTERING
socket.on('user_entering', function(data) {
	console.log("USER ENTERING");
	console.log("new user: "+ data["newuser"]);
	socketids[socket.id] = data["newuser"];
	var new_user = data["newuser"];
	var lobby = data["room"];
	var users = rooms[lobby].users;
	//add user to lobby user list
	users.push(new_user);
	// var index = users.indexOf('xoxox');
	// users.splice(index, 1);
	console.log("Users in lobby: " + rooms[lobby].users);
	// io.sockets.emit("user_entering",{newuser:socketids, room: "lobby"});
	io.sockets.emit("user_entered", {newUser: new_user, newUser_list: rooms[lobby].users, room: lobby});
});

socket.on("get_chatrooms_users", function(data) {
	console.log("GET CHATROOM USERS");
	var room = data["room"];
	var curruser = data["user"];
	console.log(curruser + " went into " + room);
	console.log("List of users to be displayed in " + room + " : " + rooms[room].users);
	io.sockets.emit("showing_users", {user: curruser, users: rooms[room].users, room: room});
});

socket.on("create_chat", function(data) {
	console.log("NEW ROOM CREATED");
	var room_name = data["roomname"];
	var creator = data["creator"];
	createRoom(room_name, creator);

	io.sockets.emit("room_created", {user: data['creator'], room_name: room_name});

	console.log("creator: "+ data["creator"]);
	console.log("room name: "+ data["roomname"]);
});

socket.on("get_current_rooms", function(data) {
	var user = data["user"];
	io.sockets.emit("room_return", {allrooms: rooms, req: user })
});

socket.on("join_room", function(data) {
	var roomjoin = data["room"];
	var user = data["user"];
	console.log(user + " entered new room " + roomjoin);
	if (rooms[roomjoin].creator != user) {
		rooms[roomjoin].users.push(user);
		console.log("List to be displayed " + rooms[roomjoin].users);
    }
});

socket.on("leaving_room", function(data) {
	console.log("LEAVING ROOM");
	var user_to_leave = data["user"];
	var old_room = data["room"];
	var old_room_users = rooms[old_room].users;
	console.log("Old users in " + old_room + " : " + old_room_users);
	
	for(i=0; i<old_room_users.length; i++){
		var a_user = old_room_users[i];
		if(user_to_leave == a_user){
			old_room_users.splice(i, 1);
		}
	}
	console.log(user_to_leave);
	console.log(old_room);
	io.sockets.emit("user_left_room", {user: user_to_leave, room: old_room});
	console.log("new users in " + old_room + " : " + rooms[old_room].users);

});

socket.on("disconnect", function() {
        console.log("disconnecting from server");
        console.log(socket.id);
        var name = socketids[socket.id];
        delete socketids[socket.id];
        if (typeof name != "undefined") {
          io.sockets.emit("user_left_message", {message:name, roomlist:socketids});
          io.sockets.emit("left-chatroom", {name: name});
          for (var room in rooms) {
              var index = rooms[room].users.indexOf(name);
              if (index > -1) {
                  rooms[room].users.splice(index, 1);
              }
              var lobby_users = rooms[room].users;
              io.sockets.emit("send_new_user_list", {room: room, userList: lobby_users, user: name});
          }
        }
});

function createRoom(roomname, maker) {
	var room = {
		roomname: roomname,
		creator: maker,
		users: []

	}

	if (!(roomname in rooms)) {
		rooms[roomname] = room;
	}
}


});
var users = [];
var currentuser;
var socketio = io.connect();
var currentroom;


//sends messages

socketio.on("message_to_client", function(data) {
  console.log(data);
  var messagecont = document.createElement("div");
  messagecont.setAttribute("id", "message-container");
  var messagediv = document.createElement("div");
  messagediv.setAttribute("class", "a-message");
  var name = document.createElement("h4");
  var msg = document.createElement("p");
  name.innerHTML = data["messagewriter"];
  msg.innerHTML = data["message"];
  if (currentroom == data["room"]) {
    messagediv.appendChild(name);
    messagediv.appendChild(msg);
    document.getElementById("message-container").appendChild(messagediv);
  }
  else  {
    console.log("Wrogn roomo ya dummy");
  }
});

//someone quits window
socketio.on("change_message", function(data) {
  var messagecont = document.createElement("div");
  messagecont.setAttribute("id", "message-container");
  var messagediv = document.createElement("div");
  messagediv.setAttribute("class", "a-message");
  var name = document.createElement("h4");
  var msg = document.createElement("p");
  name.innerHTML = data["message"];
  msg.innerHTML = data["message"] + " has left the room";
  messagediv.appendChild(name);
  messagediv.appendChild(msg);
  document.getElementById("message-container").appendChild(messagediv);

});

//creates a chatroom
socketio.on("room_created", function(data) {
  var name = data["roomname"];
  console.log(name.roomname);
  createRoomElement(name.roomname);
  console.log(data["roomname"]);
});

socketio.on("room_return", function(data) {
  var rooms = data["allrooms"];
  var numrooms = rooms.length;
  var req = data["req"];
  if (req == currentuser) {
    for(var key in rooms) {
      // console.log(rooms[key]);
      createRoomElement(rooms[key].roomname);
    }
  }

});


//Send message
function sendMessage(){
   var msg = document.getElementById("message_input").value;
   var usr = currentuser;
   //console.log(usr);
   socketio.emit("message_to_server", {message:msg, messagewriter:usr, room: currentroom});
}

function addUser(username)  {
  var li = document.createElement("li");
  var circle = document.createElement("div");
  circle.setAttribute("id", "circle");
  li.appendChild(circle);
  li.innerHTML = username;
  console.log(username);

}

function createRoomElement (roomname) {
  var li = document.createElement("li");
  var span = document.createElement("span");
  span.setAttribute("id", roomname);
  span.setAttribute("class", "rooms");
  span.innerHTML = "# " + roomname;
  li.appendChild(span);
  document.getElementById("chatrooms").appendChild(li);

}


$(document).on("click", ".rooms", function() {
  console.log("room func");
  currentroom = event.target.id;
  console.log(currentroom);
  socketio.emit("join_room", {user: currentuser, room: currentroom});
  document.getElementById("chat-channel").innerHTML = "# " + currentroom;
  $("#login-view.fullscreen-view").hide();
  $(".wrapper").show();
});



$(document).on("click", "#add-chatroom-btn", function(){
  $("#add-chatroom-view").fadeIn();
});

$("#chatroom-title").keyup(function(e) {
  var newroomname = document.getElementById("chatroom-title").value;
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    // console.log(newroomname);
    if (newroomname.length > 2) {
    //  console.log(currentuser);
     socketio.emit("create_chat", {creator: currentuser, roomname:newroomname});
     $("chatroom-title").val("");
     $("#add-chatroom-view.fullscreen-view").fadeOut();
     $(".wrapper").show();
     $("#sidePanel").show();
     $("#chatroom-title").val("");
    }
  }
});


$(document).on("click", "#cancel-add-chatroom", function() {
  $("#add-chatroom-view").fadeOut();
  $("#sidePanel").show();
  // console.log("cancelled");
});


// Sending message
$("#message-textarea").keyup(function(e){
  var usr = currentuser;
  var msg = document.getElementById("message-textarea").value;
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    
     socketio.emit("message_to_server", {message:msg, messagewriter:usr, room: currentroom});
     $("#message-textarea").val("");
  }
});

$().on();


// Login screen
$("#login_name").keyup(function(e){
//  console.log("");
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    socketio.emit("get_current_rooms", {user: currentuser});
    // console.log("Enter");
    var user = document.getElementById("login_name").value;
    currentuser = user;
    $("#add-chatroom-view.fullscreen-view").hide();
    $("#login-view.fullscreen-view").fadeOut();
    $(".wrapper").show();
    currentroom = "lobby";
    // console.log(currentroom);
    // console.log(currentuser);
    socketio.emit("user_entering", {newuser: user, room: currentroom});
    document.getElementById('username').innerHTML = user;

  }
});


$(document).on("click", ".add-btn", function () {
  $("#sidePanel").hide();
  $("#addChat").show();
});

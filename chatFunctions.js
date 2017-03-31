//var users = [];
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
  messagediv.appendChild(name);
  messagediv.appendChild(msg);
  document.getElementById("message-container").appendChild(messagediv);
});

//user enter chatroom
// socketio.on("user_entering", function(data) {
//   var x = document.createElement("p");
//   var users = data['newuser'];
//   console.log(users);
//   for (var key in users) {
//     if (users.hasOwnProperty(key)) {
//       console.log(key + " -> " + users[key]);
//       if (users[key] != currentuser) {
//         addUser(users[key]);
//
//       }
//     }
//   }
//
//   // document.getElementById("currentusers").innerHTML = createString(users);
//   //document.getElementById("currentusers").appendChild(document.createTextNode(userstring));
// });

//someone quits window
socketio.on("change_message", function(data) {
  var li = document.createElement("li");
  var circle = document.createElement("div");
  circle.setAttribute("id", "circle");

  console.log(data["roomlist"]);
  console.log(data["message"]);
  document.getElementById("currentusers").innerHTML = createString(data["roomlist"]);
  document.getElementById("chatlog").appendChild(document.createElement("hr"));
  document.getElementById("chatlog").appendChild(document.createTextNode(data["message"]));
});

//creates a chatroom
socketio.on("room_created", function(data) {
  var name = data["roomname"];
  // var roomelement = document.createElement("p");
  // roomelement.setAttribute("id", name);
  // roomelement.innerHTML = name;
  console.log(name.roomname);
  createRoomElement(name.roomname);
  // document.getElementById("rooms").appendChild(roomelement);
  //document.getElementById("rooms").appendChild(document.createTextNode(data["roomname"]));
  console.log(data["roomname"]);
});

//displays all users in a room in str format
// function createString(list) {
//   var userstring = "";
//   for (var key in list) {
//     if (list.hasOwnProperty(key)) {
//
//       console.log(key + " -> " + list[key]);
//       userstring += list[key] + ", ";
//     }
//   }
//   console.log(userstring);
//   return userstring
// }


$(document).on("click", "#login_btn", function() {
  var username = document.getElementById("login_name").value;
  console.log(username);
  if (username.length > 2) {
    console.log("Enterring");
    $("#login_screen").fadeOut();
    $("#sidePanel").show();
    currentuser = username;
    socketio.emit("user_entering", {newuser: username});
    document.getElementById('username').innerHTML = username;
    console.log("Entering");
  }
});

// $(document).on("click", ".add-btn", function () {
//   $("#sidePanel").hide();
//   $("#")
// });

$(document).on("click", ".add-btn", function () {
  $("#sidePanel").hide();
  $("#addChat").show();
});


$(document).on("click", "#newroom", function () {
  console.log("Pressed");
  var newroomname = document.getElementById("roomname").value;
  if (newroomname.length > 2) {
    socketio.emit("create_chat", {roomname:newroomname, creator:currentuser})
    console.log(newroomname);
    $("addChat").hide();
    $("#sidePanel").show();

  }

});
//Send message
function sendMessage(){
   var msg = document.getElementById("message_input").value;
   var usr = currentuser;
   //console.log(usr);
   socketio.emit("message_to_server", {message:msg, messagewriter:usr});
}


// function enterRoom(){
//   var user = document.getElementById("name").value;
//   document.getElementById("name").style.visibility = "hidden";
//   document.getElementById("enter_btn").style.visibility = "hidden"
//   document.getElementById("chatrooms").style.visibility = "visible";
//   document.getElementById("messaging").style.visibility = "visible";
//
//   currentuser = user;
//   socketio.emit("user_entering", {newuser:user});
// }

function addUser(username)  {
  var li = document.createElement("li");
  var circle = document.createElement("div");
  circle.setAttribute("id", "circle");
  li.appendChild(circle);
  li.innerHTML = username;
  // document.getElementById("userlist").appendChild(li);
  console.log(username);

}

// function createRoom() {
//   var name = document.getElementById("create_chat").value;
//   console.log(name);
//   socketio.emit("create_chat", {roomname:name, creator:currentuser})
// }

function createRoomElement (roomname) {
  var li = document.createElement("li");
  var span = document.createElement("span");
  span.setAttribute("id", roomname);
  // a.href = "";
  span.setAttribute("class", "rooms");
  span.innerHTML = "# " + roomname;
  li.appendChild(span);
  document.getElementById("chatrooms").appendChild(li);

}


$(document).on("click", ".rooms", function() {
  console.log("room func");
  currentroom = event.target.id;
  console.log(currentroom);
  document.getElementById("chat-channel").innerHTML = "# " + currentroom;
  $("#login-view.fullscreen-view").hide();
  $(".wrapper").show();
}
);







// $("#add-chatroom-btn").on(function(event){
//   alert("pressed");
//   $("add-chatroom-view").fadeIn();
// });

$(document).on("click", "#add-chatroom-btn", function(){
  $("#add-chatroom-view").fadeIn();
});

$("#chatroom-title").keyup(function(e) {
  var newroomname = document.getElementById("chatroom-title").value;
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    console.log(newroomname);
    if (newroomname.length > 2) {
     socketio.emit("create_chat", {creator: currentuser, roomname:newroomname});
     $("chatroom-title").val("");
     $("#add-chatroom-view.fullscreen-view").fadeOut();
     $(".wrapper").show();
     $("#sidePanel").show();
    //  $("#chatroom-title").val("");

    }
  }
});



$(document).on("click", "#cancel-add-chatroom", function() {
  $("#add-chatroom-view").fadeOut();
  $("#sidePanel").show();
  console.log("cancelled");
})


// Sending message
$("#message-textarea").keyup(function(e){
  var usr = currentuser;
  var msg = document.getElementById("message-textarea").value;
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
     socketio.emit("message_to_server", {message:msg, messagewriter:usr});
     $("#message-textarea").val("");
  }
});


// Login screen
$("#login_name").keyup(function(e){
//  console.log("");
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    console.log("Enter");
    var user = document.getElementById("login_name").value;
    $("#add-chatroom-view.fullscreen-view").hide();
    $("#login-view.fullscreen-view").fadeOut();
    $(".wrapper").show();
    currentuser = user;
    currentroom = lobby;
    socketio.emit("user_entering", {newuser: user, room: lobby});
    document.getElementById('username').innerHTML = user;
    // console.log("Entering");
    // console.log(currentuser);
  }
});

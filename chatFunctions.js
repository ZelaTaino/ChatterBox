//var users = [];
var currentuser;
var socketio = io.connect();
var login_page = $("#login_screen");
var mainscreen = $("sidePanel");

//sends messages
socketio.on("message_to_client",function(data) {
   //Append an HR thematic break and the escaped HTML of the new message
   console.log(data);
   document.getElementById("chatlog").appendChild(document.createElement("hr"));
   document.getElementById("chatlog").appendChild(document.createTextNode(data['messagewriter'] + ": " + data['message']));
});

//user enter chatroom
socketio.on("user_entering", function(data) {
  var x = document.createElement("p");
  var users = data['newuser'];
  console.log(users);
  for (var key in users) {
    if (users.hasOwnProperty(key)) {
      console.log(key + " -> " + users[key]);
      if (users[key] != currentuser) {
        addUser(users[key]);

      }
    }
  }

  // document.getElementById("currentusers").innerHTML = createString(users);
  //document.getElementById("currentusers").appendChild(document.createTextNode(userstring));
});

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
function createString(list) {
  var userstring = "";
  for (var key in list) {
    if (list.hasOwnProperty(key)) {

      console.log(key + " -> " + list[key]);
      userstring += list[key] + ", ";
    }
  }
  console.log(userstring);
  return userstring
}


$(document).on("click", "#login_btn", function() {
  var username = document.getElementById("login_name").value;
  if (username.length > 2) {
    $("#login_screen").fadeOut();
    $("#sidePanel").show();
    currentuser = username;
    socketio.emit("user_entering", {newuser: username});
    document.getElementById('username').innerHTML = username;
    console.log("Entering");
  }

});
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


function enterRoom(){
  var user = document.getElementById("name").value;
  document.getElementById("name").style.visibility = "hidden";
  document.getElementById("enter_btn").style.visibility = "hidden"
  document.getElementById("chatrooms").style.visibility = "visible";
  document.getElementById("messaging").style.visibility = "visible";

  currentuser = user;
  socketio.emit("user_entering", {newuser:user});
}

function addUser(username)  {
  var li = document.createElement("li");
  var circle = document.createElement("div");
  circle.setAttribute("id", "circle");
  li.appendChild(circle);
  li.innerHTML = username;
  document.getElementById("userlist").appendChild(li);
  console.log(username);

}

// function createRoom() {
//   var name = document.getElementById("create_chat").value;
//   console.log(name);
//   socketio.emit("create_chat", {roomname:name, creator:currentuser})
// }

function createRoomElement (roomname) {
  var li = document.createElement("li");
  var a = document.createElement("p");
  li.appendChild(a);
  p.setAttribute("id", roomname);
  p.setAttribute("class", rooms);
  p.innerHTML = "# " + roomname;
  document.getElementById("chatrooms").appendChild(li);

}

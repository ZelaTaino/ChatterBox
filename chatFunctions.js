var users = [];
var currentuser = null;
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
    var oldscrollheight = $("#chat-area").prop("scrollHeight") - 20;
    console.log(oldscrollheight);
    document.getElementById("message-container").appendChild(messagediv);
    var newscrollHeight = $("#chat-area").prop("scrollHeight");
    console.log(newscrollHeight);
    if(newscrollHeight > oldscrollheight){
      $("#chat-area").animate({scrollTop: newscrollHeight}, 'slow');
      console.log("ENTERED SHOULD SCROLLED");
    }
  }
  else  {
    console.log("Wrong roomo ya dummy");
  }
});

//someone quits window
socketio.on("user_left_message", function(data) {
  if(currentuser != 'undefined'){
    var messagecont = document.createElement("div");
    messagecont.setAttribute("id", "message-container");
    var messagediv = document.createElement("div");
    messagediv.setAttribute("class", "a-message");
    var name = document.createElement("h4");
    var msg = document.createElement("p");
    msg.style.color = "gray";
    msg.style.fontStyle = "italic";
    name.innerHTML = data["message"];
    msg.innerHTML = data["message"] + " has left the room";
    messagediv.appendChild(name);
    messagediv.appendChild(msg);
    document.getElementById("message-container").appendChild(messagediv);
    console.log(data["roomlist"]);
  }
});

//creates a chatroom
socketio.on("room_created", function(data) {
  var room_name = data["room_name"];
  var user = data["user"];
  
  createRoomElement(room_name);
  
  //if user created room, switch room
  if (user == currentuser) {
    switchRooms(room_name);
  }
});

//create room
function createRoomElement (roomname) {
  var li = document.createElement("li");
  var span = document.createElement("span");
  span.setAttribute("id", roomname);
  span.setAttribute("class", "rooms");
  span.innerHTML = "# " + roomname;
  li.appendChild(span);
  document.getElementById("chatrooms").appendChild(li);
}

//when user switches room
function switchRooms(room_name){
  var old_room = currentroom;
  currentroom = room_name;

  socketio.emit("switching_rooms", {user: currentuser, old_room: old_room, new_room: room_name});

  //room name changes
  document.getElementById("chat-channel").innerHTML = "# " + currentroom;

  // socketio.emit("leaving_room", {user: currentuser, room: old_room});
  // socketio.emit("join_room", {user: currentuser, room: currentroom});
  // socketio.emit("get_chatrooms_users", {user: currentuser, room: currentroom});
  $("#login-view.fullscreen-view").hide();
  $(".wrapper").show();
}

// when user switches room 
$(document).on("click", ".rooms", function() {
  switchRooms(event.target.id);
});















socketio.on("room_return", function(data) {
  var rooms = data["allrooms"];
  console.log(rooms);
  var numrooms = rooms.length;
  var req = data["req"];
  if (req == currentuser) {
    for(var key in rooms) {
      console.log(rooms[key]);
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

function createDmElement(username){
  var li = document.createElement("li");
  li.setAttribute("class","a_user");
  li.setAttribute("id",username);
  var span = document.createElement("span");
  var circle = document.createElement("div");
  circle.setAttribute("id", "circle");
  span.appendChild(circle);
  var usernameDiv = document.createElement("div");
  usernameDiv.setAttribute("id", "username-div");
  usernameDiv.innerHTML = username;
  // span.appendChild(username);
  span.appendChild(usernameDiv);
  li.appendChild(span);
  document.getElementById("directmessages").appendChild(li);
}



// Login screen
$("#login_name").keyup(function(e){
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    var user = document.getElementById("login_name").value;
    currentuser = user;
    socketio.emit("get_current_rooms", {user: currentuser});
    currentroom = "lobby";

    socketio.emit("user_logging_in", {user: user, room: currentroom});

    //socketio.emit("user_entering", {newuser: user, room: currentroom});
    //socketio.emit("get_chatrooms_users", {room: currentroom, user: currentuser});


    $("#add-chatroom-view.fullscreen-view").hide();
    $("#login-view.fullscreen-view").fadeOut();
    $(".wrapper").show();
    document.getElementById('username').innerHTML = user;
  }
});





//after loggin, display lobby list
socketio.on("display_list_to_user", function(data){
  console.log("DISPLAY NEW LIST");
  var user_room_list = data["userList"];
  var user = data["user"];

  console.log("display list to entering user: " + user_room_list);
  console.log(user_room_list.length);

  if(user == currentuser){
    //remove from old list
    var old_elems = document.getElementsByClassName("a_user");
    while(old_elems.length > 0){
      old_elems[0].parentNode.removeChild(old_elems[0]);
    }

     //create new list
    for(i=0; i<user_room_list.length; i++){
      createDmElement(user_room_list[i]);
    }
  }
});

//if someone entered my chat room, remove and update list
socketio.on("send_new_user_list",function(data){
  console.log("SEND NEW USER LIST");
  var user_list = data["userList"];
  var room = data["room"];
  var user = data["user"];

  console.log("for room " + room);
  console.log("new list:" + user_list);
  // if(user != currentuser){
    if(currentroom == room){

      //remove old list
      var old_elems = document.getElementsByClassName("a_user");

      console.log(old_elems);
      console.log(old_elems.length);

      while(old_elems.length > 0){
        old_elems[0].parentNode.removeChild(old_elems[0]);
      }

      //create new list
      for(i=0; i<user_list.length; i++){
        console.log("Element to be printed "+user_list[i]);
        createDmElement(user_list[i]);
      }
    }
});






//other ppl entered room
socketio.on("user_entered", function(data){
  if(currentuser != null){
    console.log("USER ENTERED");
    var new_user = data["newUser"];
    var newUser_list = data["newUser_list"];
    var room_entered = data["room"];
    // if(new_user != currentuser){
    update_dm_users(new_user, newUser_list, room_entered);
    // }
  }

});

//i enterd room, it updates dm list
socketio.on("showing_users", function(data){
  if(currentuser!=null){  
    console.log("SHOWING USERS");
    var user = data["user"];
    var newUser_list = data["users"];
    var room_entered = data["room"];
    update_dm_users(user, newUser_list, room_entered);
  }
});



function update_dm_users(new_user, user_list, room){
  console.log("UPDATE DM USERS");
  if(room == currentroom){
    console.log("CLEAR USERS");
    //clear DM list
    var parent = document.getElementById("directmessages");
    var elements = document.getElementsByClassName("a_user");
    // console.log(elements);
    console.log(elements.length);
    console.log(elements);
    if(elements.length != 0){
      for(i=0;i<elements.length;i++){
        console.log("Removing: " + elements[i].id);
        parent.removeChild(elements[i]);
      }
    }

    console.log("ADD USER LIST");
    //creates list
    console.log("User list: " + user_list);
    for(i=0; i < user_list.length; i++){
      createDmElement(user_list[i]);
    }
    console.log("-------------------");
  }
}

socketio.on("user_left_room", function(data){
  var user_who_left = data["user"];
  var old_room = data["room"];
  var element = document.getElementById(user_who_left);
  var parent = document.getElementById("directmessages");
  console.log(element.id);
  parent.removeChild(element);
});


$(document).on("click", "#add-chatroom-btn", function(){
  $("#add-chatroom-view").fadeIn();
});


$("#chatroom-title").keyup(function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 13){
    var newroomname = document.getElementById("chatroom-title").value;
    if (newroomname.length > 2) {
     socketio.emit("create_chat", {creator: currentuser, roomname:newroomname});

     //update ui
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



$(document).on("click", ".add-chatroom-btn", function () {
  $("#sidePanel").hide();
  $("#addChat").show();
});

$(document).ready(function(){function t(){var t=$("#chat input[type=text]").val();t=t.trim(),$("#chat input[type=text]").val(""),t.length>0&&e.emit("lobbyMessage",t)}var e=io();$("#chat button").click(function(){t()}),$("#chat input[type=text]").keypress(function(e){13===e.which&&t()}),$("#users-list").on("click","> *",function(){var t=$(this).attr("id");console.log("clicked "+t)}),e.on("lobbyMessage",function(t){var e=moment(t.date),s=$("<div>",{"class":"message"}),a=$("<span>",{"class":"timestamp",title:e.format("YYYY-MM-DD HH:mm:ss"),text:e.format("HH:mm:ss")}),n=$("<span>",{"class":"author",text:t.author.username+":"}),c=$("<span>",{"class":"content",text:t.message});s.append(a),s.append(n),s.append(c),$("#chat .chat-body").append(s),$("#chat .chat-body").scrollTop($("#chat .chat-body").height())}),e.on("updateUsersList",function(t){console.log("received users: "),console.log(t),$("#users-list").empty(),t.forEach(function(t){var e=$("<div>",{id:t.id,"class":"alert alert-success",text:t.username});$("#users-list").append(e)})})});
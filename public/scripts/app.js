function common(){toastr.options={positionClass:"toast-top-center"}}function game(){io("/game")}function index(){$("#login-form button").click(function(){$.ajax({url:"/login",type:"POST",data:$("#login-form").serialize()}).done(function(t){t.user?window.location.href="/lobby":toastr.error(t)})}),$("#signup-form .signup-btn").click(function(){var t=new FormData(document.getElementById("signup-form"));$.ajax({url:"/signup",type:"POST",enctype:"multipart/form-data",processData:!1,contentType:!1,data:t}).done(function(t){t.user?window.location.href="/lobby":toastr.error(t)})}),$(".browse-btn, .avatar-preview").click(function(){$(".avatar").click()}),$(".avatar").change(function(t){$(".avatar-preview").attr("src",URL.createObjectURL(t.target.files[0]))})}function lobby(){function t(){var t=$("#chat input[type=text]").val();t=t.trim(),$("#chat input[type=text]").val(""),t.length>0&&a.emit("chatMessage",t)}var a=io("/lobby");$("#chat button").click(function(){t()}),$("#chat input[type=text]").keypress(function(a){13===a.which&&t()}),$("#users-list").on("click","> *",function(){var t=$(this).attr("id");console.log("clicked "+t)}),a.on("chatMessage",function(t){var a=moment(t.date),e=$("<div>",{"class":"message "+t.type}),n=$("<span>",{"class":"timestamp",title:a.format("YYYY-MM-DD HH:mm:ss"),text:"["+a.format("HH:mm:ss")+"]"});if(e.append(n),"user"===t.type){var o=$("<span>",{"class":"author",text:t.author.username+":"});e.append(o)}var s=$("<span>",{"class":"content",text:t.message});e.append(s),$("#chat .chat-body").append(e);var c=$("#chat .chat-body")[0].scrollHeight;$("#chat .chat-body").scrollTop(c)}),a.on("updateUsersList",function(t){console.log("received users: "),console.log(t),$("#users-list").empty(),t.forEach(function(t){var a=$("<div>",{id:t.id,"class":"alert alert-success",text:t.username});$("#users-list").append(a)})})}$(document).ready(function(){window[$("body").attr("class")](),common()});
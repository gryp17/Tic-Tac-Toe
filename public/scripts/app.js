function common(){toastr.options={positionClass:"toast-top-center"}}function game(){io("/game")}function index(){$("#login-form button").click(function(){$.ajax({url:"/login",type:"POST",data:$("#login-form").serialize()}).done(function(a){a.user?window.location.href="/lobby":toastr.error(a)})}),$("#signup-form .signup-btn").click(function(){var a=new FormData(document.getElementById("signup-form"));$.ajax({url:"/signup",type:"POST",enctype:"multipart/form-data",processData:!1,contentType:!1,data:a}).done(function(a){a.user?window.location.href="/lobby":toastr.error(a)})}),$(".browse-btn, .avatar-preview").click(function(){$(".avatar").click()}),$(".avatar").change(function(a){$(".avatar-preview").attr("src",URL.createObjectURL(a.target.files[0]))})}function lobby(){function a(){var a=$("#chat input[type=text]").val();a=a.trim(),$("#chat input[type=text]").val(""),a.length>0&&t.emit("chatMessage",a)}var t=io("/lobby");$(".avatar-preview").click(function(){$(".avatar").click()}),$("#update-avatar-form .avatar").change(function(){var a=new FormData(document.getElementById("update-avatar-form"));$.ajax({url:"/user/updateAvatar",type:"POST",enctype:"multipart/form-data",processData:!1,contentType:!1,data:a}).done(function(a){if(a.avatar){var e=$(".avatar-preview").attr("src");e=e.replace(/[^\/]+?$/,a.avatar),$(".avatar-preview").attr("src",e),t.emit("updateAvatar",a.avatar)}else toastr.error(a)})}),$("#chat button").click(function(){a()}),$("#chat input[type=text]").keypress(function(t){13===t.which&&a()}),t.on("chatMessage",function(a){var t=moment(a.date),e=$("<div>",{"class":"message "+a.type}),n=$("<span>",{"class":"timestamp",title:t.format("YYYY-MM-DD HH:mm:ss"),text:"["+t.format("HH:mm:ss")+"]"});if(e.append(n),"user"===a.type){var r=$("<span>",{"class":"author",text:a.author.username+":"});e.append(r)}var o=$("<span>",{"class":"content",text:a.message});e.append(o),$("#chat .chat-body").append(e);var c=$("#chat .chat-body")[0].scrollHeight;$("#chat .chat-body").scrollTop(c)}),t.on("updateUsersList",function(a){$("#users-list").empty(),a.forEach(function(a){var t=$("<div>",{id:a.id,"class":"alert alert-success",text:a.username,title:"Invite "+a.username+" for a game",click:function(){var a=$(this).attr("id");console.log("clicked "+a)}}),e=$("<img>",{"class":"avatar",src:"/upload/avatars/"+a.avatar});t.prepend(e);var n=$("<span>",{"class":"glyphicon glyphicon-info-sign"}),r=$("<a>",{"class":"user-info",href:"/user/"+a.id,target:"_blank",title:"View user info"});r.append(n),t.append(r),$("#users-list").append(t)})})}$(document).ready(function(){window[$("body").attr("class")](),common()});
function ChatApp(username) {
	var me = this;

	me.username = username;
	me.curUser = {};
	// me.sockeObj = _sockeObj;
	me.socket;
	me.selectedUser;
	me.users = [];
	me.chatServerURL = (WsCallManager.isLocalDevCase) ? chatServerURL_local : chatServerURL;

	// ------------------------------------------------------------------------
	// HTML Tags

	me.chatDivTag = $('#chatDiv');

	me.btnChatBackBtnTag;

	me.curUserDivTag;
	me.curUsernameTag;
	me.curUserIconTag;
	me.editContactListTag;
	me.sendBtnTag;
	me.msgTag;
	me.searchContactNameTag;
	me.uploadInputTag;

	me.userListTag;

	me.logoutBtnTag;
	me.addUserBtnTag;
	me.emojjiDashboardTag;
	me.showEmojiDashboardTag;

	me.chatWithUserTag;
	me.chatWithIconTag;
	me.chatViewTag;
	me.initChatMsgTag;

	me.chatHistoryTag;
	me.chatHistoryMsgNoTag;

	// ------------------------------------------------------------------------
	// INIT method

	me.init = function () {


		// Set HTML & values related
		me.chatDivTag.html('').append(ChatApp.contentHtml);


		me.btnChatBackBtnTag = $(".btnChatBack");

		me.curUserDivTag = $("#curUserDiv");
		me.curUsernameTag = $("#curUsername");
		me.curUserIconTag = $("#curUserIcon");
		me.editContactListTag = $("#editContactList");
		me.sendBtnTag = $("#sendBtn");
		me.msgTag = $("#msg");
		me.searchContactNameTag = $("#searchContactName");
		me.uploadInputTag = $("#upload_input");

		me.userListTag = $("#users");

		me.logoutBtnTag = $('#logOutBtn');
		me.addUserBtnTag = $("#addUserBtn");
		me.emojjiDashboardTag = $(".emoji-dashboard");
		me.showEmojiDashboardTag = $("#showEmojiDashboard");


		me.chatWithUserTag = $(".chat-with");
		me.chatWithIconTag = $(".chat-with-icon");
		me.chatViewTag = $("#chatView");
		me.initChatMsgTag = $("#initChatMsg");

		me.chatHistoryTag = $('.chat-history');
		me.chatHistoryMsgNoTag = $(".chat-num-messages");


		// ------------------------

		FormUtil.blockPage();
		me.chatViewTag.hide();
		me.initChatMsgTag.show().html(`Loading ...`);

		if (!me.curUser) {
			me.initChatMsgTag.show().html("Loading ...");
		}

		// Add Emoji in Emoji Dashboard
		for (var i = 0; i < emojiCodes.length; i++) {
			var liTag = $("<li></li>");
			liTag.val("&#" + emojiCodes[i] + ";")
			liTag.append("&#" + emojiCodes[i] + ";");

			me.emojjiDashboardTag.find("ul").append(liTag);
		}

		// Get contact list of username
		$.get(me.chatServerURL + "/users?username=" + encodeURIComponent(me.username), {}, function (userProfile) {
			me.initSocket();

			me.curUser = userProfile.curUser;

			// Render contact list
			me.outputUsers(userProfile);

			// Update the contact list status
			me.users.forEach((user) => { me.setUserStatus(user); });

		});

		// Init Chat form
		me.editContactListTag.attr("mode", "hide");
		me.searchContactNameTag.val("");
		me.addUserBtnTag.hide();


		me.setUp_Events();

		me.chatDivTag.show();
	};


	// =====================================================================
	// For Socket

	me.initSocket = function () {
		var option = {
			reconnectionDelayMax: 1000,
			withCredentials: true,
			// path: ( WsCallManager.isLocalDevCase ) ? '': "/ws/chat/",  // PATH should be changed?  for localhost?
			extraHeaders: { "Access-Control-Allow-Origin": "origin-list" },
			autoConnect: false,
			auth: { username: me.username }
		};

		//if ( !WsCallManager.isLocalDevCase ) option.path = '/ws/chat';

		me.socket = io(me.chatServerURL, option);

		// Register a catch-all listener, which is very useful during development:
		me.socket.onAny((event, ...args) => {
			console.log(event, args);
		});

		const sessionID = localStorage.getItem("sessionID");
		if (sessionID) {
			me.socket.auth = { sessionID, username: me.username };
			// me.socket.auth = { sessionID };
		}
		else {
			me.socket.auth = { username: me.username };
		}

		me.socket.connect();

		me.chatViewTag.hide();

		me.socketEventListener();
		me.setUp_UploadFile();
	}

	me.socketEventListener = function () {
		// ---------------------------------------------------------------------------
		// SocketIO Connection Event Listener

		me.socket.on("connect", () => {

			console.log('Socket is connected.');

			const user = { username: me.username, connected: true };
			me.setUserStatus(user);


			var offlineMessages = getOfflineMessages();
			for (i = offlineMessages.length - 1; i >= 0; i--) {
				const data = offlineMessages[i];
				me.socket.emit('private_message', data);
			}

			me.initChatMsgTag.show().html(`Welcome, ${me.curUser.fullName}`);
			FormUtil.unblockPage();

		});

		me.socket.on("disconnect", () => {

			// var usernameList = Object.keys( me.users );
			// for( var i=0; i<usernameList.length;i++ )
			// {
			// 	var user = me.users[usernameList[i]]
			// 	if (user.self) {
			// 		user.connected = false;
			// 	}
			// } 

		});

		me.socket.on('connect_error', function (err) {
			if (err.message === "invalid username") {
				console.log(err.message);

				const sessionID = localStorage.getItem("sessionID");
				if (sessionID) {
					me.socket.auth = { sessionID, username: me.username };
				}
				else {
					me.socket.auth = { username: me.username };
				}

				me.socket.connect();
			}
			else {
				console.log('Failed to connect to server');
				me.initChatMsgTag.show().html(`Failed to connect to chat server. Please contact administrator.`);
				FormUtil.unblockPage();
			}
		});

		// END - SocketIO Connection Event Listener
		// ---------------------------------------------------------------------------


		me.socket.on("session", ({ sessionID, userID, username }) => {
			// Attach the session ID to the next reconnection attempts
			me.socket.auth = { sessionID };
			// Store it in the localStorage
			localStorage.setItem("sessionID", sessionID);
			// Save the ID of the user
			me.socket.userID = userID;
			me.socket.username = username;
		});

		// ---------------------------------------------------------------------------
		// For "User" Event Listener

		me.socket.on("users", (_users) => {
			_users.forEach((user) => {
				me.setUserStatus(user);
			});
		});

		me.socket.on("user_connected", (user) => {
			me.setUserStatus(user);
		});

		me.socket.on("user_connected", (user) => {
			me.setUserStatus(user);
		});

		me.socket.on('new_user_created', (userData) => {
			const found = Utils.findItemFromList(userData.contacts, me.curUser.username, "contactName");
			if (found) {
				me.curUser.contacts.push({ contactName: userData.username, hasNewMessages: found.hasNewMessages });
				me.appendUserInContactList(userData);
			}
		});

		me.socket.on('contact_removed', (contactName) => {
			me.curUser.contacts = Utils.removeFromArray(me.curUser.contacts, contactName, "contactName");
			me.userListTag.find(`li[username="${contactName}"]`).remove();
		});

		// END - For "User" Event Listener
		// ---------------------------------------------------------------------------



		// ---------------------------------------------------------------------------
		// For "Message" Event Listeners 

		me.socket.on('message_list', (data) => {
			const messages = Utils.mergeWithOfflineMessages(data.messages, data.users.username1, data.users.username2);
			me.outputMessageList(messages);
			me.userListTag.find(`[username='${me.selectedUser.username}']`).find(".has-new-message").hide();

			me.socket.emit("has_new_message", { userData: me.curUser, contactName: me.selectedUser.username, hasNewMessages: false });

		});

		me.socket.on("receive_message", ({ userData, newContact }) => {
			const contactList = userData.contacts;
			if (me.curUser.username == userData.username) {
				me.curUser = userData;
			}

			for (var i = 0; i < contactList.length; i++) {
				const contactInfo = contactList[i];
				const userTag = me.userListTag.find(`[username='${contactInfo.contactName}']`);
				if (userTag.length > 0) {
					if (contactInfo.hasNewMessages) {
						const contactTag = me.moveContactOnTop(contactInfo.contactName);
						if (contactInfo.contactName !== this.selectedUser.username) {
							contactTag.find(".has-new-message").show();
						}
						else {
							contactTag.find(".has-new-message").hide();
							me.socket.emit("has_new_message", { userData: me.curUser, contactName: me.selectedUser.username, hasNewMessages: false });
						}
					}
					else {
						userTag.find(".has-new-message").hide();
					}
				}
				else if (newContact != undefined) {
					const found = Utils.findItemFromList(contactList, newContact.username, "contactName");
					if (found) {
						me.appendUserInContactList(newContact, false);
					}
				}
			}
		});

		me.socket.on('sendMsg', data => {
			me.outputMessage(data);

			if (this.selectedUser == undefined || data.receiver != this.selectedUser.username) {
				me.socket.emit("has_new_message", { userData: me.curUser, contactName: data.sender, hasNewMessages: true });
			}

		})

		me.socket.on('user_disconnected', (username) => {
			const user = { username, connected: false }
			me.setUserStatus(user);
		});

	}


	me.setUp_UploadFile = function () {
		// -----------------------------------------------------------------------
		// Upload file'

		var siofu = new SocketIOFileUpload(me.socket);

		siofu.listenOnInput(document.getElementById("upload_input"));

		// Do something on upload progress:
		siofu.addEventListener("progress", function (event) {
			var percent = (event.bytesLoaded / event.file.size) * 100;
			console.log("File is", percent.toFixed(2), "percent loaded");
		});

		// Do something when a file is uploaded:
		siofu.addEventListener("complete", function (event) {
			console.log(event);

			const file = event.file;
			const type = (file.type.indexOf("image/") == 0) ? "IMAGE" : "FILE";
			
			const url = `${me.chatServerURL}/uploads?path=${event.detail.name}`;
			const data = Utils.formatMessage(me.curUser.username, me.selectedUser.username, url, type, url);
			me.outputMessage(data);

			me.socket.emit("private_message", data);

			// 	var messageTag = $(`<li class="clearfix">
			// 		<div class="message-data align-right">
			// 		<span class="message-data-time" >${message.time}</span> &nbsp; &nbsp;
			// 		<span class="message-data-name" >${message.username}</span> <i class="fa fa-circle me"></i>

			// 		</div>
			// 		<div class="message other-message float-right">
			// 			${message.text}
			// 		</div>
			// 	</li>`)
			// 	$('.chat-history').find("ul").append( messageTag );

			//   div.appendChild(img);

		});

		// ---------------------------------------------------------------------------

	}
	// For Socket - END
	// =====================================================================



	// ------------------------------------------------------------------------
	// HTML Tags's events

	me.setUp_Events = function () {
		me.sendBtnTag.off("click").on("click", function (e) {
			me.submitChatMessage(e)
		});

		me.msgTag.off("keypress").on("keypress", function (e) {
			if (e.key === "Enter") {
				me.submitChatMessage(e)
			}
		});

		me.searchContactNameTag.off("keyup").on("keyup", function () {
			me.searchContactUsers();
		});

		me.addUserBtnTag.off("click").on("click", function () {
			me.socket.emit("create_new_user", { username1: me.curUser.username, username2: me.searchContactNameTag.val() });
		});

		me.editContactListTag.off("click").on("click", function () {
			const mode = $(this).attr("mode")
			if (mode == "hide") {
				me.userListTag.find(".remove-icon").show();
				$(this).attr("mode", "show");
			}
			else if (mode == "show") {
				me.userListTag.find(".remove-icon").hide();
				$(this).attr("mode", "hide");
			}
		});

		// // // Log-out button
		// me.btnChatBackBtnTag.click(function() {
		// 	me.socket.emit("disconnect");
		// }); 

		// me.logoutBtnTag.click(function() {
		//     const leaveRoom = confirm('Are you sure you want to log-out ?');
		//     if (leaveRoom) {
		//         me.socket.off("connect_error");
		//         window.location = 'index.html';
		//     } 
		//     else {
		//     }
		// }); 

		$(document).off("click").on("click", function (e) {
			me.emojjiDashboardTag.slideUp('fast');
		});


		// Show Emoji Dashboard
		me.showEmojiDashboardTag.off("click").on("click", function (e) {
			me.emojjiDashboardTag.slideToggle('fast');
			e.stopPropagation();
		});

		me.emojjiDashboardTag.find("ul").find("li").off("click").on("click", function () {
			Utils.insertText(me.msgTag, $(this).html());
			me.emojjiDashboardTag.slideUp('fast');
		});


		// me.uploadInputTag.off("change").on("change", function(event){
		// 	me.socket.emit("upload", event.target.files[0], (status) => {
		// 		console.log(status);
		// 	});
		// })

		// me.uploadInputTag.off("change").on("change", function(event){
		//     var files = event.target.files;
		//     if( ( files != undefined || files != null ) && files.length > 0 )
		//     {
		//         const file = files[0];
		// 		const reader = new FileReader();
		// 		reader.addEventListener( "load", () => {
		// 			const type = ( file.type.indexOf("image/") == 0 ) ? "IMAGE" : "FILE";
		//             const data = Utils.formatMessage( me.curUser.username, me.selectedUser.username, reader.result, type, file.name );

		//             if( !me.socket.connected )
		//             {
		//                 saveOfflineMessage( data );
		//             }
		//             else
		//             {
		//                 me.socket.emit("private_message", data );
		//             }

		// 			// Re-order the contact list
		// 			me.moveContactOnTop( me.selectedUser.username );

		// 			// const userTag = me.userListTag.find(`[username='${me.selectedUser.username}']`);
		// 			// const contactData = JSON.parse( userTag.attr("user") );
		// 			// userTag.remove();
		// 			// me.appendUserInContactList( contactData, false );


		// 			me.outputMessage( data );
		// 		});

		// 		reader.readAsDataURL( file );
		//     }
		// })

	}

	me.moveContactOnTop = function (contactName) {
		// Re-order the contact list
		const userTag = me.userListTag.find(`[username='${contactName}']`);
		const contactData = JSON.parse(userTag.attr("user"));
		userTag.remove();
		return me.appendUserInContactList(contactData, false);
	}


	// ------------------------------------------------------------------------
	// Supportive methods - For Users

	me.searchContactUsers = function () {
		me.userListTag.find("li").hide();
		var searchText = me.searchContactNameTag.val().toUpperCase();

		if (searchText != "") {
			let canAddNew = true;
			me.userListTag.find("li").each(function () {
				var fullName = $(this).html();
				var userName = $(this).attr("user");
				if (fullName.toUpperCase().indexOf(searchText) >= 0 || userName.toUpperCase().indexOf(searchText) >= 0) {
					$(this).show();

					if (fullName.toUpperCase() == searchText || userName.toUpperCase() == searchText) {
						canAddNew = false;
					}
				}
			});

			if (canAddNew) {
				me.addUserBtnTag.show();
			}
			else {
				me.addUserBtnTag.hide();
			}
		}
		else {
			me.userListTag.find("li").show();
			me.addUserBtnTag.hide();
		}
	}

	me.setCurrentUserInfo = function () {
		me.curUserDivTag.attr(`username="${me.curUser.username}"`);
		me.curUsernameTag.html(me.curUser.fullName);

		// For curUser icon background-color
		me.curUserIconTag.html(me.curUser.fullName.substring(0, 2).toUpperCase());
		// me.curUserIconTag.css("backgroundColor", "#" + randomColor);
		me.curUserIconTag.css("color", "#" + Utils.stringToDarkColour(me.curUser.username));
		me.curUserIconTag.css("backgroundColor", Utils.stringToLightColour(me.curUser.username));
	}


	// Output user list
	me.outputUsers = function (data) {

		me.curUser = data.curUser;
		me.setCurrentUserInfo();

		me.userListTag.html("");

		// Add the proper list here
		data.contacts.forEach((user) => {

			if (user != null) {
				const contactName = user.username;
				if (contactName != me.username) {
					me.appendUserInContactList(user);
				}
			}

		});
	}

	me.appendUserInContactList = function (userData, isAppend) {
		if (me.userListTag.find(`[username='${userData.username}']`).length == 0) {
			const contactName = userData.username;
			const firstChar = userData.fullName.substring(0, 2).toUpperCase();
			const bgColorIcon = Utils.stringToLightColour(contactName);
			const colorIcon = Utils.stringToDarkColour(contactName);
			const userInfo = JSON.stringify(userData);
			const hasNewMessages = Utils.findItemFromList(me.curUser.contacts, userData.username, "contactName").hasNewMessages;

			// Set status "offline" for all users in contact list. Will update after getting online user list / OR when an user is online
			var userTag = $(`<li class="clearfix" style="cursor:pointer;" username='${contactName}' user='${userInfo}'>
			
								<div class="remove-icon" style="display:none;">&#128465;</div>
								<div class="user-icon" style="background-color: ${bgColorIcon}; color: ${colorIcon}">${firstChar}</div>
								<div class="about">
									<div class="name"><span>${userData.fullName}</span><span class="has-new-message" style="display:none;">(N)</span></div>
									<!-- div class="status">
										<i class="fa fa-circle offline"></i> <span>offline</span>
									</div -->
								</div>
							</li>`);

			if (hasNewMessages) {
				userTag.find(".has-new-message").show();
			}

			me.setupEvent_UserItemOnClick(userTag);
			if (isAppend == undefined || isAppend) {
				me.userListTag.append(userTag);
			}
			else if (!isAppend) {
				me.userListTag.prepend(userTag);
			}

			return userTag;
		}
	}

	// Select an user

	me.selectContactUser = function (userTag) {
		me.selectedUser = JSON.parse(userTag.attr("user"));
		me.chatWithUserTag.html(`Chat with ${me.selectedUser.fullName}`);
		me.chatWithIconTag.html(me.selectedUser.fullName.substring(0, 2).toUpperCase())
		me.chatWithIconTag.css("color", "#" + Utils.stringToDarkColour(me.selectedUser.username));
		me.chatWithIconTag.css("backgroundColor", Utils.stringToLightColour(me.selectedUser.username));
		me.chatHistoryTag.find("ul").html("");


		me.chatViewTag.show();
		me.initChatMsgTag.hide();

		me.socket.emit('get_message_list', { username1: me.username, username2: me.selectedUser.username });
	}

	me.setupEvent_UserItemOnClick = function (userTag) {
		// Show the conversation when a contact is selected
		userTag.find(".user-icon").click(function (e) {
			me.selectContactUser(userTag)
		});
		userTag.find(".about").click(function (e) {
			me.selectContactUser(userTag)
		});

		// Remove a contact in list
		userTag.find(".remove-icon").click(function (e) {
			var ok = confirm("Are you sure you want to remove this contact ?");
			if (ok) {
				const contactUser = JSON.parse(userTag.attr("user"));
				me.socket.emit("remove_contact", { userData: me.curUser, contactName: contactUser.username });
			}
		});
	}

	me.setUserStatus = function (user) {
		let userTag = $(`[username="${user.username}"]`);
		if (userTag.length > 0) {
			var statusTag = userTag.find("div.status");
			const status = user.connected ? "online" : "offline";
			statusTag.find("i").removeClass("offline").removeClass("online").addClass(status);
			statusTag.find("span").html(status);
		}

	}

	me.initReactiveProperties = (user) => {
		user.messages = [];
		// user.hasNewMessages = false;
	};

	// ------------------------------------------------------------------------
	// Supportive methods - For messages

	// Message submit
	me.submitChatMessage = function (e) {
		e.preventDefault();

		// Get message.msg
		let msg = me.msgTag.val();
		msg = msg.trim();
		if (!msg) {
			return false;
		}

		const data = Utils.formatMessage(me.curUser.username, me.selectedUser.username, msg);
		if (me.socket.connected) {
			// Emit message to server
			me.socket.emit("private_message", data);
			// me.socket.emit("has_new_message", { userData: me.selectedUser, contactName: me.curUser.username, hasNewMessages: true });
		}
		else {
			saveOfflineMessage(data);
		}


		me.moveContactOnTop(me.selectedUser.username);

		me.outputMessage(data);

		// Clear input
		me.msgTag.val("");
	}


	// Output message list
	me.outputMessageList = function (list) {

		for (let i = 0; i < list.length; i++) {
			me.outputMessage(list[i]);
		}

	}


	// Output a message
	me.outputMessage = function (message) {

		if (me.selectedUser != undefined) {
			if ((me.username == message.sender && me.selectedUser.username == message.receiver) ||
				(me.username == message.receiver && me.selectedUser.username == message.sender)) {
				// Only remove message from localStorage if the socket is online and this message existed 
				if (me.socket.connected) {
					removeOfflineMessage(message);
				}

				var messageTag = me.chatHistoryTag.find(`ul li[id="${message.datetime}"]`);
				if (messageTag.length > 0) {
					if (messageTag.hasClass("offline")) {
						messageTag.removeClass("offline");
					}
				}
				else {
					var messageTextDivTag;
					if (message.filetype != undefined) {
						if (message.filetype == "IMAGE") {
							messageTextDivTag = `<img style="width: 300px;" src="${message.name}">`;
						}
						else {
							messageTextDivTag = `<a href="${message.name}" target="_blank">${message.name}</a>`;
						}
					}
					else {
						// const utf8 = new Uint8Array(
						// 	Array.prototype.map.call(
						// 		message.msg, 
						// 		c => c.charCodeAt(0)
						// 	)
						// );

						// const msg = new TextDecoder('utf8').decode(utf8);
						// messageTextDivTag = `<span>${msg }</span>`;

						// const str = message.msg;
						// const rex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;
						// const msg = str.replace(rex, match => `${match.codePointAt(0).toString(16)}`);

						messageTextDivTag = `<span>${Utils.convertUnicodeEmoji(message.msg)}</span>`;
					}


					const offlineClazz = (me.socket.connected) ? "" : "offline";

					if (message.sender == me.username) {
						const senderFullName = me.curUser.fullName;
						messageTag = $(`<li id='${message.datetime}' class="${offlineClazz}">
											<div class="message-data">
												<span class="message-data-time" >${DateUtils.formatDisplayDateTime(message.datetime)}</span> &nbsp; &nbsp;
												<span class="message-data-name" >${senderFullName}</span> <i class="fa fa-circle me"></i>
												
												</div>
												<div class="message my-message">
													${messageTextDivTag}
												</div>
										</li>`)
					}
					else {
						const senderFullName = me.selectedUser.fullName;
						messageTag = $(`<li id='${message.datetime}' class="clearfix ${offlineClazz}">
								<div class="message-data align-right">
									<span class="message-data-time" >${DateUtils.formatDisplayDateTime(message.datetime)}</span> &nbsp; &nbsp;
									<span class="message-data-name" >${senderFullName}</span> <i class="fa fa-circle me"></i>
								</div>
								<div class="message other-message float-right">
									${messageTextDivTag}
								</div>
							</li>`)
					}

					me.chatHistoryTag.find("ul").append(messageTag);
					me.chatHistoryMsgNoTag.html("already " + NumberUtils.formatDisplayNumber(me.chatHistoryTag.find("ul li").length) + " messages");
					me.chatHistoryTag.scrollTop(me.chatHistoryTag[0].scrollHeight);
				}
			}
		}
	}


	// ------------------------------------------------------------------------
	// Run INIT

	me.init();
};


ChatApp.contentHtml = `
<div class="wapper_card">
	<div class="sheet-title c_900" style="width:100%">
		<img src="images/arrow_back.svg" class="btnChatBack btnBack mouseDown" />
		<span term="menu_chat">Chat</span>
	</div>

	<div class="card" style="padding: 8px; background-color: #FFF; height: calc( 100vh - 70px ); width: 98%; display: flex;">
		<div class="subContent" style="width: 100%; height: 100%;">
			<div class="chatContainer clearfix">
				<div class="people-list" id="people-list">
					<div class="curUsserDiv">
						<div class="user-icon" id="curUserIcon"></div>
						<div class="about">
							<div class="name">
								<span id="curUsername"></span>
								<span id="editContactList" mode="hide">&#9998;</span>
							</div>
						</div>
					</div>

					<div class="searchForm">
						<input class="nosubmit search" id="searchContactName" placeholder="Search..." style="background-color: white;" />
						<div class="add-user-btn" id="addUserBtn" style="display:none;">Add</div>
					</div>
					<ul id="users">
					</ul>
				</div>

				<div class="chat" style="display: none;" id="chatView">
					<div class="chat-header clearfix">
						<div class="user-icon chat-with-icon"></div>
						<div class="chat-about">
							<div class="chat-with"></div>
							<div class="chat-num-messages"></div>
						</div>
						<i class="fa fa-star"></i>
					</div>

					<div class="chat-history"><ul></ul></div>

					<div class="chat-message clearfix chat-form">
						<input id="msg" type="text" class="message-text" placeholder="Enter Message" required="" autocomplete="off"/>
						<img id="showEmojiDashboard" src="images/smile.png" style="width: 16px; opacity: 0.4; cursor: pointer;" />
						<label>
							<input type="file" id="upload_input" multiple style="display:none" />
							<img src="images/file-icon.png" style="width: 13px; opacity: 0.4; margin-left: 10px; cursor: pointer;" />
						</label>

						<button class="btn" id="sendBtn">Send</button>

						<div class="emoji-dashboard" style="display:none"><ul></ul></div>
					</div>

					<div class="chat" id="initChatMsg" style="height: 917px; font-size: 40px; text-align: center; padding: 100px 0;"></div>

				</div>
			</div>
		</div>
	</div>
</div>
`;
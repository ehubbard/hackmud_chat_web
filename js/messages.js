function MessageList(channel, ul, user) {
	this.channel = channel;
	this.ul = ul;
	this.messages = {};
	this.ids = [];
	this.user = user;
}

MessageList.prototype.poll = function() {
	return this.channel.poll().then(messages => {
	});
}

MessageList.prototype.send = function(msg) {
	this.scrollToBottom();
	return this.channel.send(msg);
}

MessageList.prototype.tell = function(user,to_user,msg) {
	this.scrollToBottom();
	return user.tell(to_user,msg);
}

MessageList.prototype.recordMessage = function (msg) {
	let at_bottom = this.ul[0].scrollHeight - this.ul.scrollTop() == this.ul.height();

	let msgs = Array.isArray(msg) ? msg : [msg];

	msgs.forEach(m => {
		id = m.id;
		this.messages[id] = m;
		this.ids.push(id);

		classList = ['message'];
		if (settings.ignore_list.includes(m.from_user)) {
			classList.push('ignore');
		}
		this.write(formatMessage(m), classList);
	});

	if (at_bottom) {
		this.scrollToBottom();
	}
}

MessageList.prototype.write = function(html, classArray) {
	if (!classArray) {
		classArray = [];
	}

	let li = $('<li class="' + classArray.join(' ') + '">');
	li.html(html);
	this.ul.append(li);
}

MessageList.prototype.safeWrite = function(str, classArray) {
	this.write(escapeHtml(str), classArray);
}

// putting this on the MessageList class so that we have a way to output data
MessageList.prototype.handleSlashCommand = function(str) {
	var components = str.split(' ');

	if (components[0] == 'help') {
		this.safeWrite('Commands: /help, /ignore <user>, /color <letter|color code|none>, /tell <user> <optional message>');
	} else if (components[0] == 'ignore') {
		if (components[1]) {
			var user = components[1];
			settings.addIgnore(user);
			this.safeWrite("Ignored " + user);
		} else {
			this.safeWrite("Ignore list: " + settings.ignore_list.join(", "));
		}
	} else if (components[0] == 'color') {
		if (components[1]) {
			var color = components[1];
			settings.setColor(color);
			this.write('Set chat color to "' + color + '". Sample: "' + colorCallback(null, color, 'foo bar baz') + '"');
		} else {
			if (settings.color_code) {
				var color = settings.color_code;
				this.write('Current chat color is "' + color + '". Use "/color none" to unset. Sample: "' + colorCallback(null, color, 'foo bar baz') + '"');
			} else {
				this.safeWrite("Currently using the default chat color.");
			}
		}
	} else if (components[0] == 'tell') {
		if (components[1]) {
			var u=components[1];
			if(!this.user.tells[u]) {
				this.user.tells[u]={}
				setupChannel(this.user,this.user.chan_ul,this.user.user_div,u,true);
			}
			$('.channel_tab').removeClass('active');
			this.user.tells[u].list.li.addClass('active');

			$('.channel_area').hide();
			this.user.tells[u].list.channel_div.show();

			this.user.tells[u].list.scrollToBottom();
			$(this.user.tells[u].list.channel_div).find('input').focus()
			if(components[2]) {
				components.shift()
				components.shift()
				var m=components.join(' ');
				this.user.tells[u].list.tell(this.user,u,m);
			}
		} else {
			this.safeWrite("Please specify a user to open a conversation with");
		}
	}

	this.scrollToBottom();
}

MessageList.prototype.pgUp = function() {
	let height = this.ul.height();
	let currTop = this.ul.scrollTop();

	this.ul.scrollTop(currTop - height);
}

MessageList.prototype.pgDn = function() {
	let height = this.ul.height();
	let currTop = this.ul.scrollTop();

	this.ul.scrollTop(currTop + height);
}

MessageList.prototype.scrollToBottom = function() {
	this.ul.scrollTop(1e10); // just scroll down a lot
}

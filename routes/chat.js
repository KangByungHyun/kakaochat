module.exports = (mysqlConn, io) => {
    const router = require('express').Router();
	let room_list = [];
	
	router.get('/rooms', function(req, res, next) {
		// user_id = req.cookies['user_id'];
		// console.log('채팅방들' + user_id);
		console.log('현재 방들');
		console.log(room_list);
		res.render('rooms', {'room_list':room_list});
	});
	
	router.get('/room', function(req, res, next) {
		let room_name = req.query.room_name;
		// console.log('채팅방' + req.params.room_name);
		console.log('채팅방' + room_name);
		var user = null;
		let sql = 'SELECT * FROM user WHERE user_id = ?';
		let selectValArr = [req.cookies['user_id']];
		
		mysqlConn.query(sql, selectValArr, function (err, result) {
			if (err) throw err;
			user = result;
			console.log('---------------');
			console.log(user);
			res.render('chat', {'room_name':room_name, 'user':user});
		});
	});
	
	router.get('/logout', function(req, res, next) {
		res.clearCookie('user_id');
		res.redirect('/');
	});
	
	/*** Socket.IO 추가 ***/
	io.on('connection', function(socket){
		
		var room_name = null;
		var member_list = [];
		console.log(socket.user_id + ' 사용자 채팅 접속 ' + socket.id);
		
		socket.on('disconnect', function(){
			console.log(socket.user_id + ' 사용자 채팅 종료 ' + socket.id);
			room_list.forEach(function(room){
				if(room.room_name == room_name){
					room.room_members = room.room_members.filter((user_id) => user_id.split('==')[0] !== socket.user_id);
					socket.leave(room_name);
					if(room.room_members.length == 0){
						console.log('빈 방 삭제');
						room_list = room_list.filter((item) => item.room_name !== room_name);
					}
				}
			});
		});
		
		socket.on('join', function(data){
			json_data = JSON.parse(data);
			user_id = json_data.user_id;
			room_name = json_data.room_name;
			socket.user_id = user_id;
			socket.join(room_name);
			
			var room_check = true;
			room_list.forEach(function(room){
				if(room.room_name == room_name){
					room_check = false;
					room.room_members.push(socket.user_id+'=='+socket.id);
					member_list = room.room_members;
				}
			});
			
			if(room_check){
				console.log('room_list에 ' + room_name + '방 추가');
				room_list.push({'room_name': room_name, 'room_members':[socket.user_id+'=='+socket.id]});
				member_list.push(socket.user_id+'=='+socket.id);
			}
			
			// room_list.push({'room_name':})
			console.log(room_name + '방에 ' + socket.user_id + '님 입장함 ' +  socket.id);
			console.log(io.sockets.adapter.rooms);
			console.log(room_list);
			console.log('---------------------');
			console.log(member_list);
			
			io.sockets.in(room_name).emit('new_join', member_list);
		});
		
		socket.on('leave', function(){
			// socket.leave(room_name);
			
			room_list.forEach(function(room){
				if(room.room_name == room_name){
					room.room_members = room.room_members.filter((user_id) => user_id.split('==')[0] !== socket.user_id);
					socket.leave(room_name);
					member_list = room.room_members;
					if(room.room_members.length == 0){
						console.log('빈 방 삭제');
						room_list = room_list.filter((item) => item.room_name !== room_name);
						member_list = [];
					}
				}
			});
			
			console.log(room_name + '방에서 ' + socket.user_id + '님 퇴장함 ' + socket.id);
			console.log(io.sockets.adapter.rooms);
			console.log(room_list);
			io.sockets.in(room_name).emit('new_join', member_list);
		});
		
		socket.on('everybody', function(msg){
			json_data = JSON.parse(msg);
			console.log('방: ' + room_name + ', 보낸이: ' + socket.user_id + ', 내용: ' + json_data.content + ' ' + socket.id);
			// io.emit('everybody', '{"user_id":"' + json_data.user_id + '", "content":"' + json_data.content + '"}');
			io.sockets.in(room_name).emit('receive', '{"user_id":"' + socket.user_id + '", "content":"' + json_data.content + '", "user_img":"' + json_data.user_img + '"}');
		});
		
		socket.on('whisper', function(msg){
			json_data = JSON.parse(msg);
			console.log('방: ' + room_name + ', 보낸이: ' + socket.user_id + ', 내용: ' + json_data.content + ' ' + socket.id + ', 받는이: ' + json_data.receiver_id + ', 받는소켓: ' + json_data.receiver_socket);
			io.sockets.in(json_data.receiver_socket).emit('receive', '{"user_id":"' + socket.user_id + '", "content":"' + json_data.content + '", "receiver_id":"'+json_data.receiver_id+'", "receiver_socket":"' + json_data.receiver_socket + '", "user_img":"' + json_data.user_img + '"}');
			io.sockets.in(socket.id).emit('receive', '{"user_id":"' + socket.user_id + '", "content":"' + json_data.content + '", "receiver_id":"'+json_data.receiver_id+'","receiver_socket":"'+ json_data.receiver_socket + '", "user_img":"' + json_data.user_img + '"}');
		});
	});

    return router;
}

// module.exports = router;

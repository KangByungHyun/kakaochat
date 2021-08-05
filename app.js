var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var mysql = require('mysql');
require('dotenv').config()

var app = express();
const ejs = require( "ejs" );
const bodyParser = require('body-parser')

const mysqlConnObj = require('./config/mysql');
const mysqlConn = mysqlConnObj.init();

app.io = require('socket.io')();

var indexRouter = require('./routes/index')(mysqlConn, path);
// var usersRouter = require('./routes/users');
// var authRouter = require('./routes/auth');
var chatRouter = require('./routes/chat')(mysqlConn, app.io);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set( "view engine", "ejs" );

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/auth', authRouter);
app.use('/chat', chatRouter);

 
/*** Socket.IO 추가 ***/
// app.io.on('connection', function(socket){
	// console.log('사용자 채팅 접속');
	
	// // socket.broadcast.emit('환영합니다.');
	
	// socket.on('disconnect', function(){
		// console.log('사용자 채팅 종료');
	// });
	
	// var room_name = null;
	// var user_id = null;
	// var room_list = [];
	
	// socket.on('join', function(data){
		// json_data = JSON.parse(data);
		// user_id = json_data.user_id;
		// room_name = json_data.room_name;

		// socket.join(room_name);
		// console.log(app.io.sockets.adapter.rooms);
		// console.log(room_name + '방에 ' + user_id + '님 입장함');
	// });
	
	// socket.on('list', function(){
		// console.log('list함수');
		
		// var list = app.io.sockets.adapter.rooms;
		
		// app.io.emit('list', list);
	// });
	
	// socket.on('leave', function(data){
		// json_data = JSON.parse(data);
		// user_id = json_data.user_id;
		// room_name = json_data.room_name;
		// socket.leave(room_name);
		
		// console.log(app.io.sockets.adapter.rooms);
		// console.log(room_name + '방에서 ' + user_id + '님 퇴장함');
	// });
	
	// socket.on('everybody', function(msg){
		// json_data = JSON.parse(msg);
		// console.log('방: ' + room_name + ', 보낸이: ' + json_data.user_id + ', 내용: ' + json_data.content);
		// // app.io.emit('everybody', '{"user_id":"' + json_data.user_id + '", "content":"' + json_data.content + '"}');
		// app.io.sockets.in(room_name).emit('everybody', '{"user_id":"' + json_data.user_id + '", "content":"' + json_data.content + '"}');
	// });
// });

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
	// next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	// res.locals.message = err.message;
	// res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	// res.status(err.status || 500);
	// res.render('error');
// });

module.exports = app;

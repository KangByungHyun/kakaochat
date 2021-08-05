module.exports = (mysqlConn, path) => {
	var express = require('express');
	var router = express.Router();
	const multer = require('multer');

	const upload = multer({
		storage: multer.diskStorage({
			destination: function (req, file, cb) {
				console.log('여까진옴');
				
				cb(null, 'public/images');
				// AWS S3 node.js upload 검색 (CLI)
				// CLI 
				},
				filename: function (req, file, cb) {
				cb(null, new Date().valueOf() + path.extname(file.originalname));
				console.log('여까진옴2');
				// cb(null, file.originalname);
			}
		}),
	});

	/* GET home page. */
	router.get('/', function(req, res, next) {
		if(req.cookies['user_id'] !== undefined){
			console.log("로그인 정보 있음");
			res.redirect('chat/rooms');
		}else{
			res.render('index');
		}
	});

	router.post('/', function(req, res, next) {
		console.log('로그인');
		const user = {
			'user_id': req.body.user_id,
			'user_pass': req.body.user_pass
		};

		let sql = 'SELECT user_id FROM user WHERE user_id = ? and user_pass = ?';
		let selectValArr = [user.user_id, user.user_pass];

		mysqlConn.query(sql, selectValArr, function (err, results) {
			if (err) throw err;

			if (results[0] === undefined) {
				console.log('로그인 실패');
				res.redirect('/');
			} else {
				console.log('로그인 성공');
				res.cookie('user_id', user.user_id);
				res.redirect('chat/rooms');
			}
		});
		
	});

	router.get('/signup', function(req, res, next) {
		console.log('회원가입');
		res.render('signup');
	});

	// router.post('/signup', function(req, res, next) {
	router.post('/signup', upload.single('img'), (req, res, next) => {
		console.log('회원가입 등록');
		console.log( req.file );
		console.log( __dirname + '/' );
		const user = {
			'user_id': req.body.user_id,
			'user_pass': req.body.user_pass,
			'user_img': req.file.filename
		};

		let sql = 'SELECT user_id FROM user WHERE user_id = ?';
		let selectValArr = [user.user_id];
		let insertValArr = [user.user_id, user.user_pass, user.user_img];
		
		mysqlConn.query(sql, selectValArr, function (err, results) {
			if (err) throw err;

			if (results[0] === undefined) { // 동일한 아이디가 없을 경우
				sql = "INSERT INTO user (user_id, user_pass, user_img) VALUES (?,?,?)";
				mysqlConn.query(sql, insertValArr, function (err, results){
					if(err) console.log(err)
					else {
						res.cookie('user_id', user.user_id);
						res.redirect('chat/rooms');
					}
				});
			} else {
				console.log('아이디 중복');
				res.redirect('signup');
			}
		});
	});

	return router;
}

// module.exports = router;

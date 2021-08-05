var express = require('express');
var router = express.Router();
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy;

passport.use('kakao', new KakaoStrategy({
	clientID: '1d067c865c3d780872761bbeb84c13f1',
	callbackURL: '/auth/kakao/callback',     // 위에서 설정한 Redirect URI
	}, async (accessToken, refreshToken, profile, done) => {
	console.log('-----profile-----');
	console.log(profile);
	console.log('-----accessToken-----');
	console.log(accessToken);
	console.log('-----refreshToken-----');
	console.log(refreshToken);
}))


router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
	failureRedirect: '/',
}), (res, req) => {
	console.log('-----res------');
	console.log('res');
	res.redirect('/chat/chats');
});
module.exports = router;

const express = require('express');
const User = require('./model/user');
const Topic = require('./model/topic');
const Comment = require('./model/comment')
const md5 = require('blueimp-md5');

const router = express();

//处理渲染页面首页请求
router.get('/', (req, res) => {
	//为页面添加标识证明 user
	req.app.locals.currentLink = 'user'
	Topic.find((err, data) => {
		if (err) {
			return res.end('Server Error');
		}
		//渲染首页数据条数以及 页码个数
		let PageCode = [];
		let length = Math.ceil(data.length / 8);
		for (var i = 1; i <= length; i++) {
			PageCode.push(i);
		}
		data = data.slice(0, 8);
		res.render('index.html', {
			user: req.session.user,
			topic: data,
			pageCode: PageCode
		});
	})
})

//处理首页 页码跳转请求
router.get('/page/choose', (req, res) => {
	const num = parseInt(req.query.num, 10);
	//一次页码跳转渲染八条数据
	const startNum = (num - 1) * 8;
	const endNum = startNum + 8;
	Topic.find((err, data) => {
		if (err) {
			return res.end('Server Error');
		}
		data = data.slice(startNum, endNum);
		res.json({ topic: data });
	})
})
var userSession = null
//处理用户注册请求 渲染用户注册页面
router.get('/register', (req, res) => {
	res.render('register.html');
})

//处理注册请求 根据表单擦护照数据库 保存数据渲染页面
router.post('/register', (req, res) => {
	let body = req.body;
	User.findOne({
		$or: [
			{
				email: body.email
			},
			{
				nickname: body.nickname
			}
		]
	}, (err, data) => {
		if (err) {
			return res.status(500).json({
				err_code: 500,
				message: '服务器发生错误'
			})
		}
		if (data) {
			return res.status(200).json({
				err_code: 1,
				message: '邮箱或密码已存在'
			})
		}
		body.password = md5(md5(body.password));
		new User(body).save((err, data) => {
			if (err) {
				return res.status(500).json({
					err_code: 500,
				})
			}
			req.session.user = data;
			userSession = req.session.user
			return res.status(200).json({
				err_code: 0,
			})
		})

	})
})

//渲染登陆页面
router.get('/login', (req, res) => {
	res.render('login.html');
})


//处理用户登录请求 以及状态判断
router.post('/login', (req, res) => {
	let body = req.body;
	body.password = md5(md5(body.password));
	User.findOne({
		email: body.email,
		password: body.password
	}, (err, data) => {
		if (err) {
			return res.status(500).json({
				err_code: 500,
				message: '服务器错误'
			})
		}
		if (!data) {
			return res.status(200).json({
				err_code: 1,
				message: '邮箱或密码错误'
			})
		}
		if(data.status == 2) {
			return res.status(200).json({
				err_code: 2,
				message: '该用户禁止登陆'
			})
		}
		req.session.user = data
		res.status(200).json({
			err_code: 0,
		})
	})
})
// 渲染 发布博客界面
router.get('/topics/new', (req, res) => {
	req.app.locals.currentLink = 'new'
	res.render('topic/new.html', {
		user: req.session.user
	});
})

//处理博客信息并将数据存入数据库 渲染主界面
router.post('/topics/new', (req, res) => {
	let body = req.body
	new Topic(body).save((err, data) => {
		if (err) {
			return res.status(500).send('server error')
		}
		res.redirect('/')
	})

})

var topicData = null
//渲染 博客详情界面
router.get('/topics/show', (req, res) => {
	Topic.findOne({ _id: req.query.id }, (err, data) => {
		if (err) {
			throw (err);
		}
		topicData = data
		res.render('topic/show.html', {
			topic: data,
			user: req.session.user
		})
	})
})

//我拿不到数据库里面的数据 不知道怎么解决  处理评论持久化
// router.post('/topic/show', (req, res) => {
// 	let body = req.body
// 	Comment.findOne({
// 		comment: body.comment
// 	}, (err, data) => {
// 		if (err) {
// 			res.status(500).send('server error')
// 		}
// 		if (data = null) {
// 			console.log(body);
// 			new Comment(body).save(err => {
// 				return res.status(500).send('server error')
// 			})
// 		}
// 		res.render('topic/show.html', {
// 			comment: body,
// 			user: req.session.user,
// 			topic: topicData
// 		})
// 	})
// })

// 渲染用户基本信息界面
router.get('/settings/profile', function (req, res) {
	req.app.locals.currentLink = 'profile'
	res.render('settings/profile.html', { user: req.session.user });
})

// 修改用户信息功能 ajax
router.post('/settings/profile', function (req, res) {
	var body = req.body;
	body.birthday = body.birthday + '';
	User.findByIdAndUpdate(req.session.user._id, body, function (err, data) {
		if (err) {
			return res.json({
				err_code: 500
			})
		}
		req.session.user = data;
		res.json({
			err_code: 0
		})
	})
})

//渲染用户 admin界面  修改密码功能未完善
router.get('/settings/admin', (req, res) => {
	res.app.locals.currentLink = 'admin'
	res.status(200).render('settings/admin.html', {
		user: req.session.user
	})
})

//处理 admin界面下 永久删除账号按钮
router.get('/delete', (req, res) => {
	User.deleteOne({ _id: req.session.user._id }, (err, data) => {
		if (err) {
			res.status(500).send('server error')
		}
		req.session.user = null;
		res.redirect('/')
	})
})

//在主界面下  处理账号注销功能
router.get('/logout', (req, res) => {
	req.session.user = null;
	res.redirect('/');
})

//渲染管理员登陆界面
router.get('/settings/login', (req, res) => {
	res.render('adminlogin.html')
})

//渲染博客用户管理界面
router.get('/user', (req, res) => {
	User.find((err, data) => {
		if (err) {
			return res.status(500).send('server error')
		}
		res.render('user.html', {
			user: req.session.user,
			users: data,
		})
	})
})

//在adminlogin页面下 处理管理员登陆功能
router.post('/settings/login', (req, res) => {
	let body = req.body;
	body.password = md5(md5(body.password));
	User.findOne({
		email: body.email,
		password: body.password
	}, (err, data) => {
		if (err) {
			return res.status(500).json({
				err_code: 500,
				message: '服务器错误'
			})
		}
		if (!data) {
			return res.status(200).json({
				err_code: 1,
				message: '邮箱或密码错误'
			})
		}
		req.session.user = data
		res.status(200).json({
			err_code: 0,
		})
	})
})

//渲染 用户信息编辑界面
router.get('/user/edit', (req, res) => {
	User.findById({ _id: req.query.id }, (err, data) => {
		if (err) {
			return res.status(500).send('server error')
		}
		res.status(200).render('settings/edit.html', {
			users: data,
			user: req.session.user
		})
	})
})


// 在user 页面下 处理用户信息修改更新功能
router.post('/user/edit', (req, res) => {
	let body = req.body
	console.log(body);
	User.findOneAndUpdate({ _id: body.id }, body, (err, data) => {
		if (err) {
			return res.status(500).send('server error')
		}
		res.status(200).json({
			err_code: 0
		})
	})
})

//在user 页面下 处理用户信息删除功能
router.get('/user/delete', (req, res) => {
	User.findByIdAndRemove({_id: req.query.id}, (err, data) =>{
		if(err) {
			return res.status(500).send('server error')
		}
		res.redirect('/user')
	})
})

module.exports = router;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test', {
	useNewUrlParser: true,
	useUnifiedTopology: true     //这个即是报的警告
}).then(res => {
	console.log('数据库连接成功')
})

var userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	nickname: {
		type: String,
		require: true
	},
	password: {
		type: String,
		required: true
	},
	created_time: {
		type: Date,
		dafault: Date.now
	},
	last_modified_time: {
		type: Date,
		default: Date.now
	},
	avatar: {
		type: String,
		dafault: '/public/img/avatar-default.png'
	},
	bio: {
		type: String,
		default: '这个人很懒，什么都没留下'
	},
	gender: {
		type: Number,
		enum: [-1, 0, 1],
		default: -1
	},
	birthday: {
		type: String
	},
	status: {
		type: Number,
		// 0 没有权限限制
		// 1 不可以登录
		// 2 不可评论
		enum: [0, 1, 2],
		default: 0
	}
})

module.exports = mongoose.model('User', userSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true     //这个即是报的警告s
  }).then(res => {
    console.log('数据库连接成功')
  })

var topicSchema = new Schema({
	title:{
		type:String,
		default:'',
		required: true
	},
	article:{
		type:String,
		default:'',
		required: true
	},
	userId:{
		type:String,
		required: true
	},
	type:{
		type:String
	},
})

module.exports = mongoose.model('Topic',topicSchema); 


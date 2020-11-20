const mongoose = require('mongoose')

const Scheam = mongoose.Schema

mongoose.connect('mongodb://localhost/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true     //这个即是报的警告s
}).then(res => {
  console.log('数据库连接成功')
})

var commentsScheam = new Scheam({
  comment: {
    type: String,
    default: '',
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Comment', commentsScheam);



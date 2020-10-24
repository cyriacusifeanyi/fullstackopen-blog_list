const mongoose = require('mongoose')
// let uniqueValidator = require('mongoose-unique-validator')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

// blogSchema.plugin(uniqueValidator)

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

blogSchema.query.byTitle = function (title) {
  return this.where({ name: new RegExp(title, 'i') })
}
blogSchema.query.byAuthor = function (author) {
  return this.where({ name: new RegExp(author, 'i') })
}

module.exports = mongoose.model('Blog', blogSchema)

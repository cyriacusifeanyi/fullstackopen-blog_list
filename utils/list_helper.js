
var _ = require('lodash')
// const blogsRouter = require("../controllers/blog")

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let totalLikes = 0
  blogs.filter((blog) => totalLikes += blog.likes)
  console.log(totalLikes)
  return totalLikes
}

const sortByKey = (array, key) => {
  return array.sort((a, b) => {
    let x = a[key]
    let y = b[key]
    return ((x < y) ? -1 : ((x > y) ? 1 : 0))
  })
}

const favoriteBlog = (blogs) => {
  let result = _.first(sortByKey(blogs, 'likes').reverse())
  result = {
    'title': result.title,
    'author': result.author,
    'likes': result.likes
  }
  return (result)
}


const mostBlogs = (blogs) => {

}

const mostLikes = (blogs) => {
  return blogs
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
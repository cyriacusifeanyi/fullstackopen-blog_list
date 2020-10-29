const Blog = require('../models/blog')

const initialBlogs = [
  {
    'title': 'apprentice to Start-Up',
    'author': 'Ifeanyi Cyriacus',
    'url': 'http://localhost:3003/api/blogs',
    'likes': 3,
  },
  {
    'title': 'Getting Real',
    'author': 'David Heinemeier Hansson',
    'url': 'https://basecamp.com/books/getting-real',
    'likes': 3
  },
  {
    'title': 'Hackers & Painters',
    'author': 'Paul Graham',
    'url': 'https://basecamp.com/books/getting-real',
    'likes': 3
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'The Wealth of Nation',
    author: 'Adam Smith',
    url: 'https://basecamp.com/books/getting-real',
    likes: 13
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}
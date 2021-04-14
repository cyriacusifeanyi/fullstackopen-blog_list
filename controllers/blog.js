const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// get all
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1, id: 1 })

  response.json(blogs.map(blog => blog.toJSON()))
})

// create one
blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())

})

// get by id
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', { username: 1, name: 1, id: 1 })

  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

// delete by id
blogsRouter.delete('/:id', async (request, response) => {

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }


  const userId = decodedToken.id
  const blog = await Blog.findById(request.params.id)
  console.log(blog.user.toString())
  console.log(userId.toString())

  if (blog.user.toString() === userId.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(403).end()//406 Not Acceptable
  }

})

// update by id
blogsRouter.put('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const userId = decodedToken.id
  const blog = await Blog.findById(request.params.id)
  const body = request.body

  if (blog.user.toString() === userId.toString()) {
    let blogObject = { 'title': null, 'author': null, 'url': null, 'likes': null }

    let labels = ['title', 'author', 'url', 'likes']
    for (let i = 0; i < labels.length; i++) {

      if ((body[labels[i]] !== null) && (body[labels[i]] !== undefined)) {//if not null
        blogObject[labels[i]] = body[labels[i]]
      } else {
        blogObject[labels[i]] = blog[labels[i]]
      }

    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogObject, { new: true })
    response.json(updatedBlog.toJSON())
    response.status(204).end()
  } else {
    response.status(403).end()//406 Not Acceptable
  }

})

// add comment to blogs by id
blogsRouter.post('/:id/comments', async (request, response) => {

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const body = request.body
  const blog = await Blog.findById(request.params.id) //current blog state

  let blogObject = {
    'title': blog['title'],
    'author': blog['author'],
    'url': blog['url'],
    'likes': blog['likes'],
    'comments': [
      ...blog.comments,
      body.comment
    ]
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogObject, { new: true })
  response.json(updatedBlog.toJSON())
  response.status(204).end()
})

module.exports = blogsRouter
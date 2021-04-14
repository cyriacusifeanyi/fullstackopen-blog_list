const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// get all
usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate('blogs', { title: 1, url: 1, author: 1, id: 1 })

  response.json(users.map(user => user.toJSON()))
})

// get by id
usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
    .populate('blogs', { title: 1, url: 1, author: 1, id: 1 })

  if (user) {
    response.json(user.toJSON())
    console.log(user.toJSON())
  } else {
    response.status(404).end()
  }
})

// create one
usersRouter.post('/', async (request, response) => {
  const body = request.body
  if (body.username.length < 3) {
    return response.status(400).json({
      error: `User validation failed: username:
       Path 'username' ('${body.username}') is shorter than the minimum allowed length (3).`
    })
  } else if ((body.password).length < 3) {
    return response.status(400).json({
      error: `User validation failed: password:
       Path 'password' ('${body.password}') is shorter than the minimum allowed length (3).`
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.json(savedUser.toJSON())

})

module.exports = usersRouter
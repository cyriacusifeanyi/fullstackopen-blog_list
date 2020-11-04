// const bcrypt = require('bcrypt')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./user_test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

jest.setTimeout(50000)
describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User(
      {
        username: 'root',
        name: 'superAdmin',
        password: 'sekret'
      })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  // not yet checkeds
  test('invalid users are not created', async () => {
    const usersAtStart = await helper.usersInDb()

    let newUsers = [{
      username: '',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }, {
      username: 'mluukkai1',
      name: '',
      password: 'salainen',
    }, {
      username: 'mluukkai2',
      name: 'Matti Luukkainen',
      password: '',
    }, {
      username: 'ml',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }, {
      username: 'mluukkai3',
      name: 'Matti Luukkainen',
      password: 'sa',
    },]

    newUsers.forEach(async user => {
      user = new User(user)
      await user.save()
    })

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map(u => u.username)
    newUsers.forEach(user => {
      expect(usernames).not.toContain(user.username)
    })
  })

})


afterAll(() => {
  mongoose.connection.close()
})
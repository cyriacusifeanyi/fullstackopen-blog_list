const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObject = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObject
    .map(blog => blog.save())

  // The Promise.all method can be used for
  // transforming an array of promises into
  // a single promise, that will be fulfilled
  // once every promise in the array passed to
  // it as a parameter is resolved
  await Promise.all(promiseArray)
})

jest.setTimeout(10000)

// 4.8: Blog list tests, step1
describe('correct amount of blog posts in the JSON format', () => {

  test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body)
      .toHaveLength(helper.initialBlogs.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain(helper.initialBlogs[0].title)
  })

})

// 4.9*: Blog list tests, step2
test('verifies that the unique identifier property of the blog posts is named id', async () => {
  const response = await (await api.get('/api/blogs')).body
  expect(response[0].id).toBeDefined()
})

describe('addition of new blog', () => {
  // 4.10: Blog list tests, step3
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Intelligent Investor',
      author: 'Benjamin Graham',
      url: 'http://localhost:3003/api/blogs',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    // verify that the total number of blogs in the system is increased by one
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    // verify that the content of the blog post is saved correctly to the database
    expect(titles).toContain(
      'Intelligent Investor'
    )
  })

  // 4.11*: Blog list tests, step4
  test('if a blog omitts a non-required property (likes) it still gets added', async () => {
    const newBlog = {
      'title': 'Focklore',
      'author': 'Taylor Swift',
      'url': 'http://localhost:3003/api/blogs',
      // 'likes': 5,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('Focklore')
  })

  // 4.12*: Blog list tests, step5
  test('if a blog ommits a required properties (title, author or url) it doesn\'t get added', async () => {
    const newBlog = {
      title: 'The Wealth of Nation',
      // author: 'Adam Smith',
      // url: 'https://basecamp.com/books/getting-real',
      likes: 13
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain('The Wealth of Nation')
  })
})

// 4.13 Blog list expansions, step1
describe('deletion of blog', () => {
  test('succedes with status code (204), if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const ids = blogsAtEnd.map(r => r.id)
    expect(ids).not.toContain(blogToDelete.id)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    console.log('hello :', validNonexistingId)

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .expect(204)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '9a3d4da59070081a82a3445'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

// 4.14 Blog list expansions, step2
describe('updating of blog', () => {
  const updatedBlog = {
    author: 'Taylor Swift',
    url: 'http://shakeitof.com',
  }

  test('succedes if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .put(`/api/blogs/${blogToView.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).not.toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    console.log(validNonexistingId)

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedBlog)
      .expect(500)//Internal Server Error
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '9a3d4da59070081a82a3445'

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(updatedBlog)
      .expect(400)//Bad Request
  })

})


afterAll(() => {
  mongoose.connection.close()
})
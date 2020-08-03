/* eslint-disable no-undef */
const pollsRouter = require('express').Router()
const Poll = require('../models/poll')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

pollsRouter.get('/', async (request, response) => {
  const notes = await Poll.find({}).populate('user')
  response.json(notes.map(note => note.toJSON()))
})

pollsRouter.post('/', async (request, response) => {
  const body = request.body

  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const poll = new Poll({
    question: body.question,
    options: body.options,
    allowCustomOption: body.allowCustomOption,
    privatePoll: body.privatePoll,
    user: user._id
  })

  const savedPoll = await poll.save()
  user.polls = user.polls.concat(savedPoll._id)
  await user.save()
  response.json(savedPoll.toJSON())
})

pollsRouter.get('/:id', async (request, response) => {
  const poll = await Poll.findById(request.params.id)
  if (poll) {
    response.json(poll.toJSON())
  } else {
    response.status(404).end()
  }
})

pollsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const poll = {
    question: body.question,
    options: body.options
  }

  Poll.findByIdAndUpdate(request.params.id, poll, { new: true })
    .then(updatedPoll => {
      response.json(updatedPoll.toJSON())
    })
    .catch(error => next(error))
})

pollsRouter.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    const pollToDelete = await Poll.findById(id)
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!pollToDelete) {
      return res.status(400).json({ error: 'no poll found with the id ' + id })
    }
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'missing or invalid token' })
    } else if (pollToDelete.user.toString() !== decodedToken.id) {
      return res.status(401).json({ error: `not authorized decodedToken: ${decodedToken}, polltodeleteuser: ${pollToDelete.user.id.toString()}` })
    } else {
      const deletedPoll = await Poll.findByIdAndRemove(id)
      res.json(deletedPoll.toJSON())
    }

  } catch (exception) {
    next(exception)
  }
})

module.exports = pollsRouter
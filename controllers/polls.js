const pollsRouter = require('express').Router()
const Poll = require('../models/poll')
const User = require('../models/user')

pollsRouter.get('/', async (request, response) => {
  const notes = await Poll.find({}).populate('user')
  response.json(notes.map(note => note.toJSON()))
})

pollsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.userId)

  const poll = new Poll({
    question: body.question,
    options: body.options,
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

pollsRouter.delete('/:id', async (request, response) => {
  await Poll.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = pollsRouter
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
require('dotenv').config()
const Poll = require('./models/poll')

const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const pollSchema = new mongoose.Schema({
    question: String,
    options: Object,
})

let polls = [
    {
        id: 1,
        question: "Your favourite programmin language?",
        options: { 1: { option: "Java", votes: 1 }, 2: { option: "Javascript", votes: 3 }, 3: { option: "C++", votes: 1 }, 4: { option: "C", votes: 0 }, 5: { option: "Python", votes: 0 } }
    },
    {
        id: 2,
        question: "How are you today?",
        options: { 1: { option: "Fine", votes: 0 }, 2: { option: "Not so good", votes: 0 }, 3: { option: "OK", votes: 0 }, 5: { option: "Great!", votes: 0 } }
    }
]

app.get('/api/polls', (request, response) => {
    Poll.find({}).then(polls => {
        response.json(polls)
    })
})

app.get('/api/polls/:id', (request, response, next) => {
    Poll.findById(request.params.id).then(poll => {
        if (poll) {
            response.json(poll)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

app.delete('/api/polls/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/polls', (request, response) => {
    const body = request.body

    if (!body.question) {
        return response.status(400).json({
            error: 'question missing'
        })
    }

    if (!body.options) {
        return response.status(400).json({
            error: 'options missing'
        })
    }

    const poll = new Poll({
        question: body.question,
        options: body.options
    })

    poll.save().then(savedPoll => {
        response.json(savedPoll)
    })
})

app.put('/api/polls/:id', (request, response, next) => {
    const body = request.body

    const poll = {
        question: body.question,
        options: body.options,
    }

    Poll.findByIdAndUpdate(request.params.id, poll, { new: true })
        .then(updatedPoll => {
            response.json(updatedPoll)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
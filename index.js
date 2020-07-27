const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))

let polls = [
    {
        id: 1,
        question: "Your favourite programmin language?",
        options: {1: "Java", 2: "Javascript", 3: "C++", 4: "C", 5: "Python"}
    },
    {
        id: 2,
        question: "How are you today?",
        options: {1: "Fine", 2: "Not so good", 3: "OK", 4: "C", 5: "Great!"}
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/polls', (req, res) => {
    res.json(polls)
})

app.get('/api/polls/:id', (request, response) => {
    const id = Number(request.params.id)
    const poll = polls.find(poll => poll.id === id)
    if (poll) {
        response.json(poll)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/polls/:id', (request, response) => {
    const id = Number(request.params.id)
    polls = polls.filter(poll => poll.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = polls.length > 0
        ? Math.max(...polls.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/polls', (request, response) => {
    const body = request.body

    if (!body.question) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (!body.options) {
        return response.status(400).json({
            error: 'options missing'
        })
    }

    const poll = {
        question: body.question,
        options: body.options,
        date: new Date(),
        id: generateId(),
    }

    polls = polls.concat(poll)

    response.json(poll)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
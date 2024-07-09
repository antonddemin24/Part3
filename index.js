require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

// const password = '2R9EmpfTj7JvpOm9'

// const url =
//   `mongodb+srv://antlinkx:${password}@cluster0.mvrbyhe.mongodb.net/?retryWrites=true&w=majority`

// mongoose.set('strictQuery',false)
// mongoose.connect(url)

// const noteSchema = new mongoose.Schema({
//     name: String,
//     number: String,
//   })

// noteSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString()
//         delete returnedObject._id
//         delete returnedObject.__v
//     }
// })

// const Person = mongoose.model('Person', noteSchema)

const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('req-body', (req, res) => JSON.stringify(req.body))
const morganFormat = ':method :url :status :res[content-length] - :response-time ms :req-body'

// Use the custom Morgan format
app.use(morgan(morganFormat))

let persons = [
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/info', (request, response) => {
  const now = new Date()
  const numEntries = persons.length
  const message = `Phonebook has info for ${numEntries} people<br><br>${now}`

  response.send(`<p>${message}</p>`)
})

app.get('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id);
  // const person = persons.find(p => p.id === id);

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end();
  // }
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.delete('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id);
  // phonebook = persons.filter(p => p.id !== id);
  // response.status(204).end();
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  // const body = request.body;
  // console.log(request.body)

  // if (!body.name || !body.number) {
  //   return response.status(400).json({
  //     error: 'name or phone number missing'
  //   });
  // }

  // const personExists = persons.find(p => p.name === body.name);
  // if (personExists) {
  //     return response.status(400).json({
  //         error: 'name must be unique'
  //     });
  // }

  // const id = Math.floor(Math.random() * 1000000);
  // const person = { id, name: body.name, phone: body.number };
  // phonebook = persons.concat(person);

  // response.json(person);
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or phone number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.content,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(errorHandler)
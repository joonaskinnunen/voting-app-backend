const mongoose = require('mongoose')

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    minlength: 5,
    required: true
  },
  options: {
    type: Object,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  allowCustomOption: {
    type: Boolean,
  },
  privatePoll: {
    type: Boolean,
  }
})

pollSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Poll', pollSchema)
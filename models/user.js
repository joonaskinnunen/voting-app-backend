const mongoose = require('mongoose')
// eslint-disable-next-line no-unused-vars
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    minlength: 5
  },
  passwordHash: String,
  polls: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
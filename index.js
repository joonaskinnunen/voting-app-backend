const app = require('./App')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
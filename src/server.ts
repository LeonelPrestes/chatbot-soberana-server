import { app } from './app.js'

app
  .listen({
    port: 8081,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:8081')
  })

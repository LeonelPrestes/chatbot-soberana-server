import { app } from './app.js'
import { env } from './env/env.js'

let shuttingDown = false
async function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  app.log.info({ signal }, 'Encerrando servidor')
  try {
    await app.close()
  } catch (error) {
    app.log.error({ err: error }, 'Falha ao encerrar servidor')
    process.exitCode = 1
  }
}

process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
} catch (error) {
  app.log.error({ err: error }, 'Falha ao iniciar servidor')
  process.exitCode = 1
  await app.close()
}

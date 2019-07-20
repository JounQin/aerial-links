import 'signale'

declare module 'signale' {
  type LogLevel = 'info' | 'timer' | 'debug' | 'warn' | 'error'

  interface SignaleOptions {
    logLevel?: LogLevel
  }

  interface SignaleBase {
    _generalLogLevel?: LogLevel
  }
}

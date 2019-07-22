import { Signale } from 'signale'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const pkg = require('../package.json')

export const logger = new Signale({
  scope: pkg.name,
  logLevel: 'warn',
})

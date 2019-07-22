#! /usr/bin/env node

import _program, { CommanderStatic } from 'commander'

import { logger, pkg } from '.'

export interface Options {
  debug?: boolean
}

const program: CommanderStatic & Options = _program

program
  .version(pkg.version)
  .option('-d, --debug', 'output debugging logs')
  .parse(process.argv)

if (program.debug) {
  logger.logLevel = 'debug'
}

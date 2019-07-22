#! /usr/bin/env node

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { write } from 'clipboardy'
import _program, { CommanderStatic } from 'commander'

import {
  Options,
  VALID_TYPES_TIP,
  debug,
  debugNs,
  forceDebug,
  getAerialLinks,
} from '.'

import _debug from 'debug'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json')

export interface CliOptions extends Options {
  debug?: boolean
  file?: string
  json?: boolean
  noCopy?: boolean
}

const writeFile = promisify(fs.writeFile)
const copy = promisify(write)
const program: CommanderStatic & CliOptions = _program

program
  .version(version)
  .option('-d, --debug', 'output debugging logs')
  .option('-e, --exclude', 'exclude existed files')
  .option('-t, --type <type>', VALID_TYPES_TIP, 'all')
  .option('-j, --json', 'output json format')
  .option('-n, --no-copy', 'do not copy to clipboard')
  .option('-p, --cache-path', 'custom aerial cache path to read `entries.json`')
  .option(
    '-f, --file <path>',
    'filename to export the content, default to print directly',
  )
  .parse(process.argv)

if (program.debug) {
  _debug.enable(debugNs)
}

export const newLine = (content: string) => '\n' + content

const { exclude, file, json, noCopy, type, cachePath } = program

const main = async () => {
  const links = await getAerialLinks({ type, exclude, cachePath })

  const plainOutput = links.join('\n')
  const output = json ? JSON.stringify(json) : plainOutput

  debug('links to be exported: %s', newLine(plainOutput))

  if (file) {
    const outputPath = path.isAbsolute(file) ? file : path.resolve(file)
    debug('output path: %s', outputPath)
    await writeFile(outputPath, output)
  } else {
    forceDebug('%s', newLine(output))
  }

  if (!noCopy) {
    copy(output)
    forceDebug('copied to clipboard')
  }
}

main()

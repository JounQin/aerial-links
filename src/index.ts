import fs from 'fs'
import path from 'path'
import { userInfo } from 'os'
import { promisify } from 'util'

import signale, { Signale } from 'signale'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const pkg = require('../package.json')

export const logger = new Signale({
  scope: pkg.name,
  logLevel: 'warn',
})

export const info = signale.scope(pkg.name).info

const access = promisify(fs.access)
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

const USER_NAME = userInfo().username
const CACHE_PATHS = [
  `/Users/${USER_NAME}/Library/Application Support/Aerial`,
  `/Users/${USER_NAME}/Library/Containers/com.apple.ScreenSaver.Engine.legacyScreenSaver/Data/Library/Application Support/Aerial`,
]
const ENTRIES_JSON = 'entries.json'

export const EXPORT_TYPES = [
  'all',
  'url-1080-H264',
  'url-1080-HDR',
  'url-1080-SDR',
  'url-4K-HDR',
  'url-4K-SDR',
] as const

export type ExportType = (typeof EXPORT_TYPES)[number]

export type EntryAsset = {
  accessibilityLabel: string
  id: string
  pointsOfInterest: Record<string, string>
} & Record<Exclude<ExportType, 'all'>, string>

export interface Entries {
  assets: EntryAsset[]
  initialAssetCount: number
  version: number
}

export interface Options {
  type?: ExportType
  exclude?: boolean
  cachePath?: string
}

export const VALID_TYPES_TIP = `export video type, valid types: ${EXPORT_TYPES.join(
  ', ',
)}`

export const INVALID_TYPES_TIP = 'Invalid ' + VALID_TYPES_TIP

export async function getAerialLinks({
  type = 'all',
  exclude = false,
  cachePath,
}: Options) {
  let filePath!: string

  if (cachePath) {
    try {
      filePath = path.resolve(cachePath, ENTRIES_JSON)
      await access(filePath)
    } catch (e) {
      logger.warn(`file: ${filePath} is not found, fallback to default path`)
      cachePath = ''
    }
  }

  for (const p of CACHE_PATHS) {
    filePath = path.resolve(p, ENTRIES_JSON)
    try {
      await access(filePath)
      cachePath = p
      break
    } catch (e) {
      continue
    }
  }

  if (!cachePath) {
    logger.warn(
      'Please make sure Aerial has been installed correctly, you can try `brew cask install jounqin/x/aerial-beta`',
    )
    return []
  }

  try {
    await access(filePath)
  } catch (e) {
    logger.warn(
      'Please make sure Aerial has been installed correctly, you can try `brew cask install jounqin/x/aerial-beta`',
    )
    return []
  }

  const { assets }: Entries = JSON.parse((await readFile(filePath)).toString())
  const files = exclude ? await readDir(cachePath) : []
  return assets.reduce<string[]>((links, asset) => {
    let toAddLinks: string[]
    switch (type) {
      case 'all':
        toAddLinks = [
          asset['url-1080-H264'],
          asset['url-1080-HDR'],
          asset['url-1080-SDR'],
          asset['url-4K-HDR'],
          asset['url-4K-SDR'],
        ]
        break
      default: {
        if (type && type in asset) {
          toAddLinks = [asset[type]]
        } else {
          throw new TypeError(INVALID_TYPES_TIP)
        }
      }
    }

    if (!exclude) {
      links.push(...toAddLinks)
    }

    const pureLinks: string[] = []
    toAddLinks.forEach(link => {
      if (
        files.some((file, index) => {
          const matched = link.endsWith('/' + file)
          if (matched) {
            files.splice(index, 1)
          }
          return matched
        })
      ) {
        return
      }
      pureLinks.push(link)
    })
    links.push(...pureLinks)
    return links
  }, [])
}

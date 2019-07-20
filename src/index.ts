import fs from 'fs'
import path from 'path'
import { userInfo } from 'os'
import { promisify } from 'util'

import _debug, { Debugger } from 'debug'

export const debug = _debug('aerial-links:')
export const debugNs = debug.namespace
const access = promisify(fs.access)
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

const USER_NAME = userInfo().username
const CACHE_PATH = `/Users/${USER_NAME}/Library/Containers/com.apple.ScreenSaver.Engine.legacyScreenSaver/Data/Library/Application Support/Aerial`
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

export const VALID_TYPES_TIP = `export video type, valid types: ${EXPORT_TYPES.join(
  ', ',
)}`

export const INVALID_TYPES_TIP = 'Invalid ' + VALID_TYPES_TIP

const debugEnabled = debug.enabled

// @ts-ignore
export const forceDebug: Debugger = (...args) => {
  if (!debugEnabled) {
    _debug.enable(debugNs)
  }

  debug(...args)

  if (!debugEnabled) {
    _debug.disable()
  }
}

export async function getAerialLinks(
  exportType: ExportType = 'all',
  exclude = false,
) {
  const filePath = path.join(CACHE_PATH, ENTRIES_JSON)

  try {
    await access(filePath)
  } catch (e) {
    forceDebug(
      'warning: %s',
      'Please make sure Aerial has been installed correctly, you can try `brew cask install jounqin/x/aerial-beta`',
    )
    return []
  }

  const { assets }: Entries = JSON.parse((await readFile(filePath)).toString())
  const files = exclude ? await readDir(CACHE_PATH) : []
  return assets.reduce<string[]>((links, asset) => {
    let toAddLinks: string[]
    switch (exportType) {
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
        if (exportType && exportType in asset) {
          toAddLinks = [asset[exportType]]
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

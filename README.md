# aerial-links

[![Travis](https://img.shields.io/travis/com/JounQin/aerial-links.svg)](https://travis-ci.com/JounQin/aerial-links)
[![David](https://img.shields.io/david/JounQin/aerial-links.svg)](https://david-dm.org/JounQin/aerial-links)
[![David Dev](https://img.shields.io/david/dev/JounQin/aerial-links.svg)](https://david-dm.org/JounQin/aerial-links?type=dev)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Get all Aerial video links automatically from its `entries.json`.

## Install

```sh
# yarn
yarn global add aerial-links

# npm
npm i -g aerial-links
```

## Usage

```sh
Usage: aerial-links [options]

Options:
  -V, --version      output the version number
  -d, --debug        output debugging logs
  -e, --exclude      exclude existed files
  -t, --type <type>  export video type, valid types: all, url-1080-H264, url-1080-HDR, url-1080-SDR, url-4K-HDR, url-4K-SDR (default: "all")
  -j, --json         output json format
  -n, --no-copy      do not copy to clipboard
  -f, --file <path>  filename to export the content, default to print directly
  -h, --help         output usage information
```

## JS API

```js
import { getAerialLinks } from 'aerial-links'

const links = await getAerialLinks(
  (exportType: ExportType = 'all'),
  (exclude = false),
)
```

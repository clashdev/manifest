import type { FileInfo, Manifest, Release } from './types.js'
import { getReleaseList } from './utils.js'

export async function getManifest(): Promise<Manifest> {
  const releases = await getReleaseList('pymumu', 'smartdns')
  return releases.map((release): Release => {
    const files = release.assets
      .filter((asset) => asset.name.startsWith('smartdns-'))
      .map((asset): FileInfo => {
        const matched = /^smartdns-(?<arch>\w+)$/.exec(asset.name)
        return {
          name: asset.name,
          platform: `linux/${getArch(matched?.groups?.arch ?? 'unknown')}`,
          url: asset.browser_download_url,
        }
      })
    return {
      name: release.name || release.tag_name,
      version: getVersion(release.tag_name),
      unstable: release.draft || release.prerelease,
      release_url: release.html_url,
      created_at: release.created_at,
      files,
    }
  })
}

function getArch(name: string) {
  if (name === 'aarch64') {
    return 'arm64'
  } else if (name === 'x86') {
    return '386'
  } else if (name === 'x86_64') {
    return 'amd64'
  }
  return name
}

function getVersion(tag: string) {
  return tag
    .replace(/^Release(\d+)$/, '0.$1.0')
    .replace(/^Release(\d+\.\d+)$/, '0.$1')
    .replace(/^Release(\d+)-RC(\d+)$/, '0.$1.0-rc$2')
    .replace(/^Release(\d+\.\d+)-RC(\d+)$/, '0.$1-rc$2')
}

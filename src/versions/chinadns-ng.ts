import type { FileInfo, Manifest, Release } from './types.js'
import { getReleaseList } from './utils.js'

const mapping: Record<string, string> = {
  'aarch64': 'arm64',
  'aarch64_be': 'arm64be',
  'x86_64': 'amd64',
  'x86_64-x32': '386',
}

export async function getManifest(): Promise<Manifest> {
  const releases = await getReleaseList('zfl9', 'chinadns-ng')
  return releases.map((release): Release => {
    const files = release.assets
      .filter((asset) => asset.name.startsWith('chinadns-ng-'))
      .map((asset): FileInfo => {
        return {
          name: asset.name,
          platform: `linux/${getArch(asset.name)}`,
          url: asset.browser_download_url,
        }
      })
    return {
      name: release.name || release.tag_name,
      version: release.tag_name,
      unstable: release.draft || release.prerelease,
      release_url: release.html_url,
      created_at: release.created_at,
      files,
    }
  })
}

function getArch(name: string) {
  const arch = name.replace(/^chinadns-ng-/, '')
  return mapping[arch] ?? arch
}

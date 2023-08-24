import type { FileInfo, Manifest, Release } from './types.js'
import { getReleaseList } from './utils.js'

const mapping: Record<string, [os: string, arch: string]> = {
  aarch64: ['linux', 'arm64'],
  arm: ['linux', 'arm'],
  armv7: ['linux', 'armv7'],
  armhf: ['linux', 'armhf'],
  darwin64: ['darwin', 'amd64'],
  linux32: ['linux', '386'],
  linux64: ['linux', 'amd64'],
  mipsel: ['linux', 'mipsel'],
  win32: ['windows', '386'],
  win64: ['windows', 'amd64'],
}

export async function getManifest(): Promise<Manifest> {
  const releases = await getReleaseList('tindy2013', 'subconverter')
  return releases.map((release): Release => {
    const files = release.assets
      .filter((asset) => asset.name.startsWith('subconverter_'))
      .map((asset): FileInfo => {
        let matched: RegExpExecArray | null
        let os = 'unknown'
        let arch = 'unknown'
        if (asset.name.includes('mipsel')) {
          os = 'linux'
          arch = 'mips'
        } else if ((matched = /^subconverter_(?<arch>\w+)/.exec(asset.name))) {
          ;[os, arch] = mapping[matched.groups!.arch]
        }
        return {
          name: asset.name,
          platform: `${os}/${arch}`,
          url: asset.browser_download_url,
        }
      })
    return {
      name: release.name || release.tag_name,
      version: release.tag_name.replace(/^v/, ''),
      unstable: release.draft || release.prerelease,
      release_url: release.html_url,
      created_at: release.created_at,
      files,
    }
  })
}

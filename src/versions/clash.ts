import type { FileInfo, Manifest, Release } from './types.js'
import { getReleaseList } from './utils.js'

const mapping: Record<string, string> = {
  win64: 'windows',
  macos: 'darwin',
}

export async function getManifest(): Promise<Manifest> {
  const releases = await getReleaseList('Dreamacro', 'clash')
  return releases.map((release): Release => {
    const files = release.assets
      .filter((asset) => asset.name.startsWith('clash-'))
      .map((asset): FileInfo => {
        let matched: RegExpExecArray | null
        let os = 'unknown'
        let arch = 'unknown'
        if ((matched = /^clash-(?<os>\w+)-(?<arch>\w+)/.exec(asset.name))) {
          os = matched.groups!.os
          arch = matched.groups!.arch
        } else if ((matched = /^clash-(?<os>\w+)/.exec(asset.name))) {
          arch = 'amd64'
          os = mapping[matched[1]] ?? matched[1]
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

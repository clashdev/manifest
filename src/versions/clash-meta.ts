import type { FileInfo, Manifest, Release } from './types.js'
import { getReleaseList } from './utils.js'

export async function getManifest(): Promise<Manifest> {
  const releases = await getReleaseList('MetaCubeX', 'Clash.Meta')
  return releases.map((release): Release => {
    const files = release.assets
      .filter((asset) => /^clash.meta-/i.test(asset.name))
      .map((asset): FileInfo => {
        const matched = /^clash.meta-(?<os>\w+)-(?<arch>\w+)/i.exec(asset.name)!
        const os = matched?.groups?.os ?? 'unknown'
        const arch = getArch(matched?.groups?.arch)
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

function getArch(arch: string | undefined) {
  if (arch === 'arm32') arch = 'arm'
  if (arch === undefined) return 'unknown'
  return arch
}

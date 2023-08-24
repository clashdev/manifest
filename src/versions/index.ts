import type { Manifest } from './types.js'
import { BASE_PATH, writeManifest } from './utils.js'
import { rm } from 'node:fs/promises'
import { getManifest as getChinaDNSManifest } from './chinadns-ng.js'
import { getManifest as getClashMetaManifest } from './clash-meta.js'
import { getManifest as getClashManifest } from './clash.js'
import { getManifest as getSmartDNSManifest } from './smartdns.js'
import { getManifest as getSubconverterManifest } from './subconverter.js'

const manifests: Record<string, () => Promise<Manifest>> = {
  'clash': getClashManifest,
  'clash-meta': getClashMetaManifest,
  'subconverter': getSubconverterManifest,
  'smartdns': getSmartDNSManifest,
  'chinadns-ng': getChinaDNSManifest,
}

async function main() {
  await rm(BASE_PATH, { recursive: true, force: true })
  for (const [name, getManifest] of Object.entries(manifests)) {
    console.time(name)
    const manifest = await getManifest()
    await writeManifest(manifest, name)
    console.timeEnd(name)
  }
}

main()

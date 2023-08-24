import { Octokit } from '@octokit/rest'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { format } from 'prettier'
import type { Manifest } from './types.js'

export const BASE_PATH = 'versions'

export const client = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function getReleaseList(owner: string, repo: string) {
  return client.paginate(client.repos.listReleases, { owner, repo })
}

export async function writeManifest(manifest: Manifest, name: string) {
  manifest = manifest
    .map((release) => {
      Reflect.set(release, 'created_at', new Date(release.created_at))
      if (release.unstable !== true) Reflect.deleteProperty(release, 'unstable')
      return release
    })
    .filter((release) => release.files.length > 0)
  await mkdir(BASE_PATH, { recursive: true })
  await writeFile(
    join(BASE_PATH, `${name}.json`),
    await format(JSON.stringify(manifest), { parser: 'json' }),
    'utf-8',
  )
}

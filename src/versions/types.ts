export type Manifest = readonly Release[]

export interface Release {
  readonly name: string
  readonly version: string
  readonly unstable?: boolean
  readonly release_url: string
  readonly created_at: Date | string
  readonly files: readonly FileInfo[]
}

export interface FileInfo {
  readonly name: string
  readonly platform: string
  readonly url: string
}

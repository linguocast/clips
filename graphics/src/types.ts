export interface Dictionary {
  base: string
  pronunciation?: string
  also?: string[]
  translation: string
  // image: string
}

export interface Media {
  source: string
  start: number
  startAt?: number
  position?: number
}

export type Language = 'chinese' | 'spanish' | 'italian'
export type Variant = 'traditional' | 'simplified' | null
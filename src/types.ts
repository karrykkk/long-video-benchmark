export type Level = 'clip' | 'transition' | 'global'

export interface BenchmarkDimension {
  id: string
  level: Level
  parentCode: string
  parentName: string
  code: string
  name: string
  definition: string
  scoringPoints: string[]
  errorTypes: string[]
  updatedAt: number
}

export interface LevelMeta {
  label: string
  shortLabel: string
  description: string
  color: string
}

export const levelMeta: Record<Level, LevelMeta> = {
  clip: {
    label: '片段级 Clip-level',
    shortLabel: '片段级',
    description: '单镜头或单片段内的画面、声音、运动、视听质量与用户意图遵循能力',
    color: '#5872e8',
  },
  transition: {
    label: '过渡级 Transition-level',
    shortLabel: '过渡级',
    description: '仅评估两个直接相邻片段之间的衔接；非相邻片段关系归入全局级',
    color: '#8a5bd9',
  },
  global: {
    label: '全局级 Global-level',
    shortLabel: '全局级',
    description: '完整长视频的叙事、记忆与目标完成能力',
    color: '#28a06b',
  },
}

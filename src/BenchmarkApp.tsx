import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import './BenchmarkApp.css'
import { INITIAL_DIMENSIONS } from './data'
import { levelMeta, type BenchmarkDimension, type Level } from './types'

const STORAGE_KEY = 'long-video-benchmark-rubric-v23'
const LEGACY_STORAGE_KEYS = [
  'long-video-benchmark-rubric-v22',
  'long-video-benchmark-rubric-v21',
  'long-video-benchmark-rubric-v20',
  'long-video-benchmark-rubric-v19',
  'long-video-benchmark-rubric-v18',
  'long-video-benchmark-rubric-v17',
  'long-video-benchmark-rubric-v16',
  'long-video-benchmark-rubric-v15',
  'long-video-benchmark-rubric-v14',
  'long-video-benchmark-rubric-v13',
  'long-video-benchmark-rubric-v12',
  'long-video-benchmark-rubric-v11',
  'long-video-benchmark-rubric-v10',
  'long-video-benchmark-rubric-v9',
  'long-video-benchmark-rubric-v8',
  'long-video-benchmark-rubric-v7',
  'long-video-benchmark-rubric-v6',
  'long-video-benchmark-rubric-v5',
  'long-video-benchmark-rubric-v4',
  'long-video-benchmark-rubric-v3',
  'long-video-benchmark-rubric-v2',
  'long-video-benchmark-rubric-v1',
]

type IconName =
  | 'search'
  | 'plus'
  | 'download'
  | 'upload'
  | 'grid'
  | 'edit'
  | 'trash'
  | 'close'
  | 'chevron'
  | 'reset'
  | 'check'

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="6.8" />
        <path d="m16 16 4.3 4.3" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
        <path d="M4 20h16" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
        <path d="M4 20h16" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    edit: (
      <>
        <path d="m14.5 5.5 4 4" />
        <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 3h6l1 4H8l1-4Z" />
        <path d="m6.5 7 .8 14h9.4l.8-14M10 11v6M14 11v6" />
      </>
    ),
    close: (
      <>
        <path d="m5 5 14 14" />
        <path d="M19 5 5 19" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    reset: (
      <>
        <path d="M4 9V4h5" />
        <path d="M5.5 6.5a8 8 0 1 1-1.2 7" />
      </>
    ),
    check: <path d="m5 12 4.5 4.5L19 7" />,
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function loadDimensions(): BenchmarkDimension[] {
  try {
    const currentSaved = window.localStorage.getItem(STORAGE_KEY)
    const legacySaved = LEGACY_STORAGE_KEYS.map((key) =>
      window.localStorage.getItem(key),
    ).find((value) => value !== null)
    const saved = currentSaved ?? legacySaved
    if (!saved) return INITIAL_DIMENSIONS
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return INITIAL_DIMENSIONS
    const migrated = (parsed as BenchmarkDimension[])
      .map((dimension) => {
        if (
          dimension.id === 'g5-1' &&
          dimension.parentCode === 'G5' &&
          dimension.parentName === '整体表现力'
        ) {
          return {
            ...dimension,
            id: 'g6-1',
            parentCode: 'G6',
            code: 'G6.1',
          }
        }
        if (
          dimension.level === 'global' &&
          dimension.parentCode === 'G2' &&
          dimension.parentName === '视听合理性'
        ) {
          const suffix = dimension.code.split('.')[1] ?? '1'
          return {
            ...dimension,
            id: `c3-${suffix}`,
            level: 'clip' as const,
            parentCode: 'C3',
            code: `C3.${suffix}`,
          }
        }
        if (
          dimension.parentCode === 'C3' &&
          dimension.parentName === 'Prompt 遵循度'
        ) {
          const suffix = dimension.code.split('.')[1] ?? '1'
          return {
            ...dimension,
            id: `g5-${suffix}`,
            level: 'global' as const,
            parentCode: 'G5',
            parentName: '用户意图遵循度',
            code: `G5.${suffix}`,
          }
        }
        if (
          dimension.level === 'global' &&
          dimension.parentCode === 'G5' &&
          dimension.parentName === 'Prompt 遵循度'
        ) {
          return { ...dimension, parentName: '用户意图遵循度' }
        }
        if (
          dimension.level === 'transition' &&
          dimension.parentCode === 'T1' &&
          ['镜头衔接', '剪辑衔接'].includes(dimension.parentName)
        ) {
          return { ...dimension, parentName: '主体衔接' }
        }
        if (
          dimension.level === 'global' &&
          dimension.parentCode === 'G6' &&
          dimension.parentName === '整体表现力'
        ) {
          return { ...dimension, parentName: '视频功能性' }
        }
        if (dimension.id === 't1-2' && dimension.parentCode === 'T1') {
          return {
            ...dimension,
            id: 't3-2',
            parentCode: 'T3',
            parentName: '场景衔接',
            code: 'T3.2',
          }
        }
        if (
          dimension.id === 't3-2' &&
          ['空间方位、视线与运动方向衔接', '空间、视线与运动方向连续'].includes(
            dimension.name,
          )
        ) {
          return { ...dimension, name: '空间关系衔接' }
        }
        if (
          dimension.id === 't2-1' &&
          dimension.definition.includes('；切换手法本身的执行质量由 T1.4 评估。')
        ) {
          return {
            ...dimension,
            definition: dimension.definition.replace(
              '；切换手法本身的执行质量由 T1.4 评估。',
              '。',
            ),
          }
        }
        if (dimension.id === 't1-1' && dimension.name === '动作与事件承接') {
          return { ...dimension, name: '动作衔接', parentName: '主体衔接' }
        }
        if (dimension.id === 't1-4' && dimension.parentCode === 'T1') {
          return {
            ...dimension,
            id: 't4-1',
            parentCode: 'T4',
            parentName: '声音衔接',
            code: 'T4.1',
          }
        }
        const transitionRenames: Record<string, [string[], string]> = {
          T2: [
            ['相邻片段镜头语言统一', '相邻片段镜头语言衔接', '镜头语言衔接'],
            '镜头衔接',
          ],
          T3: [
            [
              '跨片段场景连续',
              '相邻片段场景承接',
              '相邻片段场景统一',
              '相邻片段场景衔接',
            ],
            '场景衔接',
          ],
        }
        const rename = transitionRenames[dimension.parentCode]
        if (
          dimension.level === 'transition' &&
          rename &&
          rename[0].includes(dimension.parentName)
        ) {
          return { ...dimension, parentName: rename[1] }
        }
        return dimension
      })
      .filter(
        (dimension) =>
          currentSaved !== null ||
          !(
            (dimension.parentCode === 'C4' &&
              dimension.parentName === '片段内主体一致性') ||
            (dimension.parentCode === 'T2' &&
              dimension.parentName === '片段间主体一致') ||
            (dimension.id === 'g3-2' &&
              dimension.name === '回环视觉记忆与重访一致性') ||
            (dimension.parentCode === 'G4' &&
              dimension.parentName === '长程目标') ||
            (dimension.id === 't1-3' &&
              dimension.name === '切点与转场执行') ||
            (dimension.parentCode === 'T4' &&
              ['多片段风格统一', '相邻片段风格统一', '相邻片段风格衔接'].includes(
                dimension.parentName,
              ))
          ),
      )
    if (currentSaved === null) {
      const globalCodeMap: Record<string, string> = {
        G3: 'G2',
        G5: 'G3',
        G6: 'G4',
      }
      const renumber = (text: string) =>
        text.replace(
          /G([356])\.(\d)/g,
          (match, group: string, sub: string) =>
            globalCodeMap[`G${group}`]
              ? `${globalCodeMap[`G${group}`]}.${sub}`
              : match,
        )
      migrated.forEach((item, index) => {
        const isRenumbered =
          item.level === 'global' && globalCodeMap[item.parentCode]
        migrated[index] = {
          ...item,
          parentCode: isRenumbered
            ? globalCodeMap[item.parentCode]
            : item.parentCode,
          code: isRenumbered ? renumber(item.code) : item.code,
          definition: renumber(item.definition),
          scoringPoints: item.scoringPoints.map(renumber),
          errorTypes: item.errorTypes.map(renumber),
        }
      })
      const newDimensionIds = [
        'g5-3',
        'g5-4',
        'g5-5',
        'g5-6',
        't1-5',
        't2-1',
        'g3-3',
        't4-1',
        'g1-3',
        'g3-2',
        'c4-1',
      ] as const
      newDimensionIds.forEach((id) => {
        if (migrated.some((item) => item.id === id)) return
        const newDimension = INITIAL_DIMENSIONS.find((item) => item.id === id)
        if (newDimension) migrated.push(structuredClone(newDimension))
      })
      const revisedDimensionIds = [
        't1-1',
        't2-1',
        't3-1',
        't3-2',
        't4-1',
        'g1-1',
        'g3-1',
        'g6-1',
      ]
      revisedDimensionIds.forEach((id) => {
        const index = migrated.findIndex((item) => item.id === id)
        const revised = INITIAL_DIMENSIONS.find((item) => item.id === id)
        if (
          index >= 0 &&
          revised &&
          migrated[index].updatedAt === revised.updatedAt
        ) {
          migrated[index] = structuredClone(revised)
        }
      })
    }
    return withoutScenarios(migrated)
  } catch {
    return INITIAL_DIMENSIONS
  }
}

function withoutScenarios(dimensions: BenchmarkDimension[]) {
  return dimensions.map((dimension) => {
    const copy: BenchmarkDimension & { scenarios?: unknown } = { ...dimension }
    delete copy.scenarios
    return copy as BenchmarkDimension
  })
}

function emptyDimension(
  level: Level,
  parentCode = level === 'clip' ? 'C1' : level === 'transition' ? 'T1' : 'G1',
  parentName = '',
): BenchmarkDimension {
  return {
    id: `dimension-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level,
    parentCode,
    parentName,
    code: `${parentCode}.?`,
    name: '未命名子维度',
    definition: '',
    scoringPoints: [''],
    errorTypes: [''],
    updatedAt: Date.now(),
  }
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  }).format(timestamp)
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index < 0) return text
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  )
}

function BenchmarkApp() {
  const [dimensions, setDimensions] =
    useState<BenchmarkDimension[]>(loadDimensions)
  const [levelFilter, setLevelFilter] = useState<'all' | Level>('all')
  const [parentFilter, setParentFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<BenchmarkDimension | null>(null)
  const [toast, setToast] = useState('')
  const importInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dimensions))
  }, [dimensions])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const parentGroups = useMemo(() => {
    const map = new Map<
      string,
      { code: string; name: string; level: Level; count: number }
    >()
    dimensions.forEach((dimension) => {
      const key = `${dimension.level}-${dimension.parentCode}`
      const existing = map.get(key)
      if (existing) existing.count += 1
      else {
        map.set(key, {
          code: dimension.parentCode,
          name: dimension.parentName,
          level: dimension.level,
          count: 1,
        })
      }
    })
    return Array.from(map.values()).sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true }),
    )
  }, [dimensions])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const levelOrder: Record<Level, number> = {
      clip: 0,
      transition: 1,
      global: 2,
    }
    return dimensions
      .filter((dimension) => {
        if (levelFilter !== 'all' && dimension.level !== levelFilter) {
          return false
        }
        if (
          parentFilter !== 'all' &&
          `${dimension.level}-${dimension.parentCode}` !== parentFilter
        ) {
          return false
        }
        if (!normalizedSearch) return true
        const haystack = [
          dimension.code,
          dimension.name,
          dimension.parentName,
          dimension.definition,
          ...dimension.scoringPoints,
          ...dimension.errorTypes,
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(normalizedSearch)
      })
      .sort(
        (a, b) =>
          levelOrder[a.level] - levelOrder[b.level] ||
          a.code.localeCompare(b.code, 'zh-CN', { numeric: true }),
      )
  }, [dimensions, levelFilter, parentFilter, search])

  const stats = useMemo(() => {
    const parents = new Set(
      dimensions.map((item) => `${item.level}-${item.parentCode}`),
    ).size
    const complete = dimensions.filter(
      (item) =>
        item.definition.trim() &&
        item.scoringPoints.some((point) => point.trim()) &&
        item.errorTypes.some((error) => error.trim()),
    ).length
    return { parents, complete }
  }, [dimensions])

  const selectLevel = (level: 'all' | Level) => {
    setLevelFilter(level)
    setParentFilter('all')
  }

  const selectParent = (level: Level, code: string) => {
    setLevelFilter(level)
    setParentFilter(`${level}-${code}`)
  }

  const openEditor = (dimension: BenchmarkDimension) => {
    setDraft(structuredClone(dimension))
  }

  const addDimension = () => {
    const level = levelFilter === 'all' ? 'clip' : levelFilter
    const selectedParent = parentGroups.find(
      (group) => `${group.level}-${group.code}` === parentFilter,
    )
    setDraft(
      emptyDimension(level, selectedParent?.code, selectedParent?.name),
    )
  }

  const saveDraft = () => {
    if (!draft) return
    if (
      !draft.code.trim() ||
      !draft.name.trim() ||
      !draft.parentCode.trim() ||
      !draft.parentName.trim() ||
      !draft.definition.trim()
    ) {
      setToast('请补全维度编码、名称、所属维度与能力定义')
      return
    }

    const cleaned: BenchmarkDimension = {
      ...draft,
      code: draft.code.trim(),
      name: draft.name.trim(),
      parentCode: draft.parentCode.trim(),
      parentName: draft.parentName.trim(),
      definition: draft.definition.trim(),
      scoringPoints: draft.scoringPoints.filter((point) => point.trim()),
      errorTypes: draft.errorTypes.filter((error) => error.trim()),
      updatedAt: Date.now(),
    }
    const exists = dimensions.some((item) => item.id === cleaned.id)
    setDimensions((current) =>
      exists
        ? current.map((item) => (item.id === cleaned.id ? cleaned : item))
        : [...current, cleaned],
    )
    setDraft(null)
    setToast(exists ? '维度规则已更新' : '新维度已创建')
  }

  const deleteDraft = () => {
    if (!draft) return
    const exists = dimensions.some((item) => item.id === draft.id)
    if (!exists) {
      setDraft(null)
      return
    }
    if (!window.confirm(`确认删除「${draft.code} ${draft.name}」？`)) return
    setDimensions((current) => current.filter((item) => item.id !== draft.id))
    setDraft(null)
    setToast('维度已删除')
  }

  const exportJson = () => {
    const payload = {
      title: 'Long Video Generation Benchmark',
      version: 1,
      exportedAt: new Date().toISOString(),
      dimensions,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `long-video-benchmark-${new Date()
      .toISOString()
      .slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setToast('已导出 JSON 规则文件')
  }

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const imported = Array.isArray(parsed)
        ? parsed
        : typeof parsed === 'object' &&
            parsed !== null &&
            'dimensions' in parsed &&
            Array.isArray((parsed as { dimensions?: unknown }).dimensions)
          ? (parsed as { dimensions: BenchmarkDimension[] }).dimensions
          : null
      if (!imported || imported.length === 0) {
        throw new Error('No dimensions')
      }
      setDimensions(withoutScenarios(imported as BenchmarkDimension[]))
      setLevelFilter('all')
      setParentFilter('all')
      setToast(`已导入 ${imported.length} 个子维度`)
    } catch {
      setToast('导入失败：文件不是有效的规则 JSON')
    }
  }

  const resetData = () => {
    if (!window.confirm('恢复初版数据？当前本地修改将被覆盖。')) return
    setDimensions(structuredClone(INITIAL_DIMENSIONS))
    setLevelFilter('all')
    setParentFilter('all')
    setToast('已恢复初版数据')
  }

  const updateArrayField = (
    field: 'scoringPoints' | 'errorTypes',
    index: number,
    value: string,
  ) => {
    setDraft((current) => {
      if (!current) return current
      const next = [...current[field]]
      next[index] = value
      return { ...current, [field]: next }
    })
  }

  const removeArrayField = (
    field: 'scoringPoints' | 'errorTypes',
    index: number,
  ) => {
    setDraft((current) => {
      if (!current) return current
      const next = current[field].filter((_, itemIndex) => itemIndex !== index)
      return { ...current, [field]: next.length ? next : [''] }
    })
  }

  const addArrayField = (field: 'scoringPoints' | 'errorTypes') => {
    setDraft((current) =>
      current ? { ...current, [field]: [...current[field], ''] } : current,
    )
  }

  const activeParentName =
    parentGroups.find(
      (group) => `${group.level}-${group.code}` === parentFilter,
    )?.name ?? ''

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <span>LV</span>
            <i />
          </div>
          <div>
            <strong>Long Video Benchmark</strong>
            <span>长视频生成评测规则工作台</span>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="autosave">
            <span />
            已保存到本地
          </div>
          <button
            className="button ghost"
            onClick={() => importInput.current?.click()}
          >
            <Icon name="upload" size={16} />
            导入
          </button>
          <input
            ref={importInput}
            className="hidden-input"
            type="file"
            accept="application/json,.json"
            onChange={importJson}
          />
          <button className="button ghost" onClick={exportJson}>
            <Icon name="download" size={16} />
            导出
          </button>
          <button className="button primary" onClick={addDimension}>
            <Icon name="plus" size={17} />
            新建子维度
          </button>
        </div>
      </header>

      <section className="overview">
        <div className="overview-copy">
          <div className="eyebrow">
            <span>RUBRIC BUILDER</span>
            <b>初版 · 可编辑</b>
          </div>
          <h1>评测维度与规则</h1>
          <p>
            从片段质量到长程一致性，为每个能力建立可执行的评分规则。
          </p>
        </div>
        <div className="overview-stats">
          <div className="stat-card">
            <span className="stat-icon lavender">维</span>
            <div>
              <strong>{dimensions.length}</strong>
              <span>二级维度</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon blue">类</span>
            <div>
              <strong>{stats.parents}</strong>
              <span>能力类别</span>
            </div>
          </div>
          <div className="stat-card completion">
            <div className="completion-label">
              <span>规则完整度</span>
              <strong>
                {dimensions.length
                  ? Math.round((stats.complete / dimensions.length) * 100)
                  : 0}
                %
              </strong>
            </div>
            <div className="progress">
              <i
                style={{
                  width: `${
                    dimensions.length
                      ? (stats.complete / dimensions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <small>
              {stats.complete} / {dimensions.length} 项规则已补全
            </small>
          </div>
        </div>
      </section>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>维度导航</span>
            <button
              title="恢复初版"
              aria-label="恢复初版"
              onClick={resetData}
            >
              <Icon name="reset" size={15} />
            </button>
          </div>
          <button
            className={`nav-all ${
              levelFilter === 'all' && parentFilter === 'all' ? 'active' : ''
            }`}
            onClick={() => selectLevel('all')}
          >
            <span className="nav-all-icon">
              <Icon name="grid" size={16} />
            </span>
            <span>全部维度</span>
            <b>{dimensions.length}</b>
          </button>

          {(Object.keys(levelMeta) as Level[]).map((level) => {
            const levelGroups = parentGroups.filter(
              (group) => group.level === level,
            )
            const levelCount = dimensions.filter(
              (item) => item.level === level,
            ).length
            return (
              <div className="nav-section" key={level}>
                <button
                  className={`nav-level ${
                    levelFilter === level && parentFilter === 'all'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => selectLevel(level)}
                >
                  <span
                    className="level-dot"
                    style={{ background: levelMeta[level].color }}
                  />
                  <span>{levelMeta[level].shortLabel}</span>
                  <b>{levelCount}</b>
                </button>
                <div className="nav-groups">
                  {levelGroups.map((group) => (
                    <button
                      key={`${level}-${group.code}`}
                      className={
                        parentFilter === `${level}-${group.code}` ? 'active' : ''
                      }
                      onClick={() => selectParent(level, group.code)}
                    >
                      <span>{group.code}</span>
                      <em>{group.name}</em>
                      <b>{group.count}</b>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="sidebar-note">
            <span>提示</span>
            <p>点击任意行打开编辑面板。所有修改会自动保存在当前浏览器。</p>
          </div>
        </aside>

        <main className="content">
          <div className="content-toolbar">
            <div className="filter-context">
              <span>当前视图</span>
              <strong>
                {parentFilter !== 'all'
                  ? activeParentName
                  : levelFilter !== 'all'
                    ? levelMeta[levelFilter].label
                    : '全部评测维度'}
              </strong>
              <b>{filtered.length} 项</b>
            </div>
            <div className="toolbar-right">
              <label className="search-box">
                <Icon name="search" size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索维度或规则…"
                />
                {search && (
                  <button
                    aria-label="清除搜索"
                    onClick={() => setSearch('')}
                    type="button"
                  >
                    <Icon name="close" size={13} />
                  </button>
                )}
              </label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div>
                <Icon name="search" size={26} />
              </div>
              <h3>没有匹配的维度</h3>
              <p>调整筛选条件或搜索关键词，也可以直接新建一个子维度。</p>
              <button className="button primary" onClick={addDimension}>
                <Icon name="plus" size={16} />
                新建子维度
              </button>
            </div>
          ) : (
            <RulesTable
              dimensions={filtered}
              search={search}
              onOpen={openEditor}
            />
          )}
        </main>
      </div>

      {draft && (
        <div
          className="drawer-backdrop"
          onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) setDraft(null)
          }}
        >
          <aside className="editor-drawer">
            <div className="drawer-header">
              <div>
                <span className="drawer-kicker">
                  {dimensions.some((item) => item.id === draft.id)
                    ? '编辑子维度'
                    : '新建子维度'}
                </span>
                <h2>
                  <b>{draft.code}</b>
                  {draft.name}
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="关闭编辑面板"
                onClick={() => setDraft(null)}
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="drawer-body">
              <section className="form-section">
                <div className="section-title">
                  <span>01</span>
                  <div>
                    <h3>维度信息</h3>
                    <p>设置层级、归属与能力边界</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label>
                    <span>层级</span>
                    <select
                      value={draft.level}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          level: event.target.value as Level,
                        })
                      }
                    >
                      {(Object.keys(levelMeta) as Level[]).map((level) => (
                        <option key={level} value={level}>
                          {levelMeta[level].label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>子维度编码</span>
                    <input
                      value={draft.code}
                      onChange={(event) =>
                        setDraft({ ...draft, code: event.target.value })
                      }
                      placeholder="例如 C2.3"
                    />
                  </label>
                  <label>
                    <span>一级维度编码</span>
                    <input
                      value={draft.parentCode}
                      onChange={(event) =>
                        setDraft({ ...draft, parentCode: event.target.value })
                      }
                      placeholder="例如 C2"
                    />
                  </label>
                  <label>
                    <span>一级维度名称</span>
                    <input
                      value={draft.parentName}
                      onChange={(event) =>
                        setDraft({ ...draft, parentName: event.target.value })
                      }
                      placeholder="例如 运动合理性"
                    />
                  </label>
                  <label className="full">
                    <span>子维度名称</span>
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                      placeholder="输入清晰、可区分的能力名称"
                    />
                  </label>
                  <label className="full">
                    <span>能力定义</span>
                    <textarea
                      rows={4}
                      value={draft.definition}
                      onChange={(event) =>
                        setDraft({ ...draft, definition: event.target.value })
                      }
                      placeholder="说明评估对象、能力边界和判定目标…"
                    />
                  </label>
                </div>
              </section>

              <section className="form-section">
                <div className="section-title">
                  <span>02</span>
                  <div>
                    <h3>评分规则</h3>
                    <p>拆成观察员可以逐项核对的标准</p>
                  </div>
                </div>
                <ArrayEditor
                  label="核心评分点"
                  values={draft.scoringPoints}
                  numbered
                  placeholder="输入一条可观察、可判定的评分标准"
                  onChange={(index, value) =>
                    updateArrayField('scoringPoints', index, value)
                  }
                  onRemove={(index) =>
                    removeArrayField('scoringPoints', index)
                  }
                  onAdd={() => addArrayField('scoringPoints')}
                />
                <ArrayEditor
                  label="对应错误类型"
                  values={draft.errorTypes}
                  placeholder="例如：身份漂移"
                  onChange={(index, value) =>
                    updateArrayField('errorTypes', index, value)
                  }
                  onRemove={(index) => removeArrayField('errorTypes', index)}
                  onAdd={() => addArrayField('errorTypes')}
                />
              </section>
            </div>

            <div className="drawer-footer">
              <button className="button danger-ghost" onClick={deleteDraft}>
                <Icon name="trash" size={16} />
                删除
              </button>
              <div>
                <button className="button ghost" onClick={() => setDraft(null)}>
                  取消
                </button>
                <button className="button primary" onClick={saveDraft}>
                  <Icon name="check" size={16} />
                  保存修改
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span>
            <Icon name="check" size={15} />
          </span>
          {toast}
        </div>
      )}
    </div>
  )
}

function RulesTable({
  dimensions,
  search,
  onOpen,
}: {
  dimensions: BenchmarkDimension[]
  search: string
  onOpen: (dimension: BenchmarkDimension) => void
}) {
  return (
    <div className="table-frame">
      <table className="rules-table">
        <thead>
          <tr>
            <th className="dimension-column">评测维度</th>
            <th className="definition-column">能力定义</th>
            <th className="score-column">核心评分点</th>
            <th className="error-column">对应错误类型</th>
            <th className="updated-column">更新</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dimension) => {
            return (
              <tr key={dimension.id} onClick={() => onOpen(dimension)}>
                <td className="dimension-column">
                  <div className="dimension-cell">
                    <div className="dimension-topline">
                      <span
                        className="level-pill"
                        style={{
                          color: levelMeta[dimension.level].color,
                          background: `${levelMeta[dimension.level].color}12`,
                        }}
                      >
                        {levelMeta[dimension.level].shortLabel}
                      </span>
                      <small>
                        {dimension.parentCode} · {dimension.parentName}
                      </small>
                    </div>
                    <strong>
                      <b>{dimension.code}</b>
                      {highlightText(dimension.name, search)}
                    </strong>
                    <button aria-label={`编辑 ${dimension.name}`}>
                      <Icon name="edit" size={14} />
                    </button>
                  </div>
                </td>
                <td>
                  <p className="definition-text">
                    {highlightText(dimension.definition, search)}
                  </p>
                </td>
                <td>
                  <ol className="score-list">
                    {dimension.scoringPoints.slice(0, 4).map((point, index) => (
                      <li key={`${dimension.id}-score-${index}`}>
                        <span>{index + 1}</span>
                        <p>{highlightText(point, search)}</p>
                      </li>
                    ))}
                  </ol>
                </td>
                <td>
                  <div className="error-tags">
                    {dimension.errorTypes.slice(0, 5).map((error, index) => (
                      <span key={`${dimension.id}-error-${index}`}>
                        {highlightText(error, search)}
                      </span>
                    ))}
                    {dimension.errorTypes.length > 5 && (
                      <span>+{dimension.errorTypes.length - 5}</span>
                    )}
                  </div>
                </td>
                <td className="updated-cell">
                  <span>{formatDate(dimension.updatedAt)}</span>
                  <Icon name="chevron" size={15} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ArrayEditor({
  label,
  values,
  placeholder,
  numbered = false,
  onChange,
  onRemove,
  onAdd,
}: {
  label: string
  values: string[]
  placeholder: string
  numbered?: boolean
  onChange: (index: number, value: string) => void
  onRemove: (index: number) => void
  onAdd: () => void
}) {
  return (
    <div className="array-editor">
      <div className="array-label">
        <span>{label}</span>
        <button type="button" onClick={onAdd}>
          <Icon name="plus" size={13} />
          添加
        </button>
      </div>
      <div className="array-items">
        {values.map((value, index) => (
          <div className="array-item" key={`${label}-${index}`}>
            {numbered && <span className="array-number">{index + 1}</span>}
            <input
              value={value}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              aria-label={`删除第 ${index + 1} 项`}
              onClick={() => onRemove(index)}
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BenchmarkApp

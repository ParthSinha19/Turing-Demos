import { CHAPTERS, type ChapterId } from '../data/chapters'

export const STORAGE_KEY = 'the-last-signal-progress-v1'

export interface GameProgress {
  completed: ChapterId[]
  optionalCompleted: ChapterId[]
  currentChapter: ChapterId
  storyPrediction: string
  reflectionError: string
  reflectionFix: string
  finished: boolean
}

export const DEFAULT_PROGRESS: GameProgress = {
  completed: [],
  optionalCompleted: [],
  currentChapter: 'trail',
  storyPrediction: '',
  reflectionError: '',
  reflectionFix: '',
  finished: false,
}

export function isChapterUnlocked(id: ChapterId, completed: ChapterId[], teacherMode = false): boolean {
  if (teacherMode) return true
  const index = CHAPTERS.findIndex((chapter) => chapter.id === id)
  if (index <= 0) return true
  return CHAPTERS.slice(0, index).every((chapter) => completed.includes(chapter.id))
}

export function loadProgress(storage?: Pick<Storage, 'getItem'>): GameProgress {
  try {
    const raw = (storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined))?.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS }
    const parsed = JSON.parse(raw) as Partial<GameProgress>
    const validIds = CHAPTERS.map((chapter) => chapter.id)
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id): id is ChapterId => validIds.includes(id as ChapterId)) : [],
      optionalCompleted: Array.isArray(parsed.optionalCompleted) ? parsed.optionalCompleted.filter((id): id is ChapterId => validIds.includes(id as ChapterId)) : [],
      currentChapter: validIds.includes(parsed.currentChapter as ChapterId) ? parsed.currentChapter as ChapterId : 'trail',
      storyPrediction: typeof parsed.storyPrediction === 'string' ? parsed.storyPrediction : '',
      reflectionError: typeof parsed.reflectionError === 'string' ? parsed.reflectionError : '',
      reflectionFix: typeof parsed.reflectionFix === 'string' ? parsed.reflectionFix : '',
      finished: Boolean(parsed.finished),
    }
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}

export function saveProgress(progress: GameProgress, storage?: Pick<Storage, 'setItem'>): boolean {
  try {
    const target = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined)
    target?.setItem(STORAGE_KEY, JSON.stringify(progress))
    return Boolean(target)
  } catch {
    return false
  }
}

export function resetProgress(storage?: Pick<Storage, 'removeItem'>): boolean {
  try {
    const target = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined)
    target?.removeItem(STORAGE_KEY)
    return Boolean(target)
  } catch {
    return false
  }
}

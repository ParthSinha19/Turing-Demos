import { describe, expect, it } from 'vitest'
import { DEFAULT_PROGRESS, isChapterUnlocked, loadProgress, resetProgress, saveProgress, STORAGE_KEY } from './progress'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  }
}

describe('saved investigation progress', () => {
  it('round-trips state and ignores invalid saved chapter ids', () => {
    const store = memoryStorage()
    const next = { ...DEFAULT_PROGRESS, completed: ['trail', 'bogus'] as never[], currentChapter: 'laboratory' as const }
    expect(saveProgress(next, store)).toBe(true)
    expect(loadProgress(store).completed).toEqual(['trail'])
    expect(loadProgress(store).currentChapter).toBe('laboratory')
  })

  it('unlocks in order and permits teacher preview', () => {
    expect(isChapterUnlocked('trail', [])).toBe(true)
    expect(isChapterUnlocked('laboratory', [])).toBe(false)
    expect(isChapterUnlocked('laboratory', ['trail'])).toBe(true)
    expect(isChapterUnlocked('tower', [], true)).toBe(true)
  })

  it('resets local progress', () => {
    const store = memoryStorage()
    saveProgress({ ...DEFAULT_PROGRESS, completed: ['trail'] }, store)
    expect(resetProgress(store)).toBe(true)
    expect(store.getItem(STORAGE_KEY)).toBeNull()
    expect(loadProgress(store).completed).toEqual([])
  })
})

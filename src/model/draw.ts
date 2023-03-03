import type { RestoredDataState } from '@excalidraw/excalidraw/types/data/restore'
import { atom } from 'jotai'
import type { ValuesType } from 'utility-types'
import { CONTENT_TYPE } from '@/lib/constants'

export type DrawData = Partial<{
  filePath: string;
  fileContent: RestoredDataState;
  contentType: ValuesType<typeof CONTENT_TYPE>
}>
export const drawAtom = atom<DrawData[]>([
  {
    filePath: '',
  },
])
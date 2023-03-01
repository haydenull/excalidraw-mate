import { RestoredDataState } from '@excalidraw/excalidraw/types/data/restore'
import { atom } from 'jotai'

export const drawAtom = atom<Partial<{
  filePath: string;
  fileContent: RestoredDataState;
}>>({
  filePath: '',
})
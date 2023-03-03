import { type FileEntry } from '@tauri-apps/api/fs';
import { atom } from 'jotai'

export const appAtom = atom<{
  currentDrawFile: FileEntry;
  isDirectoryDialogOpen: boolean;
}>({
  currentDrawFile: {
    name: '',
    path: '',
  },
  isDirectoryDialogOpen: false,
})
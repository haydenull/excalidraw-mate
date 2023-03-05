import { type FileEntry } from '@tauri-apps/api/fs';
import { atom } from 'jotai'

export const appAtom = atom<{
  currentDrawFile: FileEntry;
  isShowSidebar: boolean;
  isDirectoryDialogOpen: boolean;
  isFontDialogOpen: boolean;
}>({
  currentDrawFile: {
    name: '',
    path: '',
  },
  isShowSidebar: false,
  isDirectoryDialogOpen: false,
  isFontDialogOpen: false,
})
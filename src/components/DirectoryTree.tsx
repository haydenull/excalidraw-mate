import { type FileEntry } from '@tauri-apps/api/fs'
import { FileBox, FolderOpen, PenTool } from 'lucide-react'

const GAP = 20

const DirectoryTree: React.FC<{
  file: FileEntry;
  level: number;
  onFileSelect: (file: FileEntry) => void;
  activeFIlePath: string;
}> = ({ file, level, activeFIlePath, onFileSelect }) => {
  const isPlaceholder = file.name === '' && file.path === ''
  return (
    <>
      { isPlaceholder ? null : <div key={file.path} className="text-sm text-gray-400 dark:text-gray-500 flex items-center" style={{ marginLeft: `${GAP * level}px` }}><FolderOpen className="mr-1" size={14} />{file.name}</div>}
      {file.children?.map(childFile => (
        Array.isArray(childFile?.children)
        ? <DirectoryTree key={childFile?.path} file={childFile} level={level + 1} activeFIlePath={activeFIlePath} onFileSelect={onFileSelect} />
        : (
          <div
            key={childFile.path}
            style={{ marginLeft: isPlaceholder ? 0 : `${GAP * (level + 1)}px` }}
            data-state={activeFIlePath === childFile.path ? 'active' : 'inactive'}
            className="mx-1 cursor-pointer flex items-center text-sm font-medium transition-colors bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100 dark:hover:text-slate-100 h-9 px-2 rounded-md data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800"
            onClick={() => onFileSelect(childFile)}
          >
            <PenTool className="mr-1" size={12} />{childFile.name}
          </div>
        )
      ))}
    </>
  )
}

export default DirectoryTree

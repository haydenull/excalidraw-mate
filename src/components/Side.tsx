import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { invoke } from '@tauri-apps/api'
import { open } from '@tauri-apps/api/dialog'
import { type FileEntry, readDir, readBinaryFile } from '@tauri-apps/api/fs'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { FileCog2 } from 'lucide-react'
import { drawAtom } from '@/model/draw'
import { loadFromBlob } from '@excalidraw/excalidraw'

const Side: React.FC<{}> = () => {
  const [, setDraw] = useAtom(drawAtom)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [expand, setExpand] = useState<boolean>(false)
  console.log('[faiz:] === files', files)

  const openFolder = async () => {
    // const dir = await invoke('open_folder')
    const dir = await open({ directory: true })
    console.log('[faiz:] === dir', dir)
  }
  const onFileSelect = async (file: FileEntry) => {
    const fileContent = await readBinaryFile(file.path)
    console.log('[faiz:] === fileContent', fileContent)
    const blob = new Blob([new TextDecoder().decode(fileContent)], { type: 'application/json' })
    setDraw({
      filePath: file.path,
      fileContent: await loadFromBlob(blob, null, null),
    })
  }

  useEffect(() => {
    const getDir = async () => {
      const dir = await readDir('/Users/Hayden/Code/DigitalWorld/zio/draws')
      const regex = new RegExp('^.+\\.excalidraw(\\.png|\\.svg)?$')
      setFiles(dir?.filter(file => regex.test(file?.name ?? '')) ?? [])
    }
    getDir()
  }, [])

  return (
    <>
      <div className="h-screen fixed z-50 bg-white dark:bg-slate-900 shadow flex flex-col overflow-hidden" style={{ width: expand ? '200px' : 0 }}>
        <Button onClick={openFolder} className="mb-2">Open Folder</Button>
        <ScrollArea className="flex-1">
          {files.map(file => (
            <Button key={file.name} variant="ghost" size="sm" onClick={() => onFileSelect(file)}>{file.name}</Button>
          ))}
        </ScrollArea>
      </div>
      <Button variant="ghost" size="sm" className="fixed right-28 top-5 z-50" onClick={() => setExpand(_expand => !_expand)}><FileCog2 /></Button>
    </>
  )
}

export default Side

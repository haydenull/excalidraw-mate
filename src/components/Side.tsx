import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { invoke } from '@tauri-apps/api'
import { open } from '@tauri-apps/api/dialog'
import { X } from 'lucide-react'
import { type FileEntry, readDir, readBinaryFile } from '@tauri-apps/api/fs'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { drawAtom } from '@/model/draw'
import { loadFromBlob } from '@excalidraw/excalidraw'
import { appAtom } from '@/model/app'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/Select'
import { getSettings, setSettings } from '@/lib/settingsStorage'
import { getContentType } from '@/lib/utils'
import { CONTENT_TYPE } from '@/lib/constants'

const getDirFiles = async (path: string) => {
  const dir = await readDir(path)
  const regex = new RegExp('^.+\\.excalidraw(\\.png|\\.svg)?$')
  return dir?.filter(file => regex.test(file?.name ?? '')) ?? []
}

const Side: React.FC<{}> = () => {
  const [, setDraw] = useAtom(drawAtom)
  const [appData, setAppData] = useAtom(appAtom)
  const expand = appData?.showFilePanel
  const [files, setFiles] = useState<FileEntry[]>([])
  const [dirSelectOptions, setDirSelectOptions] = useState<string[]>([])
  const [dirSelectValue, setDirSelectValue] = useState<string>()
  const [parsing, setParsing] = useState(false)

  const openFolder = async () => {
    // const dir = await invoke('open_folder')
    const dir = await open({ directory: true })
    if (typeof dir === 'string') {
      setDirSelectOptions(_options => [..._options, dir])
      setSettings('directories', [...dirSelectOptions, dir])
    }
  }
  const onFileSelect = async (file: FileEntry) => {
    setParsing(true)
    const fileContent = await readBinaryFile(file.path)
    const contentType = getContentType(file?.name ?? '')
    const blob = new Blob(contentType === CONTENT_TYPE.PNG ? [fileContent] : [new TextDecoder().decode(fileContent)], { type: contentType })
    setDraw({
      filePath: file.path,
      fileContent: await loadFromBlob(blob, null, null),
      contentType,
    })
    setParsing(false)
  }
  const onDirSelectChange = async (value: string) => {
    setDirSelectValue(value)
    setSettings('lastDirectory', value)
    setFiles(await getDirFiles(value))
  }
  const onClickNewFile = () => {
    // TODO: tauri create file
  }

  useEffect(() => {
    const boot = async () => {
      const { directories = [], lastDirectory } = await getSettings()
      setDirSelectOptions(directories)
      setDirSelectValue(lastDirectory)
      if (lastDirectory) {
        setFiles(await getDirFiles(lastDirectory))
      }
    }
    boot()
  }, [])

  return (
    <>
      <div className="h-screen w-[294px] fixed right-0 z-50 p-2 bg-white dark:bg-slate-900 shadow-lg flex flex-col" style={{ display: expand ? 'flex' : 'none' }}>
        <div className="flex justify-between">
          <Select value={dirSelectValue} onValueChange={onDirSelectChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Please select your directory" />
            </SelectTrigger>
            <SelectContent className="w-[220px]">
              {
                dirSelectOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              }
              <SelectItem key="placeholder" value="placeholder" className="hidden">placeholder</SelectItem>
              <div>
                <Button onClick={openFolder} size="sm" className="w-full mt-2">Add Directory</Button>
              </div>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => setAppData(_data => ({..._data, showFilePanel: false}))}><X strokeWidth="1" /></Button>
        </div>
        <Button variant="outline" className="mt-2" size="sm">New File</Button>

        <ScrollArea className="flex-1 mt-2">
          {files.map(file => (
            <Button key={file.name} variant="ghost" size="sm" className="mx-1" onClick={() => onFileSelect(file)}>{file.name}</Button>
          ))}
        </ScrollArea>
      </div>
      <div className="w-screen h-screen fixed bg-white dark:bg-slate-800 dark:text-gray-50 opacity-70 z-[999] left-0 top-0 flex justify-center items-center" style={{ display: parsing ? 'flex' : 'none' }}>Parsing File...</div>
    </>
  )
}

export default Side

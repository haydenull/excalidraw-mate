import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import dayjs from 'dayjs'
import { Plus, X } from 'lucide-react'
import { type FileEntry, readDir, readBinaryFile } from '@tauri-apps/api/fs'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { drawAtom } from '@/model/draw'
import { loadFromBlob, Sidebar } from '@excalidraw/excalidraw'
import { appAtom } from '@/model/app'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/Select'
import { getSettings, setSettings } from '@/lib/settingsStorage'
import { getContentType } from '@/lib/utils'
import { CONTENT_TYPE } from '@/lib/constants'
import { writePng } from '@/lib/writeExcalidrawFile'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from './ui/Label'
import { Input } from './ui/Input'
import { useToast } from '@/hooks/useToast'
import DirectoryTree from './DirectoryTree'

const getDirFiles = async (path: string) => {
  const dir = await readDir(path, { recursive: true })
  const regex = new RegExp('^.+\\.excalidraw(\\.png|\\.svg)?$')
  // 遍历所有 dir filter 不符合条件的文件, 移除没有文件的 dir, 如果文件有多层, 则递归移除
  const filterNoExcalidrawFile = (dir: FileEntry[]) => {
    const result: FileEntry[] = []
    for (const file of dir) {
      if (Array.isArray(file.children)) {
        file.children = filterNoExcalidrawFile(file.children)
        if (file.children.length > 0) result.push(file)
      } else {
        if (regex.test(file?.name ?? '')) result.push(file)
      }
    }
    return result
  }
  return filterNoExcalidrawFile(dir)
}

const Side: React.FC<{}> = () => {
  const [draws, setDraws] = useAtom(drawAtom)
  const [appData, setAppData] = useAtom(appAtom)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [dirSelectOptions, setDirSelectOptions] = useState<{path: string; alias?: string}[]>([])
  const [dirSelectValue, setDirSelectValue] = useState<string>()
  const [parsing, setParsing] = useState(false)
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false)

  const { toast } = useToast()

  const onFileSelect = async (file: FileEntry) => {
    setAppData(_appData => ({ ..._appData, currentDrawFile: file }))
    setParsing(true)
    const isExist = draws.some(draw => draw.filePath === file.path)
    if (isExist) return setParsing(false)

    const fileContent = await readBinaryFile(file.path)
    const contentType = getContentType(file?.name ?? '')
    const blob = new Blob(contentType === CONTENT_TYPE.PNG ? [fileContent] : [new TextDecoder().decode(fileContent)], { type: contentType })
    const finalFileContent = await loadFromBlob(blob, null, null)
    setDraws(_draws => {
      return _draws?.concat({
        filePath: file.path,
        fileContent: finalFileContent,
        contentType,
      })
    })
    setParsing(false)
  }
  const onDirSelectChange = async (value: string) => {
    setDirSelectValue(value)
    setSettings('lastDirectory', value)
    setFiles(await getDirFiles(value))
  }
  const onClickNewFile = async () => {
    const fileName = document.querySelector<HTMLInputElement>('#fileName')?.value?.trim()
    console.log('[faiz:] === onClickNewFile', fileName)
    if (!fileName) return toast({ variant: 'destructive', description: 'File name is required' })
    const _fileName = `${fileName}.excalidraw.png`
    const _filePath = `${dirSelectValue}/${_fileName}`
    // TODO: check if file exists
    try {
      await writePng(_filePath, [], {}, {})
      setFiles(await getDirFiles(dirSelectValue!))
      onFileSelect({
        name: _fileName,
        path: _filePath,
      })
      setNewFileDialogOpen(false)
    } catch (error) {
      console.error('[faiz:] === create file error', error)
      toast({ variant: 'destructive', description: 'Create file failed' })
    }
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
    <div
      className="fixed w-[360px] h-screen shadow-2xl z-[10] right-0 top-0 bg-white dark:bg-slate-800 p-3"
      style={{ display: appData?.isShowSidebar ? 'block' : 'none' }}
    >
      <div className="flex">
        <Select value={dirSelectValue} onValueChange={onDirSelectChange}>
          <SelectTrigger className="mr-2">
            <SelectValue placeholder="Please select your directory" />
          </SelectTrigger>
          <SelectContent>
            {
              dirSelectOptions.map(option => (
                <SelectItem key={option.path} value={option.path}>{option.alias || option.path}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <Button variant="outline" className="px-2" onClick={() => setAppData(_data => ({..._data, isShowSidebar: false}))}><X /></Button>
      </div>
      <div className="h-full w-full py-2 flex flex-col">
        {
          dirSelectValue
          ? (
            <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onSelect={() => {}}><Plus size="16" className="mr-2" /> New File</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New File</DialogTitle>
                  <DialogDescription>Create a new file in the current directory</DialogDescription>
                </DialogHeader>
                <div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fileName" className="text-right">File Name:</Label>
                    <Input id="fileName" className="col-span-3" defaultValue={dayjs().format('YYYY-MM-DD-HH-mm-ss')} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={onClickNewFile}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
          : null
        }

        <ScrollArea className="flex-1 mt-2">
          <DirectoryTree level={0} file={{ name: '', path: '', children: files }} activeFIlePath={appData?.currentDrawFile?.path} onFileSelect={onFileSelect} />
        </ScrollArea>
      </div>
      <div className="w-screen h-screen fixed bg-white dark:bg-slate-800 dark:text-gray-50 opacity-70 z-[999] left-0 top-0 flex justify-center items-center" style={{ display: parsing ? 'flex' : 'none' }}>Parsing File...</div>
    </div>
  )
}

export default Side

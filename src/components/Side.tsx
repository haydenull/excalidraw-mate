import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { invoke } from '@tauri-apps/api'
import { open } from '@tauri-apps/api/dialog'
import { Plus } from 'lucide-react'
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
import { Button as ExcalidrawButton } from '@excalidraw/excalidraw'

const getDirFiles = async (path: string) => {
  const dir = await readDir(path)
  const regex = new RegExp('^.+\\.excalidraw(\\.png|\\.svg)?$')
  return dir?.filter(file => regex.test(file?.name ?? '')) ?? []
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

  // const openFolder = async () => {
  //   // const dir = await invoke('open_folder')
  //   const dir = await open({ directory: true })
  //   if (typeof dir === 'string') {
  //     setDirSelectOptions(_options => [..._options, dir])
  //     setSettings('directories', [...dirSelectOptions, dir])
  //   }
  // }
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
    // TODO: check if file exists
    try {
      await writePng(`${dirSelectValue}/${fileName}.excalidraw.png`, [], {}, {})
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
    <>
      <Sidebar.Header>
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
            {/* <SelectItem key="placeholder" value="placeholder" className="hidden">placeholder</SelectItem> */}
            {/* <div>
              <Button onClick={openFolder} size="sm" className="w-full mt-2">Add Directory</Button>
            </div> */}
          </SelectContent>
        </Select>
      </Sidebar.Header>
      <div className="h-full w-full p-2 flex flex-col">
        {
          dirSelectValue
          ? (
            <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
              <DialogTrigger asChild>
                <ExcalidrawButton style={{ width: '100%' }} onSelect={() => {}}><Plus size="16" className="mr-2" /> New File</ExcalidrawButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New File</DialogTitle>
                  <DialogDescription>Create a new file in the current directory</DialogDescription>
                </DialogHeader>
                <div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fileName" className="text-right">File Name:</Label>
                    <Input id="fileName" className="col-span-3" />
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
          {files.map(file => (
            <div
              key={file.name}
              data-state={appData?.currentDrawFile?.path === file.path ? 'active' : 'inactive'}
              className="mx-1 cursor-pointer flex items-center text-sm font-medium transition-colors bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100 dark:hover:text-slate-100 h-9 px-2 rounded-md data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800"
              onClick={() => onFileSelect(file)}
            >
              {file.name}
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="w-screen h-screen fixed bg-white dark:bg-slate-800 dark:text-gray-50 opacity-70 z-[999] left-0 top-0 flex justify-center items-center" style={{ display: parsing ? 'flex' : 'none' }}>Parsing File...</div>
    </>
  )
}

export default Side

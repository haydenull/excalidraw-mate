import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { useAtom } from 'jotai'
import { appAtom } from '@/model/app'
import { Plus, Trash2 } from 'lucide-react'
import { open } from '@tauri-apps/api/dialog'
import { getSettings, setSettings } from '@/lib/settingsStorage'
import { useEffect, useState } from 'react'

const DirectoryDialog: React.FC<{}> = () => {
  const [appData, setAppData] = useAtom(appAtom)
  const [dirSelectOptions, setDirSelectOptions] = useState<{path: string; alias?: string}[]>([])

  const openFolder = async () => {
    const dir = await open({ directory: true })
    if (typeof dir === 'string') {
      setDirSelectOptions(_options => [..._options, { path: dir } ])
    }
  }
  const save = async () => {
    await setSettings('directories', dirSelectOptions)
    setAppData(_data => ({ ..._data, isDirectoryDialogOpen: false }))
  }
  const onAliasInputChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const { value } = e.target
    setDirSelectOptions(_options => {
      const index = _options.findIndex(item => item.path === path)
      if (index === -1) return _options
      const _newOptions = [..._options]
      _newOptions[index].alias = value
      return _newOptions
    })
  }
  const onClickDelete = (path: string) => {
    setDirSelectOptions(_options => _options.filter(item => item.path !== path))
  }

  useEffect(() => {
    const boot = async () => {
      const { directories = [], lastDirectory } = await getSettings()
      console.log('[faiz:] === directories', directories)
      setDirSelectOptions(directories)
    }
    boot()
  }, [])

  return (
    <Dialog open={appData.isDirectoryDialogOpen} onOpenChange={(open) => setAppData(_data => ({ ..._data, isDirectoryDialogOpen: open })) }>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Directory</DialogTitle>
          <DialogDescription>Manage your directory</DialogDescription>
        </DialogHeader>
        {
          dirSelectOptions?.map(item => (
            <div className="flex items-center" key={item.path || 'defaultKey'}>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right col-span-2 pr-2">{item?.path}</p>
                <Label htmlFor={`alias-${item.path}`} className="text-right col-span-1">Alias Name:</Label>
                <Input id={`alias-${item.path}`} className="col-span-1" value={item.alias} onChange={e => onAliasInputChange(e, item.path)} />
              </div>
              <Trash2 className="ml-2 cursor-pointer" size={18} onClick={() => onClickDelete(item.path)} />
            </div>
          ))
        }
        <Button size="sm" onClick={openFolder}><Plus size={18} className="mr-2" /> Add Directory</Button>
        <DialogFooter>
          <Button type="submit" onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DirectoryDialog

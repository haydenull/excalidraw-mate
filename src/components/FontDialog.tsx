import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { useAtom } from 'jotai'
import { appAtom } from '@/model/app'
import { Pencil, Baseline, Code2 } from 'lucide-react'
import { getSettings, setSettings, type ISettings } from '@/lib/settingsStorage'
import { useEffect, useState } from 'react'
import { FONT_ID } from '@/lib/constants'
import rewriteAllFont from '@/lib/rewriteFont'

const FontDialog: React.FC<{}> = () => {
  const [appData, setAppData] = useAtom(appAtom)
  const [customFontMap, setCustomFontMap] = useState<ISettings['customFont']>()

  const save = async () => {
    await setSettings('customFont', customFontMap)
    await rewriteAllFont()
    setAppData(_data => ({ ..._data, isFontDialogOpen: false }))
  }
  const onFontInputChange = (e: React.ChangeEvent<HTMLInputElement>, fontId: keyof typeof FONT_ID) => {
    const { value } = e.target
    setCustomFontMap(_map => ({ ..._map, [fontId]: value }))
  }

  useEffect(() => {
    const boot = async () => {
      const { customFont } = await getSettings()
      console.log('[faiz:] === customFont', customFont)
      setCustomFontMap(customFont)
    }
    boot()
  }, [])

  return (
    <Dialog open={appData.isFontDialogOpen} onOpenChange={(open) => setAppData(_data => ({ ..._data, isFontDialogOpen: open })) }>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Font Family</DialogTitle>
          <DialogDescription>Use your own font family <p className="text-sm">Please restart the application for the settings to take effect.</p></DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center">
          <Label className="col-span-1 flex items-center"><Pencil size={14} className="mr-2" /> Hand-drawn</Label>
          <Input className="col-span-3" value={customFontMap?.['Hand-drawn']} onChange={e => onFontInputChange(e, 'Hand-drawn')} />
        </div>
        <div className="grid grid-cols-4 items-center">
          <Label className="col-span-1 flex items-center"><Baseline size={14} className="mr-2" /> Normal</Label>
          <Input className="col-span-3" value={customFontMap?.['Normal']} onChange={e => onFontInputChange(e, 'Normal')} />
        </div>
        <div className="grid grid-cols-4 items-center">
          <Label className="col-span-1 flex items-center"><Code2 size={14} className="mr-2" /> Code</Label>
          <Input className="col-span-3" value={customFontMap?.['Code']} onChange={e => onFontInputChange(e, 'Code')} />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FontDialog

import { Toaster } from '@/components/ui/Toaster'
import './App.css'
import Draw from '@/components/Draw'
import { drawAtom } from '@/model/draw'
import { useAtom } from 'jotai'
import { appAtom } from '@/model/app'
import DirectoryDialog from '@/components/DirectoryDialog'

function App() {
  const [draws] = useAtom(drawAtom)
  const [appData] = useAtom(appAtom)

  console.log('[faiz:] === draws', draws)

  return (
    <>
      <div className="w-screen h-screen">
        {
          draws?.map(drawData => (
            <Draw
              key={drawData.filePath}
              drawData={drawData}
              className="absolute top-0 left-0"
              style={{ zIndex: appData?.currentDrawFile?.path === drawData.filePath ? 10 : -1 }}
            />
          ))
        }
      </div>
      <DirectoryDialog />
      <Toaster />
    </>
  )
}

export default App

import React, { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { Excalidraw, WelcomeScreen, Footer, getSceneVersion, MainMenu, Sidebar } from '@excalidraw/excalidraw'
import { drawAtom } from '@/model/draw'
import { appAtom } from '@/model/app'
import { FileCog2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WRITE_FUNC_MAP } from '@/lib/writeExcalidrawFile'
import { useToast } from '@/hooks/useToast'
import { debounce } from '@/lib/utils'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import type { ValuesType } from 'utility-types'
import { CONTENT_TYPE } from '@/lib/constants'
import useMediaQuery from '@/hooks/useMediaQuery'
import Side from '@/components/Side'

const Draw: React.FC<{}> = () => {
  const [drawData] = useAtom(drawAtom)
  const [, setAppData] = useAtom(appAtom)
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  console.log('[faiz:] === excalidrawRef?.current', excalidrawRef?.current)
  const { toast } = useToast()
  // const newFileData = useRef<{
  //   contentType?: ValuesType<typeof CONTENT_TYPE>
  //   path: string;
  //   elements: readonly ExcalidrawElement[];
  //   appState: Partial<AppState>;
  //   files: BinaryFiles;
  // }>()

  const theme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'

  // const onSave = async () => {
  //   if (drawData?.filePath !== newFileData?.current?.path) return
  //   try {
  //     const { contentType, path, elements = [], appState = {}, files = {} } = newFileData?.current ?? {}
  //     if (!path) return toast({ variant: 'destructive', description: 'File not found' })
  //     if (!contentType) return toast({ variant: 'destructive', description: 'File type not supported' })
  //     const write = WRITE_FUNC_MAP[contentType]
  //     await write(path, elements, appState, files)
  //     setHasUnsavedChanges(false)
  //   } catch (err) {
  //     toast({ variant: 'destructive', description: 'Write file failed' })
  //   }
  // }

  const onChange = debounce(async (elements, appState, files) => {
    console.log('[faiz:] === onChange', elements, appState, files)
    // setHasUnsavedChanges(true)
    // newFileData.current = {
    //   contentType: drawData?.contentType,
    //   path: drawData.filePath ?? '',
    //   elements,
    //   appState: {
    //     ...appState,
    //     exportEmbedScene: true,
    //   },
    //   files,
    // }
    const path = drawData?.filePath
    if (!path) return toast({ variant: 'destructive', description: 'File not found' })
    const contentType = drawData?.contentType
    if (!contentType) return toast({ variant: 'destructive', description: 'File type not supported' })
    const write = WRITE_FUNC_MAP[contentType]
    try {
      await write(path, elements, appState, files)
    } catch (error) {
      toast({ variant: 'destructive', description: 'Write file failed' })
    }
  })

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     console.log('[faiz:] === e', e)
  //     if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
  //       e.preventDefault()
  //       onSave()
  //     }
  //   }
  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => window.removeEventListener('keydown', handleKeyDown)
  // }, [onSave])

  return (
    <div className="w-screen h-screen">
      <Excalidraw
        key={drawData?.filePath}
        ref={excalidrawRef}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
        // viewModeEnabled={!Boolean(drawData?.filePath)}
        theme={theme}
        initialData={{...drawData?.fileContent, scrollToContent: true}}
        onChange={(elements, appState, files) => {
          if (!drawData?.fileContent?.elements) return
          const initialVersion = getSceneVersion(drawData?.fileContent?.elements)
          const curVersion = getSceneVersion(elements)
          if (initialVersion !== curVersion) onChange(elements, appState, files)
        }}
        renderSidebar={() => <Sidebar><Side /></Sidebar>}
      >
        <MainMenu>
          <MainMenu.Group title="Mate items">
            <MainMenu.Item onSelect={() => console.log('settings')}>
              Settings
            </MainMenu.Item>
            <MainMenu.ItemLink href="https://excalidraw.com">
              Excalidraw
            </MainMenu.ItemLink>
          </MainMenu.Group>
          <MainMenu.Group title="Excalidraw items">
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MainMenu.DefaultItems.ToggleTheme />
          </MainMenu.Group>
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>Excalidraw Mate</WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              Excalidraw Desktop
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemHelp />
              <WelcomeScreen.Center.MenuItemLiveCollaborationTrigger
                onSelect={() => console.log('xxxx')}
              />
              {true && (
                <WelcomeScreen.Center.MenuItem
                  onSelect={() => console.log("doing something!")}
                >
                  Do something
                </WelcomeScreen.Center.MenuItem>
              )}
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
        <Footer>
          {/* <Button variant="outline" className="ml-2">
            <FileCog2 strokeWidth="1" size={22} onClick={() => setAppData(_data => ({ ..._data, showFilePanel: !_data?.showFilePanel }))} />
          </Button> */}
          <Button variant="outline" className="ml-2">
            <FileCog2 strokeWidth="1" size={22} onClick={() => excalidrawRef?.current?.toggleMenu('customSidebar')} />
          </Button>
          {/* <Button variant="outline" className="ml-2" onClick={onSave}>
            { hasUnsavedChanges ? 'Save' : 'Saved' }
          </Button> */}
        </Footer>
      </Excalidraw>
    </div>
  )
}

export default Draw

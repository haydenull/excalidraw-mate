import React, { useRef } from 'react'
import { useSetAtom } from 'jotai'
import { Excalidraw, WelcomeScreen, Footer, getSceneVersion, MainMenu, exportToSvg } from '@excalidraw/excalidraw'
import { type DrawData } from '@/model/draw'
import { appAtom } from '@/model/app'
import { FileBox, FolderOpen, Github, Type } from 'lucide-react'
import { WRITE_FUNC_MAP } from '@/lib/writeExcalidrawFile'
import { useToast } from '@/hooks/useToast'
import { debounce } from '@/lib/utils'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import useMediaQuery from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { Button } from '@excalidraw/excalidraw'
import { open as openUrl } from '@tauri-apps/api/shell'


const Draw: React.FC<{
  drawData: DrawData
  style?: React.CSSProperties
  className?: string
}> = ({ drawData, style, className }) => {
  const setAppData = useSetAtom(appAtom)
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
  const { toast } = useToast()

  const theme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'

  const onChange = debounce(async (elements, appState, files) => {
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

  return (
    <div className={cn('w-screen h-screen', className)} style={style}>
      <Excalidraw
        key={drawData?.filePath}
        ref={excalidrawRef}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
        viewModeEnabled={!Boolean(drawData?.filePath)}
        theme={theme}
        initialData={{...drawData?.fileContent, scrollToContent: true}}
        onChange={(elements, appState, files) => {
          if (!drawData?.fileContent?.elements) return
          const initialVersion = getSceneVersion(drawData?.fileContent?.elements)
          const curVersion = getSceneVersion(elements)
          if (initialVersion !== curVersion) onChange(elements, appState, files)
        }}
        renderTopRightUI={() => (
          <Button
            onSelect={() => setAppData(_data => ({..._data, isShowSidebar: true}))}
            style={{ width: 41, height: 41 }}
          >
            <FileBox strokeWidth="1.5" size={18} />
          </Button>
        )}
      >
        <MainMenu>
          {/* <MainMenu.Group title="Mate items"> */}
            <MainMenu.Item icon={<FolderOpen />} onSelect={() => setAppData(_data => ({ ..._data, isDirectoryDialogOpen: true }))}>
              Manage Directory
            </MainMenu.Item>
            <MainMenu.Item icon={<Type />} onSelect={() => setAppData(_data => ({ ..._data, isFontDialogOpen: true }))}>
              Font Family
            </MainMenu.Item>
            <MainMenu.Item icon={<Github />} onSelect={() => openUrl('https://github.com/haydenull/excalidraw-mate')}>
              Github
            </MainMenu.Item>
          {/* </MainMenu.Group> */}
          {/* <MainMenu.Group title="Excalidraw items"> */}
            {/* <MainMenu.DefaultItems.LoadScene /> */}
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            {/* <MainMenu.DefaultItems.ToggleTheme /> */}
          {/* </MainMenu.Group> */}
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>Excalidraw Mate</WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              Excalidraw Desktop
            </WelcomeScreen.Center.Heading>
            {/* <WelcomeScreen.Center.Menu>
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
            </WelcomeScreen.Center.Menu> */}
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
    </div>
  )
}

export default Draw

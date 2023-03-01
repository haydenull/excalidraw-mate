import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { Excalidraw, WelcomeScreen, Footer } from '@excalidraw/excalidraw'
import { drawAtom } from '@/model/draw'
import { appAtom } from '@/model/app'
import { FileCog2 } from 'lucide-react'

const Draw: React.FC<{}> = () => {
  const [drawData] = useAtom(drawAtom)
  const [, setAppData] = useAtom(appAtom)
  console.log('[faiz:] === drawData', drawData)

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = isDarkMode ? 'dark' : 'light'

  return (
    <div className="w-screen h-screen">
      {
        drawData?.fileContent
        ? <Excalidraw key={drawData?.filePath} theme={theme} initialData={{...drawData?.fileContent}} />
        : (<Excalidraw theme={theme}>
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
            <FileCog2 onClick={() => setAppData(_data => ({ ..._data, showFilePanel: !_data?.showFilePanel }))} />
          </Footer>
        </Excalidraw>)
      }
    </div>
  )
}

export default Draw

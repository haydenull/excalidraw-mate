import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { Excalidraw } from '@excalidraw/excalidraw'
import { drawAtom } from '@/model/draw'

const Draw: React.FC<{}> = () => {
  const [drawData] = useAtom(drawAtom)
  console.log('[faiz:] === drawData', drawData)

  return (
    <div className="w-screen h-screen">
      {
        drawData?.fileContent && <Excalidraw key={drawData?.filePath} theme="dark" initialData={{...drawData?.fileContent}} />
      }
    </div>
  )
}

export default Draw

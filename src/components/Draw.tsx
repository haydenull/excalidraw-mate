import React, { useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'

const Draw: React.FC<{}> = () => {
  return (
    <div className="w-screen h-screen">
      <Excalidraw />
    </div>
  )
}

export default Draw

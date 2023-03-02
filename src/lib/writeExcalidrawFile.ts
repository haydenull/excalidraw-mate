import { exportToBlob, exportToSvg, serializeAsJSON } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types'
import { writeFile, writeBinaryFile, writeTextFile } from '@tauri-apps/api/fs'

const textEncoder = new TextEncoder()

const writePng = async (
  path: string,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
) => {
  const blob = await exportToBlob({
    elements,
    appState,
    files,
    getDimensions: (width, height) => {
      const scale = appState.exportScale || 2
      return {
        width: width * scale,
        height: height * scale,
        scale,
      }
    },
  })

  if (!blob) {
    alert('Could not export to PNG')
    return Promise.reject(new Error('Failed to export to PNG'))
  }

  const arrayBuffer = await blob.arrayBuffer()
  const _content = Array.from(new Uint8Array(arrayBuffer))
  return writeBinaryFile(path, new Uint8Array(_content))
}

export const writeExcalidrawFile = async (
  path: string,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
) => {
  const _content = Array.from(textEncoder.encode(serializeAsJSON(elements, appState, files, 'local')))
  return writeBinaryFile(path, new Uint8Array(_content))
}

export const writeSvg = async (
  path: string,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
) => {
  const svg = await exportToSvg({
    elements,
    appState,
    files,
  })
  const _content = Array.from(textEncoder.encode(svg.outerHTML))
  return writeBinaryFile(path, new Uint8Array(_content))
}
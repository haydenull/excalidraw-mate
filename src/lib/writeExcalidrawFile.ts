import { exportToBlob, exportToSvg, serializeAsJSON } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types'
import { writeFile, writeBinaryFile, writeTextFile } from '@tauri-apps/api/fs'
import type { ValuesType } from 'utility-types'
import { CONTENT_TYPE } from './constants'

const textEncoder = new TextEncoder()

export const writePng = async (
  path: string,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
) => {
  const blob = await exportToBlob({
    elements,
    appState: {
      ...appState,
      exportEmbedScene: true,
    },
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

export const WRITE_FUNC_MAP = {
  [CONTENT_TYPE.PNG]: writePng,
  [CONTENT_TYPE.JSON]: writeExcalidrawFile,
  [CONTENT_TYPE.SVG]: writeSvg,
}
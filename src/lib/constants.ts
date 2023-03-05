export const CONTENT_TYPE = {
  JSON: 'application/json',  // .excalidraw application/json
  PNG: 'image/png',          // .excalidraw.png image/png
  SVG: 'image/svg+xml',      // .excalidraw.svg image/svg+xml
} as const

export const FONT_ID = {
  'Hand-drawn': 'Virgil',
  'Normal': 'Cascadia',
  'Code': 'Assistant',
} as const
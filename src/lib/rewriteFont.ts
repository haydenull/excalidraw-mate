const rewriteFont = (fontFamily: string, fontUrl: string, fontType = 'font/woff2') => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = fontUrl
  link.as = 'font'
  link.type = fontType
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)

  const style = document.createElement('style')
  style.innerHTML = `
    @font-face {
      font-family: "${fontFamily}";
      src: url("${fontUrl}");
      font-display: swap;
    }
  `
  document.head.appendChild(style)
}

export default rewriteFont
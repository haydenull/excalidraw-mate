import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CONTENT_TYPE } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getContentType = (fileName: string) => {
  return fileName?.endsWith('.png') ? CONTENT_TYPE.PNG : fileName?.endsWith('.svg') ? CONTENT_TYPE.SVG : CONTENT_TYPE.JSON
}

export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number = 1000) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

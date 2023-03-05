import { Store } from 'tauri-plugin-store-api'
import { FONT_ID } from '@/lib/constants'

const store = new Store('.settings.dat')

export type ISettings = Partial<{
  theme: 'light' | 'dark' | 'system';
  directories: {path: string; alias?: string}[];
  lastDirectory: string;
  customFont: Partial<Record<keyof typeof FONT_ID, string>>;
}>

export const setSettings = async <TKey extends keyof ISettings>(key: TKey, value: ISettings[TKey]) => {
  const _settings = await store.get<ISettings>('settings') || {}
  return await store.set('settings', { ..._settings, [key]: value })
}

export const getSettings = async () => {
  return await store.get<ISettings>('settings') || {}
}
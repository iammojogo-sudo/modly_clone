import type {
  AssetLibraryListResult,
  AssetLibraryOpenRequest,
  AssetLibraryOpenResult,
  AssetLibraryReadRequest,
  AssetLibraryReadResult,
} from '../../src/shared/types/assetLibrary.ts'

export interface IpcRendererLike {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>
  send(channel: string, ...args: unknown[]): void
  on(channel: string, listener: (...args: unknown[]) => void): void
  removeAllListeners(channel: string): void
}

export interface WebFrameLike {
  setZoomFactor(factor: number): void
}

export function createElectronApi(ipcRenderer: IpcRendererLike, webFrame: WebFrameLike) {
  return {
    window: {
      minimize: () => ipcRenderer.send('window:minimize'),
      maximize: () => ipcRenderer.send('window:maximize'),
      close:    () => ipcRenderer.send('window:close'),
    },
    ui: { setZoomFactor: (factor: number) => webFrame.setZoomFactor(factor) },
    shell: { openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url) },
    workspace: {
      library: {
        list: (): Promise<AssetLibraryListResult> => ipcRenderer.invoke('workspace:library:list') as Promise<AssetLibraryListResult>,
        read: (request: AssetLibraryReadRequest): Promise<AssetLibraryReadResult> => ipcRenderer.invoke('workspace:library:read', request) as Promise<AssetLibraryReadResult>,
        open: (request: AssetLibraryOpenRequest): Promise<AssetLibraryOpenResult> => ipcRenderer.invoke('workspace:library:open', request) as Promise<AssetLibraryOpenResult>,
      },
    },
  }
}

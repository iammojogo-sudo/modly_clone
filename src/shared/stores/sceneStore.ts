import { create } from 'zustand'

export interface SceneMesh {
  id: string
  name: string
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  visible: boolean
}

export interface SceneData {
  meshes: SceneMesh[]
  version: number
}

const SCENE_VERSION = 1

interface SceneState {
  meshes: SceneMesh[]
  selectedMeshId: string | null
  activeSceneFile: string | null
  isDirty: boolean

  addMesh: (mesh: Omit<SceneMesh, 'id'>) => string
  removeMesh: (id: string) => void
  updateMesh: (id: string, patch: Partial<SceneMesh>) => void
  updateMeshTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void
  setSelectedMesh: (id: string | null) => void
  clearScene: () => void
  saveScene: (filename?: string) => Promise<void>
  loadScene: (filename: string) => Promise<void>
  listScenes: () => Promise<string[]>
  setActiveSceneFile: (filename: string | null) => void
  setMeshes: (meshes: SceneMesh[]) => void
}

export const useSceneStore = create<SceneState>()((set, get) => ({
  meshes: [],
  selectedMeshId: null,
  activeSceneFile: null,
  isDirty: false,

  addMesh: (mesh) => {
    const id = crypto.randomUUID()
    set((state) => ({
      meshes: [...state.meshes, { id, ...mesh }],
      isDirty: true,
      selectedMeshId: id,
    }))
    return id
  },

  removeMesh: (id) => {
    set((state) => ({
      meshes: state.meshes.filter((m) => m.id !== id),
      selectedMeshId: state.selectedMeshId === id ? null : state.selectedMeshId,
      isDirty: true,
    }))
  },

  updateMesh: (id, patch) => {
    set((state) => ({
      meshes: state.meshes.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      isDirty: true,
    }))
  },

  updateMeshTransform: (id, position, rotation, scale) => {
    set((state) => ({
      meshes: state.meshes.map((m) =>
        m.id === id ? { ...m, position, rotation, scale } : m
      ),
      isDirty: true,
    }))
  },

  setSelectedMesh: (id) => set({ selectedMeshId: id }),

  clearScene: () => set({ meshes: [], selectedMeshId: null, activeSceneFile: null, isDirty: false }),

  setMeshes: (meshes) => set({ meshes, selectedMeshId: null, isDirty: false }),

  saveScene: async (filename) => {
    const state = get()
    const name = filename ?? state.activeSceneFile ?? `scene-${Date.now()}`
    const sceneData: SceneData = {
      meshes: state.meshes,
      version: SCENE_VERSION,
    }
    const result = await window.electron.scene.save({ filename: name, scene: sceneData })
    if (result.success) {
      set({ activeSceneFile: name, isDirty: false })
    } else {
      console.error('Failed to save scene:', result.error)
    }
  },

  loadScene: async (filename) => {
    const result = await window.electron.scene.load(filename)
    if (result.success && result.scene) {
      const data = result.scene as SceneData
      set({
        meshes: data.meshes ?? [],
        selectedMeshId: null,
        activeSceneFile: filename,
        isDirty: false,
      })
    } else {
      console.error('Failed to load scene:', result.error)
    }
  },

  listScenes: async () => {
    return window.electron.scene.list()
  },

  setActiveSceneFile: (filename) => set({ activeSceneFile: filename }),
}))

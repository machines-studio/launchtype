const params = new URLSearchParams(window.location.search)
const debug = String(params.get('debug')).split(',')

export const DPR = parseFloat(params.get('dpr') ?? window.devicePixelRatio ?? 1)
export const CABLE_BLEND_MODE_NORMAL = 0
export const CABLE_BLEND_MODE_SCREEN = 12

export const PLAYBACK_RATE = parseFloat(params.get('pbr') ?? '1')
export const PAROLES_LABEL_MAX_LENGTH = 50

export const PATCH_GRADIENTS_COLOR_LENGTH = 6

export const SHOW_CABLE_UI = debug.includes('cables')
export const DEBUG_PAD_MAP = String(params.get('pad-map')).split(',')
export const DEBUG_POINTERS = debug.includes('pointers')
export const DEBUG_WORDS = debug.includes('words')

export const SERVER_URL = import.meta.env.DEV ? 'https://localhost:8888' : window.location.origin
export const API_URL = SERVER_URL + '/api'
export const WS_URL = (window.location.protocol === 'https' ? 'wss://' : 'ws://') + 'localhost:1337'

export const PAROLES = {
  fetch: async () => {
    const resp = await fetch(API_URL + '/paroles')
    return resp.json()
  }
}

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

// TODO dynamic url
export const API_URL = 'http://localhost:8888/api'
export const WS_URL = 'ws://localhost:8888'

export const PAROLES = {
  fetch: async () => {
    const resp = await fetch(API_URL + '/paroles')
    return resp.json()
  }
}

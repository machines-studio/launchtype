const params = new URLSearchParams(window.location.search)
const debug = String(params.get('debug')).split(',')

export const CABLE_BLEND_MODE_NORMAL = 0
export const CABLE_BLEND_MODE_SCREEN = 12

export const PLAYBACK_RATE = parseFloat(params.get('pbr') ?? '1')
export const PAROLES_LABEL_MAX_LENGTH = 50

export const PATCH_GRADIENTS_COLOR_LENGTH = 6

export const SHOW_CABLE_UI = debug.includes('cables')
export const DEBUG_PAD_MAP = params.get('pad-map')
export const DEBUG_POINTERS = debug.includes('pointers')
export const DEBUG_WORDS = debug.includes('words')

import cables from '@cables/cables'
import { loadEnv } from 'vite'

const env = loadEnv('production', process.cwd(), '')
if (!env.CABLE_PATCH_ID) throw new Error('No CABLE_PATCH_ID defined in .env')

cables.export({
  patchId: process.argv[2] ?? env.CABLE_PATCH_ID,
  apiKey: env.CABLE_API_KEY,
  destination: 'assets/cables',
  minifyGlsl: false,
  combineJs: true,
  jsonFilename: 'patch.json',
  assets: 'all',
  noSubdirs: true,
  sourcemaps: true,
  hideMadeWithCables: true
}, () => {
  console.log('done !')
}, error => {
  console.error(error)
  process.exit(1)
})

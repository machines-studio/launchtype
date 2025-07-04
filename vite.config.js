import path from 'path'
import { defineConfig, loadEnv } from 'vite'

// If a backend is needed, see https://vitejs.dev/guide/backend-integration.html

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    root: path.join(__dirname, 'src'),
    publicDir: path.join(__dirname, 'assets'),
    envDir: path.join(__dirname),
    build: { outDir: path.join(__dirname, 'build') },

    base: env.BASE || '/',

    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version)
    },

    resolve: {
      alias: {
        // Dynamically importable assets using import.meta.glob
        '@assets': path.resolve(__dirname, 'assets')
      }
    },

    plugins: [
      { // Replace index.jsx by test/test.jsx as entry in test mode
        name: 'html-inject-test',
        transformIndexHtml: html => mode === 'test' ? html.replace('/index.jsx', '/test/test.jsx') : html,
        config: () => ({
          resolve: {
            alias: { '/test': path.join(__dirname, 'test') }
          }
        })
      }
    ],

    server: {
      port: 8080,
      host: true,
      allowedHosts: ['.local']
    },

    css: {
      devSourcemap: true,
      modules: {
        scopeBehaviour: 'global',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api', 'mixed-decls', 'import'],
          additionalData: `
            @use '/style/_helpers' as *;
            @use '/style/_devices' as *;
            $env: ${mode};
          `
        }
      }
    },

    esbuild: {
      jsxInject: "import { h } from '@tooooools/ui'",
      jsxFactory: 'h'
    }
  }
})

import { defineConfig } from 'vite'
import { resolve } from 'path'
import { globSync } from 'glob'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import htmlMinimize from '@sergeymakinen/vite-plugin-html-minimize'
import htmlInject from 'vite-plugin-html-inject'

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: true,
		cssMinify: 'lightningcss',

		rollupOptions: {
			input: {
				// Główny index.html → dist/index.html
				index: resolve(__dirname, 'index.html'),

				// Strony HTML → dist/html/page.html itp.
				...Object.fromEntries(
					globSync('html/**/*.html').map(file => {
						const name = file.replace(/\.html$/, '')
						return [name, resolve(__dirname, file)]
					}),
				),
				// obrazki są w public/img → nie dodajemy ich do input
			},

			output: {
				entryFileNames: chunk => {
					const name = chunk.name.split('/').pop()
					return `js/${name}.min.js`
				},
				chunkFileNames: chunk => {
					const name = chunk.name.split('/').pop()
					return `js/${name}.min.js`
				},

				assetFileNames: assetInfo => {
					const name = assetInfo.name ?? ''
					if (name.endsWith('.css')) {
						return 'css/[name].min.css'
					}
					if (name.endsWith('.map')) {
						let base = name.replace(/\.map$/, '')
						if (base.includes('/')) base = base.split('/').pop()
						if (base.endsWith('.js')) base = base.slice(0, -3)
						return `js/${base}.min.js.map`
					}
					return '[name][extname]'
				},
			},
		},
	},

	server: {
		port: 3000,
		open: true,
	},

	css: {
		devSourcemap: true,
	},

	plugins: [
		htmlInject(),
		ViteImageOptimizer({
			png: {
				quality: 75, // 0-100
			},
			jpg: {
				quality: 75,
			},
			jpeg: {
				quality: 75,
			},
			webp: {
				quality: 75,
			},
			// avif: { quality: 50 },   // jeśli chcesz avif
			// svg: { multipass: true },
			cache: false,
			logStats: true, // pokaże statystyki kompresji
		}),

		htmlMinimize({
			minify: {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true,
				minifyCSS: true,
				minifyJS: true,
			},
		}),
	],
})

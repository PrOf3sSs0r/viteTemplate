// import { defineConfig } from 'vite'
// import { resolve } from 'path'
// import { globSync } from 'glob'
// import imagemin from 'vite-plugin-imagemin'

// export default defineConfig({
// 	build: {
// 		rollupOptions: {
// 			input: {
// 				index: resolve(__dirname, 'index.html'),
// 				...globSync('src/html/**/*.html').reduce((acc, file) => {
// 					const relative = file.replace(/^src\/html\//, '').replace(/\.html$/, '')
// 					acc[relative] = resolve(__dirname, file)
// 					return acc
// 				}, {}),
// 			},
// 		},
// 		sourcemap: true,
// 		emptyOutDir: true,
// 		cssMinify: 'lightningcss',
// 	},
// 	server: {
// 		port: 3000,
// 		open: true,
// 	},
// 	css: {
// 		devSourcemap: true,
// 	},
// 	plugins: [
// 		imagemin({
// 			gifsicle: { optimizationLevel: 7 },
// 			optipng: { optimizationLevel: 7 },
// 			mozjpeg: { quality: 75 },
// 			pngquant: { quality: [0.65, 0.8], speed: 4 },
// 			svgo: {
// 				plugins: [
// 					{ name: 'removeViewBox', active: false },
// 					{ name: 'cleanupIDs', active: false },
// 				],
// 			},
// 			webp: { quality: 75 },
// 		}),
// 	],
// })

import { defineConfig } from 'vite'
import { resolve } from 'path'
import { globSync } from 'glob'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import htmlMinimize from '@sergeymakinen/vite-plugin-html-minimize'

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: true,
		cssMinify: 'lightningcss',

		rollupOptions: {
			input: {
				// Główny index.html z roota → dist/index.html
				index: resolve(__dirname, 'index.html'),

				// Strony z html/ → zachowujemy strukturę dist/html/page.html itp.
				...Object.fromEntries(
					globSync('html/**/*.html').map(file => {
						const name = file.replace(/\.html$/, '') // np. html/page
						return [name, resolve(__dirname, file)]
					}),
				),
			},

			output: {
				// JS entry / chunks → nazwa.min.js (bez hasha, bez podfolderu html/)
				entryFileNames: chunk => {
					const name = chunk.name.split('/').pop() // "page" zamiast "html/page"
					return `js/${name}.min.js`
				},

				chunkFileNames: chunk => {
					const name = chunk.name.split('/').pop()
					return `js/${name}.min.js`
				},

				// Assets – bez hasha, bez folderu assets/
				assetFileNames: assetInfo => {
					const name = assetInfo.name ?? ''

					// CSS → css/nazwa.min.css
					if (name.endsWith('.css')) {
						return 'css/[name].min.css'
					}

					// Obrazki → img/nazwa.rozszerzenie (bez hasha)
					if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
						return 'img/[name][extname]'
					}

					// Sourcemapy → js/nazwa.min.js.map (bez hasha)
					if (name.endsWith('.map')) {
						let base = name.replace(/\.map$/, '')
						if (base.includes('/')) {
							base = base.split('/').pop()
						}
						// jeśli kończy się na .js → usuwamy to
						if (base.endsWith('.js')) {
							base = base.slice(0, -3)
						}
						return `js/${base}.min.js.map`
					}

					// Fallback dla wszystkiego innego (fonty, json itp.) → wrzucamy do root dist/
					// (to zapobiega pojawieniu się assets/)
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
		ViteImageOptimizer({
			png: {
				quality: [0.65, 0.8],
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
			avif: {
				quality: 70,
			},
			gif: {
				optimizationLevel: 7,
			},
			svg: {
				multipass: true,
				plugins: [
					{ name: 'removeViewBox', active: false },
					{ name: 'cleanupIDs', active: false },
				],
			},
			include: ['**/*.{png,jpg,jpeg,gif,svg,webp,avif}'],
			logStats: true,
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

import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3333,
		host: true,
		watch: {
			usePolling: true,
		},
	},
});

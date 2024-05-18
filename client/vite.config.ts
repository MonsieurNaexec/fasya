import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig((configEnv) => {
  const isDevelopment = configEnv.mode === "development";

  return {
    build: {
      outDir: "../server/public",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          app: resolve(__dirname, "index.html"),
          admin: resolve(__dirname, "admindashboard.html"),
        },
      },
    },
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 3000,
      proxy: {
        "/socket.io/": {
          target: "http://localhost:3030",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/admin/": {
          target: "http://localhost:3030",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: "./src/infrastructure/tests.setup.ts",
    },
    resolve: {
      alias: {
        app: resolve(__dirname, "src", "app"),
        components: resolve(__dirname, "src", "components"),
        hooks: resolve(__dirname, "src", "hooks"),
      },
    },
    css: {
      modules: {
        generateScopedName: isDevelopment
          ? "[name]__[local]__[hash:base64:5]"
          : "[hash:base64:5]",
      },
    },
  };
});

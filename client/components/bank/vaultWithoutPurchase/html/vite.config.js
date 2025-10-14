import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(() => {
  const useLocalSDK = process.env.LOCAL_SDK === 'true';

  return {
    root: resolve(__dirname, "src"),
    server: {
      port: 5174,
      proxy: useLocalSDK ? {
        '/web-sdk': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
        }
      } : {}
    },
    define: {
      'import.meta.env.LOCAL_SDK': JSON.stringify(useLocalSDK),
    },
  };
});

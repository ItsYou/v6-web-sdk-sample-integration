import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const useLocalSDK = process.env.LOCAL_SDK === 'true';

  return {
    plugins: [],
    root: "src",
    server: {
      port: 3000,
      proxy: {
        "/paypal-api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
        ...(useLocalSDK ? {
          '/web-sdk': {
            target: 'https://localhost.paypal.com:3002',
            changeOrigin: true,
            secure: false,
          }
        } : {})
      },
    },
    define: {
      'import.meta.env.LOCAL_SDK': JSON.stringify(useLocalSDK),
    },
  };
});

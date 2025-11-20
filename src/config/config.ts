export const config: Config = {
  frontendUrl: import.meta.env.VITE_FRONTEND_URL!,
  backendUrl: import.meta.env.VITE_BACKEND_URL!,
};

interface Config {
  frontendUrl: string;
  backendUrl: string;
}

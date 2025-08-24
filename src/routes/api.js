import axios from 'axios';

const BASE =
  process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,                  // trimite cookie-urile
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
});

// Pentru cereri care dau 419 (fără CSRF), refacem CSRF și reîncercăm
export async function bootCsrf() {
  await api.get('/sanctum/csrf-cookie');
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (response && response.status === 419 && !config._retry) {
      config._retry = true;
      await bootCsrf();
      return api.request(config);
    }
    throw err;
  }
);

export default api;
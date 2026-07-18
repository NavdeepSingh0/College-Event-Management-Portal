// frontend/src/utils/api.js

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const API = {
    getToken() {
        return localStorage.getItem('cu_token');
    },

    setToken(token) {
        if (token) {
            localStorage.setItem('cu_token', token);
        } else {
            localStorage.removeItem('cu_token');
        }
    },

    async request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        const token = this.getToken();
        if (token) {
            opts.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            opts.body = JSON.stringify(body);
        }

        try {
            const res = await fetch(`${API_BASE}${path}`, opts);
            
            // Handle 401 Unauthorized globally
            if (res.status === 401) {
                this.setToken(null);
                window.dispatchEvent(new Event('auth:unauthorized'));
            }

            const data = await res.json().catch(() => ({}));
            
            if (!res.ok) {
                throw data;
            }

            return data;
        } catch (err) {
            throw err;
        }
    },

    get(path) { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body) { return this.request('PUT', path, body); },
    del(path) { return this.request('DELETE', path); }
};

export default API;

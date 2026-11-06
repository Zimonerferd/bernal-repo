import { ref, computed } from 'vue';
import axios from 'axios';
import { useNotify } from './useNotify';

const { showMessage } = useNotify();

// One shared axios instance for the whole app
export const api = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json' },
});

// ---------- Authentication state (ref) ----------
const token = ref(localStorage.getItem('token') || '');
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const authLoading = ref(false);
const loginError = ref('');

// ---------- Derived state (computed) ----------
const isLoggedIn = computed(() => token.value !== '');
const isAdmin = computed(() => user.value?.role === 'admin');
const tokenPreview = computed(() => (token.value ? token.value.slice(0, 6) + '...' : ''));

// Send the token as a Bearer token on every request
api.interceptors.request.use((config) => {
    if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
});

// If Laravel says 401, the token is invalid or expired: go back to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && token.value) {
            clearSession();
            showMessage('Your session expired. Please log in again.', 'error');
        }
        return Promise.reject(error);
    }
);

function clearSession() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

async function login(credentials) {
    loginError.value = '';
    authLoading.value = true;
    try {
        const { data } = await api.post('/login', credentials);
        token.value = data.token;
        user.value = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage(`Welcome, ${data.user.name}!`);
    } catch (e) {
        if (e.response?.status === 401) {
            loginError.value = e.response.data.message;
        } else if (e.response?.status === 422) {
            loginError.value = Object.values(e.response.data.errors).flat().join(' ');
        } else {
            loginError.value = 'Something went wrong. Is the server running?';
        }
    } finally {
        authLoading.value = false;
    }
}

async function logout() {
    try {
        await api.post('/logout');
    } catch (e) {
        // ignore: we clear the session either way
    }
    clearSession();
    showMessage('You have been logged out.');
}

export function useAuth() {
    return {
        token,
        user,
        isLoggedIn,
        isAdmin,
        tokenPreview,
        authLoading,
        loginError,
        login,
        logout,
    };
}
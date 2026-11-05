<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AlertMessage from './components/AlertMessage.vue';
import LoginForm from './components/LoginForm.vue';
import StudentForm from './components/StudentForm.vue';
import StudentTable from './components/StudentTable.vue';

const api = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json' },
});

const token = ref(localStorage.getItem('token') || '');
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const students = ref([]);
const loading = ref(false);
const saving = ref(false);
const showForm = ref(false);
const editing = ref(null);
const errors = ref({});
const loginError = ref('');
const message = ref({ text: '', type: 'success' });
let messageTimer = null;

const isAdmin = computed(() => user.value?.role === 'admin');

// Attach the bearer token to every request
api.interceptors.request.use((config) => {
    if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
});

// If the token is rejected, go back to the login screen
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

function showMessage(text, type = 'success') {
    clearTimeout(messageTimer);
    message.value = { text, type };
    messageTimer = setTimeout(() => (message.value.text = ''), 4000);
}

function clearSession() {
    token.value = '';
    user.value = null;
    students.value = [];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    closeForm();
}

async function login(credentials) {
    loginError.value = '';
    loading.value = true;
    try {
        const { data } = await api.post('/login', credentials);
        token.value = data.token;
        user.value = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage(`Welcome, ${data.user.name}!`);
        await fetchStudents();
    } catch (e) {
        if (e.response?.status === 401) {
            loginError.value = e.response.data.message;
        } else if (e.response?.status === 422) {
            loginError.value = Object.values(e.response.data.errors).flat().join(' ');
        } else {
            loginError.value = 'Something went wrong. Is the server running?';
        }
    } finally {
        loading.value = false;
    }
}

async function logout() {
    try {
        await api.post('/logout');
    } catch (e) {
        // ignore, we clear the session either way
    }
    clearSession();
    showMessage('You have been logged out.');
}

async function fetchStudents() {
    loading.value = true;
    try {
        const { data } = await api.get('/students');
        students.value = data;
    } catch (e) {
        if (e.response?.status !== 401) {
            showMessage('Failed to load students.', 'error');
        }
    } finally {
        loading.value = false;
    }
}

function openAdd() {
    editing.value = null;
    errors.value = {};
    showForm.value = true;
}

function openEdit(student) {
    editing.value = { ...student };
    errors.value = {};
    showForm.value = true;
}

function closeForm() {
    showForm.value = false;
    editing.value = null;
    errors.value = {};
}

async function saveStudent(payload) {
    saving.value = true;
    errors.value = {};
    try {
        if (payload.id) {
            await api.put(`/students/${payload.id}`, payload);
            showMessage('Student updated successfully.');
        } else {
            await api.post('/students', payload);
            showMessage('Student added successfully.');
        }
        closeForm();
        await fetchStudents();
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response.data.errors;
            showMessage('Please fix the validation errors below.', 'error');
        } else if (e.response?.status === 403) {
            showMessage('You do not have permission to do that.', 'error');
        } else if (e.response?.status !== 401) {
            showMessage('Something went wrong. Please try again.', 'error');
        }
    } finally {
        saving.value = false;
    }
}

async function deleteStudent(student) {
    if (!confirm(`Delete ${student.first_name} ${student.last_name}?`)) return;
    try {
        await api.delete(`/students/${student.id}`);
        showMessage('Student deleted successfully.');
        await fetchStudents();
    } catch (e) {
        if (e.response?.status === 403) {
            showMessage('You do not have permission to delete students.', 'error');
        } else if (e.response?.status === 404) {
            showMessage('That student no longer exists.', 'error');
            await fetchStudents();
        } else if (e.response?.status !== 401) {
            showMessage('Failed to delete student.', 'error');
        }
    }
}

onMounted(() => {
    if (token.value) fetchStudents();
});
</script>

<template>
    <div class="container">
        <header>
            <h1>Student Management</h1>
            <div v-if="user" class="user-box">
                <span>{{ user.name }}</span>
                <span class="badge">{{ user.role }}</span>
                <button class="btn-secondary" @click="logout">Logout</button>
            </div>
        </header>

        <AlertMessage :message="message.text" :type="message.type" />

        <LoginForm v-if="!token" :error="loginError" :loading="loading" @login="login" />

        <template v-else>
            <div class="toolbar">
                <button v-if="isAdmin" class="btn-primary" @click="openAdd">+ Add Student</button>
                <p v-else class="hint">You have read-only access (regular user).</p>
            </div>

            <StudentForm
                v-if="showForm"
                :student="editing"
                :errors="errors"
                :saving="saving"
                @save="saveStudent"
                @cancel="closeForm"
            />

            <StudentTable
                :students="students"
                :is-admin="isAdmin"
                :loading="loading"
                @edit="openEdit"
                @delete="deleteStudent"
            />
        </template>
    </div>
</template>
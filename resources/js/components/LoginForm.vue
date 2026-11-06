<script setup>
import { reactive } from 'vue';

defineProps({
    error: { type: String, default: '' },
    loading: { type: Boolean, default: false },
});

const emit = defineEmits(['login']);

const form = reactive({ email: '', password: '' });

function submit() {
    emit('login', { ...form });
}
</script>

<template>
    <div class="card login">
        <h2>Login</h2>

        <p v-if="error" class="error-box">{{ error }}</p>

        <form @submit.prevent="submit">
            <div class="field">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="you@example.com" />
            </div>
            <div class="field">
                <label>Password</label>
                <input v-model="form.password" type="password" placeholder="Password" />
            </div>
            <button class="btn-primary" type="submit" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>
        </form>
    </div>
</template>
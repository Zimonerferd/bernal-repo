<script setup>
import AlertMessage from './components/AlertMessage.vue';
import LoginForm from './components/LoginForm.vue';
import StudentForm from './components/StudentForm.vue';
import StudentTable from './components/StudentTable.vue';
import { useAuth } from './composables/useAuth';
import { useNotify } from './composables/useNotify';
import { useStudents } from './composables/useStudents';

const { user, isLoggedIn, isAdmin, tokenPreview, authLoading, loginError, login, logout } = useAuth();
const { message } = useNotify();
const {
    students,
    filteredStudents,
    search,
    ui,
    editing,
    errors,
    openAdd,
    openEdit,
    closeForm,
    saveStudent,
    deleteStudent,
} = useStudents();
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

        <LoginForm v-if="!isLoggedIn" :error="loginError" :loading="authLoading" @login="login" />

        <template v-else>
            <div class="card state-card">
                <strong>Session state</strong>
                <ul>
                    <li>Logged in: {{ isLoggedIn }}</li>
                    <li>Role: {{ user?.role }}</li>
                    <li>Is admin: {{ isAdmin }}</li>
                    <li>Bearer token: {{ tokenPreview }}</li>
                    <li>Students loaded: {{ students.length }}</li>
                </ul>
            </div>

            <div class="toolbar">
                <div>
                    <button v-if="isAdmin" class="btn-primary" @click="openAdd">+ Add Student</button>
                    <p v-else class="hint">You have read-only access (regular user).</p>
                </div>
                <input v-model="search" class="search" type="text" placeholder="Search students..." />
            </div>

            <StudentForm
                v-if="ui.showForm"
                :student="editing"
                :errors="errors"
                :saving="ui.saving"
                @save="saveStudent"
                @cancel="closeForm"
            />

            <StudentTable
                :students="filteredStudents"
                :is-admin="isAdmin"
                :loading="ui.loading"
                :deleting-id="ui.deletingId"
                @edit="openEdit"
                @delete="deleteStudent"
            />
        </template>
    </div>
</template>
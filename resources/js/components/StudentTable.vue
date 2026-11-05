<script setup>
defineProps({
    students: { type: Array, default: () => [] },
    isAdmin: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
});

defineEmits(['edit', 'delete']);
</script>

<template>
    <div class="card">
        <p v-if="loading" class="empty">Loading students...</p>

        <p v-else-if="students.length === 0" class="empty">No student records found.</p>

        <table v-else>
            <thead>
                <tr>
                    <th>Student No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th v-if="isAdmin">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in students" :key="student.id">
                    <td>{{ student.student_number }}</td>
                    <td>{{ student.first_name }} {{ student.last_name }}</td>
                    <td>{{ student.email }}</td>
                    <td>{{ student.course }}</td>
                    <td>{{ student.year_level }}</td>
                    <td v-if="isAdmin" class="row-actions">
                        <button class="btn-edit" @click="$emit('edit', student)">Edit</button>
                        <button class="btn-delete" @click="$emit('delete', student)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
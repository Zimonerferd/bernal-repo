<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    student: { type: Object, default: null },
    errors: { type: Object, default: () => ({}) },
    saving: { type: Boolean, default: false },
});

const emit = defineEmits(['save', 'cancel']);

const form = reactive({
    student_number: '',
    first_name: '',
    last_name: '',
    email: '',
    course: '',
    year_level: 1,
});

// Fill the form when editing, reset it when adding
watch(
    () => props.student,
    (s) => {
        form.student_number = s?.student_number ?? '';
        form.first_name = s?.first_name ?? '';
        form.last_name = s?.last_name ?? '';
        form.email = s?.email ?? '';
        form.course = s?.course ?? '';
        form.year_level = s?.year_level ?? 1;
    },
    { immediate: true }
);

function submit() {
    emit('save', { id: props.student?.id, ...form });
}
</script>

<template>
    <div class="card">
        <h2>{{ student ? 'Edit Student' : 'Add Student' }}</h2>

        <form @submit.prevent="submit">
            <div class="form-grid">
                <div class="field">
                    <label>Student Number</label>
                    <input v-model="form.student_number" type="text" placeholder="2024-0001" />
                    <small v-if="errors.student_number" class="field-error">{{ errors.student_number[0] }}</small>
                </div>

                <div class="field">
                    <label>Email</label>
                    <input v-model="form.email" type="text" placeholder="juan@example.com" />
                    <small v-if="errors.email" class="field-error">{{ errors.email[0] }}</small>
                </div>

                <div class="field">
                    <label>First Name</label>
                    <input v-model="form.first_name" type="text" />
                    <small v-if="errors.first_name" class="field-error">{{ errors.first_name[0] }}</small>
                </div>

                <div class="field">
                    <label>Last Name</label>
                    <input v-model="form.last_name" type="text" />
                    <small v-if="errors.last_name" class="field-error">{{ errors.last_name[0] }}</small>
                </div>

                <div class="field">
                    <label>Course</label>
                    <input v-model="form.course" type="text" placeholder="BSIT" />
                    <small v-if="errors.course" class="field-error">{{ errors.course[0] }}</small>
                </div>

                <div class="field">
                    <label>Year Level</label>
                    <input v-model.number="form.year_level" type="number" min="1" max="6" />
                    <small v-if="errors.year_level" class="field-error">{{ errors.year_level[0] }}</small>
                </div>
            </div>

            <div class="actions">
                <button class="btn-primary" type="submit" :disabled="saving">
                    {{ saving ? 'Saving...' : student ? 'Update' : 'Save' }}
                </button>
                <button class="btn-secondary" type="button" @click="$emit('cancel')">Cancel</button>
            </div>
        </form>
    </div>
</template>
import { ref, reactive, computed, watch } from 'vue';
import { api, useAuth } from './useAuth';
import { useNotify } from './useNotify';

export function useStudents() {
    const { token } = useAuth();
    const { showMessage } = useNotify();

    // ref(): values we replace as a whole
    const students = ref([]);
    const editing = ref(null);
    const errors = ref({});
    const search = ref('');

    // reactive(): a group of related UI flags
    const ui = reactive({
        loading: false,
        saving: false,
        showForm: false,
        deletingId: null,
    });

    // computed(): the list filtered by the search box
    const filteredStudents = computed(() => {
        const q = search.value.trim().toLowerCase();
        if (!q) return students.value;
        return students.value.filter((s) =>
            `${s.student_number} ${s.first_name} ${s.last_name} ${s.email} ${s.course}`
                .toLowerCase()
                .includes(q)
        );
    });

    async function fetchStudents() {
        ui.loading = true;
        try {
            const { data } = await api.get('/students');
            students.value = data;
        } catch (e) {
            if (e.response?.status !== 401) {
                showMessage('Failed to load students.', 'error');
            }
        } finally {
            ui.loading = false;
        }
    }

    function openAdd() {
        editing.value = null;
        errors.value = {};
        ui.showForm = true;
    }

    function openEdit(student) {
        editing.value = { ...student };
        errors.value = {};
        ui.showForm = true;
    }

    function closeForm() {
        ui.showForm = false;
        editing.value = null;
        errors.value = {};
    }

    async function saveStudent(payload) {
        ui.saving = true;
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
            ui.saving = false;
        }
    }

    async function deleteStudent(student) {
        if (!confirm(`Delete ${student.first_name} ${student.last_name}?`)) return;
        ui.deletingId = student.id;
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
        } finally {
            ui.deletingId = null;
        }
    }

    // watch(): when the token appears, load the data; when it disappears, clear everything
    watch(
        token,
        (value) => {
            if (value) {
                fetchStudents();
            } else {
                students.value = [];
                search.value = '';
                closeForm();
            }
        },
        { immediate: true }
    );

    return {
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
    };
}
import { ref } from 'vue';

// Module-level ref: every component that calls useNotify() shares this state
const message = ref({ text: '', type: 'success' });
let timer = null;

export function useNotify() {
    function showMessage(text, type = 'success') {
        clearTimeout(timer);
        message.value = { text, type };
        timer = setTimeout(() => {
            message.value.text = '';
        }, 4000);
    }

    return { message, showMessage };
}
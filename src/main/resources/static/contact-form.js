document.addEventListener('alpine:init', () => {
    const DEFAULT_ERROR = 'An error occurred. Please try again.';

    function csrfHeaders() {
        const csrfMeta = document.querySelector('meta[name="_csrf"]');
        const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');
        if (!csrfMeta || !csrfHeaderMeta) {
            return {};
        }

        return { [csrfHeaderMeta.getAttribute('content')]: csrfMeta.getAttribute('content') };
    }

    async function jsonOrNull(response) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return null;
        }

        try {
            return await response.json();
        } catch (e) {
            return null;
        }
    }

    Alpine.data('contactForm', () => ({
        name: '',
        email: '',
        message: '',
        submitted: false,
        submitting: false,
        error: null,
        fieldErrors: {},
        async submit() {
            this.submitting = true;
            this.error = null;
            this.fieldErrors = {};
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                    body: JSON.stringify({ name: this.name, email: this.email, message: this.message })
                });

                if (response.ok) {
                    this.submitted = true;
                } else {
                    const data = await jsonOrNull(response);
                    this.fieldErrors = data?.errors || {};
                    this.error = data?.errors ? null : data?.message || DEFAULT_ERROR;
                }
            } catch (e) {
                this.error = 'Network error. Please try again.';
            } finally {
                this.submitting = false;
            }
        }
    }));
});

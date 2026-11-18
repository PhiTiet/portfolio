document.addEventListener('alpine:init', () => {
    Alpine.data('contactForm', () => ({
        name: '',
        email: '',
        message: '',
        website: '',
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        message: this.message,
                        website: this.website
                    })
                });
                if (response.ok) {
                    this.submitted = true;
                } else {
                    const data = /json/.test(response.headers.get('content-type') ?? '')
                        ? await response.json().catch(() => null)
                        : null;
                    if (data?.errors) this.fieldErrors = data.errors;
                    else this.error = data?.detail || this.$root.dataset.errorGeneric;
                }
            } catch (e) {
                this.error = this.$root.dataset.errorNetwork;
            } finally {
                this.submitting = false;
            }
        }
    }));
});

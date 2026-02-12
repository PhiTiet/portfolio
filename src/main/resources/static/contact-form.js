document.addEventListener('alpine:init', () => {
    Alpine.data('contactForm', () => ({
        name: '',
        email: '',
        message: '',
        submitted: false,
        submitting: false,
        error: null,
        async submit() {
            this.submitting = true;
            this.error = null;
            try {
                const csrfMeta = document.querySelector('meta[name="_csrf"]');
                const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (csrfMeta && csrfHeaderMeta) {
                    headers[csrfHeaderMeta.getAttribute('content')] = csrfMeta.getAttribute('content');
                }
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        message: this.message
                    })
                });
                if (response.ok) {
                    this.submitted = true;
                } else {
                    const data = await response.json();
                    this.error = data.message || 'An error occurred. Please try again.';
                }
            } catch (e) {
                this.error = 'Network error. Please try again.';
            } finally {
                this.submitting = false;
            }
        }
    }));
});

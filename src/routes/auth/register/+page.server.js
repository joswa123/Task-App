// src/routes/auth/register/+page.server.js
import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

const DEBUG = true;

export const actions = {
    default: async ({ request, cookies, url }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!name || !email || !password) {
            return fail(400, {
                error: 'All fields are required.',
                name,
                email
            });
        }

        try {
            const apiResponse = await fetch(`${url.origin}/api/auth/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const result = await apiResponse.json();

            if (apiResponse.ok && result.success) {
                cookies.set('session_id', result.sessionId, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7
                });

                throw redirect(303, '/tasks');
            } else {
                return fail(apiResponse.status || 400, {
                    error: result.error || 'Registration failed.',
                    name,
                    email
                });
            }
        } catch (error) {
            // --- THIS IS THE CORRECTED PART ---
            // Check if the error is a redirect object from SvelteKit
            if (error && error.status >= 300 && error.status < 400) {
                // It's a redirect, so re-throw it for SvelteKit to handle properly
                throw error;
            }
            
            // Otherwise, it's a different kind of error (e.g., network error)
            console.error('Registration form action error:', error);
            return fail(500, {
                error: 'An unexpected error occurred. Please try again.',
                name,
                email
            });
        }
    }
};
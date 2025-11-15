import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, cookies, url }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            return fail(400, {
                error: 'Email and password are required',
                email
            });
        }

        try {
            const response = await fetch(`${url.origin}/api/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Set the session cookie
                cookies.set('session_id', result.sessionId, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                });

                throw redirect(303, '/tasks');
            } else {
                return fail(400, {
                    error: result.error || 'Login failed',
                    email
                });
            }
        } catch (error) {
            if (error instanceof redirect) {
                throw error;
            }
            console.error('Login error:', error);
            return fail(500, {
                error: 'Login failed. Please try again.',
                email
            });
        }
    }
};
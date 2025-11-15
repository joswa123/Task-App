// src/routes/+layout.server.js
import { redirect } from '@sveltejs/kit';

export function load({ locals, url }) {
    const user = locals.user;
    const currentPath = url.pathname;

    // Define public routes. The home page '/' is REMOVED from this list.
    const publicRoutes = ['/auth/login', '/auth/register'];
    
    // If user is NOT logged in and is NOT on a public route, redirect to login
    if (!user && !publicRoutes.includes(currentPath)) {
        throw redirect(303, '/auth/login');
    }

    // If user IS logged in and is on an auth page, redirect to tasks
    if (user && (currentPath === '/auth/login' || currentPath === '/auth/register')) {
        throw redirect(303, '/tasks');
    }

    // --- SPECIAL HANDLING FOR THE HOME PAGE '/' ---
    if (currentPath === '/') {
        if (user) {
            // If logged in, go to tasks
            throw redirect(303, '/tasks');
        } else {
            // If NOT logged in, go to login
            throw redirect(303, '/auth/login');
        }
    }

    // Return the validated user object for any other pages
    return {
        user: user
    };
}
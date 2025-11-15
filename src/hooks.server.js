// src/hooks.server.js
import { auth } from '$lib/server/auth.js';

export async function handle({ event, resolve }) {
    // 1. It checks if the user has a session_id cookie.
    //    This is like checking for a ticket at the door.
    const sessionId = event.cookies.get('session_id');
    
    if (sessionId) {
        try {
            // 2. If they have a cookie, it asks the database
            //    "Is this a valid session for a real user?"
            const user = await auth.validateSession(sessionId);

            if (user) {
                // 3. If the session is valid, it gives the user a "member pass".
                //    It attaches the user's data to the request, so every
                //    other part of the app knows who this person is.
                event.locals.user = user;
                event.locals.sessionId = sessionId;
            } else {
                // 4. If the session is invalid (e.g., expired), it takes
                //    their ticket away and tells them to get a new one.
                event.cookies.delete('session_id', { path: '/' });
            }
        } catch (error) {
            // 5. If the database check crashes, it also takes the ticket away
            //    as a safety measure.
            console.error('Error in hooks.server.js while validating session:', error);
            event.cookies.delete('session_id', { path: '/' });
        }
    }

    // 6. It lets the person proceed into the building.
    //    The `resolve(event)` passes control to the next step,
    //    which is usually the `+layout.server.js` file.
    return resolve(event);
}
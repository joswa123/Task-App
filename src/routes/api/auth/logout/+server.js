import { auth } from '../../../../lib/server/auth.js';
import { json } from '@sveltejs/kit';

export async function POST({ cookies, locals }) {
  const sessionId = cookies.get('session_id');
  
  if (sessionId) {
    await auth.deleteSession(sessionId);
    cookies.delete('session_id', { path: '/auth/register' });
  }

  return json({ success: true, message: 'Logged out successfully' });
}

import { auth } from '../../../../lib/server/auth.js';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional()
});

export async function POST({ request, cookies }) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    const user = await auth.createUser(email, password, name);
    const sessionId = await auth.createSession(user.id);
    
    cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    });

    return json({ 
      success: true,
      sessionId: sessionId,
      user: { id: user.id, email: user.email, name: user.name } 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: error.errors[0].message }, { status: 400 });
    }
    
    return json({ error: error.message }, { status: 400 });
  }
}

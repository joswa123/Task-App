// src/routes/api/timer/logs/+server.js
import { json } from '@sveltejs/kit';
import db from '../../../../lib/server/db.js';


// This function handles GET requests to /api/timer/logs
export async function GET({ url, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(url);
  const isActive = searchParams.get('active');

  if (isActive === 'true') {
    try {
      const activeTimer = await db.timeLog.findFirst({
        where: {
          userId: locals.user.id,
          endTime: null // An active timer has no end time
        },
        orderBy: {
          startTime: 'desc'
        },
        include: {
          task: true
        }
      });

      return json({ activeTimer });
    } catch (error) {
      console.error('Failed to check for active timer:', error);
      return json({ error: 'Failed to check for active timer' }, { status: 500 });
    }
  }

  // Handle other query parameters if needed in the future
  return json({ error: 'Invalid query' }, { status: 400 });
}
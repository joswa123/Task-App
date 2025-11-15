// src/routes/api/timer/stop/+server.js
import { json } from '@sveltejs/kit';
import db from '../../../lib/server/db.js';

export async function POST({ locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find active timer for user
    const activeTimer = await db.timeLog.findFirst({
      where: {
        userId: locals.user.id,
        endTime: null
      },
      include: {
        task: true
      }
    });

    if (!activeTimer) {
      return json({ error: 'No active timer found' }, { status: 400 });
    }

    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime);
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    // Update time log with end time and duration
    const updatedTimeLog = await db.timeLog.update({
      where: { id: activeTimer.id },
      data: {
        endTime,
        durationSeconds
      }
    });

    return json({ 
      success: true, 
      timeLog: updatedTimeLog,
      durationSeconds,
      message: 'Timer stopped' 
    });
  } catch (error) {
    console.error('Failed to stop timer:', error);
    return json({ error: 'Failed to stop timer' }, { status: 500 });
  }
}
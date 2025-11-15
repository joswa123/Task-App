// src/routes/api/tasks/[id]/+server.js
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import db from '../../../lib/server/db.js';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
});

// GET /api/tasks/[id] - Get single task
// This function handles GET requests to /api/timer/logs/[id]
export async function GET({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        const timeLog = await db.timeLog.findFirst({
            where: {
                id: id,
                userId: locals.user.id // Ensure the user owns this log
            },
            include: {
                task: true
            }
        });

        if (!timeLog) {
            return json({ error: 'Time log not found' }, { status: 404 });
        }

        return json({ timeLog });
    } catch (error) {
        console.error('Failed to fetch time log:', error);
        return json({ error: 'Failed to fetch time log' }, { status: 500 });
    }
}

// PUT /api/tasks/[id] - Update task
export async function PUT({ params, request, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = updateTaskSchema.parse(body);

    const task = await db.task.findFirst({
      where: { 
        id: params.id,
        userId: locals.user.id 
      }
    });

    if (!task) {
      return json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await db.task.update({
      where: { id: params.id },
      data: updates
    });

    return json({ task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update task:', error);
    return json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE({ params, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const task = await db.task.findFirst({
      where: { 
        id: params.id,
        userId: locals.user.id 
      }
    });

    if (!task) {
      return json({ error: 'Task not found' }, { status: 404 });
    }

    await db.task.delete({
      where: { id: params.id }
    });

    return json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
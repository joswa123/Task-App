// src/routes/api/tasks/+server.js
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import db from '$lib/server/db.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING')
});

// GET /api/tasks - Get all tasks for the logged-in user
export async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await db.task.findMany({
      where: { userId: locals.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        timeLogs: {
          select: { durationSeconds: true }
        }
      }
    });

    const tasksWithTotalTime = tasks.map(task => ({
      ...task,
      totalTime: task.timeLogs.reduce((total, log) => total + (log.durationSeconds || 0), 0)
    }));

    return json({ tasks: tasksWithTotalTime });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, status } = createTaskSchema.parse(body);

    const newTask = await db.task.create({
      data: { title, description, status, userId: locals.user.id }
    });

    return json({ task: newTask }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create task:', error);
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
}
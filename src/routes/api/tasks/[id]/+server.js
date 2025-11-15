import { json } from "@sveltejs/kit";
import { z } from "zod";
import db from "$lib/server/db.js";
const updateTaskSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
});
// PUT /api/tasks/[id] - Update a task
export async function PUT({ params, request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = params.id;

    // Log all tasks for this user to debug
    const userTasks = await db.task.findMany({
      where: { userId: locals.user.id },
      select: { id: true, title: true },
    });

    const body = await request.json();
    const updateData = updateTaskSchema.parse(body);


    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: locals.user.id,
      },
    });

    if (!existingTask) {
      console.error("❌ Task not found in database:", {
        requestedId: taskId,
        availableTasks: userTasks.map((t) => t.id),
        user: locals.user.id,
      });
      return json({ error: "Task not found" }, { status: 404 });
    }


    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: updateData,
    });


    return json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("❌ Failed to update task:", error);
    return json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE({ params, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = params.id; // Use string ID directly

    // Check if task exists and belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: locals.user.id,
      },
    });

    if (!existingTask) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    // Delete the task
    await db.task.delete({
      where: { id: taskId },
    });

    return json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return json({ error: "Failed to delete task" }, { status: 500 });
  }
}

// GET /api/tasks/[id] - Get a single task
export async function GET({ params, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = params.id; // Use string ID directly

    const task = await db.task.findFirst({
      where: {
        id: taskId,
        userId: locals.user.id,
      },
      include: {
        timeLogs: {
          select: { durationSeconds: true },
        },
      },
    });

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const taskWithTotalTime = {
      ...task,
      totalTime: task.timeLogs.reduce(
        (total, log) => total + (log.durationSeconds || 0),
        0
      ),
    };

    return json({ task: taskWithTotalTime });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

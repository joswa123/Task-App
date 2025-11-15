import { json } from '@sveltejs/kit';

// Use the same timeLogs array (shared between files)
// In a real app, this would be a database
let timeLogs = [];

export async function POST({ request, cookies }) {
    try {
        const { taskId } = await request.json();
        
        // Validate session
        const sessionId = cookies.get('session_id');
        if (!sessionId) {
            return json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        if (!taskId) {
            return json({ 
                success: false, 
                error: 'Task ID is required' 
            }, { status: 400 });
        }

        // Create new time log with proper ID format
        const newTimeLog = {
            id: generateId(), // Use a proper ID generator
            taskId: taskId,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null,
            userId: 'user-1' // Get from session in real app
        };

        timeLogs.push(newTimeLog);
        console.log('Timer started. Total logs:', timeLogs.length);

        return json({ 
            success: true,
            message: 'Timer started successfully',
            timeLog: newTimeLog
        });

    } catch (error) {
        console.error('Start timer error:', error);
        return json({ 
            success: false, 
            error: 'Failed to start timer' 
        }, { status: 500 });
    }
}

// Simple ID generator
function generateId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
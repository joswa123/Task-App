import { json } from '@sveltejs/kit';
import { addTimeLog ,getTimeLogs} from '../../../../lib/timeStore.js';


export async function POST({ request, cookies }) {
    try {
        const { taskId } = await request.json();
        
        console.log('🚀 Starting timer for task:', taskId);
        
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

        // Create new time log
        const newTimeLog = {
            id: generateId(),
            taskId: taskId,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null,
            userId: 'user-1'
        };

        // Add to shared storage
        addTimeLog(newTimeLog);
        
        console.log('✅ Timer started. Log ID:', newTimeLog.id);
        console.log('📊 All logs:', getTimeLogs().map(log => ({ id: log.id, taskId: log.taskId })));

        return json({ 
            success: true,
            message: 'Timer started successfully',
            timeLog: newTimeLog
        });

    } catch (error) {
        console.error('❌ Start timer error:', error);
        return json({ 
            success: false, 
            error: 'Failed to start timer' 
        }, { status: 500 });
    }
}

function generateId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
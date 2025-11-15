
import { json } from '@sveltejs/kit';
import { findTimeLog, updateTimeLog, getTimeLogs } from '../../../../../lib/timeStore.js';

export async function POST({ params, cookies }) {
    try {
        const logId = params.id;
        console.log('🛑 Stopping timer with ID:', logId);
        console.log('📊 Available logs:', getTimeLogs().map(log => log.id));
        
        // Validate session
        const sessionId = cookies.get('session_id');
        if (!sessionId) {
            return json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        // Find the time log
        const existingLog = findTimeLog(logId);
        
        if (!existingLog) {
            console.log('❌ Log not found in storage');
            return json({ 
                success: false, 
                error: 'Timer log not found' 
            }, { status: 404 });
        }

        // Calculate duration and update the log
        const endTime = new Date().toISOString();
        const startTime = new Date(existingLog.startTime);
        const duration = Math.floor((new Date(endTime) - startTime) / 1000);

        // Update the log
        const updatedLog = updateTimeLog(logId, {
            endTime: endTime,
            duration: duration
        });


        return json({ 
            success: true,
            message: 'Timer stopped successfully',
            timeLog: updatedLog
        });

    } catch (error) {
        console.error('❌ Stop timer error:', error);
        return json({ 
            success: false, 
            error: 'Failed to stop timer: ' + error.message 
        }, { status: 500 });
    }
}
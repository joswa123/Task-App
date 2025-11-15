import { json } from '@sveltejs/kit';

let timeLogs = [];

export async function POST({ request, cookies }) {
    try {
        const { logId } = await request.json();
        
        // Validate session
        const sessionId = cookies.get('session_id');
        if (!sessionId) {
            return json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        if (!logId) {
            return json({ 
                success: false, 
                error: 'Log ID is required' 
            }, { status: 400 });
        }

        // Find the time log
        const logIndex = timeLogs.findIndex(log => log.id === logId);
        
        if (logIndex === -1) {
            return json({ 
                success: false, 
                error: 'Timer log not found' 
            }, { status: 404 });
        }

        // Update the end time
        const endTime = new Date().toISOString();
        const startTime = new Date(timeLogs[logIndex].startTime);
        const duration = Math.floor((new Date(endTime) - startTime) / 1000);

        timeLogs[logIndex] = {
            ...timeLogs[logIndex],
            endTime: endTime,
            duration: duration
        };

        return json({ 
            success: true,
            message: 'Timer stopped successfully',
            timeLog: timeLogs[logIndex]
        });

    } catch (error) {
        console.error('Stop timer error:', error);
        return json({ 
            success: false, 
            error: 'Failed to stop timer' 
        }, { status: 500 });
    }
}
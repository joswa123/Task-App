// Simple shared in-memory storage
let timeLogs = [];

export function getTimeLogs() {
    return timeLogs;
}

export function addTimeLog(log) {
    timeLogs.push(log);
    console.log('➕ Added log:', log.id, 'Total logs:', timeLogs.length);
    return log;
}

export function findTimeLog(logId) {
    const log = timeLogs.find(log => log.id === logId);
    console.log('🔍 Looking for log:', logId, 'Found:', !!log);
    return log;
}

export function updateTimeLog(logId, updates) {
    const index = timeLogs.findIndex(log => log.id === logId);
    if (index !== -1) {
        timeLogs[index] = { ...timeLogs[index], ...updates };
        console.log('✏️ Updated log:', logId);
        return timeLogs[index];
    }
    console.log('❌ Log not found for update:', logId);
    return null;
}
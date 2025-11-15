<script>
    import { page } from '$app/stores';
    import { redirect } from '@sveltejs/kit';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { onDestroy } from 'svelte'; 
    
    // Import slide and fade functions from Svelte
    import { slide, fade } from 'svelte/transition';
    
    export let data;
    
    // Redirect if not authenticated
    $: if (!data.user) {
        throw redirect(302, '/auth/login');
    }

    let tasks = [];
    let selectedTaskId = '';
    let activeTimer = null;
    let elapsedTime = 0;
    let timerInterval = null;
    let isLoading = true;
    let error = '';
    $: currentLogId = $page.url.searchParams.get('log');

    async function getTimerById(logId) {
        if (!logId) return null;
        try {
            const response = await fetch(`/api/timer/logs/${logId}`);
            if (response.ok) {
                const data = await response.json();
                return data.timeLog;
            }
        } catch (err) {
            console.error('Failed to get timer by ID:', err);
            return null;
        }
    }

    onMount(async () => {
        if (browser) {
            await loadTasks();
            
            const logId = $page.url.searchParams.get('log');
            if (logId) {
                // Start timer display when log ID is present in URL
                const tempTimer = { id: logId, startTime: new Date().toISOString() };
                activeTimer = tempTimer;
                startTimerDisplay();
            }
        }
    });

    // Load user's tasks
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                const data = await response.json();
                tasks = data.tasks || [];
                 console.log('📋 Loaded tasks with time data:', tasks.map(t => ({
                id: t.id,
                title: t.title,
                totalTime: t.totalTime,
                timeLogs: t.timeLogs
            })));
                // Set default selected task to first pending task
                const pendingTask = tasks.find(t => t.status === 'PENDING');
                if (pendingTask) {
                    selectedTaskId = pendingTask.id;
                }
            } else {
                error = 'Failed to load tasks';
            }
        } catch (err) {
            error = 'Failed to load tasks';
            console.error(err);
        } finally {
            isLoading = false;
        }
    }

    // Start timer
    async function startTimer(taskId) {
        try {
            const response = await fetch('/api/timer/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: taskId
                })
            });

            if (response.ok) {
                const result = await response.json();
                const newTimeLog = result.timeLog;
            
                // Manually set the new active timer and start the display
                activeTimer = newTimeLog;
                startTimerDisplay();

                // Navigate after a tiny delay to ensure state is set
                setTimeout(() => {
                    window.location.href = `/timer?log=${newTimeLog.id}`;
                }, 100);
            } else {
                const errorData = await response.json();
                alert(`Failed to start timer: ${errorData.error}`);
            }
        } catch (err) {
            console.error('Failed to start timer:', err);
            alert('Failed to start timer. Please try again.');
        }
    }

    // Stop timer
  // In src/routes/timer/+page.svelte
async function stopTimer() {
    if (!activeTimer) {
        alert('No active timer to stop.');
        return;
    }

    try {
      
        const response = await fetch(`/api/timer/stop/${activeTimer.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Response status:', response.status);
        
        // Check if response is OK
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            // Try to get error message from response
            try {
                const errorText = await response.text();
                console.log('📄 Response text:', errorText);
                if (errorText) {
                    errorMessage += ` - ${errorText}`;
                }
            } catch (e) {
                console.log('❌ Could not read response text:', e);
            }
            
            throw new Error(errorMessage);
        }

        // Parse JSON response
        const result = await response.json();
        console.log('✅ Stop result:', result);

        if (result.success) {
            stopTimerDisplay();
            activeTimer = null;
            elapsedTime = 0;
            
            await loadTasks();
            error = '';
            
            // Clear the URL parameter
            window.history.replaceState({}, '', '/timer');
            
            // Show success message
            alert('Timer stopped successfully! Time tracked: ' + formatTime(result.timeLog.duration));
        } else {
            error = result.error || 'Failed to stop timer';
            alert('Error: ' + error);
        }
    } catch (err) {
        console.error('❌ Stop timer error:', err);
        error = `Failed to stop timer: ${err.message}`;
        alert('Error: ' + error);
        
        // If it's a 404, reset the timer state
        if (err.message.includes('404')) {
            stopTimerDisplay();
            activeTimer = null;
            elapsedTime = 0;
            window.history.replaceState({}, '', '/timer');
        }
    }
}


    // Start the timer display
    function startTimerDisplay() {
        // Don't restart if the timer is already running for this session
        if (timerInterval) {
            console.log('Timer interval already running. Skipping restart.');
            return; 
        }

        if (activeTimer && activeTimer.startTime) {
            // The startTime from the DB is a string, so convert it to a Date object
            const startTime = new Date(activeTimer.startTime).getTime();
            
            timerInterval = setInterval(() => {
                elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            }, 1000);
        }
    }

    // Stop the timer display
    function stopTimerDisplay() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Format time for display
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Get current active task
    $: activeTask = activeTimer ? tasks.find(t => t.id === activeTimer.taskId) : null;

    // Cleanup on destroy
    onDestroy(() => {
        stopTimerDisplay();
    });
</script>

<div class="page-transition-container">
    <div class="page-content" transition:slide|fade>
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="p-6">
                    {#if !activeTimer}
                        <!-- Task Selection & Start -->
                        <div class="space-y-4">
                            <div>
                                <label for="task-select" class="block text-sm font-medium text-gray-700 mb-2">
                                    Select Task to Track
                                </label>
                                <select
                                    id="task-select"
                                    bind:value={selectedTaskId}
                                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Choose a task...</option>
                                    {#each tasks.filter(t => t.status !== 'COMPLETED') as task}
                                        <option value={task.id}>
                                            {task.title} ({task.status.toLowerCase().replace('_', ' ')})
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <button
                                on:click={() => startTimer(selectedTaskId)}
                                disabled={!selectedTaskId}
                                class="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start Timer
                            </button>
                        </div>
                    {:else}
                        <!-- Active Timer Display -->
                        <div class="text-center space-y-6">
                            <!-- Timer Display -->
                            <div class="bg-white rounded-lg shadow-lg p-8">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4">Timer Running</h2>
                                <div class="text-6xl font-mono font-bold text-green-600 mb-6">
                                    {formatTime(elapsedTime)}
                                </div>
                                <p class="text-lg text-gray-600">
                                    Tracking time for: <strong class="text-gray-800">{activeTask?.title}</strong>
                                </p>
                            </div>
                            
                            <!-- Stop Button Only -->
                            <div class="flex justify-center">
                                <button
                                    on:click={() => stopTimer()}
                                    class="flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                    Stop Timer
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
<!-- src/routes/tasks/+page.svelte -->
<script>
    import { page } from '$app/stores';
    import { redirect } from '@sveltejs/kit';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    export let data;
    
    // Redirect if not authenticated
    $: if (!data.user) {
        throw redirect(302, '/auth/login');
    }

    let tasks = [];
    let isLoading = true;
    let error = '';

    onMount(async () => {
        if (browser) {
            await loadTasks();
        }
    });

    // Load tasks
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                const data = await response.json();
                tasks = data.tasks || [];
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


async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        // The URL must be /tasks/${taskId}
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Reload the task list from the server
            await loadTasks(); 
        } else {
            const errorData = await response.json();
            alert(`Failed to delete task: ${errorData.error}`);
        }
    } catch (err) {
        console.error('Failed to delete task:', err);
        alert('Failed to delete task. Please try again.');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
       
// Check if taskId is valid
       const localTask = tasks.find(t => t.id === taskId);
        if (!localTask) {
            console.error('❌ Task not found in local state:', taskId);
            throw new Error('Task not found in local state');
        }
         
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus
            })
        });


        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Update the local tasks array
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].status = newStatus;
                tasks[taskIndex].updatedAt = result.task.updatedAt;
            }
        } else {
            console.error('Failed to update task:', result.error);
            alert('Failed to update task: ' + result.error);
        }
    } catch (err) {
        console.error('Error updating task status:', err);
        alert('Error updating task status: ' + err.message);
    }
}
</script>

<svelte:head>
    <title>Tasks - TimeTracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
                <p class="mt-2 text-gray-600">Manage your tasks and track your progress</p>
            </div>
            <a 
                href="/tasks/create" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                + New Task
            </a>
        </div>

        {#if error}
            <div class="mb-4 rounded-md bg-red-50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                </div>
            </div>
        {/if}

        {#if isLoading}
            <!-- Loading State -->
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
                <ul class="divide-y divide-gray-200">
                    {#each Array(3) as _, i}
                        <li class="px-6 py-4 animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                        </li>
                    {/each}
                </ul>
            </div>
        {:else if tasks.length > 0}
            <!-- Tasks List -->
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
                <ul class="divide-y divide-gray-200">
                    {#each tasks as task}
                        <li class="px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <div class="flex-1">
                                            <h3 class="text-lg font-medium text-gray-900">{task.title}</h3>
                                            {#if task.description}
                                                <p class="mt-1 text-sm text-gray-500">{task.description}</p>
                                            {/if}
                                        </div>
                                        <div class="flex items-center space-x-4 ml-4">
                                            <!-- Time Spent -->
                                           {#if (task.totalTime || 0) > 0}
    <span class="text-sm text-gray-500 whitespace-nowrap">
        {Math.floor((task.totalTime || 0) / 3600)}h {Math.floor(((task.totalTime || 0) % 3600) / 60)}m
    </span>
{/if}
                                            
                                            <!-- Status Badge -->
                                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">
                                                {(task.status || 'PENDING').toLowerCase().replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <!-- Actions -->
                                    <div class="mt-4 flex items-center space-x-4">
                                        <select 
                    value={task.status}
                    on:change={(e) => updateTaskStatus(task.id, e.target.value)}
                    class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
                                        
                                        <a 
                                            href="/timer?task={task.id}" 
                                            class="text-sm text-blue-600 hover:text-blue-500 font-medium"
                                        >
                                            Start Timer
                                        </a>
                                        
                                        <button 
                                            on:click={() => deleteTask(task.id)}
                                            class="text-sm text-red-600 hover:text-red-500 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        {:else}
            <!-- Empty State -->
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-12 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">No tasks</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                    <div class="mt-6">
                        <a 
                            href="/tasks/create" 
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            + New Task
                        </a>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
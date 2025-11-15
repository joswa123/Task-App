<!-- src/routes/tasks/create/+page.svelte -->
<script>
    import { page } from '$app/stores';
    import { redirect } from '@sveltejs/kit';
    import { onMount } from 'svelte';

    export let data;
    
    // Redirect if not authenticated
    $: if (!data.user) {
        throw redirect(302, '/auth/login');
    }

    let title = '';
    let description = '';
    let isLoading = false;
    let error = '';

    onMount(() => {
        // Focus the title input when page loads
        const titleInput = document.getElementById('title');
        if (titleInput) titleInput.focus();
    });

    async function handleSubmit() {
        if (!title.trim()) return;
        
        isLoading = true;
        error = '';

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: title.trim(),
                    description: description.trim() 
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to tasks list
                window.location.href = '/tasks';
            } else {
                error = result.error || 'Failed to create task';
            }
        } catch (err) {
            error = 'Failed to create task. Please try again.';
            console.error('Task creation error:', err);
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Create Task - TimeTracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Create New Task</h1>
                    <p class="mt-1 text-sm text-gray-600">
                        Add a new task to track your work and productivity.
                    </p>
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

                <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="What needs to be done?"
                            bind:value={title}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Add more details about this task..."
                            bind:value={description}
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <a
                            href="/tasks"
                            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            disabled={isLoading || !title.trim()}
                        >
                            {#if isLoading}
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            {:else}
                                Create Task
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
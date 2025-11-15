<!-- src/routes/+page.svelte -->
<script>
    export let data;
</script>

<svelte:head>
    <title>Dashboard - TimeTracker</title>
</svelte:head>

<!-- This page should only be visible to a logged-in user -->
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow p-8 text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">
                Welcome to TimeTracker, {data.user?.name || data.user?.email}!
            </h1>
            <p class="text-gray-600 mb-6">
                You are successfully logged in.
            </p>
            <div class="space-y-3">
                <a 
                    href="/tasks/create" 
                    class="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Create Your First Task
                </a>
                <a 
                    href="/tasks" 
                    class="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 ml-3"
                >
                    View All Tasks
                </a>
            </div>
        </div>
    </div>
</div>
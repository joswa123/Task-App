<script>
    import { page } from '$app/stores'; // <-- ADD THIS LINE
    import '../app.css';

    export let data;

    // Navigation items for logged-in users
    const navItems = [
        { href: '/tasks', label: 'Tasks' },
        { href: '/timer', label: 'Timer' }
    ];
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    {#if data.user}
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold text-gray-900">TickTask</h1>
                        <div class="hidden md:ml-6 md:flex md:space-x-8">
                            {#each navItems as item}
                                <a 
                                    href={item.href}
                                    class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors
                                        {$page.url.pathname === item.href ? 'border-blue-500 text-gray-900' : ''}"
                                >
                                    {item.label}
                                </a>
                            {/each}
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- SUGGESTION: Make the welcome message dynamic -->
                        <span class="text-sm text-gray-700">Welcome, {data.user.name || data.user.email}!</span>
                        <a 
                            href="/auth/logout" 
                            class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors"
                        >
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    {/if}

    <!-- Main Content -->
    <main class={data.user ? 'py-6' : ''}>
        <slot />
    </main>
</div>
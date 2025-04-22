<script>
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { onMount } from "svelte";

    let logs = [];
    let pagination = { page: 1, limit: 100, total: 0, totalPages: 0 };
    let loading = true;
    let error = null;

    let showClearModal = false;
    let daysToKeep = "30";
    let clearStatus = null;

    // Filter state
    let pathFilter = "";
    let ipFilter = "";
    let startDate = "";
    let endDate = "";

    async function fetchLogs() {
        loading = true;
        error = null;

        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append("page", pagination.page);
            params.append("limit", pagination.limit);

            if (pathFilter) params.append("path", pathFilter);
            if (ipFilter) params.append("ip", ipFilter);
            if (startDate) params.append("start", startDate);
            if (endDate) params.append("end", endDate);

            const response = await fetch(`/api/logs?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            logs = data.logs;
            pagination = data.pagination;
        } catch (e) {
            error = e.message;
            console.error("Failed to fetch logs:", e);
        } finally {
            loading = false;
        }
    }

    function applyFilters() {
        pagination.page = 1; // Reset to first page when filtering
        fetchLogs();
    }

    function changePage(newPage) {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            pagination.page = newPage;
            fetchLogs();
        }
    }

    async function clearOldLogs() {
        try {
            clearStatus = "pending";
            const response = await fetch(`/api/logs/clear?days=${daysToKeep}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();
            clearStatus = "success";
            showClearModal = false;

            // Show a temporary success message
            error = null;
            logs = [];
            pagination.total = 0;
            pagination.page = 1;

            // Refresh logs after clearing
            setTimeout(() => {
                fetchLogs();
            }, 500);
        } catch (e) {
            clearStatus = "error";
            error = `Failed to clear logs: ${e.message}`;
            console.error("Failed to clear logs:", e);
        }
    }

    onMount(fetchLogs);
</script>

<div class="flex flex-col h-screen bg-zinc-900">
    <Header title="Visitor Logs" />
    <main class="flex-1 overflow-y-auto container mx-auto p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-zinc-800 p-4 rounded-lg col-span-1">
                <nav class="flex flex-col space-y-2">
                    <a
                        href="/konsole"
                        class="text-zinc-100 hover:text-cyan-400 py-2"
                        >Dashboard</a
                    >
                    <a
                        href="/konsole/new"
                        class="text-zinc-100 hover:text-cyan-400 py-2"
                        >Write a new post</a
                    >
                    <a href="/konsole/logs" class="text-cyan-400 py-2"
                        >Visitor Logs</a
                    >
                </nav>
            </div>

            <div class="bg-zinc-800 p-4 rounded-lg col-span-1 md:col-span-3">
                <h1 class="text-2xl font-bold text-zinc-100 mb-4">
                    Visitor Logs
                </h1>

                <!-- Filters -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label
                            for="path-filter"
                            class="block text-zinc-400 mb-1">Path</label
                        >
                        <input
                            type="text"
                            bind:value={pathFilter}
                            placeholder="/posts/123"
                            class="w-full p-2 bg-zinc-700 border border-zinc-600 rounded"
                        />
                    </div>
                    <div>
                        <label for="ip-filter" class="block text-zinc-400 mb-1"
                            >IP Address</label
                        >
                        <input
                            type="text"
                            bind:value={ipFilter}
                            placeholder="127.0.0.1"
                            class="w-full p-2 bg-zinc-700 border border-zinc-600 rounded"
                        />
                    </div>
                    <div>
                        <label for="start-date" class="block text-zinc-400 mb-1"
                            >Start Date</label
                        >
                        <input
                            type="date"
                            bind:value={startDate}
                            class="w-full p-2 bg-zinc-700 border border-zinc-600 rounded"
                        />
                    </div>
                    <div>
                        <label for="end-date" class="block text-zinc-400 mb-1"
                            >End Date</label
                        >
                        <input
                            type="date"
                            bind:value={endDate}
                            class="w-full p-2 bg-zinc-700 border border-zinc-600 rounded"
                        />
                    </div>
                </div>

                <div class="mb-4 flex space-x-4">
                    <button
                        on:click={applyFilters}
                        class="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-500"
                    >
                        Apply Filters
                    </button>

                    <button
                        on:click={() => (showClearModal = true)}
                        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                    >
                        Clear Old Logs
                    </button>
                </div>

                <!-- Logs table -->
                {#if loading}
                    <div class="text-center py-8">
                        <p class="text-zinc-400">Loading logs...</p>
                    </div>
                {:else if error}
                    <div
                        class="bg-red-500/20 border border-red-500 p-4 rounded"
                    >
                        <p class="text-red-300">{error}</p>
                    </div>
                {:else if logs.length === 0}
                    <div class="text-center py-8">
                        <p class="text-zinc-400">No logs found</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-zinc-100">
                            <thead>
                                <tr class="bg-zinc-700">
                                    <th class="p-2 text-left">Time</th>
                                    <th class="p-2 text-left">IP Address</th>
                                    <th class="p-2 text-left">Path</th>
                                    <th class="p-2 text-left">Referrer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each logs as log}
                                    <tr
                                        class="border-b border-zinc-700 hover:bg-zinc-700/50"
                                    >
                                        <td class="p-2">
                                            {new Date(
                                                log.visitedAt,
                                            ).toLocaleString()}
                                        </td>
                                        <td class="p-2">{log.ipAddress}</td>
                                        <td class="p-2">{log.path}</td>
                                        <td class="p-2"
                                            >{log.referrer || "-"}</td
                                        >
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    {#if pagination.totalPages > 1}
                        <div class="flex justify-between items-center mt-4">
                            <div class="text-zinc-400">
                                Showing {(pagination.page - 1) *
                                    pagination.limit +
                                    1} -
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total,
                                )} of {pagination.total}
                            </div>
                            <div class="flex space-x-2">
                                <button
                                    on:click={() =>
                                        changePage(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    class="px-3 py-1 bg-zinc-700 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span class="px-3 py-1 bg-zinc-700 rounded">
                                    {pagination.page} / {pagination.totalPages}
                                </span>
                                <button
                                    on:click={() =>
                                        changePage(pagination.page + 1)}
                                    disabled={pagination.page ===
                                        pagination.totalPages}
                                    class="px-3 py-1 bg-zinc-700 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </main>
    <Footer />
    {#if showClearModal}
        <div
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
            <div class="bg-zinc-800 p-6 rounded-lg max-w-md w-full">
                <h3 class="text-xl font-bold text-zinc-100 mb-4">Clear Logs</h3>
                <p class="text-zinc-300 mb-4">
                    Select how many days of logs to keep:
                </p>

                <div class="mb-4">
                    <select
                        bind:value={daysToKeep}
                        class="w-full p-2 bg-zinc-700 border border-zinc-600 rounded"
                    >
                        <option value="7">Keep last 7 days</option>
                        <option value="14">Keep last 14 days</option>
                        <option value="30">Keep last 30 days</option>
                        <option value="90">Keep last 90 days</option>
                    </select>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        on:click={() => (showClearModal = false)}
                        class="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 text-zinc-100"
                    >
                        Cancel
                    </button>
                    <button
                        on:click={clearOldLogs}
                        class="px-4 py-2 bg-red-600 rounded hover:bg-red-500 text-zinc-100"
                    >
                        Clear Old Logs
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

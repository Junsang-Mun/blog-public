<script>
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Card from "$lib/components/Card.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    export let data;
    const user = data.user;

    let stats = null;
    let statsLoading = true;

    let posts = [];

    async function loadStats() {
        try {
            const res = await fetch("/api/stats");
            if (res.ok) {
                stats = await res.json();
            }
        } catch (err) {
            console.error("Failed to load stats:", err);
        } finally {
            statsLoading = false;
        }
    }

    onMount(async () => {
        const res = await fetch("/api/allPosts");
        if (!res.ok) return;
        const data = await res.json();
        posts = data.map((post) => ({
            ...post,
            date: new Date(post.createdAt).toLocaleDateString(),
            link: `/posts/${post.id}`,
            summary: post.content?.slice(0, 100) ?? "",
        }));
        loadStats();
    });
</script>

<div class="flex flex-col h-screen bg-zinc-900">
    <Header title="Konsole" />
    <main class="flex-1 overflow-y-auto container mx-auto p-4">
        <div
            class="bg-zinc-800 p-4 mb-4 rounded-lg flex justify-between items-center"
        >
            <div class="flex items-center">
                <img
                    src={user.avatar}
                    alt={user.login}
                    class="w-8 h-8 rounded-full mr-2"
                />
                <span class="text-zinc-100">Welcome, {user.login}</span>
            </div>
            <a href="/auth/logout" class="text-cyan-500 hover:text-cyan-400"
                >Logout</a
            >
        </div>

        <div class="bg-zinc-800 p-4 rounded-lg mb-4">
            <h2 class="text-xl font-bold text-zinc-100 mb-4">
                Visitor Statistics
            </h2>

            {#if statsLoading}
                <p class="text-zinc-400">Loading statistics...</p>
            {:else if stats}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4"
                >
                    <div class="bg-zinc-700 p-3 rounded">
                        <h3 class="text-sm text-zinc-400">Today</h3>
                        <p class="text-2xl font-bold text-cyan-400">
                            {stats.visitors.today}
                        </p>
                    </div>
                    <div class="bg-zinc-700 p-3 rounded">
                        <h3 class="text-sm text-zinc-400">Yesterday</h3>
                        <p class="text-2xl font-bold text-zinc-100">
                            {stats.visitors.yesterday}
                        </p>
                    </div>
                    <div class="bg-zinc-700 p-3 rounded">
                        <h3 class="text-sm text-zinc-400">This Week</h3>
                        <p class="text-2xl font-bold text-zinc-100">
                            {stats.visitors.week}
                        </p>
                    </div>
                    <div class="bg-zinc-700 p-3 rounded">
                        <h3 class="text-sm text-zinc-400">This Month</h3>
                        <p class="text-2xl font-bold text-zinc-100">
                            {stats.visitors.month}
                        </p>
                    </div>
                    <div class="bg-zinc-700 p-3 rounded">
                        <h3 class="text-sm text-zinc-400">All Time</h3>
                        <p class="text-2xl font-bold text-zinc-100">
                            {stats.visitors.total}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-lg font-semibold text-zinc-100 mb-2">
                            Popular Pages
                        </h3>
                        <ul class="space-y-1">
                            {#each stats.popularPages as page}
                                <li class="flex justify-between text-sm">
                                    <span class="text-zinc-300 truncate"
                                        >{page.path}</span
                                    >
                                    <span class="text-cyan-400 ml-2"
                                        >{page.count}</span
                                    >
                                </li>
                            {/each}
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-zinc-100 mb-2">
                            Top Referrers
                        </h3>
                        <ul class="space-y-1">
                            {#each stats.topReferrers as ref}
                                <li class="flex justify-between text-sm">
                                    <span class="text-zinc-300 truncate"
                                        >{ref.referrer}</span
                                    >
                                    <span class="text-cyan-400 ml-2"
                                        >{ref.count}</span
                                    >
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>

                <div class="mt-4">
                    <a
                        href="/konsole/logs"
                        class="text-cyan-500 hover:underline"
                        >View detailed logs →</a
                    >
                </div>
            {:else}
                <p class="text-zinc-400">Failed to load statistics</p>
            {/if}
        </div>

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
                    <a
                        href="/konsole/logs"
                        class="text-zinc-100 hover:text-cyan-400 py-2"
                        >Visitor Logs</a
                    >
                </nav>
            </div>

            <div class="bg-zinc-800 p-4 rounded-lg col-span-1 md:col-span-3">
                <div
                    class="flex flex-col md:flex-row md:items-center md:justify-between mb-4"
                >
                    <h1 class="text-2xl font-bold text-zinc-100 mb-2 md:mb-0">
                        Edit posts
                    </h1>
                    <div class="md:w-1/2">
                        <SearchBar
                            isKonsole={true}
                            placeholder="Search your drafts and posts..."
                        />
                    </div>
                </div>

                {#if posts.length === 0}
                    <p class="text-zinc-400 text-center py-20">
                        No posts yet. Time to write!
                    </p>
                {:else}
                    <div class="space-y-4">
                        {#each posts as post}
                            <div class="relative">
                                <Card
                                    title={post.title}
                                    date={post.date}
                                    link={`/konsole/edit/${post.id}`}
                                    className="hover:ring hover:ring-cyan-500 cursor-pointer"
                                />
                                {#if !post.published}
                                    <span
                                        class="absolute top-2 right-2 text-red-400 text-xs bg-red-900/40 px-2 py-1 rounded-full"
                                    >
                                        Unpublished
                                    </span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </main>
    <Footer />
</div>

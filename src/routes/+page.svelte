<script>
    import { onMount } from "svelte";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Card from "$lib/components/Card.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";

    let posts = [];
    let selectedTag = null;
    let allTags = [];

    onMount(async () => {
        const res = await fetch("/api/posts");
        const data = await res.json();

        posts = data.map((post) => ({
            ...post,
            tags: post.tags ?? [],
            summary: post.content?.slice(0, 100) ?? "",
            date: new Date(post.createdAt).toLocaleDateString(),
            link: `/posts/${post.id}`,
        }));

        const tagSet = new Set();
        posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
        allTags = Array.from(tagSet).sort();
    });

    function filterByTag(tag) {
        selectedTag = selectedTag === tag ? null : tag;
    }

    $: filteredPosts = selectedTag
        ? posts.filter((p) => p.tags.includes(selectedTag))
        : posts;
</script>

<svelte:head>
    <title>example.com</title>
    <meta property="og:title" content="example.com" />
    <meta property="og:description" content="a Personal Blog" />
    <meta property="og:image" content={`/images/og_default.png`} />
    <meta property="og:url" content={`https://example.com/`} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="example.com" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="example.com" />
    <meta name="twitter:description" content="a Personal Blog" />
    <meta name="twitter:image" content={`/images/og_default.png`} />
</svelte:head>

<div class="flex flex-col h-screen bg-zinc-900">
    <Header title="example.com" />
    <main class="flex-1 overflow-y-auto container mx-auto p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="md:col-span-2">
                <h1 class="text-3xl font-bold mb-2 text-zinc-100">
                    Latest Posts
                </h1>
            </div>
            <div class="md:col-span-1">
                <SearchBar placeholder="Search articles..." />
            </div>
        </div>

        {#if allTags.length > 0}
            <div class="mb-4 flex flex-wrap gap-2">
                {#each allTags as tag}
                    <button
                        class="px-3 py-1 rounded-full text-sm border transition
                {selectedTag === tag
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'bg-zinc-700 border-zinc-600 text-zinc-200'}"
                        on:click={() => filterByTag(tag)}
                    >
                        {tag}
                    </button>
                {/each}
            </div>
        {/if}
        {#if filteredPosts.length > 0}
            {#each filteredPosts as post}
                <Card
                    {...post}
                    className="mb-4 hover:ring hover:ring-cyan-500 cursor-pointer"
                />
            {/each}
        {:else if posts.length === 0}
            <p class="text-lg text-zinc-300">
                If you're seeing this, it means I haven't written a single word.
            </p>
        {:else}
            {#each posts as post}
                <Card
                    title={post.title}
                    summary={post.summary}
                    date={post.date}
                    link={post.link}
                    className="mb-4"
                />
            {/each}
        {/if}
    </main>
    <Footer />
</div>

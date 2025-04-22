<script>
    import { page } from "$app/stores";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
</script>

<div class="flex flex-col h-screen bg-zinc-900">
    <Header title="example.com" />
    <main class="flex-1 flex items-center justify-center container mx-auto p-4">
        <div class="text-center">
            <h1 class="text-6xl font-bold mb-4 text-zinc-100">
                {$page.status}
            </h1>
            {#if $page.status === 404}
                <p class="text-xl text-zinc-400">
                    Oops! This page took a day off.
                </p>
            {:else}
                <p class="text-xl text-zinc-400">Oops! Something went wrong.</p>
            {/if}
        </div>
    </main>
    <Footer />
</div>

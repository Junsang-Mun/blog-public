<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let isKonsole = false; // To differentiate between main page and konsole
    export let placeholder = "Search posts...";

    const dispatch = createEventDispatcher();

    let searchTerm = "";
    let searchResults = [];
    let isSearching = false;
    let searchError = null;
    let debounceTimer;
    let showResults = false;
    let inputElement;

    // Handle search input with debounce
    function handleInput() {
        clearTimeout(debounceTimer);
        searchError = null;

        if (searchTerm.trim().length > 1) {
            isSearching = true;
            showResults = true;
            debounceTimer = setTimeout(performSearch, 300);
        } else {
            searchResults = [];
            isSearching = false;
            showResults = false;
        }
    }

    async function performSearch() {
        if (searchTerm.trim().length < 2) {
            searchResults = [];
            isSearching = false;
            return;
        }

        console.log(
            `Performing search for "${searchTerm}" (admin: ${isKonsole})`,
        );
        searchError = null;

        try {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(searchTerm.trim())}&admin=${isKonsole}`,
            );
            console.log(`Search response status: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`Search returned ${data.length} results`);
                searchResults = data;
            } else {
                const errorText = await response.text();
                console.error(
                    `Search failed with status ${response.status}: ${errorText}`,
                );
                searchResults = [];
                searchError = `Search failed: ${response.status} ${errorText}`;
            }
        } catch (error) {
            console.error("Search error:", error);
            searchResults = [];
            searchError = `Search error: ${error.message}`;
        } finally {
            isSearching = false;
        }
    }

    function selectResult(result) {
        searchTerm = "";
        searchResults = [];
        showResults = false;

        if (isKonsole) {
            goto(`/konsole/edit/${result.id}`);
        } else {
            goto(`/posts/${result.id}`);
        }
    }

    function handleKeydown(event) {
        if (event.key === "Escape") {
            searchResults = [];
            showResults = false;
        } else if (event.key === "Enter" && searchTerm.trim().length > 1) {
            performSearch();
        }
    }

    function handleClickOutside(event) {
        if (inputElement && !inputElement.contains(event.target)) {
            showResults = false;
        }
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    });
</script>

<div class="relative" bind:this={inputElement}>
    <div class="relative">
        <input
            type="text"
            bind:value={searchTerm}
            on:input={handleInput}
            on:keydown={handleKeydown}
            {placeholder}
            class="w-full p-2 pl-10 rounded bg-zinc-700 text-zinc-100 border-zinc-600 border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
        />
        <span
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        </span>
        {#if searchTerm && !isSearching}
            <button
                on:click={() => {
                    searchTerm = "";
                    searchResults = [];
                }}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                aria-label="Clear search"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        {/if}
    </div>

    {#if showResults && (isSearching || searchResults.length > 0 || searchError)}
        <div
            class="absolute z-50 mt-2 w-full rounded-md shadow-lg bg-zinc-800 border border-zinc-700"
        >
            {#if isSearching}
                <div class="p-4 text-center flex justify-center items-center">
                    <span class="text-cyan-400 inline-flex">
                        <span class="loading-dot text-2xl">.</span>
                        <span class="loading-dot text-2xl">.</span>
                        <span class="loading-dot text-2xl">.</span>
                    </span>
                </div>
            {:else if searchError}
                <div class="p-4 text-center text-rose-400">
                    <p>Error occurred: {searchError}</p>
                </div>
            {:else if searchResults.length === 0}
                <div class="p-4 text-center text-zinc-400">
                    No results found for "{searchTerm}"
                </div>
            {:else}
                <ul class="max-h-60 overflow-y-auto py-1">
                    {#each searchResults as result}
                        <li>
                            <button
                                on:click={() => selectResult(result)}
                                class="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 hover:text-cyan-400 transition text-zinc-200"
                            >
                                <div class="font-medium">{result.title}</div>
                                {#if result.excerpt}
                                    <div
                                        class="text-xs text-zinc-400 line-clamp-1"
                                    >
                                        {result.excerpt}
                                    </div>
                                {/if}
                                {#if result.createdAt}
                                    <div class="text-xs text-zinc-400 mt-1">
                                        {new Date(
                                            result.createdAt,
                                        ).toLocaleDateString()}
                                        {#if !result.published}
                                            <span class="ml-2 text-rose-400"
                                                >(Draft)</span
                                            >
                                        {/if}
                                    </div>
                                {/if}
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div>

<style>
    @keyframes blink {
        0% {
            opacity: 0.2;
        }
        20% {
            opacity: 1;
        }
        100% {
            opacity: 0.2;
        }
    }

    .loading-dot {
        animation: blink 1.4s infinite both;
    }

    .loading-dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .loading-dot:nth-child(3) {
        animation-delay: 0.4s;
    }
</style>

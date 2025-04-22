<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation"; // Add the import for goto
    import MarkdownEditor from "$lib/components/MarkdownEditor.svelte";

    // Post data
    export let title = "";
    export let content = "";
    export let tags = [];
    let tagInput = "";

    function addTag(event) {
        if (event.key === "Enter" && tagInput.trim()) {
            event.preventDefault();

            const newTag = tagInput.trim();

            if (!tags.includes(newTag) && newTag) {
                tags = [...tags, newTag];
                saveToLocalStorage();
            }

            tagInput = "";
        }
    }

    function removeTag(tagToRemove) {
        tags = tags.filter((tag) => tag !== tagToRemove);
        // Immediately save to localStorage when a tag is removed
        saveToLocalStorage();
    }

    // Function to save current state to localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem(
                "blog-draft",
                JSON.stringify({
                    savedTitle: title,
                    savedContent: content,
                    savedTags: tags,
                    lastSaved: new Date().toISOString(),
                }),
            );
            console.log("Draft saved to localStorage:", {
                title,
                tagsCount: tags.length,
                contentLength: content?.length || 0,
            });
        } catch (e) {
            console.error("Failed to save draft to localStorage:", e);
        }
    }

    // Prepare payload for API with escaped data
    function preparePostPayload(isPublished) {
        return {
            title: title,
            content: content,
            tags: tags,
            published: isPublished,
        };
    }

    // Save and load functionality
    async function handleSave() {
        if (!title.trim()) {
            alert("Please enter a title for your post");
            return;
        }

        const payload = preparePostPayload(false); // Save as draft

        // Log the complete payload
        console.log("Saving post: " + JSON.stringify(payload));

        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                alert("Post saved as draft successfully!");
                localStorage.removeItem("blog-draft");
                // Use goto for navigation
                goto("/konsole");
            } else {
                const errorData = await response.text();
                throw new Error(`Failed to save post: ${errorData}`);
            }
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. Please try again.");
        }
    }

    async function handlePublish() {
        if (!title.trim()) {
            alert("Please enter a title for your post");
            return;
        }

        try {
            const payload = preparePostPayload(true); // Published post

            // Log the complete payload
            console.log("Publishing post: " + JSON.stringify(payload));

            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                alert("Post published successfully!");
                localStorage.removeItem("blog-draft");
                // Use goto for navigation
                goto("/konsole");
            } else {
                const errorData = await response.text();
                throw new Error(`Failed to publish post: ${errorData}`);
            }
        } catch (error) {
            console.error("Error publishing post:", error);
            alert("Failed to publish post. Please try again.");
        }
    }

    // Watch for changes to title and content
    $: if (title) {
        saveToLocalStorage();
    }

    $: if (content) {
        saveToLocalStorage();
    }

    onMount(() => {
        // Load saved draft if available
        try {
            const savedDraft = localStorage.getItem("blog-draft");
            if (savedDraft) {
                console.log("Found saved draft in localStorage");
                const { savedTitle, savedContent, savedTags, lastSaved } =
                    JSON.parse(savedDraft);

                title = savedTitle || "";
                content = savedContent || "";
                tags = savedTags || [];

                if (lastSaved) {
                    const saveTime = new Date(lastSaved);
                    console.log(
                        `Draft was last saved at: ${saveTime.toLocaleString()}`,
                    );
                }
            }
        } catch (e) {
            console.error("Failed to load draft from localStorage:", e);
        }

        // Set up autosave on an interval as a backup
        const autosaveInterval = setInterval(() => {
            saveToLocalStorage();
        }, 30000); // Save every 30 seconds

        return () => {
            clearInterval(autosaveInterval);
            // One final save when component unmounts
            saveToLocalStorage();
        };
    });
</script>

<div class="flex flex-col h-screen bg-zinc-900 text-zinc-100">
    <main class="flex-1 overflow-auto container mx-auto p-4">
        <div class="bg-zinc-800 p-6 rounded-lg">
            <div class="flex justify-between items-center mb-6">
                <div class="w-2/3">
                    <input
                        type="text"
                        placeholder="Post Title"
                        bind:value={title}
                        class="w-full p-3 bg-zinc-700 border border-zinc-600 rounded text-2xl font-bold focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div class="flex space-x-2">
                    <button
                        on:click={handleSave}
                        class="bg-zinc-700 text-zinc-100 px-4 py-2 rounded hover:bg-zinc-600 transition-colors"
                    >
                        Save Draft
                    </button>
                    <button
                        on:click={handlePublish}
                        class="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-500 transition-colors"
                    >
                        Publish
                    </button>
                </div>
            </div>

            <!-- Tags section -->
            <div class="mb-6">
                <div class="flex items-center gap-2 mb-2">
                    <label for="tags" class="text-zinc-400">Tags:</label>
                    <input
                        id="tags"
                        type="text"
                        placeholder="Add tags (press Enter)"
                        bind:value={tagInput}
                        on:keydown={addTag}
                        class="flex-1 p-2 bg-zinc-700 border border-zinc-600 rounded focus:outline-none focus:border-cyan-500"
                    />
                </div>

                {#if tags.length > 0}
                    <div class="flex flex-wrap gap-2">
                        {#each tags as tag}
                            <div
                                class="flex items-center bg-zinc-600 text-zinc-100 px-3 py-1 rounded-full text-sm"
                            >
                                {tag}
                                <button
                                    on:click={() => removeTag(tag)}
                                    class="ml-2 text-zinc-400 hover:text-zinc-100"
                                    aria-label="Remove tag"
                                >
                                    ×
                                </button>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Markdown editor component -->
            <div class="h-[calc(100vh-280px)]">
                <MarkdownEditor
                    bind:content
                    {title}
                    height="h-[calc(100vh-280px)]"
                />
            </div>
        </div>
    </main>
</div>

<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import MarkdownEditor from "$lib/components/MarkdownEditor.svelte";
    import { goto } from "$app/navigation";

    // Post data
    let title = "";
    let content = "";
    let tags = [];
    let postId = null;
    let originalPublishState = false;
    let tagInput = "";
    let loading = true;
    let error = null;

    $: id = $page.params.id;

    function addTag(event) {
        if (event.key === "Enter" && tagInput.trim()) {
            event.preventDefault();

            const newTag = tagInput.trim();

            if (!tags.includes(newTag) && newTag) {
                tags = [...tags, newTag];
            }

            tagInput = "";
        }
    }

    function removeTag(tagToRemove) {
        tags = tags.filter((tag) => tag !== tagToRemove);
    }

    // Prepare payload for API with escaped data
    function preparePostPayload(isPublished) {
        return {
            id: postId,
            title: title,
            content: content,
            tags: tags,
            published: isPublished,
        };
    }

    // Update functionality
    async function handleUpdate(publishState) {
        try {
            const payload = preparePostPayload(publishState);

            console.log("Updating post: " + JSON.stringify(payload));

            const response = await fetch(`/api/posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Post updated successfully!");
                goto("/konsole");
            } else {
                throw new Error("Failed to update post");
            }
        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update post. Please try again.");
        }
    }

    // Delete functionality
    async function handleDelete() {
        if (
            confirm(
                "Are you sure you want to delete this post? This action cannot be undone.",
            )
        ) {
            try {
                const response = await fetch(`/api/posts/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Post deleted successfully!");
                    goto("/konsole");
                } else {
                    throw new Error("Failed to delete post");
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post. Please try again.");
            }
        }
    }

    onMount(async () => {
        try {
            const res = await fetch(`/api/posts/${id}`);

            if (!res.ok) {
                throw new Error("Post not found");
            }

            const post = await res.json();

            title = post.title;
            content = post.content;
            tags = post.tags || [];
            postId = post.id;
            originalPublishState = post.published;
        } catch (err) {
            error = err.message;
            console.error("Error loading post:", err);
        } finally {
            loading = false;
        }
    });
</script>

<div class="flex flex-col h-screen bg-zinc-900 text-zinc-100">
    <main class="flex-1 overflow-auto container mx-auto p-4">
        {#if loading}
            <div class="flex justify-center items-center h-full">
                <p class="text-lg text-zinc-300">Loading post...</p>
            </div>
        {:else if error}
            <div class="bg-red-500/20 border border-red-500 p-4 rounded">
                <p class="text-red-300">{error}</p>
                <button
                    on:click={() => goto("/konsole")}
                    class="mt-4 bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600"
                >
                    Back to Dashboard
                </button>
            </div>
        {:else}
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
                            on:click={handleDelete}
                            class="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-400 transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            on:click={() => handleUpdate(false)}
                            class="bg-zinc-700 text-zinc-100 px-4 py-2 rounded hover:bg-zinc-600 transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button
                            on:click={() => handleUpdate(true)}
                            class="bg-
                            -600 text-white px-4 py-2 rounded hover:bg-cyan-500 transition-colors"
                        >
                            {originalPublishState ? "Update" : "Publish"}
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
        {/if}
    </main>
</div>

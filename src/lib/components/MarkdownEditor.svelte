<script>
    import { onMount } from "svelte";
    import { marked } from "marked";
    import { browser } from "$app/environment";

    // Import DOMPurify conditionally
    let DOMPurify;

    // Props
    export let content = "";
    export let title = "";
    export let height = "h-[calc(100vh-220px)]"; // Adjustable height

    // State variables
    let previewHtml = "";
    let isDragging = false;
    let splitPosition = 50; // Default split at 50%
    let containerWidth;
    let startX;
    let textareaElement;
    let displayContent = ""; // Only for display in editor
    let isProcessingDisplay = false;
    let imageMap = new Map(); // Map to track image placeholder mappings

    // Update preview whenever content changes
    $: {
        if (browser && DOMPurify) {
            previewHtml = DOMPurify.sanitize(marked.parse(content));
        } else {
            previewHtml = marked.parse(content);
        }
    }

    // Resizable split functionality
    function handleDragStart(event) {
        isDragging = true;
        startX = event.clientX;
        document.body.classList.add("select-none"); // Prevent text selection during drag
    }

    function handleDrag(event) {
        if (!isDragging) return;

        const dx = event.clientX - startX;
        const newPosition =
            (((splitPosition * containerWidth) / 100 + dx) / containerWidth) *
            100;

        // Keep within bounds
        if (newPosition > 20 && newPosition < 80) {
            splitPosition = newPosition;
            startX = event.clientX;
        }
    }

    function handleDragEnd() {
        isDragging = false;
        document.body.classList.remove("select-none");
    }

    // Image paste handler
    async function handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        let hasHandledImage = false;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Check if the clipboard item is an image
            if (item.type.indexOf("image") === 0) {
                event.preventDefault(); // Prevent default paste behavior

                // Get the image as a blob
                const blob = item.getAsFile();
                if (!blob) continue;

                try {
                    // Convert blob to base64
                    const base64 = await blobToBase64(blob);

                    // Insert the image at cursor position
                    insertImageAtCursor(base64, blob.type);
                    hasHandledImage = true;
                    break;
                } catch (error) {
                    console.error("Failed to process pasted image:", error);
                }
            }
        }
    }

    // Convert blob to base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Generate a unique ID for an image
    function generateImageId() {
        return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Insert image at cursor position
    function insertImageAtCursor(base64, mimeType) {
        if (!textareaElement) return;

        const filename = `pasted-image-${Date.now()}.${mimeType.split("/")[1] || "png"}`;
        const imageId = generateImageId();

        // Store full image data in our map
        imageMap.set(imageId, {
            alt: filename,
            data: base64,
        });

        // Create the actual markdown for the real content
        const fullMarkdown = `![${filename}](${base64})`;

        // Create a placeholder for display
        const placeholderMarkdown = `![🖼️ ${filename}](image-${imageId})`;

        // Get cursor position
        const start = textareaElement.selectionStart;
        const end = textareaElement.selectionEnd;

        // Update real content with the full image markdown
        content =
            content.substring(0, start) + fullMarkdown + content.substring(end);

        // Update display content directly
        displayContent =
            displayContent.substring(0, start) +
            placeholderMarkdown +
            displayContent.substring(end);

        // Update cursor position
        setTimeout(() => {
            const newPos = start + placeholderMarkdown.length;
            textareaElement.selectionStart = newPos;
            textareaElement.selectionEnd = newPos;
            textareaElement.focus();
        }, 0);
    }

    // Synchronize content from display to real
    function syncFromDisplay() {
        if (isProcessingDisplay) return;

        isProcessingDisplay = true;

        try {
            // Process all display content into real content
            // We'll go line by line to ensure line breaks are preserved

            const displayLines = displayContent.split("\n");
            const contentLines = content.split("\n");

            // We'll build up new content by matching placeholder patterns
            let newContent = [];

            for (let i = 0; i < displayLines.length; i++) {
                const line = displayLines[i];

                // Check if line has an image placeholder
                const placeholderMatch = line.match(
                    /!\[🖼️ (.*?)\]\(image-(img-.*?)\)/,
                );

                if (placeholderMatch) {
                    // This is a line with an image placeholder
                    const [fullMatch, altText, imageId] = placeholderMatch;

                    // Get the corresponding full image data
                    const imageData = imageMap.get(imageId);

                    if (imageData) {
                        // Replace with the full markdown
                        const fullMarkdown = `![${imageData.alt}](${imageData.data})`;
                        newContent.push(line.replace(fullMatch, fullMarkdown));
                    } else {
                        // Keep as is if we don't have the data
                        newContent.push(line);
                    }
                } else {
                    // Just a regular line, keep as is
                    newContent.push(line);
                }
            }

            // Update real content
            content = newContent.join("\n");
        } finally {
            isProcessingDisplay = false;
        }
    }

    // Process content to create display version with collapsed images
    function syncToDisplay() {
        if (isProcessingDisplay) return;

        isProcessingDisplay = true;

        try {
            // Clear existing image map
            imageMap.clear();

            // Process content line by line
            const contentLines = content.split("\n");
            const displayLines = [];

            for (const line of contentLines) {
                // Check if line has a full image
                const imageMatch = line.match(
                    /!\[(.*?)\]\((data:image\/[^;]+;base64,[^)]+)\)/,
                );

                if (imageMatch) {
                    // This is a line with a full image
                    const [fullMatch, altText, dataUrl] = imageMatch;

                    // Generate an ID for this image
                    const imageId = generateImageId();

                    // Store in our map
                    imageMap.set(imageId, {
                        alt: altText,
                        data: dataUrl,
                    });

                    // Replace with placeholder in display
                    displayLines.push(
                        line.replace(
                            fullMatch,
                            `![🖼️ ${altText}](image-${imageId})`,
                        ),
                    );
                } else {
                    // Just a regular line
                    displayLines.push(line);
                }
            }

            // Update display content
            displayContent = displayLines.join("\n");
        } finally {
            isProcessingDisplay = false;
        }
    }

    onMount(async () => {
        // Dynamically import DOMPurify in browser
        const DOMPurifyModule = await import("dompurify");
        DOMPurify = DOMPurifyModule.default;

        // Initial processing of display content
        syncToDisplay();

        // Re-sanitize the content now that DOMPurify is available
        previewHtml = DOMPurify.sanitize(marked.parse(content));

        // Set up autosave - only for content, title is handled by parent
        const autosaveInterval = setInterval(() => {
            if (content) {
                const savedDraft = localStorage.getItem("blog-draft");
                let draftObj = {};

                if (savedDraft) {
                    try {
                        draftObj = JSON.parse(savedDraft);
                    } catch (e) {
                        console.error("Failed to parse saved draft", e);
                    }
                }

                localStorage.setItem(
                    "blog-draft",
                    JSON.stringify({
                        ...draftObj,
                        savedContent: content, // Save the REAL content with full image data
                    }),
                );
            }
        }, 10000); // Save every 10 seconds

        return () => {
            clearInterval(autosaveInterval);
        };
    });

    // Watch for changes to content and update display
    $: if (content && !isProcessingDisplay) {
        syncToDisplay();
    }
</script>

<svelte:window
    on:mousemove={handleDrag}
    on:mouseup={handleDragEnd}
    bind:innerWidth={containerWidth}
/>

<div class="w-full flex flex-col">
    <div
        class={`flex ${height} border border-zinc-700 rounded overflow-hidden`}
    >
        <div class="h-full overflow-hidden" style="width: {splitPosition}%">
            <textarea
                bind:this={textareaElement}
                bind:value={displayContent}
                on:input={syncFromDisplay}
                on:paste={handlePaste}
                placeholder="Write your markdown here..."
                class="w-full h-full p-4 bg-zinc-800 text-zinc-100 resize-none focus:outline-none font-mono"
                spellcheck="false"
            ></textarea>
        </div>

        <div
            class="w-1.5 h-full bg-zinc-700 cursor-col-resize hover:bg-blue-500 transition-colors"
            on:mousedown={handleDragStart}
        ></div>

        <div
            class="h-full overflow-auto bg-zinc-800"
            style="width: calc(100% - {splitPosition}%)"
        >
            <div class="p-4">
                <h2
                    class="text-2xl font-bold pb-2 mb-4 border-b border-zinc-700"
                >
                    {title || "Untitled Post"}
                </h2>
                <div class="prose prose-invert max-w-none">
                    {@html previewHtml}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Add styles for images in preview */
    :global(.prose img) {
        cursor: pointer;
    }

    :global(.prose img:hover) {
        outline: 2px solid #06b6d4; /* cyan-500 */
    }
</style>

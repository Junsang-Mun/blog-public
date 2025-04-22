<script>
    import { goto } from "$app/navigation";

    export let title;
    export let summary;
    export let date;
    export let link;
    export let className;

    function handleClick() {
        goto(link);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goto(link);
        }
    }
</script>

<div
    role="button"
    tabindex="0"
    on:click={handleClick}
    on:keydown={handleKeyDown}
    class={`bg-zinc-800 shadow-md rounded-lg overflow-hidden cursor-pointer hover:ring hover:ring-cyan-500 transition ${className}`}
>
    <div class="p-4">
        <h2
            class="text-xl font-bold mb-2 text-cyan-600 hover:text-cyan-400 transition"
        >
            {title}
        </h2>
        {#if summary}
            <p class="text-zinc-300 mb-4">{summary}</p>
        {/if}
        <div class="text-zinc-400 text-sm">{date}</div>
    </div>
</div>

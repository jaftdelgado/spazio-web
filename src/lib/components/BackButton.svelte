<script lang="ts">
	import { ArrowRightIcon } from '$lib/assets/icons';

	let { href = '', class: className = '' } = $props();
</script>

<button
	class="group relative flex h-12 items-center justify-end rounded-full bg-control pr-16 pl-6 font-medium text-primary-text shadow-xs hover:bg-control-hover {className}"
	type="button"
	onclick={() => href && (window.location.href = href)}
>
	<div
		class="absolute top-1 right-1 z-10 flex size-10 items-center justify-center rounded-full bg-slate-900 group-hover:w-[calc(100%-8px)]"
		style="transition: width 600ms cubic-bezier(0.76, 0, 0.24, 1);"
	>
		<ArrowRightIcon class="size-5 text-white" />
	</div>

	<span class="font-sans text-base whitespace-nowrap">Explorar propiedades</span>
</button>

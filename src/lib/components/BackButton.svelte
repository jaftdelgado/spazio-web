<script>
	let { href = '' } = $props();
</script>

<button
	class="group relative flex h-12 items-center rounded-2xl bg-slate-50 pr-6 pl-16 font-semibold text-black shadow-xs transition-all duration-300"
	type="button"
	onclick={() => href && (window.location.href = href)}
>
	<div
		class="absolute top-1 left-1 z-10 flex size-10 items-center justify-center rounded-xl bg-slate-900 duration-500 group-hover:w-[calc(100%-8px)]"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="25px" width="25px">
			<path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="#ffffff" />
			<path
				d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
				fill="#ffffff"
			/>
		</svg>
	</div>

	<span class="font-sans text-base whitespace-nowrap"> Explorar propiedades </span>
</button>

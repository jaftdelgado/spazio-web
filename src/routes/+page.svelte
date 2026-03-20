<script>
	import BackButton from '$lib/components/BackButton.svelte';
</script>

<section class="flex min-h-[80vh] flex-col items-center justify-center bg-white px-4 text-center">
	<div class="max-w-2xl">
		<h1
			class="font-sans text-4xl font-light tracking-tight text-neutral-950 sm:text-5xl md:text-6xl lg:text-6xl"
		>
			El
			<span class="font-serif text-neutral-800 italic">lujo</span>
			de encontrar tu lugar en el
			<span class="font-serif text-neutral-800 italic">mundo</span>
		</h1>
	</div>

	<p class="mt-6 max-w-xl font-sans text-base text-neutral-600 md:text-lg">
		Descubre espacios diseñados para conectar con tu esencia. Arquitectura, diseño y confort en
		armonía con tu estilo de vida.
	</p>

	<div class="mt-10">
		<BackButton href="/propiedades" />
	</div>
</section>

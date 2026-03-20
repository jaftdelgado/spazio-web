<script>
	import BackButton from '$lib/components/BackButton.svelte';
	import HouseTiltCard from '$lib/components/HouseTiltCard.svelte';
	import { Description } from '@shizen-ui/svelte';
</script>

<section
	class="flex min-h-[80vh] flex-col items-center justify-center bg-white px-4 pt-24 text-center sm:pt-28"
>
	<div class="max-w-2xl">
		<h1
			class="font-sans text-4xl tracking-tight text-neutral-950 sm:text-5xl md:text-6xl lg:text-6xl"
		>
			El
			<span class="font-serif text-neutral-800">lujo</span>
			de encontrar tu
			<span class="inline-flex items-center gap-3 align-middle">
				<span>lugar</span>
				<HouseTiltCard class="relative top-1 shrink-0" />
			</span>
			en el
			<span class="font-serif text-neutral-800">mundo</span>
		</h1>
	</div>

	<Description class="mt-6 max-w-2xl text-lg">
		Descubre espacios diseñados para conectar con tu esencia. Arquitectura, diseño y confort en
		armonía con tu estilo de vida.
	</Description>

	<div class="mt-10">
		<BackButton href="/propiedades" />
	</div>
</section>

<script lang="ts">
	import houseImage from '$lib/assets/images/house.webp';

	let { class: className = '' } = $props();
</script>

<div
	class="group inline-flex size-12 items-center justify-center overflow-hidden rounded-[20px] border border-neutral-300/90 bg-white shadow-xs transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 hover:rotate-3 sm:size-16 {className}"
>
	<img src={houseImage} alt="Edificio moderno en miniatura" class="size-4/5 object-cover" />
</div>

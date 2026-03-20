<script lang="ts">
	interface Props {
		size?: number | string;
		color?: string;
		strokeWidth?: number | string;
		class?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 2,
		class: className = ''
	}: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	stroke-width={strokeWidth}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
>
	<path
		d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

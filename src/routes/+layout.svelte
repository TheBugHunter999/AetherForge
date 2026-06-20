<script lang="ts">
  import '../lib/ui-polish.css';
  import CosmicBackground from '$lib/CosmicBackground.svelte';

  let { children } = $props();
</script>

<CosmicBackground />

{@render children()}

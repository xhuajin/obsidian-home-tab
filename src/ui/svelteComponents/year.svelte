<script>
  import SelectYear from "./selectYear.svelte";

  export let options = [{ year: new Date().getFullYear().toString() }];
  let selected;
</script>

<div>
  <SelectYear {options} display_func={(o) => o.year} bind:value={selected} />
</div>

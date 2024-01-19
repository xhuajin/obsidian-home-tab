<script>
  import SvelteHeatmap from 'svelte-heatmap';

  export let homeTabHeapMap;
  export let year = homeTabHeapMap.year;
  export let data = homeTabHeapMap.data;
  export let colors = homeTabHeapMap.colors;
  export let emptyColor = homeTabHeapMap.emptyColor;
  export let cellRadius = homeTabHeapMap.cellRadius;
  export let type = homeTabHeapMap.type;
  export let monthGap = "50%";
  let startDate = `${year}/01/01`;
  let endDate = `${year}/12/31`;
  
  let monthlabel = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov",""];
  let weeklabel = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let daylabel = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
</script>

<div style="margin: 50px 8vw 0">
  <SvelteHeatmap
    {data}
    view={type}
    {startDate}
    {endDate}
    monthLabels={monthlabel}
    allowOverflow="false"
    {colors}
    monthgap={monthGap}
    {emptyColor}
    {cellRadius}
    dayLabels={daylabel}
    font-size="12px"
  />
</div>

<script>
  import SvelteHeatmap from 'svelte-heatmap';

  export let homeTabHeapMap;
  // export let year = homeTabHeapMap.year;
  export let year = homeTabHeapMap.year;
  export let data = homeTabHeapMap.data;
  export let colors = homeTabHeapMap.colors;
  // export let colors = ["#6E93B9", "#ACBDD2", "#8DA6C6", "#6D90B9"];
  // export let colors = ["#e0b1cb", "#be95c4", "#9f86c0", "#5e548e"];
  // export let textColor;
  export let emptyColor = homeTabHeapMap.emptyColor;
  // export let emptyColor = "#ecedf0";
  export let cellRadius = homeTabHeapMap.cellRadius;
  export let type = homeTabHeapMap.type;
  export let monthGap = "50%";
  let startDate = `${year}/01/01`;
  let endDate = `${year}/12/31`;
  
  // let monthlabel = ["1","2","3","4","5","6","7","8","9","10","11","12"];
  let monthlabel = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov",""];
  let weeklabel = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let daylabel = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // if (type === "yearly") {
  //   monthlabel = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // }

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

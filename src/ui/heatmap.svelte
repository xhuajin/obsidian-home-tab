<script>
  import SvelteHeatmap from 'svelte-heatmap';

  export let homeTabHeapMap;
  // export let year = homeTabHeapMap.year;
  export let year = "2023";
  export let data = homeTabHeapMap.data;
  export let colors = ["#ccd3dfea", "#ACBDD2", "#8DA6C6", "#6D90B9"];
  // export let colors = ["#e0b1cb", "#be95c4", "#9f86c0", "#5e548e"];
  // export let textColor;
  export let emptyColor = "#ecedf0";
  export let cellRadius = 10;
  export let type = "yearly";
  export let monthGap = "50%";
  let startDate = `${year}/01/01`;
  let endDate = `${year}/12/31`;

  let monthlabel = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let weeklabel = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let daylabel = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  if (type === "yearly") {
    monthlabel = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  }

</script>

<div style="margin: 30px">
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

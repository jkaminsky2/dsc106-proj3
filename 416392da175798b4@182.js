function _1(md){return(
  md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Zoom to bounding boxes</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>
  
  # U.S. Presidential Election Data: 2000 - 2020
  
  Pan and zoom, or click to zoom into a particular state using [*zoom*.transform](https://d3js.org/d3-zoom#zoom_transform) transitions. Filter by election year using the year button. The bounding box is computed using [*path*.bounds](https://d3js.org/d3-geo/path#path_bounds).`
  
  )} 

  function addControls(d3, svg, zoom) {
    const years = Array.from({ length: 21 }, (_, i) => 2000 + i); // Create an array of years from 2000 to 2020

    // Create a dropdown menu for selecting the year
    const selectYear = d3.select(svg.node().parentNode) // Append to SVG container
        .append("select")
        .attr("id", "year-select")
        .style("position", "absolute") // Positioning for dropdown
        .style("top", "10px") // Adjust as needed
        .style("left", "10px") // Adjust as needed
        .on("change", function() {
          const selectedYear = +d3.select(this).property("value");
          const filteredStates = us.objects.states.geometries.filter(d => d.properties.year === selectedYear);
          updateVisualization(states, filteredStates);
        })
        .selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    const svgContainer = d3.select(svg.node().parentNode)
        .style("position", "relative");

    const yearButton = d3.select(svg.node().parentNode)
        .append("div")
        .style("position", "absolute")
        .style("top", "50px")
        .style("left", "50px");

    yearButton.append("button")
        .text("Select Year")
        .on("click", () => {
          selectYear.node().click();
        })

    yearButton.append("select")
      .attr("id", "year-dropdown")
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);

   const topLeftButton = d3.select(svg.node().parentNode) // Append to SVG container
        .append("button")
        .text("Go to Top Left")
        .style("position", "absolute") // Positioning for button
        .style("top", "30px") // Adjust as needed
        .style("left", "10px") // Adjust as needed
        .on("click", () => {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(0, 0).scale(1)
            );
        });

    const select = document.createElement('select');

    const electionYears = [2000, 2004, 2008, 2012, 2016, 2020]

    electionYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    });

    document.body.appendChild(select);

    //var dropdownButton = d3.select("#dataviz_builtWithD3")
    //    .append("select")


    //dropdownButton
    //    .selectAll("myOptions")
    //      .data(electionYears)
    //    .enter()
    //      .append("option")
    //    .text(function (d) { return d; })
    //    .attr("value", function (d) { return d; })

    //dropdownButton.on("change", function(d) {
    //  var selectedOption = d3.select(this).property("value")
    //  updateChart(selectedOption)
    //})
}

  function updateVisualization(states, filteredStates) {
    states.data(filteredStates, d => d.properties.name)
      .join(
        enter => enter.append("path")
          .attr("d", path)
          .attr("fill", d => colorScale(d.properties.name))
          .append("title")
          .text(d => d.properties.name),
        update => update
          .attr("fill", d => colorScale(d.properties.name))
      );
  }

  function _chart(d3,topojson,us)
  {
    const width = 975;
    const height = 610;
  
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
  
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        //.attr("width", "100%")
        //.attr("height", "100%")
        //.attr("style", "max-width: 100%; height: auto;")
        .attr("style", "max-width: 100%; height: auto; display: block; margin: auto;") // Center the SVG using CSS
        .on("click", reset);
  
    const path = d3.geoPath();
  
    const g = svg.append("g");
  
    const colorScale = d3.scaleOrdinal()
      .domain(topojson.feature(us, us.objects.states).features.map(d => d.properties.name))
      .range(["red", "blue"]);
  
    //const data = await FileAttachment("inter_visual_data-2.csv").csv(); // Load CSV data
    //const stateValues = new Map(data.map(d => [d.state, +d.result])); // Create a map of state values
    //const colorScale = d3.scaleSequential()
    //  .domain(d3.extent(data, d => +d.result)) // Use extent of values as domain
    //  .interpolator(d3.interpolateReds);
    
    const states = g.append("g")
      .attr("cursor", "pointer")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .join("path")
      .on("click", clicked)
      .attr("d", path)
      .attr("fill", d => colorScale(d.properties.name));
    
    states.append("title")
      .text(d => d.properties.name);
  
    g.append("path")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));
  
    svg.call(zoom);

    let sliderYear=2000;
    let slider_label="";

    <div class="overlay">
      <label> {yearButton}</label>
      <input
        id="dropdown"
        type="range"
        min="2000"
        max="2020"
        bind:value={sliderYear}
      />
    </div>

    //function filterElections(sliderYear) {
    //  let value = sliderYearScale(sliderYear);
    //  let filterYear = value.getYear();
    //  return data.filter(function (year) {

    //  })
    //}

    const yearButton = d3.select(svg.node().parentNode)
      .append("div")
      .style("position", "absolute")
      .style("top", "100px")
      .style("left", "100px");

    yearButton.append("select")
      .attr("id", "year-dropdown")
      .selectAll("option")
      .data(Array.from({ length: 21}, (_, i) => 2000 + i))
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);

    yearButton.append("button")
      .text("Select Year")
      .on("click", () => {
          selectYear.node().click(); // Trigger the click event of the selectYear dropdown
      });
  
    function reset() {
      states.transition().style("fill", null);
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
      );
    }
  
   // function clicked(event, d) {
     // const [[x0, y0], [x1, y1]] = path.bounds(d);
     // event.stopPropagation();
     // states.transition().style("fill", null);
      //d3.select(this).transition().style("fill", "red");
     // svg.transition().duration(750).call(
      //  zoom.transform,
      //  d3.zoomIdentity
      //    .translate(width / 2, height / 2)
     //     .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
     //     .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
     //   d3.pointer(event, svg.node())
    //  );
    //}

  function clicked(event, d) {
    const statePath = d3.select(this);
    const isZoomed = statePath.attr("data-zoomed");
  
    if (isZoomed) {
      // If already zoomed, zoom out to normal
      reset();
      statePath.attr("data-zoomed", null); // Remove zoomed attribute
    } else {
      const [[x0, y0], [x1, y1]] = path.bounds(d);
      event.stopPropagation();
      states.transition().style("fill", null);
      //d3.select(this).transition().style("fill", "red");
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node())
      );
      statePath.attr("data-zoomed", true); // Mark as zoomed
    }
  }
  
    function zoomed(event) {
      const {transform} = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
    }
  
    return svg.node();
  }

  function _us(FileAttachment){return(
    FileAttachment("states-albers-10m.json").json()
  )}
  
  
  export default function define(runtime, observer) {
    const main = runtime.module();
    function toString() { return this.url; }
    const fileAttachments = new Map([
      ["states-albers-10m.json", {url: new URL("./files/75faaaca1f1a4f415145b9db520349a3a0b93a53c1071346a30e6824586a7c251f45367d9262ed148b7a2b5c2694aa7703f3ac88051abc65066fd0074fdf9c9e.json", import.meta.url), mimeType: "application/json", toString}]
    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer()).define(["md"], _1);
    main.variable(observer("chart")).define("chart", ["d3","topojson","us"], _chart);
    main.variable(observer("us")).define("us", ["FileAttachment"], _us);
    return main;
  }

function _1(md){return(
  md`
  <div style="text-align: center; font-size: 30px; font-weight: bold;">
      U.S. Presidential Election Data: 2000 - 2020
    </div>
    <div style="text-align: center; margin-top: 20px;">
    <span style="margin-right: 10px;">Select an Election Year:</span>
    <select id="year-select">
      <option value="2000">2000</option>
      <option value="2004">2004</option>
      <option value="2008">2008</option>
      <option value="2012">2012</option>
      <option value="2016">2016</option>
      <option value="2020">2020</option>
    </select>
  </div>
  `
  )}

function _2(md){
  return(
    "\n\n"
    )}

async function fetchText(url) {
  const response = await fetch(url);
  return await response.text();
}

async function getdata(d3, selectedYear) {
  let ovrdata2 = []; 

  const csvURL = 'static/state_pres_data.csv';
  const csvURL2 = 'static/overall_pres_data.csv';

  try {
    const stateResponse = await fetchText(csvURL);
    const stateData = await processData(stateResponse);
    const ovrResponse = await fetchText(csvURL2);
    const ovrData = await processData(ovrResponse);
    ovrdata2 = stateData.map(state => ({
      state: state.state,
      year: state.year,
      result: ovrData.find(row => row.state === state.state && row['year'] === selectedYear)?.result || 0
    }));
  } catch (error) {
    console.error('Failed to fetch or process CSV data:', error);
  }
  return ovrdata2;
}

async function getdata2(d3) {
  let statedata2 = [];

  const csvURL = 'static/states_pres_data_5.csv';

  try {
    const stateResponse = await fetchText(csvURL);
    const stateData = await processData2(stateResponse);
    
    statedata2 = stateData.map(state => ({
      state: state.state,
      year: state.year,
      candidates: state.candidates,
      totvotes: state.votes,
      pervotes: state.percentages,
      electoral: state.pervotes
    }));
  } catch (error) {
    console.error('Failed to fetch or process CSV data:', error);
  }
  return statedata2;
}

function processData(csvData) {
  const rows = csvData.trim().split('\n');
  const data = rows.map(row => {
    const [idx, state, state_po, year, result] = row.split(',');
    return {state: state.trim(), year: year.trim(), result: parseInt(result.trim()) };
  });
  return data;
}

function processData2(csvData) {
  const rows = csvData.trim().split('\n');
  const data = rows.map(row => {
    const [index, state, year, candidates, votes, pervotes, percentages] = row.split(',');
    return {
      state: state.trim(),
      year: year.trim(),
      candidates: candidates.replace('"', "").trim().slice(1, -2).replace("'", "").split("|").map(cand => cand.replace("'", "").replace(/'$/, '')),
      votes: votes.replace('"', "").trim().slice(1, -2).replace("'", "").split("|").map(vote => parseInt(vote.trim())),
      pervotes: parseInt(pervotes.trim()),
      percentages: percentages.replace('"', "").trim().slice(1, -2).replace("'", "").split("|").map(percentage => parseFloat(percentage.trim()))
    };
  });
  return data;
}


async function getdata3(d3) {
  let elecdata = [];

  const csvURL = 'static/elecvotes2.csv';

  try {
    const electoralVotes = await fetchText(csvURL);
    const electoralVotesData = await processData3(electoralVotes);
    
    elecdata = electoralVotesData.map(state => ({
      year: state.state,
      candidate: state.year,
      elecVotes: state.result
    }));
  } catch (error) {
    console.error('Failed to fetch or process CSV data:', error);
  }
  return elecdata;
}

function processData3(csvData) {
  const rows = csvData.trim().split('\n');
  const data = rows.map(row => {
    const [idx, state, year, Electoral_College_Votes] = row.split(',');
    return {state: state.trim(), year: year.trim(), result: parseInt(Electoral_College_Votes.trim()) };
  });
  return data;
}


function addControls(d3, svg, zoom) {
  const years = Array.from({ length: 21 }, (_, i) => 2000 + i);

  const selectYear = d3.select(svg.node().parentNode)
      .append("select")
      .attr("id", "year-select")
      .style("position", "absolute")
      .style("top", "10px") 
      .style("left", "10px") 
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);
  
  const topLeftButton = d3.select(svg.node().parentNode) 
      .append("button")
      .text("Go to Top Left")
      .style("position", "absolute")
      .style("top", "30px")
      .style("left", "10px") 
      .on("click", () => {
          svg.transition().duration(750).call(
              zoom.transform,
              d3.zoomIdentity.translate(0, 0).scale(1)
          );
      });

  const stateInfo = d3.select(svg.node().parentNode)
      .append("div")
      .attr("class", "state-info")
      .style("position", "absolute")
      .style("top", "10px")
      .style("right", "10px")
      .style("width", "200px")
      .style("height", "auto")
      .style("background-color", "#f9f9f9")
      .style("padding", "10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("display", "none");
}
async function _chart(d3, topojson, us) {
  let selectedYear = document.getElementById('year-select').value;
  
  console.log(selectedYear);
  const statedata2 = await getdata2(d3);
  const electoralVotesDataset = await getdata3(d3);
  const ovrdata2 = await getdata(d3, selectedYear);

  const width = 975;
  const height = 610;

  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);
  
 

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height + 10])
      .attr("width", "60%")
      .attr("height", "60%")
      .attr("style", "max-width: 100%; height: auto; display: block; margin: auto;margin-right:300px")
      .on("click", reset);

    //svg.append("rect")
      //.attr("width", width)
      //.attr("height", height)
      //.style("fill", "none")
      //.style("stroke", "black")
      //.style("stroke", "2px")
      //.style("stroke-height", "2px")
  d3.select("#year-select").on("change", function() {
      _chart(d3, topojson, us);
  });

  const path = d3.geoPath();

  const g = svg.append("g");

  const colorScale = d3.scaleOrdinal()
      .domain([-1, 1])
      .range(["red", "blue"]);

  const states = g.append("g")
      .attr("cursor", "pointer")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const resultRow = ovrdata2.find(row => row['state'] == d.properties.name && row['year'] === selectedYear);
        if (resultRow) {
            const result = resultRow['result'];
            return colorScale(result !== undefined ? result : 0);
        } else {
            return colorScale(0);
        }
      })
    .on("click", clicked);
      

  states.append("title")
      .text(d => d.properties.name);

  g.append("path")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

  svg.call(zoom);

  
  function reset() {
    svg.transition().duration(500).style("margin-right", "300px");
    d3.select(".pie-chart").transition().duration(400).style("opacity", 0).remove();
    d3.select(".title-container").transition().duration(400).style("opacity", 0).remove();
    d3.select(".key-container").transition().duration(400).style("opacity", 0).remove();

    svg.transition().delay(500).duration(750).call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
}


  function clicked(event, d) {
    const stateName = d.properties.name;
    const statePath = d3.select(this);
    const isZoomed = statePath.attr("data-zoomed");

    if (isZoomed) {
       reset();
    } else {
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        event.stopPropagation();
        states.transition().style("fill", null);
        svg.transition().duration(450).style("margin-right", "500px"); 

        d3.selectAll("path[data-zoomed='true']").each(function() {
            d3.select(this).attr("data-zoomed", null);
        });
        d3.select(".pie-chart").remove(); 
        d3.select(".key-container").remove();

        svg.transition().delay(450).duration(700).call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2 - 20, height / 2)
                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            d3.pointer(event, svg.node())
        );
        statePath.attr("data-zoomed", true);

        displayPieChart(stateName);
    }
}

  function zoomed(event) {
      const { transform } = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
  }

  function displayPieChart(stateName) {

    const data = statedata2.find(row => row['state'] === stateName && row['year'] === selectedYear)['totvotes'];
    let totalVotes = 0;
    data.forEach(candidate => {
      totalVotes += candidate.votes;
    });
    const pieWidth = 200;
    const pieHeight = 200;
    const radius = Math.min(pieWidth, pieHeight) / 2;

    d3.select(".title-container").remove();

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pieSvg = d3.select(svg.node().parentNode)
        .append("svg")
        .attr("class", "pie-chart")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .style("position", "absolute")
        .style("top", `${height / 2 - 25}px`)
        .style("right", "10px")
        .style("left", "1062px")
        .style("display", "none");

    setTimeout(() => {
        pieSvg.style("display", "block");
        const pieGroup = pieSvg.append("g")
            .attr("transform", `translate(${pieWidth / 2},${pieHeight / 2})`);
        const colors = ["blue", "red", "green", "gold", "gray"];
        const slices = pieGroup.selectAll("path")
    .data(d3.pie()(data))
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => colors[i])
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function(d, i) {
      console.log(i);
      const curr_votes = statedata2.find(row => row['state'] === stateName && row['year'] === selectedYear)['totvotes'][i] / 1000000;
      const cur_percentage = statedata2.find(row => row['state'] === stateName && row['year'] === selectedYear)['pervotes'][i];
      
      const tooltipText = `${curr_votes.toFixed(2)}M votes\n${cur_percentage}%`;

        
        d3.select("#tooltip")
            .html(tooltipText)
            .style("visibility", "visible");
    })
    //.on("mousemove", function() {
    //    d3.select("#tooltip")
    //        .style("top", pieWidth / 2 + "px")
    //        .style("left", pieHeight / 2 + "px");
    //})
    //.on("mouseout", function() {
    //    d3.select("#tooltip")
    //        .style("visibility", "hidden");
    //})
    .transition() 
          .duration(1000) 
          .attrTween("d", function(d) { 
              var i = d3.interpolate(d.startAngle, d.endAngle);
              return function(t) {
                  d.endAngle = i(t);
                  return arc(d);
              };
            });
      

        
          const titleContainer = d3.select(svg.node().parentNode)
          .append("div")
          .attr("class", "title-container")
          .style("position", "absolute")
          .style("top", `${height / 2 - 77}px`) 
          .style("left", `${width + 87}px`)
          .style("width", `${pieWidth}px`)
          .style("text-align", "center");

      titleContainer.append("text")
          .attr("text-anchor", "middle")
          .style("font-size", "24px")
          .style("font-weight", "bold")
          .text(stateName);

      const keyContainer = d3.select(svg.node().parentNode)
          .append("div")
          .attr("class", "key-container")
          .style("position", "absolute")
          .style("top", `${height / 2 + 160}px`)
          .style("left", `${width + 300}px`)
          .style("width", `${pieWidth}px`)
          .style("text-align", "left")
          .style("font-size", "12px")
          .style("padding", "5px");

      keyContainer.append("div")
          .style("font-weight", "bold")
          .attr("text-anchor", "middle")
          .style("font-size", "20px")
          .html("<u>Key</u>");

      const colorLabels = statedata2.find(row => row['state'] === stateName && row['year'] === selectedYear)['candidates'];

      const labelsContainer = keyContainer.append("div");
      colorLabels.forEach((label, i) => {
          const labelContainer = labelsContainer.append("div")
              .style("margin", "5px 0")

          labelContainer.append("div")
              .style("display", "inline-block")
              .style("width", "10px")
              .style("height", "10px")
              .style("background-color", colors[i])
              .style("margin-right", "5px");

          labelContainer.append("span")
              .text(label)
              .style("color", colors[i]);
        });

      d3.select(svg.node().parentNode)
          .append("div")
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .style("background-color", "rgba(255, 255, 255, 0.8)")
          .style("padding", "5px")
    }, 250);
}

  return svg.node();
}

function _us(FileAttachment) {
  return (
      FileAttachment("states-albers-10m.json").json()
  );
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
      ["states-albers-10m.json", { url: new URL("./files/75faaaca1f1a4f415145b9db520349a3a0b93a53c1071346a30e6824586a7c251f45367d9262ed148b7a2b5c2694aa7703f3ac88051abc65066fd0074fdf9c9e.json", import.meta.url), mimeType: "application/json", toString }]
  ]);
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("chart")).define("chart", ["d3", "topojson", "us"], _chart);
  main.variable(observer("us")).define("us", ["FileAttachment"], _us);
  return main;
}

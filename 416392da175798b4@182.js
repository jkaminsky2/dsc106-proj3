function _1(md){
  return(
  md`
  <div style="text-align: center; font-size: 30px; font-weight: bold;">
      What is the Overall Result and State Breakdown of U.S. Presidential Elections from 2000 to 2020?
    </div>
    <div style="text-align: center; margin-top: 10px;">
  Link to write-up: [here](https://github.com/jkaminsky2/dsc106-proj3/blob/main/writeup.md)
  </div>
  <div style="text-align: center; font-size: 16px;">
    <br> This interactive visualization displays U.S. presidential election data from the 2000 election to the 2020 election, sourced from [here](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ). Select which year you want to see with the button below. 
  </div>
  <div style="text-align: center; font-size: 16px;">
  You can also click on any state to see a breakdown of presidential votes for that state; click it again to zoom out. When zoomed in on a state, highlight over slices of the pie chart to see additional data. <br> <br> <br>
  </div>
    <div style="text-align: center; margin-top: 10px;">
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

async function getdata(d3) {
  let ovrdata2 = []; 
  const csvURL = 'static/state_pres_data.csv';
  const csvURL2 = 'static/overall_pres_data.csv';
  const stateResponse = await fetchText(csvURL);
  const stateData = await processData(stateResponse);
  const ovrResponse = await fetchText(csvURL2);
  const ovrData = await processData(ovrResponse);
  ovrdata2 = ovrData.map(state => ({
    state: state.state,
    year: state.year,
    result: state.result
  }));
  return ovrdata2;
}

async function getdata2(d3) {
  let statedata2 = [];
  const csvURL = 'static/states_pres_data_5.csv';
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
  const electoralVotes = await fetchText(csvURL);
  const electoralVotesData = await processData3(electoralVotes);
  
  elecdata = electoralVotesData.map(state => ({
    year: state.state,
    candidate: state.year,
    elecVotes: state.result
  }));
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

async function _chart(d3, topojson, us) {
  let selectedYear = "2000";
  selectedYear = document.getElementById('year-select').value;
  let statedata2 = await getdata2(d3);
  let electoralVotesDataset = await getdata3(d3);
  let ovrdata2 = await getdata(d3);

  const width = 975;
  const height = 610;

  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height + 100])
      .attr("width", "60%")
      .attr("height", "60%")
      .attr("style", "max-width: 100%; height: auto; display: block; margin: auto;margin-right:300px;margin-top:50px")
      .on("click", reset);

  const path = d3.geoPath();

  function renderTitleAndBarChart(selectedYear, withTransition = false) {
    const title_text = `${selectedYear} U.S. Presidential Election`;
    const titleContainer = d3.select("body")
      .append("div")
      .attr("class", "title-container")
      .style("position", "absolute")
      .style("top", "210px")
      .style("left", "50%")
      .style("text-align", "center")
      .style("transform", "translateX(-50%)")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("z-index", "100")
      .text(title_text);

  const curr_year_calc = document.getElementById('year-select').value;
  const user_row1 = parseInt(2 * (parseInt(curr_year_calc) % 2000) / 4) + 1;
  const value1 = electoralVotesDataset[user_row1 + 1]['elecVotes'];
  const value2 = electoralVotesDataset[user_row1]['elecVotes'];
  const total = value1 + value2;
  const proportion1 = value1 / total;
  const proportion2 = value2 / total;
  const name1 = electoralVotesDataset[user_row1 + 1]['candidate'];
  const name2 = electoralVotesDataset[user_row1]['candidate'];

  const barWidth1 = proportion1 * 400; 
  const barWidth2 = proportion2 * 400;

  const barChartContainer = titleContainer.append("div")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("margin-top", "15px");

  const barChart = barChartContainer.append("svg")
    .attr("width", barWidth1 + barWidth2) 
    .attr("height", 50);

  barChart.append("rect")
    .attr("x", 0)
    .attr("y", 15)
    .attr("width", barWidth1)
    .attr("height", 25)
    .style("fill", "red");

  barChart.append("rect")
    .attr("x", barWidth1)
    .attr("y", 15)
    .attr("width", barWidth2)
    .attr("height", 25)
    .style("fill", "blue");

  barChart.append("text")
    .attr("x", 0)
    .attr("y", 10)
    .attr("text-anchor", "start")
    .text(name1)
    .style("fill", "black")
    .style("font-size", "12px");

  barChart.append("text")
    .attr("x", barWidth1 + barWidth2)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .text(name2)
    .style("fill", "black")
    .style("font-size", "12px");

  barChart.append("line")
    .attr("x1", (barWidth1+ barWidth2) / 2)
    .attr("y1", 15)
    .attr("x2", (barWidth1+ barWidth2) / 2)
    .attr("y2", 40)
    .attr("stroke-width", "2px")
    .style("stroke", "black");
    
  barChart.append("text")
    .attr("x", (barWidth1+ barWidth2) / 2)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text("Goal (270)")
    .style("fill", "black")
    .style("font-size", "12px");
    if (withTransition) {
      titleContainer
        .style("opacity", 0)
        .transition()
        .duration(2000)
        .style("opacity", 1);
    }
    };
  const g = svg.append("g");
    
  renderTitleAndBarChart(document.getElementById('year-select').value);

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
              return colorScale(result);
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

  svg.call(zoom)
  .on("dblclick.zoom", null);

  states.on("click", clicked).on("dblclick", clicked);

  function reset() {
    svg.transition().duration(500).style("margin-right", "300px");
    svg.transition().delay(500).duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
    if (zoomedState !== null) {
      d3.selectAll(".pie-chart, .title-container, .key-container")
          .transition()
          .duration(400)
          .style("opacity", 0)
          .remove();
      zoomedState = null;
    }
}

  d3.select("#year-select").on("change", updateChart);
  
  async function updateChart() {
    const year_user = document.getElementById('year-select').value;
    reset();
    d3.select(".title-container").transition().duration(400).style("opacity", 0).remove();
    d3.select(".bar-chart-container").transition().duration(400).style("opacity", 0).remove();
    const statesPaths = d3.selectAll("path");
    statesPaths.each(function(d) {
        const statePath = d3.select(this);
        setTimeout(() => {
          const x = d === undefined;
          if (x == false) {
            const resultRow = ovrdata2.find(row => row['state'] == d.properties['name'] && row['year'] === year_user);
            if (resultRow) {
                const result = resultRow['result'];
                statePath.transition()
                    .duration(1500) 
                    .attr("fill", colorScale(result));
            } else {
                statePath.transition()
                    .duration(1500)
                    .attr("fill", colorScale(0));
            }
          } else {
          }
        }, 10);
    });
      renderTitleAndBarChart(year_user,true);
  }

  let zoomedState = null;
  function clicked(event, d) {
    const stateName = d.properties.name;
    const statePath = d3.select(this);
    if (zoomedState === stateName) {
        reset();
        renderTitleAndBarChart(document.getElementById('year-select').value, true);
        zoomedState = null;
    } else {
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        event.stopPropagation();
        states.transition().style("fill", null);
        svg.transition().duration(450).style("margin-right", "500px");

        d3.selectAll("path[data-zoomed='true']").each(function() {
            d3.select(this).attr("data-zoomed", null);
        });
        d3.select(".pie-chart").remove();
        d3.select(".title-container").remove(); 
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

        zoomedState = stateName;

        displayPieChart(d3, stateName, selectedYear);

        d3.select(".title-container").transition().duration(10000).style("opacity", 1);
        d3.select(".bar-chart-container").transition().duration(10000).style("opacity", 1);
    }
}

  function zoomed(event) {
      const { transform } = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
  }

  function displayPieChart(d3, stateName, selectedYear) {
    const year_use = document.getElementById('year-select').value;
    console.log(year_use);
    let curr_data = statedata2.find(row => row['state'] === stateName && row['year'] === year_use)['totvotes'];
    let totalVotes = 0;
    curr_data.forEach(candidate => {
        totalVotes += candidate;
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
        .style("top", `${height / 2 + 175}px`)
        .style("right", "10px")
        .style("left", "1062px")
        .style("display", "none");

    setTimeout(() => {
        pieSvg.style("display", "block");
        const pieGroup = pieSvg.append("g")
            .attr("transform", `translate(${pieWidth / 2},${pieHeight / 2})`);
        const colors = ["blue", "red", "green", "gold", "gray"];
        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255, 255, 255, 0.8)")
            .style("padding", "5px");

            const slices = pieGroup.selectAll("path")
        .data(d3.pie()(curr_data))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colors[i])
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mousemove", (event, d, i) => {
            const mouseX = event.pageX;
            const mouseY = event.pageY;
            const percentage = 100 * d.value / totalVotes;
            const tooltipText = `${percentage.toFixed(2)}%` + `</br>` + `${((d.value / 1000000).toFixed(2))} M votes`;
            tooltip.html(tooltipText);
            tooltip.style("top", `${mouseY - 45}px`)
                .style("left", `${mouseX}px`)
                .style("visibility", "visible")
                .style("z-index", "9999");
            const textBox = d3.select(".tooltip-text-box");
            textBox.html(tooltipText);
            const textboxWidth = 100;
            textBox.style("top", `${mouseY - 45}px`)
                  .style("left", `${mouseX - textboxWidth / 2}px`)
                  .style("z-index", "10000");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(".tooltip-text-box").remove();
        })
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
            .style("top", `${height / 2 + 120}px`)
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
            .style("top", `${height / 2 + 350}px`)
            .style("left", `${width + 290}px`)
            .style("width", `${pieWidth}px`)
            .style("text-align", "left")
            .style("font-size", "12px")
            .style("padding", "5px");

        keyContainer.append("div")
            .style("font-weight", "bold")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .html("<u>Key</u>");

        let colorLabels = statedata2.find(row => row['state'] === stateName && row['year'] === year_use)['candidates'];

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
            .style("padding", "5px");
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

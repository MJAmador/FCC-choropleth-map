import { interpolateColor } from "./colorGenerator.js";

const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

let countyData;
let educationData;
let tooltipCache = {}; //For caching tooltip data

//Variables for determining the fill colors of the map and legend
const color1 = "#e4fffb";
const color2 = "#001311";
const colorDomain = Array.from({ length: Math.ceil(72 / 9)}, (_, i) => i * 9 + 3);
const numberOfColors = colorDomain.length - 1;

const canvas = d3.select("#canvas");
const tooltip = d3.select("#tooltip");

//Defining the color values of each county depending on its bachelorsOrHigher percentage
const colorScale = d3.scaleLinear()
    .domain([d3.min(colorDomain), d3.max(colorDomain)])
    .range([color1, color2]);

//Function to show the tooltip
function showTooltip(event, countyDataItem) {
    const id = countyDataItem.id;
    const cachedData = tooltipCache[id]; //Checking if data is cached
    if (cachedData) {
        updateTooltip(event, cachedData); //If cached, update tooltip with cached data 
    } else {
        const county = educationData.find((d) => d.fips === id);
        if (county) {
            tooltipCache[id] = county; //Caching the fetched data
            updateTooltip(event, county); //Updating tooltip with fetched data
        }
    }
};

//Function to update tooltip content and position
function updateTooltip(event, countyDataItem) {
    tooltip.transition()
        .attr("data-education", countyDataItem.bachelorsOrHigher)
        .style("visibility", "visible")
        .style("position", "absolute")
        .style("padding", "7px")
        .style("border-radius", "5px")
        .style("pointer-event", "none")
        .text(`${countyDataItem.area_name}, ${countyDataItem.state}: ${countyDataItem.bachelorsOrHigher}%`);
};

//Function to hide the tooltip
function hideTooltip() {
    tooltip.transition()
        .style("visibility", "hidden");
};

//Creating the whole map using the data provided
const drawMap = () => {
    canvas.selectAll("path") //"path" is the set of lines that draw the shape of a State
        .data(countyData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("fill", (countyDataItem) => {
            const id = countyDataItem.id;
            const county = educationData.find((d) => d.fips === id) //Finding the fips values corresponding to the id values to use the data in educationData
            const percentage = county ? county.bachelorsOrHigher : 0; //Extracting bachelorsOrHigher percentage
            return colorScale(percentage); //Asigning colors depending on the given percentage 
        })
        .attr("data-fips", (countyDataItem) => countyDataItem.id)
        .attr("data-education", (countyDataItem) => {
            const id = countyDataItem.id;
            const county = educationData.find((d) => d.fips === id)
            const percentage = county ? county.bachelorsOrHigher : 0;
            return percentage;
        })
        .on("mouseover", (event, countyDataItem) => {
            showTooltip(event, countyDataItem);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 40}px`);
        })
        .on("mouseout", () => {
            hideTooltip();
        });
};

//Creating the legend
const createLegend = () => {
    //Defining dimensions and properties
    const legendWidth = 290;
    const legendHeight = 8;
    const legendX = 565;
    const legendY = 32;
    const legendPadding = 5;

    //Creating different shades of colors between the lightest and darkest values
    const interpolatedColors = interpolateColor(color1, color2, numberOfColors);

    //Creating a SVG element for the legend
    const legend = canvas.append("g")
        .attr("id", "legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("border", "1px solid #000")
        .attr("transform", `translate(${legendX},${legendY})`);
    
    //Calculating the step for each color based on the number of colors and legend width
    const stepSize = legendWidth / numberOfColors;
    
    //Creating colored rectangles for each color in the legend
    for (let i = 0; i < numberOfColors; i++) {
        legend.append("rect")
            .attr("class", "legend-rect")
            .attr("x", legendPadding + i * stepSize)
            .attr("y", 0)
            .attr("width", stepSize)
            .attr("height", legendHeight)
            .attr("fill", interpolatedColors[i]);
    }

    //Adding tick lines and text labels
    legend.selectAll(".tick-line")
        .data(colorDomain)
        .enter()
        .append("line")
        .attr("class", "tick-line")
        .attr("x1", (d, i) => legendPadding + (i) * stepSize)
        .attr("y1", 0)
        .attr("x2", (d, i) => legendPadding + (i) * stepSize)
        .attr("y2", legendHeight + 5)
        .attr("stroke", "#000")
        .attr("stroke-width", 1);
    
    //Adding text labels for percentage values on the legend
    legend.selectAll(".legend-label")
        .data(colorDomain)
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", (d, i) => legendPadding + i * stepSize)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "middle")
        .text(d => `${d}%`);
};

d3.json(countyURL)
    .then((data) => {
        countyData = topojson.feature(data, data.objects.counties).features;
        return d3.json(educationURL);
    }) 
    .then((data) => {
            educationData = data,
            drawMap(),
            createLegend();
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
    });
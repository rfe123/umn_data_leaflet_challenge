function init_map() {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object to contain the streetmap and the topomap.
    let baseMaps = {
        Street: street,
        Topography: topo
    };

    // Modify the map so that it has the streetmap, states, and cities layers
    let map = L.map("map", {
        layers: [street],
        zoom: 8
    });

    // Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
    // street.addTo(myMap);
    // stateGroup.addTo(myMap);

    L.control.layers(baseMaps).addTo(map);

    return map;
};

let myMap = init_map();

// Lookup the index in the legend based on the bucket ranges for depth
function getDepthLevel(depth) {
    let min = -10;
    let max = 90;
    let steps = 20;

    if (depth >= max) {
        return Math.floor((max - min) / steps);
    };

    let level = 0;
    for (let i = min; i < max; i += steps) {
        if (depth >= i && depth < i + steps) { return level };
        level += 1;
    };
};

function createMarkers(data) {
    let features = data.features;

    //Red to Green ColorBrew Scale - need to reverse
    let colorScale = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'].reverse();
    let depthLabels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];

    myMap.fitBounds([
        [data.bbox[1], data.bbox[0]], // Southwest coordinates
        [data.bbox[4], data.bbox[3]]  // Northeast coordinates
    ]);

    // Loop through the data.
    features.forEach(element => {// Set the data location property to a variable.
        //console.log(element.geometry);
        let point = element.geometry;
        // Check for the location property.
        if (point) {
            let circle = L.circle([point.coordinates[1], point.coordinates[0]], {
                color: colorScale[getDepthLevel(point.coordinates[2])],
                fillOpacity: 0.5,
                radius: element.properties.mag * 20000
            });
            circle.addTo(myMap);
        };
    });

    // Create a legend control
    var legend = L.control({position: 'bottomright'});

    // Define the contents of the legend
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');

        // Loop through depthLevels and add corresponding color and label
        for (var i = 0; i < depthLabels.length; i++) {
            var legendItem = L.DomUtil.create('div', 'legend-item');
            legendItem.innerHTML = '<i style="background:' + colorScale[i] + '"></i> ' + depthLabels[i];
            div.appendChild(legendItem);
        }

        return div;
    };

    // Add the legend to the map
    legend.addTo(myMap);

}

let geoJsonData = d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');

geoJsonData.then(function (data) {
    console.log(data);
    createMarkers(data);
});

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
        zoom: 5
    });

    // Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
    // street.addTo(myMap);
    // stateGroup.addTo(myMap);

    L.control.layers(baseMaps).addTo(map);

    return map;
};

let myMap = init_map();

function createMarkers(data) {
    let features = data.features;

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
                color: 'red',
                fillOpacity: 0.5,
                radius: point.coordinates[2] * 1000
            });
            circle.addTo(myMap);
        };
    });

}

let geoJsonData = d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');

geoJsonData.then(function (data) {
    console.log(data);
    createMarkers(data);
});

var map;

// see https://switch2osm.org/using-tiles/getting-started-with-leaflet/
function initmap(startLat, startLon, startZoom) {
    // set up the map
    map = new L.Map('map');

    // create the tile layer with correct attribution
    var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 5, maxZoom: 16, attribution: osmAttrib});

    // start the map in South-East England
    map.setView(new L.LatLng(startLat, startLon), startZoom);
    map.addLayer(osm);
}

function addMarker(pageTitle, pageUrl, pageDate, lat, lon, markerType) {
    if (markerType == "kayak") {
        var colourMarker = L.AwesomeMarkers.icon({
            icon: "blind",
            markerColor: "red"
        });
        var marker = L.marker([lat, lon], {icon: colourMarker}).addTo(map);
        marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>Kayak<br>" + pageDate);
    }
    else if (markerType == "trail") {
        var colourMarker = L.AwesomeMarkers.icon({
            icon: "walk",
            markerColor: "blue"
        });
        var marker = L.marker([lat, lon], {icon: colourMarker}).addTo(map);
        marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>Trail<br>" + pageDate);
    }
    else {
        var colourMarker = L.AwesomeMarkers.icon({
            icon: "blind",
            markerColor: "green"
        });
        var marker = L.marker([lat, lon], {icon: colourMarker}).addTo(map);
        marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>" + pageDate);
    }
}

function addRoute(baseUrl, gpx) {
    new L.GPX(gpx, {
        async: true,
        marker_options: {
            startIconUrl: baseUrl + "/img/pin-icon-start.png",
            endIconUrl: baseUrl + "/img/pin-icon-end.png",
            shadowUrl: baseUrl + "/img/pin-shadow.png"
        }
    }).on('loaded', function(e) {
        map.fitBounds(e.target.getBounds());
    }).addTo(map);
}

function display_gpx(baseUrl, title, elt) {
    if (!elt) return;

    // first we add the map
    var mapid = elt.getAttribute('data-map-target');
    if (!mapid) return;

    // set up the map
    map = new L.Map(mapid);

    // create the tile layer with correct attribution
    var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 6, maxZoom: 17, attribution: osmAttrib});
    map.addLayer(osm);

    // now we add the GPX track
    var url = elt.getAttribute('data-gpx-source');
    if (!url) return;

    function _t(t) { return elt.getElementsByTagName(t)[0]; }
    function _c(c) { return elt.getElementsByClassName(c)[0]; }

    var control = L.control.layers(null, null).addTo(map);

    new L.GPX(url, {
        async: true,
        marker_options: {
            startIconUrl: baseUrl + "/img/pin-icon-start.png",
            endIconUrl: baseUrl + "/img/pin-icon-end.png",
            shadowUrl: baseUrl + "/img/pin-shadow.png"
        }
    }).on('loaded', function(e) {
        var gpx = e.target;
        map.fitBounds(gpx.getBounds());
        control.addOverlay(gpx, title);

        _t('h3').textContent = title;
        _c('start').textContent = gpx.get_start_time().toDateString() + ', '
            + gpx.get_start_time().toLocaleTimeString();
        _c('distance').textContent = (gpx.get_distance() / 1000.0).toFixed(2);
        _c('elapsed').textContent = gpx.get_duration_string(gpx.get_total_time());
        _c('moving').textContent = gpx.get_duration_string(gpx.get_moving_time());
        _c('pace').textContent = gpx.get_duration_string(gpx.get_moving_pace(), true);
        _c('ascent').textContent = gpx.get_elevation_gain().toFixed(0);

    }).addTo(map);
}

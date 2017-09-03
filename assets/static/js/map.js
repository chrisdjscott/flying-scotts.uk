// see https://switch2osm.org/using-tiles/getting-started-with-leaflet/

var map;

function init_map(elt) {
    if (!elt) return;

    // first we add the map
    var mapid = elt.getAttribute('data-map-target');
    if (!mapid) return;

    // set up the map
    map = new L.Map(mapid);

    // create the tile layer with correct attribution
    var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 16, attribution: osmAttrib});
    map.addLayer(osm);
}


function add_marker(pageTitle, pageUrl, pageDate, lat, lon, description) {
    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>" + description + "<br>" + pageDate);
}


function set_view(startLat, startLon, startZoom) {
    map.setView(new L.LatLng(startLat, startLon), startZoom);
}


function set_title(elt, title) {
    if (!elt) return;
    elt.getElementsByTagName('h3')[0].textContent = title;
}


function add_gpx(elt, title) {
    if (!elt) return;

    // first we add the map
    var mapid = elt.getAttribute('data-map-target');
    if (!mapid) return;

    // now we add the GPX track
    var url = elt.getAttribute('data-gpx-source');
    if (!url) return;

    function _t(t) { return elt.getElementsByTagName(t)[0]; }
    function _c(c) { return elt.getElementsByClassName(c)[0]; }

    var control = L.control.layers(null, null).addTo(map);

    new L.GPX(url, {
        async: true,
        marker_options: {
            startIconUrl: "/static/img/pin-icon-start.png",
            endIconUrl: "/static/img/pin-icon-end.png",
            shadowUrl: "/static/img/pin-shadow.png"
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

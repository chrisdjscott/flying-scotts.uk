// see https://switch2osm.org/using-tiles/getting-started-with-leaflet/

var map;
var photoLayer;
var control;
var markers;

function init_map(elt) {
    if (!elt) return;

    // first we add the map
    var mapid = elt.getAttribute('data-map-target');
    if (!mapid) return;

    // set up the map
    map = new L.Map(mapid);

    // default base layer
    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 1,
            maxZoom: 16,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    map.addLayer(OpenStreetMap_Mapnik);

    // satellite base layer
    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // add control
    baseMaps = {
        "OpenStreetMap": OpenStreetMap_Mapnik,
        "Satellite": Esri_WorldImagery,
    }
    control = L.control.layers(baseMaps, null).addTo(map);
}


function add_marker(pageTitle, pageUrl, pageDate, lat, lon, description) {
    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>" + description + "<br>" + pageDate);
}


function init_cluster() {
    markers = L.markerClusterGroup({
        maxClusterRadius: 40,
    });
}


function add_marker_to_cluster(pageTitle, pageUrl, pageDate, lat, lon, description) {
    var marker = L.marker([lat, lon]);
    marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>" + description + "<br>" + pageDate);
    markers.addLayer(marker);
}


function add_cluster_to_map() {
    map.addLayer(markers);
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

function add_photo_layer(photos) {
    if (photos.length == 0) return;

    photoLayer = L.photo.cluster().on('click', function(evt) {
        var photo = evt.layer.photo;
        var template = '<a href="{url}"><img src="{url}" class="img-fluid" /></a><p>{description}</p>';
        evt.layer.bindPopup(L.Util.template(template, photo), {
            minWidth: 400,
            className: 'leaflet-popup-photo',
            closeButton: false,
        }).openPopup();
    });

    control.addOverlay(photoLayer, "Photos");
    photoLayer.add(photos).addTo(map);
}

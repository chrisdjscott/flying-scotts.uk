// see https://switch2osm.org/using-tiles/getting-started-with-leaflet/

function PostMap(mapelt) {
    var elt = mapelt;
    if (!elt) throw new Error("elt does not exist in init_map");
    console.log("Creating new map on: ", elt);
    var mapid = elt.getAttribute('data-map-target');
    if (!mapid) throw new Error("data-map-target does not exist in init_map");
    var markers = null;
    var photoLayer = null;


    // set up the map
    var map = new L.Map(mapid);

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
    var baseMaps = {
        "OpenStreetMap": OpenStreetMap_Mapnik,
        "Satellite": Esri_WorldImagery,
    }
    var control = L.control.layers(baseMaps, null).addTo(map);


    function add_fullscreen_control() {
        map.addControl(new L.Control.Fullscreen());
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


    function add_marker_to_cluster(pageTitle, pageUrl, pageDate, lat, lon, description, image, image_width, image_height) {
        var marker = L.marker([lat, lon]);
        var popup_html = "<a href=" + pageUrl + ">" + pageTitle;
        if (image) {
            popup_html += '<br><img src="' + image + '" width="' + image_width + '" height="' + image_height + '" title="' + pageTitle +'">';
        }
        popup_html += "</a><br>";
        popup_html += description + "<br>" + pageDate;
        marker.bindPopup(popup_html);
        markers.addLayer(marker);
    }


    function add_cluster_to_map(markers) {
        map.addLayer(markers);
    }


    function set_view(startLat, startLon, startZoom) {
        map.setView(new L.LatLng(startLat, startLon), startZoom);
    }


    function set_view_nz() {
        map.fitBounds([
            [-47.32,166.32],
            [-34.36,178.63]
        ]);
    }


    function set_title(title) {
        elt.getElementsByTagName('h3')[0].textContent = title;
    }


    function add_route(permalink, date) {
        // title set in shortcode
        var title = elt.getAttribute("data-title");
        if (!title) throw new Error("Title was not set by shortcode");

        // if gpx is set we add_apx, otherwise add marker and set view and title
        var gpx = elt.getAttribute("data-gpx-source");
        if (gpx) {
            add_gpx(title);
        }
        else {
            var lat = elt.getAttribute("data-latitude");
            var lon = elt.getAttribute("data-longitude");
            var zoom = elt.getAttribute("data-zoom");
            if (lat && lon && zoom) {
                // add the start point and view that
                add_marker(title, permalink, date, lat, lon, "");
                set_view(lat, lon, zoom);
                set_title(title);
            }
            else {
                throw new Error("Map must specify either gpx or latitude, longitude and zoom!");
            }
        }
    }


    function add_gpx(title) {
        // now we add the GPX track
        var url = elt.getAttribute('data-gpx-source');
        if (!url) throw new Error("data-gpx-source does not exist")

        function _t(t) { return elt.getElementsByTagName(t)[0]; }
        function _c(c) { return elt.getElementsByClassName(c)[0]; }

        var elev = L.control.elevation({
            position: "bottomright",
            theme: "steelblue-theme",
            collapsed: true,
        });
        elev.addTo(map);

        var gpx = new L.GPX(url, {
            async: true,
            marker_options: {
                startIconUrl: "/img/pin-icon-start.png",
                endIconUrl: "/img/pin-icon-end.png",
                shadowUrl: "/img/pin-shadow.png"
            }
        });

        gpx.on('loaded', function(e) {
            var gpx = e.target;
            map.fitBounds(gpx.getBounds());
            control.addOverlay(gpx, title);

            _t('h3').textContent = title;
            _c('start').textContent = gpx.get_start_time().toDateString() + ', '
                + gpx.get_start_time().toLocaleTimeString();
            _c('distance').textContent = (gpx.get_distance() / 1000.0).toFixed(2);
            _c('duration').textContent = gpx.get_duration_string(gpx.get_total_time());
            _c('pace').textContent = gpx.get_duration_string(gpx.get_total_time() / (gpx.get_distance() / 1000.0), true);
            _c('ascent').textContent = gpx.get_elevation_gain().toFixed(0);

        });

        gpx.on("addline", function(e) {
            elev.addData(e.line);
        });

        gpx.addTo(map);
    }

    function add_photo_layer(photos) {
        if (photos.length == 0) return;

        photoLayer = L.photo.cluster().on('click', function(evt) {
            var photo = evt.layer.photo;
            openGallery(galleries.length, photo.pid, true);
        });

        control.addOverlay(photoLayer, "Photos");
        photoLayer.add(photos).addTo(map);
    }

    return Object.freeze({
        add_fullscreen_control,
        add_route,
    });
}

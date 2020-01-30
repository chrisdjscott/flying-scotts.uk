// see https://switch2osm.org/using-tiles/getting-started-with-leaflet/

var map;
var photoLayer;
var control;
var markers;


function create_map() {
    var map_object = {
        map: null,
        photoLayer: null,
        control: null,
        markers: null,
        elt: null,
        init_map: function(map_elt) {
            if (!elt) return;
            this.elt = map_elt;

            // first we add the map
            var mapid = elt.getAttribute('data-map-target');
            if (!mapid) return;

            // set up the map
            this.map = new L.Map(mapid);

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
            this.control = L.control.layers(baseMaps, null).addTo(map);

        }




        add_fullscreen_control: function() {
            this.map.addControl(new L.Control.Fullscreen());
        }


        add_marker: function(pageTitle, pageUrl, pageDate, lat, lon, description) {
            var marker = L.marker([lat, lon]).addTo(this.map);
            marker.bindPopup("<a href=" + pageUrl + ">" + pageTitle + "</a><br>" + description + "<br>" + pageDate);
        }


        init_cluster: function() {
            this.markers = L.markerClusterGroup({
                maxClusterRadius: 40,
            });
        }


        add_marker_to_cluster: function(pageTitle, pageUrl, pageDate, lat, lon, description, image, image_width, image_height) {
            var marker = L.marker([lat, lon]);
            var popup_html = "<a href=" + pageUrl + ">" + pageTitle;
            if (image) {
                popup_html += '<br><img src="' + image + '" width="' + image_width + '" height="' + image_height + '" title="' + pageTitle +'">';
            }
            popup_html += "</a><br>";
            popup_html += description + "<br>" + pageDate;
            marker.bindPopup(popup_html);
            this.markers.addLayer(marker);
        }


        add_cluster_to_map: function() {
            this.map.addLayer(markers);
        }


        set_view: function(startLat, startLon, startZoom) {
            this.map.setView(new L.LatLng(startLat, startLon), startZoom);
        }


        set_view_nz: function() {
            this.map.fitBounds([
                [-47.32,166.32],
                [-34.36,178.63]
            ]);
        }


        set_title: function(title) {
            if (!this.elt) return;
            this.elt.getElementsByTagName('h3')[0].textContent = title;
        }


        add_gpx: function(title) {
            if (!this.elt) return;

            // first we add the map
            var mapid = elt.getAttribute('data-map-target');
            if (!mapid) return;

            // now we add the GPX track
            var url = elt.getAttribute('data-gpx-source');
            if (!url) return;

            function _t(t) { return this.elt.getElementsByTagName(t)[0]; }
            function _c(c) { return this.elt.getElementsByClassName(c)[0]; }

            var elev = L.control.elevation({
                position: "bottomright",
                theme: "steelblue-theme",
                collapsed: true,
            });
            elev.addTo(this.map);

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
                this.map.fitBounds(gpx.getBounds());
                this.control.addOverlay(gpx, title);

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

            gpx.addTo(this.map);
        }

        add_photo_layer: function(photos) {
            if (photos.length == 0) return;

            photoLayer = L.photo.cluster().on('click', function(evt) {
                var photo = evt.layer.photo;
                openGallery(galleries.length, photo.pid, true);
            });

            this.control.addOverlay(photoLayer, "Photos");
            photoLayer.add(photos).addTo(this.map);
        }

    };

    return map_object;
}



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


function add_cluster_to_map() {
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

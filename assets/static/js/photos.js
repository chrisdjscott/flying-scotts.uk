// initialise photo swipe
// based on: https://gist.github.com/kshnurov/8b175b8798d4a907e47b
var initPhotoSwipeFromDOM = function(gallerySelector) {
    // store all items
    var galleries = [];

    $(gallerySelector).each( function(galleryIndex) {
        var $gallery = $(this);
        galleries.push({
            id: galleryIndex,
            items: [],
        });

        // build list of slides for this photo swipe gallery
        $gallery.find('a').each(function() {
            var $href = $(this).attr('href'),
                $size = $(this).data('size').split('x'),
                $width = $size[0],
                $height = $size[1],
                $title = $(this).data('title');

            var item = {
                src: $href,
                w: $width,
                h: $height,
                title: $title
            };

            galleries[galleryIndex].items.push(item);
        });


        // open photoswipe when image clicked
        $gallery.on('click', 'a', function(evt) {
            evt.preventDefault();
            openGallery(galleryIndex + 1, $(this).index());
        });
    });

    // function that opens photoswipe
    var openGallery = function(gid, pid) {
        // photo swipe element
        var $pswp = $('.pswp')[0];

        // items for this gallery
        var items = galleries[gid - 1].items;

        // photoswipe options
        var options = {
            index: pid,
            //bgOpacity: 0.7,
            //showHideOpacity: true,
            galleryUID: gid,
        };

        // initialise and open photoswipe
        var lightbox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
        lightbox.init();
    }

    // function that parses hash and opens photoswipe if needed
    var parseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');
            if(pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        if(!params.hasOwnProperty('pid')) {
            return params;
        }
        params.pid = parseInt(params.pid, 10);

        return params;
    }

    // parse URL and open gallery if contains #&pid=3&gid=1
    var hashData = parseHash();
    if (hashData.pid > 0 && hashData.gid > 0) {
        openGallery(hashData.gid, hashData.pid);
    }
}

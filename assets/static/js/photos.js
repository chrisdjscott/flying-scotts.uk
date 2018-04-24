// store all galleries
var galleries = [];

// initialise photo swipe
// based on: https://gist.github.com/kshnurov/8b175b8798d4a907e47b
var initPhotoSwipeFromDOM = function(gallerySelector) {
    // iterate over each gallery in the page
    $(gallerySelector).each( function(galleryIndex) {
        var $gallery = $(this);
        galleries.push({
            items: [],
        });

        // build list of slides for this photo swipe gallery
        $gallery.find('a').each(function() {
            var $size = $(this).data('size').split('x');
            var item = {
                src: $(this).attr('href'),
                w: parseInt($size[0], 10),
                h: parseInt($size[1], 10),
                title: $(this).data('title'),
                el: this,
            };

            galleries[galleryIndex].items.push(item);
        });

        // open photoswipe when image clicked
        $gallery.on('click', 'a', function(evt) {
            evt.preventDefault();
            openGallery(galleryIndex + 1, $(this).index() + 1);
        });
    });

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

// function that opens photoswipe
var openGallery = function(gid, pid, thumb=null) {
    // photo swipe element
    var $pswp = $('.pswp')[0];

    // items for this gallery
    var items = galleries[gid - 1].items;

    // photoswipe options
    var options = {
        index: pid - 1,  // expecting 0-based index for photo
        galleryUID: gid,
        getThumbBoundsFn: function(index) {
            // using thumb means the zoom looks correct when opening from map
            // however it will always close back to the original photo that was opened
            var thumbnail = thumb || items[index].el.children[0],
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        },
        showHideOpacity: (thumb ? true : false),
    };

    // initialise and open photoswipe
    var lightbox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
    lightbox.init();
}

// function that returns the index of the main gallery on the page
var getMainGalleryIndex = function() {
    // main gallery is the last one
    return galleries.length;
}

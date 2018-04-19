# -*- coding: utf-8 -*-
import os

from markupsafe import escape
from werkzeug.urls import url_parse
from bs4 import BeautifulSoup

from lektor.context import get_ctx
from lektor.pluginsystem import Plugin
from lektor.imagetools import get_image_info


class MarkdownImgFancyPlugin(Plugin):
    name = u'markdown-img-fancy'
    description = u'Add your description here.'

    def on_markdown_config(self, config, **extra):
        class ImageFancyMixin(object):
            def image(renderer, src, title, text):
                # get config
                cfg = self.get_config()

                # set title to alt, if not set
                if not title:
                    title = text

                # get the default img tag
                img_tag = super(ImageFancyMixin, renderer).image(src, title, text)

                # parse tag
                soup = BeautifulSoup(img_tag, "html.parser")
                img_src = soup.img['src']

                # display thumbnail for local images
                if not src.startswith("https"):
                    root, ext = os.path.splitext(img_src)
                    soup.img['src'] = root + '-thumbnail' + ext

                # add classes to the img
                img_class = cfg.get('images.class')
                if img_class:
                    soup.img['class'] = img_class

                # convert soup back to string
                img_tag = str(soup)

                # add anchor (except for remote, i.e. Google Photos, images)
                if not src.startswith("https"):
                    img_tag = '<a href="{0}">'.format(img_src) + img_tag + "</a>"
                    soup = BeautifulSoup(img_tag, "html.parser")
                    if cfg.get('images.ekko-lightbox'):
                        soup.a['data-toggle'] = 'lightbox'
                        img_tag = str(soup)
                    elif cfg.get('images.magnific'):
                        soup.a['class'] = 'image-link'
                        img_tag = str(soup)
                    elif cfg.get('images.photoswipe'):
                        # photoswipe requires the image dimensions
                        ctx = get_ctx()
                        img_fn = os.path.join(os.path.dirname(ctx.source.source_filename), src)
                        if os.path.exists(img_fn):
                            with open(img_fn, 'rb') as fh:
                                _, width, height = get_image_info(fh)

                            soup.a['data-size'] = "%sx%s" % (width, height)
                            soup.a['data-title'] = "%s" % escape(title)
                            soup.a['data-index'] = "0"
                            img_tag = '<div class="post-photos">' + str(soup) + '</div>'
#                        else:
#                            print(">>> WARNING: markdown_img_fancy: file does not exist: '%s'" % img_fn)

                return img_tag

        config.renderer_mixins.append(ImageFancyMixin)

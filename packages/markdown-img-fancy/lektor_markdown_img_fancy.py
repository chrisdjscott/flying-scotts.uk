# -*- coding: utf-8 -*-
from markupsafe import escape
from werkzeug.urls import url_parse
from bs4 import BeautifulSoup

from lektor.context import get_ctx
from lektor.pluginsystem import Plugin


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
                soup = BeautifulSoup(img_tag, 'html.parser')
                img_src = soup.img['src']

                #TODO: change src to thumbnail
                #TODO: create thumbnail?
                #TODO: add attributes to anchor

                # add classes to the img
                img_class = cfg.get('images.class')
                if img_class:
                    soup.img['class'] = img_class

                # convert soup back to string
                img_tag = str(soup)

                # add anchor
                img_tag = '<a href="{0}">'.format(img_src) + img_tag + "</a>"

                return img_tag

        config.renderer_mixins.append(ImageFancyMixin)

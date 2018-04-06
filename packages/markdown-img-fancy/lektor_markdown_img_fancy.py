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


                #TODO: set title to alt already, if that option is set

                # get the default img tag
                img_tag = super(ImageFancyMixin, renderer).image(src, title, text)

                #TODO: only do the following if we are changing something
                soup = BeautifulSoup(img_tag, 'html.parser')

                #TODO: change src to thumbnail
                #TODO: add classes to img
                #TODO: create thumbnail?
                #TODO: create anchor linking to full image
                #TODO: add attributes to anchor

                # add classes to the img
                soup.img['class'] = 'img-fluid-both'

                # convert soup back to string
                img_tag = str(soup)

                return img_tag

        config.renderer_mixins.append(ImageFancyMixin)

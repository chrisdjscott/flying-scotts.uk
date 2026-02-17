from __future__ import unicode_literals
from __future__ import print_function
import os
import sys
import shutil
import re
import datetime
import subprocess
import glob

import invoke


ROOT_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(ROOT_DIR, 'build')



@invoke.task(help={'title': 'Title of the post (compulsory)', 'slug': 'Custom slug (automatic)',
    'add_gpx': 'Add gpx file with the same name (false)', 'description': 'Post description (empty)',
    'date': 'Post date YYYY-MM-DD (empty)'})
def newpost(ctx, title, slug=None, add_gpx=False, description=None, date=None):
    """
    Prepare to add a new post.

    """
    def slugify(s):
        s = s.lower()
        for c in [' ', '-', '.', '/']:
            s = s.replace(c, '_')
        s = re.sub('\W', '', s)
        s = s.replace('_', ' ')
        s = re.sub('\s+', ' ', s)
        s = s.strip()
        s = s.replace(' ', '-')

        return s

    # slug for the post
    post_slug = slug if slug is not None else slugify(title)

    print('Creating new post:')
    print('  title:', title)
    print('  slug:', post_slug)
    print('  add_gpx:', add_gpx)
    print('  description:', description)
    print('  date:', date)

    # check the branch and switch to a new one
    #   1. do a status and fetch
    invoke.run('git status')
    invoke.run("git fetch")

    #   2. check we are on master
    git_status = subprocess.check_output('git status', universal_newlines=True, shell=True)
    if 'On branch master' not in git_status:
        print("Error: should be starting from master")
        raise invoke.Exit(1)

    #   3. check up to date
    if 'Your branch is behind' in git_status:
        print("Error: branch is behind")
        raise invoke.Exit(1)

    #   4. create new branch
    invoke.run("git checkout -b %s" % post_slug)

    # directory for the content
    content_dir = os.path.join(ROOT_DIR, "content")
    post_dir = os.path.join(content_dir, post_slug)
    if os.path.exists(post_dir):
        print("Error: post directory already exists: %s" % post_dir)
        raise invoke.Exit(1)
    os.mkdir(post_dir)

    # content
    content_dict = {
        'title': title,
        'today': datetime.datetime.today().strftime('%Y-%m-%d'),
        'gpx_file': post_slug + '.gpx' if add_gpx else '',
        'description': '' if description is None else description,
        'date': '' if date is None else date,
    }

    # content file
    content_file = os.path.join(post_dir, "index.md")
    templ = """+++
title = "%(title)s"
date = "%(date)s"
publishdate = "%(today)s"
author = "Chris Scott"
image = ""
latitude = ""
longitude = ""
gpx = "%(gpx_file)s"
description = "%(description)s"
+++

""" % content_dict
    with open(content_file, "w") as fh:
        fh.write(templ)


@invoke.task
def photos(ctx, filename):
    """
    Process photos by reducing size and removing EXIF data.

    """
    print("Preparing photos: %s" % filename)

    exif_keep = "-GPSLatitudeRef -GPSLongitudeRef -GPSLatitude -GPSLongitude -GPSInfo -ImageLength -ImageHeight -ImageWidth"
    invoke.run('mogrify -resize "1920x1920>" -quality 70% -interlace Plane {0}'.format(filename), echo=True)
    invoke.run('exiftool -overwrite_original_in_place -all= -tagsFromFile @ {0} {1}'.format(exif_keep, filename), echo=True)


@invoke.task
def setgps(ctx, filename, lat, lon):
    """
    Set GPS location for the image file.

    """
    from pexif import JpegFile

    try:
        ef = JpegFile.fromFile(filename)
        ef.set_geo(float(lat), float(lon))
    except IOError:
        type, value, traceback = sys.exc_info()
        print("Error opening file:", value)
        raise invoke.Exit(1)
    except JpegFile.InvalidFile:
        type, value, traceback = sys.exc_info()
        print("Error opening file:", value)
        raise invoke.Exit(2)

    try:
        ef.writeFile(filename)
    except IOError:
        type, value, traceback = sys.exc_info()
        print("Error saving file:", value)
        raise invoke.Exit(3)

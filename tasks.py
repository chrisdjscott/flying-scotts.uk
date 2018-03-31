from __future__ import unicode_literals
from __future__ import print_function
import os
import shutil
import re
import datetime
import subprocess

import invoke

from lektor.builder import Builder
from lektor.cli import Context
from lektor.reporter import CliReporter


ROOT_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(ROOT_DIR, 'build')


@invoke.task
def build(ctx):
    lektor_cli_ctx = Context()
    lektor_cli_ctx.load_plugins()

    env = lektor_cli_ctx.get_env()
    pad = env.new_pad()

    # This is essentially `lektor build --output-path build`.
    with CliReporter(env, verbosity=0):
        builder = Builder(pad, OUTPUT_DIR)
        failures = builder.build_all()

    if failures:
        print("Error: Builder failed!")
        raise invoke.Exit(1)

    # copy redirect file for netlify
    redirect_input = os.path.join(ROOT_DIR, "redirects.txt")
    redirect_output = os.path.join(OUTPUT_DIR, '_redirects')
    shutil.copy(redirect_input, redirect_output)


@invoke.task(help={'title': 'Title of the post (compulsory)', 'slug': 'Custom slug (automatic)',
    'add_gpx': 'Add gpx file with the same name (false)', 'description': 'Post description (empty)',
    'date': 'Post date YYYY-MM-DD (empty)'})
def newpost(ctx, title, slug=None, add_gpx=False, description=None, date=None):
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
    content_file = os.path.join(post_dir, "contents.lr")
    templ = """title: %(title)s
---
date: %(date)s
---
pub_date: %(today)s
---
author: Chris Scott
---
image:
---
latitude:
---
longitude:
---
gpx: %(gpx_file)s
---
description: %(description)s
---
body:

""" % content_dict
    with open(content_file, "w") as fh:
        fh.write(templ)


@invoke.task
def minify(ctx):
    minify_files = [
        'js/map.js',
        'css/map.css',
    ]
    cwd = os.path.abspath(os.path.dirname(__file__))
    assets = os.path.join(cwd, 'assets', 'static')
    for fn in minify_files:
        fpath_in = os.path.join(assets, fn)
        root, ext = os.path.splitext(fn)
        fpath_out = os.path.join(assets, root + '.min' + ext)
        with open(fpath_out, "w") as fout:
            invoke.run("minify {0}".format(fpath_in), out_stream=fout, echo=True)

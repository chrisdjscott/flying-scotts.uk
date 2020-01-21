#!/usr/bin/env python

import os
import sys
import glob
import subprocess


lrfiles = glob.glob("*.lr")
if len(lrfiles) == 0:
    print("nothing to do")
    sys.exit(0)
imfiles = [os.path.splitext(fn)[0] for fn in lrfiles]
for fn in imfiles:
    assert os.path.exists(fn), "No corresponding image file %s" % fn
print("images:", imfiles)
print("lektor:", lrfiles)

# get new file names
newimfiles = {}
imtitles = {}
for lr, im in zip(lrfiles, imfiles):
    with open(lr) as fh:
        order = None
        description = None
        for line in fh:
            if order is None and line.startswith("order:"):
                order = int(line.split()[1])
            elif description is None and line.startswith("description:"):
                array = line.strip().split(":")
                assert len(array) == 1 or len(array) == 2
                description = array[1].lstrip() if len(array) == 2 else im
    assert order is not None, "No order in lr file %s" % lr
    assert description is not None, "No description in lr file %s" % lr
    newimfiles[im] = "%03d_%s" % (order, im)
    imtitles[im] = description if len(description) else im

# get name of image file
with open("index.md") as fh:
    background = None
    index_lines = fh.readlines()
    assert index_lines[0].startswith("---"), "index file not starting as expected"
    index_lines.pop(0)
    frontmatter = []
    body = []
    have_frontmatter = False
    for i, line in enumerate(index_lines):
        if not have_frontmatter:
            if line.startswith("---"):
                have_frontmatter = True
                continue

            elif background is None and line.startswith("image:"):
                background = line.split()[1]
                line = "image: {}\n".format(newimfiles[background])

            frontmatter.append(line.rstrip())

        else:
            if line.startswith("!["):
                # change to shortcode, checking not http
                # ![some description](image.jpg)
                desc, imbit = line.rstrip().split("[")[1].split("]")
                assert imbit.startswith("("), "Error parsing image beginning"
                assert imbit.rstrip().endswith(")"), "Error parsing image end"
                im = imbit[1:-1]
                print(line, desc, im)

                line = '{{{{< photo src="{}" title="{}" >}}}}'.format(newimfiles[im], desc)

            body.append(line.rstrip())

assert background is not None, "Could not find image in index.md"
print("Background:", background)
assert background in imfiles, "Background is not in image files list"
assert have_frontmatter

# now parse image lr files and add resources
frontmatter.append("resources:")
for im, title in imtitles.items():
    frontmatter.append("  - src: {}".format(newimfiles[im]))
    frontmatter.append("    title: {}".format(title))

print("Starting to change things now")

# rename images
print(newimfiles)
for old, new in newimfiles.items():
    subprocess.check_call('git mv "{}" "{}"'.format(old, new), shell=True)

# change image names in index.md
with open("index.md", "w") as fh:
    fh.write("---\n")
    fh.write("\n".join(frontmatter))
    fh.write("\n---\n")
    fh.write("\n".join(body))

# remove lr files
subprocess.check_call("git rm *.lr", shell=True)

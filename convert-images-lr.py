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
for lr, im in zip(lrfiles, imfiles):
    with open(lr) as fh:
        order = None
        for line in fh:
            if line.startswith("order:"):
                order = int(line.split()[1])
                break
    assert order is not None, "No order in lr file %s" % lr
    newimfiles[im] = "%03d_%s" % (order, im)

# get name of image file
with open("index.md") as fh:
    background = None
    index_lines = fh.readlines()
    for i, line in enumerate(index_lines):
        if line.startswith("image:"):
            background = line.split()[1]
            index_lines[i] = "image: {}\n".format(newimfiles[background])
            break
assert background is not None, "Could not find image in index.md"
print("Background:", background)
assert background in imfiles, "Background is not in image files list"

# rename images
print(newimfiles)
for old, new in newimfiles.items():
    subprocess.check_call('git mv "{}" "{}"'.format(old, new), shell=True)

# change image name in index.md
with open("index.md", "w") as fh:
    fh.write("".join(index_lines))

#TODO: need to add shortcode in md file with description

# remove lr files
subprocess.check_call("git rm *.lr", shell=True)

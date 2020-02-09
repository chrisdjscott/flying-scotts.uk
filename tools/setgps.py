#!/usr/bin/env python

"""
Set GPS location for the image file.

"""
import sys

from pexif import JpegFile


filename = sys.argv[1]
lat = sys.argv[2]
lon = sys.argv[3]


try:
    ef = JpegFile.fromFile(filename)
    ef.set_geo(float(lat), float(lon))
except IOError:
    type, value, traceback = sys.exc_info()
    print("Error opening file:", value)
    raise IOError("Errpr opening file")
except JpegFile.InvalidFile:
    type, value, traceback = sys.exc_info()
    print("Error opening file:", value)
    raise IOError("Invalid file")

try:
    ef.writeFile(filename)
except IOError:
    type, value, traceback = sys.exc_info()
    print("Error saving file:", value)
    raise IOError("Error saving file")

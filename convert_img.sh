# https://stackoverflow.com/a/7262050
mogrify -resize "1920>" -quality 75% -interlace Plane *.jpg
exiftool -overwrite_original_in_place -all= -tagsFromFile @ -GPSLatitudeRef -GPSLongitudeRef -GPSLatitude -GPSLongitude -GPSPosition *.jpg

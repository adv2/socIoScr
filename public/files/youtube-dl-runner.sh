#!/bin/bash
link="$1"
youtube-dl -o "%(title)s.%(ext)s" -x --audio-format mp3 --embed-thumbnail --no-overwrites  $link

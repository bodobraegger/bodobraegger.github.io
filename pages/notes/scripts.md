---
title: Scripts+Configs, Admin of my System
place: Rio de Janeiro, RJ, Brasil
date: 2026-04-26T16:23:49-03:00
lang: en
type: note+blog
plum: true
---

My collection of scripts, configuration tidbits and more is growing. Just upgraded
to Ubuntu 26.04, and every migration requires some new small new tinkering, even
if this becomes less and less the case. Here I will log some of the things I use
again and again, sort of evergreen.

## Dualboot Shared NTFS partition

Setup with Windows, mounting the Windows partition for shared (non-important)
files such as downloaded media files and so on, requires setup in `/etc/fstab`
for automount on Ubuntu boot:

```bash
UUID=0123456789ABCDEF  /mnt/ur_place  ntfs  defaults,uid=1000,gid=1000,iocharset=utf8,windows_names,nofail  0  0
```

Note that the partition should be treated strictly as **untrusted, disposable storage**.
**No execution or sensitive data!**

## Transluscent windows on click

I am currently studying a lot of vocabulary. Back at home, I am used to a multi-
monitor setup, I like being able to switch visually between different tasks and
also to read, watch and whatever else simoultaneously.

It helps to be able to lay windows on top of each other to maximize space, here
is a script that lives in my `~/.local/bin/` folder and in my path:

```bash
# make next window we click on transluscent by arg or default
FACTOR="${1:-70}"
xprop -f _NET_WM_WINDOW_OPACITY 32c -set _NET_WM_WINDOW_OPACITY $(printf 0x%x $((0xffffffff * FACTOR / 100)))
```

## AppImage to Desktop Entry

Small script to autocreate a Desktop Entry from an AppImage file to make them feel more integrated into your system,
and show up in the Gnome (and Pop!) Launcher.

```bash
#!/bin/bash
set -e
set -o pipefail

APPIMAGE_PATH=$1

if [ -z "$APPIMAGE_PATH" ]; then
    echo "Missing argument: appimage"
    exit 1
fi

if [ ! -f "$APPIMAGE_PATH" ]; then
    echo "File not found: $APPIMAGE_PATH"
    exit 1
fi

TEMP_SQUASHFS_PATH=$(mktemp -d)
APPIMAGE_FULLPATH=$(readlink -e "$APPIMAGE_PATH")
APPIMAGE_FILENAME=$(basename "$APPIMAGE_PATH")
APP_NAME="${APPIMAGE_FILENAME%.*}"
DESKTOP_ENTRY_PATH="${HOME}/.local/share/applications/$APP_NAME.desktop"
ICON_FOLDER="${HOME}/.local/share/icons"
mkdir -p "${ICON_FOLDER}"

if [ "$2" == "--remove" ]; then
    rm -f "$DESKTOP_ENTRY_PATH"
    find "${ICON_FOLDER}" -maxdepth 1 -type f -name "$APP_NAME.*" -delete
    echo "Removed"
    exit 0
fi

pushd $TEMP_SQUASHFS_PATH
"$APPIMAGE_FULLPATH" --appimage-extract > /dev/null
cd squashfs-root/

echo "Choose icon: "
mapfile -t FILENAMES < <(find -L . -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.svg' \))
i=1
for filename in "${FILENAMES[@]}"
do
    printf " %d) %s\n" "$i" "$filename"
    i=$((i + 1))
done

read -r SELECTED_INDEX

ICON_SRC=${FILENAMES[$((SELECTED_INDEX - 1))]}
ICON_EXT="${ICON_SRC##*.}"
ICON_DST="${ICON_FOLDER}/$APP_NAME.$ICON_EXT"
cp "$ICON_SRC" "$ICON_DST"

cat <<EOT > "$DESKTOP_ENTRY_PATH"
[Desktop Entry]
Name=$APP_NAME
StartupWMClass=$APP_NAME
Exec="$APPIMAGE_FULLPATH"
Icon=$ICON_DST
Type=Application
Terminal=false
EOT

popd

rm -rf $TEMP_SQUASHFS_PATH

echo "Created"
```

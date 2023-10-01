import { useCallback } from "preact/hooks";
import joystickIconUrl from "~/images/icons/joystick.png";
import joystickFaviconUrl from "~/images/icons/favicons/joystick.png";
import { File, files, openFile, totalSize } from "~/os/filesystem";
import { useDoubleClick } from "../useDoubleClick";
import "./fileicon.css";

export function getFileExtension(file: File) {
    return file.filename.split(".", 2)[1];
}
export function getFileBasename(file: File) {
    const parts = file.filename.split("/");
    return parts[parts.length - 1];
}

export function getIconForFile(file: File) {
    const extension = getFileExtension(file);
    return joystickIconUrl;
}
export function getFaviconForPath(path: string) {
    return joystickFaviconUrl;
}

export function getIconForPath(path: string) {
    return joystickIconUrl;
}

function getDisplayNameForFile(file: File) {
    if (file.shortcutProperties) {
        return file.shortcutProperties.displayName;
    }
    return getFileBasename(file);
}

export function displayFilesize(size: number | undefined) {
    if (size != 0 && size != undefined) {
        if (size > 1000) {
            return (size / 1000).toFixed(2) + "GB";
        }
        return size.toFixed(2) + "MB";
    }
    return "";
}

function getCDriveSpace() {
    let usedSize = 0;
    files.value.forEach((file) => {
        usedSize += file.value.filesize;
    });
    return `${displayFilesize(usedSize)} / ${displayFilesize(totalSize)}`;
}

interface FileIconProps {
    file: File;
    onFocus?: () => void;
    onDoubleClick?: () => void;
}
export function FileIcon({ file, onFocus, onDoubleClick }: FileIconProps) {
    const doubleClickFn = useCallback(() => {
        if (onDoubleClick) {
            onDoubleClick();
        } else {
            openFile(file);
        }
    }, [file, onDoubleClick]);
    const onClick = useDoubleClick(doubleClickFn);
    const spaceDetails =
        file.filename === "My Computer/C:/" ? <span class="spaceDetails">{getCDriveSpace()}</span> : undefined;
    return (
        <button class="fileIcon" onClick={onClick} onFocus={onFocus}>
            <img src={getIconForFile(file)} />
            <span class="fileIconLabel">{getDisplayNameForFile(file)}</span>
            {spaceDetails}
        </button>
    );
}

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

function displayFilesize(size: number){
    if(size > 1000){
        return (size/1000).toFixed(2) + "GB";
    }
    return size.toFixed(2) + "MB";
}

function getCDriveSpace(){
    let usedSize = 0;
    files.value.forEach(file => {
        usedSize += file.value.filesize;
    });
    return `${displayFilesize(usedSize)} / ${displayFilesize(totalSize)}`
}

interface FileIconProps {
    file: File;
}
export function FileIcon({ file }: FileIconProps) {
    const onDoubleClick = useCallback(() => {
        openFile(file);
    }, [file]);
    const onClick = useDoubleClick(onDoubleClick);
    console.log(file.filename);
    const spaceDetails = file.filename === "My Computer/C:/" ? <span class="spaceDetails">{getCDriveSpace()}</span> : undefined;
    return (
        <button class="fileIcon" onClick={onClick}>
            <img src={getIconForFile(file)} />
            <span class="fileIconLabel">{getDisplayNameForFile(file)}</span>
            {spaceDetails}
        </button>
    );
}

import { useCallback } from "preact/hooks";
import joystickIconUrl from "~/images/icons/joystick.png";
import { File, openFile } from "~/os/filesystem";
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

function getDisplayNameForFile(file: File) {
    if (file.shortcutProperties) {
        return file.shortcutProperties.displayName;
    }
    return getFileBasename(file);
}

interface FileIconProps {
    file: File;
}
export function FileIcon({ file }: FileIconProps) {
    const onDoubleClick = useCallback(() => {
        openFile(file);
    }, [file]);
    const onClick = useDoubleClick(onDoubleClick);
    return (
        <button class="fileIcon" onClick={onClick}>
            <img src={getIconForFile(file)} />
            <span class="fileIconLabel">{getDisplayNameForFile(file)}</span>
        </button>
    );
}

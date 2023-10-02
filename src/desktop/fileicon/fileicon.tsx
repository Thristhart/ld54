import { useCallback, useEffect, useRef } from "preact/hooks";
import joystickIconUrl from "~/images/icons/joystick.png";
import notepadIconUrl from "~/images/icons/notepad.png";
import joystickFaviconUrl from "~/images/icons/favicons/joystick.png";
import myComputerFaviconUrl from "~/images/icons/favicons/mycomputer.png";
import folderIconUrl from "~/images/icons/folder.png";
import hardDriveIconUrl from "~/images/icons/harddrive.png";
import { File, files, openFile, removeFile, totalSize } from "~/os/filesystem";
import { useDoubleClick } from "../useDoubleClick";
import "./fileicon.css";
import { useSignal } from "@preact/signals";
import { RefObject } from "preact";

export function getFileExtension(file: File) {
    return file.filename.split(".", 2)[1];
}
export function getFileBasename(file: File) {
    const parts = file.filename.split("/");
    return parts[parts.length - 1];
}

export function getIconForFile(file: File) {
    if (file.shortcutProperties?.iconUrl) {
        return file.shortcutProperties.iconUrl;
    }
    const extension = getFileExtension(file);
    if (file.filename === "My Computer/C:/") {
        return hardDriveIconUrl;
    }
    if (!extension) {
        return folderIconUrl;
    }
    if (extension === "txt") {
        return notepadIconUrl;
    }
    return joystickIconUrl;
}
export function getFaviconForPath(path: string) {
    if (path.endsWith("My Computer")) {
        return myComputerFaviconUrl;
    }
    return joystickFaviconUrl;
}

export function getDisplayNameForFile(file: File) {
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
        usedSize += file.filesize;
    });
    return `${displayFilesize(usedSize)} / ${displayFilesize(totalSize)}`;
}

interface FileContextMenuProps {
    file: File;
    menuRef: RefObject<HTMLUListElement>;
}
function FileContextMenu({ file, menuRef }: FileContextMenuProps) {
    return (
        <ul class="fileContextMenu" ref={menuRef}>
            <li>
                <button className="fileContextMenuBold" onClick={() => openFile(file)}>
                    Open
                </button>
            </li>
            <li>
                <button disabled>Explore</button>
            </li>
            <li>
                <button disabled>Search...</button>
            </li>
            <li>
                <hr />
            </li>
            <li>
                <button disabled>Copy</button>
            </li>
            <li>
                <hr />
            </li>
            <li>
                <button disabled>Create Shortcut</button>
            </li>
            <li>
                <button onClick={() => removeFile(file)}>Delete</button>
            </li>
            <li>
                <button disabled>Rename</button>
            </li>
            <li>
                <hr />
            </li>
            <li>
                <button disabled>Properties</button>
            </li>
        </ul>
    );
}

interface FileIconProps {
    file: File;
    onFocus?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onDoubleClick?: () => void;
}
export function FileIcon({ file, onFocus, onKeyDown, onDoubleClick }: FileIconProps) {
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
    const showContextMenu = useSignal(false);
    const menuRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
        function onClick(e: MouseEvent) {
            showContextMenu.value = false;
        }
        if (showContextMenu.value) {
            document.body.addEventListener("click", onClick);
            document.body.addEventListener("contextmenu", onClick);
        } else {
            document.body.removeEventListener("click", onClick);
            document.body.removeEventListener("contextmenu", onClick);
        }
        return () => {
            document.body.removeEventListener("click", onClick);
            document.body.removeEventListener("contextmenu", onClick);
        };
    }, [showContextMenu.value]);
    return (
        <div class="fileIconContainer">
            {showContextMenu.value && <FileContextMenu menuRef={menuRef} file={file} />}
            <button
                class="fileIcon"
                onClick={onClick}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                onContextMenu={(e) => {
                    e.preventDefault();
                    showContextMenu.value = true;
                }}>
                <img src={getIconForFile(file)} />
                <span class="fileIconLabel">{getDisplayNameForFile(file)}</span>
                {spaceDetails}
            </button>
        </div>
    );
}

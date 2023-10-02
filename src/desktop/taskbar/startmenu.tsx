import { File, getFilesInPath, myComputerShortcut, openFile } from "~/os/filesystem";
import { getDisplayNameForFile, getIconForFile } from "../fileicon/fileicon";
import "./startmenu.css";
import duckImageUrl from "~/images/duck.png";
import { RefObject } from "preact";

interface StartMenuItemProps {
    file: File;
}
function StartMenuItem({ file }: StartMenuItemProps) {
    return (
        <button class="startMenuItem" onClick={() => openFile(file)}>
            <img src={getIconForFile(file)} />
            <span class="startMenuItemLabel">{getDisplayNameForFile(file)}</span>
        </button>
    );
}

interface StartMenuProps {
    menuRef: RefObject<HTMLDivElement>;
}
export function StartMenu({ menuRef }: StartMenuProps) {
    return (
        <div class="startMenu" ref={menuRef}>
            <div class="startMenuContents">
                <header>
                    <img src={duckImageUrl} />
                    <span class="startMenuUsername">User</span>
                </header>
                <section class="startMenuItems">
                    <hr class="startMenuHighlightHR" />
                    <div class="startMenuLeft">
                        {getFilesInPath("C:/StartMenu").map((file) => (
                            <StartMenuItem key={file.filename} file={file} />
                        ))}
                    </div>
                    <div class="startMenuRight">
                        <StartMenuItem file={myComputerShortcut} />
                    </div>
                </section>
                <footer></footer>
            </div>
        </div>
    );
}

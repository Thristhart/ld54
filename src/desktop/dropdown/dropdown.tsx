import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";
import { useEffect, useReducer } from "react";
import "./dropdown.css";

interface SubmenuDescription {
    [name: string]: {
        disabled?: boolean;
        onClick?: () => void;
    };
}
export interface MenuDescription {
    [name: string]: SubmenuDescription;
}

interface SubmenuProps {
    readonly submenu: SubmenuDescription;
}
function Submenu({ submenu }: SubmenuProps) {
    return (
        <ul class={"submenu"}>
            {Object.entries(submenu).map(([name, details]) => (
                <li key={name} class="submenuEntry">
                    <button onClick={details.onClick} disabled={details.disabled}>
                        {name}
                    </button>
                </li>
            ))}
        </ul>
    );
}

interface DropdownItemProps extends JSXInternal.HTMLAttributes<HTMLButtonElement> {
    readonly name: string;
}
function DropdownItem({ name, ...buttonProps }: DropdownItemProps) {
    return (
        <button className="dropdownItemButton" {...buttonProps}>
            {name}
        </button>
    );
}

interface DropdownProps {
    readonly menu: MenuDescription;
}
export function Dropdown({ menu }: DropdownProps) {
    const hoveredMenu = useSignal<string | undefined>(undefined);
    const isOpen = useSignal(false);
    const containerRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
        function onMouseup(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) {
                isOpen.value = false;
            }
        }
        window.addEventListener("mouseup", onMouseup);
        return () => {
            window.removeEventListener("mouseup", onMouseup);
        };
    }, []);
    return (
        <ul className="dropdownMenu" ref={containerRef}>
            {Object.entries(menu).map(([name, submenu]) => (
                <li className="dropdownItem">
                    <DropdownItem
                        key={name}
                        name={name}
                        onPointerEnter={() => (hoveredMenu.value = name)}
                        onPointerDown={() => (isOpen.value = true)}
                    />
                    {isOpen.value && hoveredMenu.value === name && <Submenu submenu={submenu} />}
                </li>
            ))}
        </ul>
    );
}

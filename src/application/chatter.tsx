import { ProcessDescription, getOrCreateProcess } from "~/os/processes";
import { focusWindow, openWindowForProcess } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";
import "./chatter.css";

type Message = {
    timestamp: Date;
    username: string;
    message: preact.JSX.Element | string;
};

type ChatterState = Array<Message>;

interface ChatterWindowProps {
    process: Process<ChatterState>;
}

function ChatterWindow({ process }: ChatterWindowProps) {
    const chat: Array<preact.JSX.Element> = [];
    process.state.value.forEach((element) => {
        chat.push(
            <span class="timestamp">
                {element.timestamp.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} |
            </span>
        );
        chat.push(
            <span class="username" data-value={element.username}>
                {element.username}:{" "}
            </span>
        );
        chat.push(<span class="chatline">{element.message}</span>);
        chat.push(<br />);
    });
    return (
        <div class="chatWindow">
            <div class="chatBody">{chat}</div>
            <div class="chatBottom">
                <div class="textbox"></div>
                <div class="sendButton">Send</div>
            </div>
        </div>
    );
}

export const chatterDescription: ProcessDescription<ChatterState> = {
    initialState: [],
    name: "chatter.exe",
    onOpen: (process) => {
        openWindowForProcess(
            process,
            {
                contentComponent: ChatterWindow,
                iconUrl,
                initialTitle: "Chatter",
                minWidth: 490,
                minHeight: 320,
            },
            undefined,
            { width: 490, height: 320 }
        );
    },
};

export function addMessage(message: Omit<Message, "timestamp">) {
    const process = getOrCreateProcess(chatterDescription);
    process.state.value = [...process.state.value, { ...message, timestamp: new Date() }];
    const window = Object.values(process.windows)[0];
    if (window) {
        focusWindow(window.windowId);
    } else {
        openWindowForProcess(
            process,
            {
                contentComponent: ChatterWindow,
                iconUrl,
                initialTitle: "Chatter",
                minWidth: 490,
                minHeight: 320,
            },
            undefined,
            { width: 490, height: 320 }
        );
    }
}

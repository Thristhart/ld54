import { ProcessDescription } from "~/os/processes";
import { openWindowForProcess } from "~/os/windows";
import type { Process } from "./process";
import iconUrl from "~/images/icons/favicons/joystick.png";
import "./chatter.css";
import { options } from "preact";

type Message = {
    timestamp: Date,
    username: string,
    message: string,
}

type ChatterState = Array<Message>;

interface ChatterWindowProps {
    process: Process<ChatterState>;
}
function ChatterWindow({ process }: ChatterWindowProps) {
    var chat: Array<preact.JSX.Element> = [] ;
    process.state.value.forEach(element => {
        chat.push(<span class="timestamp">{element.timestamp.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})} |</span>)
        chat.push(<span class="username" data-value={element.username}>{element.username}: </span>)
        chat.push(<span class="chatline">{element.message}</span>);
        chat.push(<br />);
    })
    return <div class="chatWindow">
        <div class="chatBody">{chat}</div>
        <div class="chatBottom">
            <div class="textbox"></div><div class="sendButton">Send</div>
        </div>
    </div>
}

export const chatterDescription: ProcessDescription<ChatterState> = {
    initialState: [
        {
            timestamp: new Date(Date.now()),
            username: "Test User",
            message: "Hello, World!"
        },
        {
            timestamp: new Date(Date.now()),
            username: "Test User",
            message: "Second Beat."
        },
        {
            timestamp: new Date(Date.now()),
            username: "Test User",
            message: "Profit!"
        },
    ],
    name: "chatter.exe",
    onOpen: (process) => {
        openWindowForProcess(process, {
            contentComponent: ChatterWindow,
            iconUrl,
            initialTitle: "Chatter",
        });
    },
};

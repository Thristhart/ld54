import EventEmitter from "eventemitter3";
import { AddCassieDialog } from "./application/cassie/cassie";
import { addMessage } from "./application/chatter";
import { openBrowserToUrl } from "./application/browser/browser";

export const eventEmitter = new EventEmitter();

function wait(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

async function startup() {
    await wait(3000);
    addMessage({
        username: "TheGreatTodd",
        message: "check it out",
    });
    await wait(1000);
    addMessage({
        username: "TheGreatTodd",
        message: (
            <a
                href="#"
                onClick={() => {
                    openBrowserToUrl("http://www.freewebs.com/lanfestcolumbus/");
                }}>
                http://www.freewebs.com/lanfestcolumbus/
            </a>
        ),
    });
    await wait(3000);
    addMessage({
        username: "TheGreatTodd",
        message: "I got us an official website. go get the latest version of LANPlanner from there",
    });
}

startup();

eventEmitter.once("openSteam", () => {
    AddCassieDialog({
        text: "Oh boy steam yay",
    });
});

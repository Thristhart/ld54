import EventEmitter from "eventemitter3";
import { AddCassieDialog } from "./application/cassie/cassie";
import { addMessage } from "./application/chatter";
import { openBrowserToUrl } from "./application/browser/browser";

export const eventEmitter = new EventEmitter();

setTimeout(() => {
    addMessage({
        username: "TheGreatTodd",
        message: "check it out",
    });
}, 1000);

setTimeout(() => {
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
}, 1800);

setTimeout(() => {
    addMessage({
        username: "TheGreatTodd",
        message: "I got us an official website. go get the latest version of LANPlanner from there",
    });
}, 4800);

eventEmitter.once("openSteam", () => {
    AddCassieDialog({
        text: "Oh boy steam yay",
    });
});

import EventEmitter from "eventemitter3";
import { AddCassieDialog } from "./application/cassie/cassie";

export const eventEmitter = new EventEmitter();

eventEmitter.once("openSteam", () => {
    AddCassieDialog({
        text: "Oh boy steam yay",
    });
});

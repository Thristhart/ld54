import EventEmitter from "eventemitter3";
import { AddCassieDialog } from "./application/cassie/cassie";
import { addMessage } from "./application/chatter";
import { openBrowserToUrl } from "./application/browser/browser";
import { addTodo, deleteVertigoTodo } from "./application/todo";

export const eventEmitter = new EventEmitter();

function wait(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

eventEmitter.once("login", async () => {
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
});

eventEmitter.once("csInstallTodoAdded", async () => {
    eventEmitter.once("csInstalled", async () => {
        await wait(4000);
        addMessage({
            username: "ThunDerGnome",
            message: "don't forget to delete de_vertigo, john is a monster on that map",
        });
        await wait(3000);
        addMessage({
            username: "Johnnie6",
            message: "oh come on. just check your corners",
        });
        await wait(2000);
        addMessage({
            username: "ThunDerGnome",
            message: "nope. banned. delete it",
        });

        await wait(4000);
        addTodo(deleteVertigoTodo);
        AddCassieDialog({
            text: "Sounds like de_vertigo is banned. Let's delete it from the cstrike folder in C:/Program Files/Steam/steamapps/common!",
        });
    });
});

eventEmitter.once("vertigoDeleted", async () => {
    await wait(1000);
    addMessage({
        username: "thristhart",
        message: "that's all the content. there were supposed to be puzzles around managing your disk space",
    });
    await wait(1200);
    addMessage({
        username: "thristhart",
        message: "but we ran out of time. so it goes! thanks for playing!",
    });
    AddCassieDialog({
        text: "Thanks for playing!",
    });
});

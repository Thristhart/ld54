import "./login.css";
import loginSplashUrl from "~/images/windowsld_login_splash.png";
import duckImageUrl from "~/images/duck.png";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { StartupPhase, startupPhase } from "~/app";
import { eventEmitter } from "~/events";
import calChime from "~/audio/cal_reminder.mp3";
import { Howl } from "howler";

const bootMusic = new Howl({ src: calChime, volume: 0.8 });

function WelcomeSplash() {
    useEffect(() => {
        setTimeout(() => {
            bootMusic.play();
        }, 500);
        setTimeout(() => {
            startupPhase.value = StartupPhase.Desktop;
            eventEmitter.emit("login");
        }, 3500);
    });
    return (
        <div class="login">
            <section class="loginContents">
                <span class="loginWelcome">welcome</span>
            </section>
            <footer></footer>
        </div>
    );
}

export function Login() {
    const hasLoggedIn = useSignal(false);

    if (hasLoggedIn.value) {
        return <WelcomeSplash />;
    }

    return (
        <div class="login">
            <header></header>
            <section class="loginContents">
                <div class="loginLeftSide">
                    <img class="loginSplash" src={loginSplashUrl} />
                    <span class="loginInstruction">To begin, click your user name</span>
                </div>
                <div class="loginVerticalDivider" />
                <div class="loginRightSide">
                    <button class="loginUser" onClick={() => (hasLoggedIn.value = true)}>
                        <img src={duckImageUrl} />
                        <span class="loginUsername">User</span>
                    </button>
                </div>
            </section>
            <footer></footer>
        </div>
    );
}

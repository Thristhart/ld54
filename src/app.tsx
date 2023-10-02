import { signal } from "@preact/signals";
import { Desktop } from "./desktop/desktop";
import { Startup } from "./startup/startup";
import { Login } from "./login/login";

export enum StartupPhase {
    Startup,
    Login,
    Desktop,
}
export const startupPhase = signal(StartupPhase.Startup);

export function App() {
    switch (startupPhase.value) {
        case StartupPhase.Startup:
            return <Startup />;
        case StartupPhase.Login:
            return <Login />;
        case StartupPhase.Desktop:
            return <Desktop />;
    }
}

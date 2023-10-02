import { cassieInstallerFile } from "~/application/cassie/cassie_installer";
import { BrowserWindowProps, openBrowserDownloadWindow } from "../browser";
import "./lanplanner.css";

export function LanPlannerWebsite({ process, window }: BrowserWindowProps) {
    return (
        <div class="website lanfest">
            <h1>LANFest Columbus 2003</h1>
            <p>Get ready for the coolest LAN party in Ohio!</p>
            <p>
                LANPlanner is a wizard I wrote to help you get everything you need to be ready for pure frags in
                Columbus.
            </p>
            <button onClick={() => openBrowserDownloadWindow(process, cassieInstallerFile)}>
                Download LANPlanner now!
            </button>
        </div>
    );
}

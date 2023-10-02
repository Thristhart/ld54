import splashImageUrl from "~/images/windowsld_splash.png";
import "./startup.css";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { StartupPhase, startupPhase } from "~/app";

async function PreloadImage(imageUrlPromise: Promise<typeof import("*.png")>) {
    const img = new Image();
    img.src = (await imageUrlPromise).default;
}

PreloadImage(import("~/images/installer_sidebar.png"));
PreloadImage(import("~/images/windowsld_login_splash.png"));
PreloadImage(import("~/images/blisslike.jpg"));

export function Startup() {
    const phaseDuration = 2000;

    const barPosition = useSignal(0);

    // shrug emoji
    const barsThatFit = 19;

    useEffect(() => {
        let accumulatedTime = 0;
        let lastTick = performance.now();
        function tick(timestamp: number) {
            const dt = timestamp - lastTick;
            lastTick = timestamp;

            accumulatedTime += dt;
            let progress = accumulatedTime / phaseDuration;
            animFrameHandle = requestAnimationFrame(tick);
            barPosition.value = (Math.round(progress * barsThatFit) % barsThatFit) - 3;
        }

        setTimeout(() => {
            startupPhase.value = StartupPhase.Login;
        }, 5000);

        let animFrameHandle = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(animFrameHandle);
        };
    }, []);

    return (
        <div className="startup">
            <img className="splashimage" src={splashImageUrl} />
            <div class="startupProgress">
                {Array.from({ length: 3 }, (_, index) => (
                    <div
                        class="startupProgressBlock"
                        key={index}
                        style={{ transform: `translateX(${barPosition.value * 8}px)` }}
                    />
                ))}
            </div>
        </div>
    );
}

import { Signal } from "@preact/signals";
import { File } from "~/os/filesystem";

export function calculateCumulativeFileSize(files: File[] | Signal<File>[]){
    let fullSize = 0;
    files.forEach(file => {
        if(isSignal(file)){
            fullSize += file.value.filesize;
        }
        else{
            fullSize += file.filesize;
        }
    });
    return fullSize;
}

function isSignal(maybeSignal: Signal | File): maybeSignal is Signal
{
  return "value" in maybeSignal;
}
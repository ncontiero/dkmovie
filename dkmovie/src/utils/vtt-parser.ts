export interface VTTCue {
  start: number;
  end: number;
  text: string;
}

function timeToSeconds(timeStr: string) {
  const parts = timeStr.split(":");
  let seconds = 0;
  if (parts.length === 3) {
    seconds += Number.parseInt(parts[0], 10) * 3600;
    seconds += Number.parseInt(parts[1], 10) * 60;
    seconds += Number.parseFloat(parts[2].replace(",", "."));
  } else if (parts.length === 2) {
    seconds += Number.parseInt(parts[0], 10) * 60;
    seconds += Number.parseFloat(parts[1].replace(",", "."));
  }
  return seconds;
}

const newlineRegex = /\r?\n/;

export function parseVTT(vttText: string): VTTCue[] {
  const cues: VTTCue[] = [];
  const lines = vttText.split(newlineRegex);

  let currentCue: Partial<VTTCue> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes("-->")) {
      const [startStr, endStr] = trimmedLine.split("-->").map((s) => s.trim());
      currentCue = {
        start: timeToSeconds(startStr),
        end: timeToSeconds(endStr),
        text: "",
      };
    } else if (currentCue && trimmedLine) {
      currentCue.text =
        (currentCue.text ? `${currentCue.text}\n` : "") + trimmedLine;
    } else if (!trimmedLine && currentCue) {
      cues.push(currentCue as VTTCue);
      currentCue = null;
    }
  }
  if (currentCue) cues.push(currentCue as VTTCue);

  return cues;
}

export interface VTTCue {
  start: number;
  end: number;
  text: string;
}

export function parseVTT(vttText: string): VTTCue[] {
  const cues: VTTCue[] = [];
  const lines = vttText.split(/\r?\n/);

  let currentCue: Partial<VTTCue> | null = null;

  const timeToSeconds = (timeStr: string) => {
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
  };

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
      // Ignore identifier lines (simple numbers) if they appear before timing
      // But typically VTT puts identifier BEFORE timing.
      // Here we assume identifier is handled or ignored.
      // If the line is just a number and we just started a cue, it might be an identifier for the NEXT cue if logic is loose.
      // But strict VTT has: ID \n TIME \n TEXT.
      // My logic handles TIME \n TEXT. ID is skipped by the `else if (!line)` reset.
      // If ID is inside the cue text block, it's text.
      // Let's assume standard VTT.
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

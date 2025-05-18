from __future__ import annotations

import concurrent.futures as cf
import logging
import math
import os
import subprocess
import tempfile
from pathlib import Path
from typing import List, Tuple

import backoff
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm

load_dotenv()
log = logging.getLogger(__name__)

MAX_WORKERS = 4
MAX_RETRIES = 3

def _process_chunk(args):
    """Run in a separate process: extract wav, call Whisper, return (idx, text, segs)."""
    idx, start, dur, src_path, chunk_sec = args

    import tempfile, subprocess, os
    from pathlib import Path
    from openai import OpenAI
    import backoff

    def _extract_wav(src, s, d, dst):
        subprocess.check_call(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-ss", str(s), "-t", str(d), "-i", src,
             "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", dst])

    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def _whisper(wav):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        with open(wav, "rb") as f:
            return client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as t:
        wav = t.name
    try:
        _extract_wav(src_path, start, dur, wav)
        resp = _whisper(wav)
        segments = [
            {"start": start + s.start, "end": start + s.end, "text": s.text}
            for s in resp.segments
        ]
        return idx, resp.text, segments
    finally:
        Path(wav).unlink(missing_ok=True)


def _video_duration(path: str) -> float:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path]
    out = subprocess.check_output(cmd, text=True)
    return float(out.strip())


def _extract_wav(src: str, start: float, dur: float, dst: str) -> None:
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(start), "-t", str(dur), "-i", src,
           "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", dst]
    subprocess.check_call(cmd)


@backoff.on_exception(backoff.expo, Exception, max_tries=MAX_RETRIES)
def _whisper(wav: str):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    with open(wav, "rb") as f:
        return client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )


def transcribe_video(path: str, chunk_sec: int = 600) -> Tuple[str, List[dict]]:
    dur = _video_duration(path)
    jobs = math.ceil(dur / chunk_sec)
    log.info("%.1fs video -> %d chunks", dur, jobs)

    def work(i):
        start = i * chunk_sec
        length = min(chunk_sec, dur - start)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as t:
            wav = t.name
        try:
            _extract_wav(path, start, length, wav)
            resp = _whisper(wav)
            segments = [{"start": start + s.start, "end": start + s.end, "text": s.text} for s in resp.segments]
            return i, resp.text, segments
        finally:
            Path(wav).unlink(missing_ok=True)

    results: List[Tuple[int, str, List[dict]]] = []

    with cf.ProcessPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs = [
            ex.submit(_process_chunk, (i, i * chunk_sec,
                                       min(chunk_sec, dur - i * chunk_sec),
                                       path, chunk_sec))
            for i in range(jobs)
        ]
        for fut in tqdm(cf.as_completed(futs), total=jobs, desc="chunks"):
            results.append(fut.result())

    results.sort(key=lambda t: t[0])
    full = " ".join(txt for _, txt, _ in results)
    segs = [s for _, _, ss in results for s in ss]
    segs.sort(key=lambda s: s["start"])
    return full.strip(), segs
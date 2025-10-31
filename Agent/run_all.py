import asyncio
import signal
import sys
from pathlib import Path


AGENT_FILES = [
    "genrator.py",                 # Resume generator
    "resume-analyzer-agent.py",    # Resume analyzer
    "roadmap.py",                  # Roadmap generator
    "interviewer-agent.py",        # AI interviewer
]


async def stream_output(prefix: str, stream: asyncio.StreamReader):
    while True:
        line = await stream.readline()
        if not line:
            break
        try:
            text = line.decode(errors="ignore").rstrip()
        except Exception:
            text = str(line).rstrip()
        print(f"[{prefix}] {text}")


async def start_agent(script_path: Path):
    proc = await asyncio.create_subprocess_exec(
        sys.executable,
        str(script_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    prefix = script_path.stem
    stream_task = asyncio.create_task(stream_output(prefix, proc.stdout))  # type: ignore[arg-type]
    return proc, stream_task


async def main():
    agent_dir = Path(__file__).parent
    scripts = [agent_dir / name for name in AGENT_FILES]

    print("Starting agents:")
    for s in scripts:
        print(f" - {s.name}")

    processes = []
    stream_tasks = []
    try:
        for script in scripts:
            proc, stask = await start_agent(script)
            processes.append(proc)
            stream_tasks.append(stask)

        # Handle Ctrl+C for graceful shutdown
        stop_event = asyncio.Event()

        def _handle_sigint():
            stop_event.set()

        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                loop.add_signal_handler(sig, _handle_sigint)
            except NotImplementedError:
                # Windows
                pass

        await stop_event.wait()
    finally:
        print("\nStopping agents...")
        for p in processes:
            if p.returncode is None:
                p.terminate()
        # Give them a moment to exit
        try:
            await asyncio.wait_for(asyncio.gather(*(p.wait() for p in processes)), timeout=5)
        except asyncio.TimeoutError:
            for p in processes:
                if p.returncode is None:
                    p.kill()
        for t in stream_tasks:
            t.cancel()
        # Drain cancellations
        with contextlib.suppress(Exception):
            await asyncio.gather(*stream_tasks)


if __name__ == "__main__":
    import contextlib
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass


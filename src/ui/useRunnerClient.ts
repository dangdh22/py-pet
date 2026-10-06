import { useEffect, useMemo, useState } from "react";
import type { RunnerClient, RunnerStatus } from "../runner/client";
import type { RunnerApi } from "./contexts";

export function useRunnerClient(client: RunnerClient): RunnerApi {
  const [status, setStatus] = useState<RunnerStatus>(client.status);
  useEffect(() => client.subscribe(setStatus), [client]);
  return useMemo(
    () => ({
      status,
      run: (code: string, stdin: string, timeoutMs?: number) => client.run(code, stdin, timeoutMs),
      retry: () => client.retry(),
    }),
    [client, status],
  );
}

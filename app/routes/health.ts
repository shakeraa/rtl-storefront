import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { getHealthCheck } from "../services/system/health";

export async function loader({ request }: LoaderFunctionArgs) {
  const result = await getHealthCheck();

  return json(result, {
    status: result.status === "ok" ? 200 : 503,
    headers: {
      "cache-control": "no-store",
    },
  });
}

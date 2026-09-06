// Deliberately does no work: a container healthcheck should say whether the
// server can serve, not re-run a page's data fetching every 30 seconds.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" });
}

// Search API - disabled for static export
// For static sites, consider using client-side search with lunr.js or similar

export const dynamic = "force-static";

export async function GET() {
  return Response.json({ message: "Search is disabled in static export mode" });
}

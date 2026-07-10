import { pinchingHandIcon } from "@/app/lib/pinching-hand-icon";

export const dynamic = "force-static";

export async function GET() {
  return pinchingHandIcon("#ffffff");
}

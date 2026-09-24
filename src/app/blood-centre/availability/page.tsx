import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

// The availability table now lives on the dashboard; keep this route working
// for any old links / bookmarks by sending them there.
export default function AvailabilityPage() {
  redirect(routes.bloodCentreDashboard);
}

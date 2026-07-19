import AdminApp from "@/components/admin/AdminApp";

// Client-rendered dashboard inside the static export. All data comes from the
// Worker API at /api/admin/* behind the session cookie; nothing here is
// baked in at build time.
export default function AdminPage() {
  return <AdminApp />;
}

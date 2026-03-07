import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { listUsers } from "@/lib/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "./AdminUserActions";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const users = await listUsers();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">Back to Admin</Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">View and moderate user accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>Ban or unban accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <span className="font-medium">{u.display_name ?? u.id.slice(0, 8)}</span>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="ml-2">{u.role}</Badge>
                  {u.is_banned && <Badge variant="destructive" className="ml-2">Banned</Badge>}
                  <p className="text-xs text-muted-foreground mt-1">{u.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                </div>
                <AdminUserActions userId={u.id} isBanned={u.is_banned} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

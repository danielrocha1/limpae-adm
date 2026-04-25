import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../hooks/useUsers";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { formatFieldValue, getUserName, getUserRole, getValue, profileSchemaForRole, userSchema } from "../lib/schema";

export default function UserDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading } = useUser(id);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-40" /><Skeleton className="h-96 w-full" /></div>;
  }

  const role = getUserRole(user);
  const profileSchema = profileSchemaForRole(role);
  const profile = role === "diarista" ? getValue(user, "DiaristProfile") : getValue(user, "UserProfile");

  return (
    <div className="space-y-6">
      <Link
        to={role === "diarista" ? "/diaristas" : "/clientes"}
        className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg bg-primary/10 text-xl font-bold text-primary">
          {getValue(user, "Photo") ? <img src={getValue(user, "Photo")} alt="" className="h-full w-full object-cover" /> : getUserName(user).slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{getUserName(user)}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{role || "sem role"}</Badge>
            <span className="text-sm text-muted-foreground">ID #{id}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campos do model User</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(userSchema?.fields || []).filter((field) => !field.isRelation && !field.sensitive).map((field) => (
            <div key={field.name} className="rounded-md border p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{field.name}</p>
              <p className="mt-1 break-words text-sm">{formatFieldValue(getValue(user, field.name), field)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {profileSchema && (
        <Card>
          <CardHeader>
            <CardTitle>{profileSchema.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profileSchema.fields.filter((field) => !field.isRelation).map((field) => (
              <div key={field.name} className="rounded-md border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{field.name}</p>
                <p className="mt-1 break-words text-sm">{formatFieldValue(getValue(profile, field.name), field)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

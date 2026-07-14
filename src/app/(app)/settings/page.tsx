import { AppHeader } from "@/components/layout/app-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <>
      <AppHeader title="Settings" />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8 md:px-8">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Account</CardTitle>
            <CardDescription>
              Authentication and profile settings will land in the next feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Planned: Google login, email login, display name, and avatar via
            Supabase Auth.
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Preferences</CardTitle>
            <CardDescription>
              Currency, default status, and notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming after core product and collection flows are solid.
          </CardContent>
        </Card>
      </main>
    </>
  );
}


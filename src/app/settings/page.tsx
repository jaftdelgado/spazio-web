import { redirect } from "next/navigation";

export default async function SettingsIndexPage(props: PageProps<"/settings">) {
  const searchParams = await props.searchParams;
  const from = searchParams.from;
  if (from === "admin" || from === "explore") {
    redirect(`/settings/account?from=${from}`);
  }
  redirect("/settings/account");
}

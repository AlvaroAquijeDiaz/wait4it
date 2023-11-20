import { CompletedProfile } from "@/components/people/completed-profile";
import { UncompletedProfile } from "@/components/people/uncompleted-profile";
import { Spinner } from "@/components/ui/spinner";
import { getFullUser } from "@/lib/auth/utils";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Search for friends",
  },
};

export default async function FriendshipsPage({
  searchParams,
}: {
  searchParams?: { verified: boolean; q: string };
}) {
  const data = await getFullUser();

  if (!data) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="flex flex-col gap-4">
      <header className="sticky inset-0 w-full border-b bg-background/30 px-4 py-2 backdrop-blur backdrop-filter sm:py-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Search</h1>
      </header>

      <div className="flex h-full flex-col gap-4 px-4">
        <Suspense
          fallback={
            <section className="flex h-full w-full items-center justify-center gap-2">
              <Spinner />
            </section>
          }
        >
          {!data.username && !searchParams?.verified ? (
            <UncompletedProfile />
          ) : (
            <CompletedProfile user={data} />
          )}
        </Suspense>
      </div>
    </main>
  );
}

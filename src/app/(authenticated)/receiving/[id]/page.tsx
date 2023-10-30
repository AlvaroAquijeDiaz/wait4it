import { ErrorState } from "@/components/secrets/ErrorState";
import {
  SecretAvailable,
  SecretIsNotRevealedYet,
} from "@/components/secrets/ReceivingSecretDetails";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSecretByIdForReceiver } from "@/lib/api/secrets/queries";
import { Info, X } from "lucide-react";
import Link from "next/link";

export default async function ReceiveSecretByIdPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { secret, error } = await getSecretByIdForReceiver(Number(id));

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main className="flex flex-col gap-4">
      <section className="sticky inset-0 z-10 flex flex-col gap-2 border-b bg-background/20 px-4 py-2 backdrop-blur backdrop-filter">
        <header className="flex w-full items-center justify-between gap-4">
          <h1 className="flex items-center gap-3 text-2xl font-bold capitalize tracking-tight">
            <span>{secret.title}</span>
            <span className="w-max rounded-full border border-indigo-600 bg-indigo-950 px-3 py-1 text-xs font-light text-indigo-400">
              {secret.encryptionType}
            </span>
          </h1>

          <Link href="/receiving" className="focus-within:outline-none">
            <Button variant="ghost" size="icon">
              <X size={20} className="text-muted-foreground" />
            </Button>
          </Link>
        </header>
      </section>

      <div className="flex items-center gap-1 px-4 text-sm">
        <p>From {secret.creator.username}</p>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <Info size={16} className="text-blue-500" />
            </TooltipTrigger>

            <TooltipContent className="capitalize">{secret.creator.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {secret.revealed ? (
        <SecretAvailable secret={secret} />
      ) : (
        <SecretIsNotRevealedYet secret={secret} />
      )}
    </main>
  );
}

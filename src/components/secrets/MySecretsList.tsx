import { Secret } from "@/lib/db/schema";
import { env } from "@/lib/env.mjs";
import cryptoJS from "crypto-js";
import { ArrowRight } from "lucide-react";
import { SecretModal } from "./SecretModal";

export const MySecretsList = async ({ secrets }: { secrets: Secret[] }) => {
  if (secrets.length === 0) {
    return <EmptySecretState />;
  }

  return (
    <section>
      <SecretModal />

      <ul className="flex flex-col gap-4">
        {secrets.map((secret) => (
          <li key={secret.id}>
            <SecretCard secret={secret} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export const EmptySecretState = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border p-4 text-sm text-slate-500">
      <p>You have no secrets yet.</p>
      <SecretModal emptyState />
    </div>
  );
};

const SecretCard = ({ secret }: { secret: Secret }) => {
  const hashed = cryptoJS.AES.encrypt(secret.content, env.NEXTAUTH_SECRET!).toString();

  return (
    <article className="flex items-start justify-between gap-2 rounded-lg border p-3 sm:p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">{secret.title}</h3>
        <p className="text-sm text-slate-500">
          {secret.content} <ArrowRight size={16} />
        </p>
        <p className="max-w-[25ch] whitespace-pre-line break-words text-sm text-slate-500">
          {hashed}
        </p>
      </div>

      <SecretModal secret={secret} />
    </article>
  );
};
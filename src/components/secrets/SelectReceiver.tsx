import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FullUser, NewSecretParams } from "@/lib/db/schema";
import { useReceiverDataStore } from "@/lib/hooks/useReceiverDataStore";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { AlertOctagon, CheckIcon, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RequiredLabel } from "../ui/required-label";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const SelectReceiver = ({ isEditing }: { isEditing: boolean }) => {
  const form = useFormContext<NewSecretParams>();
  const searchParams = useSearchParams();

  const bypass = searchParams.get("bypass");
  const sendingUsername = searchParams.get("sendingUsername");
  const sendingId = searchParams.get("sendingId");

  const { data, isLoading } = trpc.friendships.getAcceptedFriends.useQuery();
  const { data: bypassUsername } = trpc.user.getSafeUserById.useQuery(sendingId || "", {
    enabled: !!sendingId && !!bypass,
  });

  const receiverDisplayName = useCallback(
    (value: string) => {
      if (!data) return;

      if (!data.people?.length || !value) return "Select someone";

      const isUserSource = data.people.find((p) => data.viewer.id === p.source.id);

      if (isUserSource) {
        return data.people.find((p) => p.friends.id === value)?.friends.name;
      }

      return data.people.find((p) => p.source.id === value)?.source.name;
    },
    [data],
  );

  if (isLoading) return <Spinner />;

  if (!!bypass) {
    return (
      <FormItem>
        <FormLabel>
          Receiver <RequiredLabel />
        </FormLabel>

        {sendingId ? (
          <Button variant="outline" className="justify-start gap-4" disabled>
            {bypassUsername?.image && (
              <Image
                className="rounded-full"
                src={bypassUsername?.image}
                alt={bypassUsername?.name || "Profile pic"}
                width={22}
                height={22}
              />
            )}

            <span>{sendingUsername}</span>
            <span className="font-normal">{bypassUsername?.name}</span>
          </Button>
        ) : (
          <FormDescription className="text-destructive">
            Looks like the URL someone shared to you is missing their user_id, please
            request it again.
          </FormDescription>
        )}
      </FormItem>
    );
  }

  if (!data?.people.length) {
    return (
      <FormItem>
        <FormLabel>
          Receiver <RequiredLabel />
        </FormLabel>

        <FormDescription>
          <span>
            You don&apos;t have anyone to send this secret to. Don&apos;t worry, it&apos;s
            easy to find & add friends, just visit the{" "}
            <Link href="/search">
              <Button variant="link" className="p-0">
                Search Page.
              </Button>
            </Link>
          </span>
        </FormDescription>
      </FormItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name="receiverId"
      render={({ field }) => (
        <FormItem>
          <TooltipProvider delayDuration={0}>
            <FormLabel>
              Receiver
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertOctagon className="text-yellow-500" size={16} />
                </TooltipTrigger>

                <TooltipContent className="font-normal">
                  <span className="text-yellow-500">Watch out,</span> you cannot change
                  the receiver after creation!
                </TooltipContent>
              </Tooltip>
            </FormLabel>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={isEditing}
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between gap-2 bg-popover",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {receiverDisplayName(field.value)}

                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="z-30 p-0">
              <Command className="bg-transparent">
                <CommandInput
                  placeholder="Search friend..."
                  className="h-9 bg-transparent"
                />
                <CommandEmpty>No friend found.</CommandEmpty>

                <CommandGroup>
                  {data.people.map((p) => (
                    <ReceiverItem
                      key={data.viewer.id === p.sourceId ? p.friends.id : p.source.id}
                      friend={data.viewer.id === p.sourceId ? p.friends : p.source}
                    />
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <FormDescription>
            The person you&apos;re making this secret for, he or she will get a
            notification right after it&apos;s created.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const ReceiverItem = ({ friend }: { friend: FullUser }) => {
  const form = useFormContext();
  const syncReceiver = useReceiverDataStore((s) => s.setReceiverData);

  return (
    <CommandItem
      value={friend.id}
      key={friend.id}
      onSelect={() => {
        form.setValue("receiverId", friend.id, {
          shouldValidate: true,
        });

        syncReceiver({
          storedReceiver: {
            ...friend,
            username: friend.username || "",
          },
        });
      }}
    >
      {friend.name}
      <CheckIcon
        className={cn(
          "ml-auto h-4 w-4",
          friend.id === form.getValues("receiverId") ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
};

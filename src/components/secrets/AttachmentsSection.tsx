import { SecretByIdResponse } from "@/lib/api/secrets/queries";
import { NewSecretParams } from "@/lib/db/schema";
import { useDisableSubmit } from "@/lib/hooks/useDisableSubmit";
import { UploadDropzone } from "@/lib/uploadthing/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AlertOctagon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { FormLabel } from "../ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const AttachmentsSection = ({
  editing,
  secret,
}: {
  editing: boolean;
  secret?: SecretByIdResponse["secret"];
}) => {
  const form = useFormContext<NewSecretParams>();
  const previewAttachments = form.watch("attachments");

  const [parent] = useAutoAnimate();
  const setDisableButton = useDisableSubmit((s) => s.change);

  return (
    <div className="flex flex-col gap-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <FormLabel>
            Attachments
            <TooltipTrigger asChild>
              <AlertOctagon size={16} className="text-yellow-500" />
            </TooltipTrigger>
          </FormLabel>

          <TooltipContent>
            Careful, you <span className="text-yellow-500">cannot</span> edit this after
            creation!
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center gap-4 overflow-x-scroll rounded-lg" ref={parent}>
        {secret?.attachments.length === 0 && (
          <span className="text-sm text-muted-foreground">
            No attachments included 👀
          </span>
        )}

        {previewAttachments?.map((s) => (
          <Link href={s} key={s} passHref rel="noopener noreferrer">
            <Image
              src={s}
              width={200}
              height={200}
              blurDataURL={"data:image/png;base64"}
              placeholder="blur"
              className="min-h-max w-auto min-w-[200px] rounded-lg transition-all hover:opacity-90"
              alt={`Attachment`}
            />
          </Link>
        ))}

        {!editing && (
          <UploadDropzone
            className="max-w-[288px] border-2 border-border ut-button:text-sm ut-label:font-semibold"
            endpoint="secretsAttachmentsUploader"
            onUploadBegin={() => {
              setDisableButton(true);
            }}
            onClientUploadComplete={(res) => {
              setDisableButton(false);

              if (!res) return;

              form.setValue("attachments", [
                ...(previewAttachments || []),
                ...res.map((f) => f.url),
              ]);
            }}
            onUploadError={(error) => {
              setDisableButton(false);
              toast.error(error.message, {
                description: "There was an error on our side. Please try again",
              });
            }}
            config={{
              appendOnPaste: true,
              mode: "auto",
            }}
          />
        )}
      </div>
    </div>
  );
};

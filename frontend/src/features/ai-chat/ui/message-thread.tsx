import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Check,
  ExternalLink,
  Globe,
  Loader2,
  PackageSearch,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useStickToBottom } from "use-stick-to-bottom";
import type { CatalogSearchSourceDto } from "@capsule/common";
import { cn } from "@/lib/utils";
import type { ChatMessage, ToolActivity } from "../model/use-ai-chat";
import { useSaveToWardrobeMutation } from "../model/use-save-to-wardrobe-mutation";
import { useSaveWildberriesItemMutation } from "../model/use-save-wildberries-item-mutation";
import { useConfirmCapsuleProposal } from "../model/use-confirm-capsule-proposal";
import { AssistantAvatar } from "./assistant-avatar";

const MAX_SUGGESTIONS = 3;
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-primary"
          style={{ opacity: 1 - index * 0.3 }}
        />
      ))}
    </div>
  );
}

function cleanMessageText(text: string) {
  return text.replace(MARKDOWN_IMAGE_REGEX, "").trim();
}

function getToolActivityLabel(activity: ToolActivity): string {
  if (activity.done) {
    switch (activity.tool) {
      case "search_wildberries":
        if (activity.source === "cache") return "Нашёл";

        if (activity.source === "wildberries") return "Нашёл на Wildberries";

        if (activity.source === "cache_fallback")
          return "Wildberries недоступен, показал похожее из сохранённого";

        return "Поиск завершён";
      case "show_wardrobe_items":
        return "Подобрал вещи из гардероба";
      case "create_capsule":
        return "Капсула готова";
      default:
        return "Готово";
    }
  }

  switch (activity.tool) {
    case "search_wildberries": {
      const query =
        typeof activity.input?.query === "string" ? activity.input.query : null;

      return query ? `Ищу: «${query}»` : "Ищу подходящую вещь...";
    }
    case "show_wardrobe_items":
      return "Подбираю вещи из гардероба...";
    case "create_capsule":
      return "Собираю капсулу...";
    default:
      return "Думаю...";
  }
}

function ToolActivityIndicator({ activity }: { activity: ToolActivity }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {activity.done ? (
        <Check className="size-3.5 text-brand-accent-text" />
      ) : (
        <Loader2 className="size-3.5 animate-spin" />
      )}
      {getToolActivityLabel(activity)}
    </div>
  );
}

function SuggestionItems({
  suggestions,
  onAddToCapsule,
}: {
  suggestions: NonNullable<ChatMessage["suggestions"]>;
  onAddToCapsule: (clothesIds: string[]) => void;
}) {
  const items = suggestions.slice(0, MAX_SUGGESTIONS);
  const saveMutation = useSaveToWardrobeMutation();

  return (
    <div className="flex flex-col gap-2">
      {items.map((clothes) => {
        const isSaving =
          saveMutation.isPending && saveMutation.variables === clothes.id;

        return (
          <div
            key={clothes.id}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-card)]",
              "bg-background border border-border p-3"
            )}
          >
            <div className="relative size-16 rounded-[var(--radius-card)] overflow-hidden bg-muted shrink-0">
              <Image
                src={clothes.imageUrl}
                alt={clothes.brand ?? "Вещь"}
                fill
                className="object-cover"
              />
            </div>
            <span className="flex-1 min-w-0 text-sm font-medium truncate">
              {clothes.brand ?? "Без бренда"}
            </span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => saveMutation.mutate(clothes.id)}
                className={cn(
                  "rounded-[var(--radius-card)] bg-primary text-primary-foreground",
                  "text-xs font-semibold px-3 py-2 cursor-pointer disabled:opacity-50"
                )}
              >
                {isSaving ? "Сохраняю…" : "Сохранить"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  try {
                    await saveMutation.mutateAsync(clothes.id);
                    onAddToCapsule([clothes.id]);
                  } catch {
                    // onError у мутации уже показал тост об ошибке
                  }
                }}
                className={cn(
                  "rounded-[var(--radius-card)] bg-secondary text-xs font-medium",
                  "px-3 py-2 cursor-pointer disabled:opacity-50"
                )}
              >
                Создать капсулу
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => toast("Скоро можно будет попросить другой вариант")}
        className={cn(
          "self-start rounded-[var(--radius-card)] bg-secondary text-xs",
          "text-muted-foreground px-3 py-2 cursor-pointer"
        )}
      >
        Другой вариант
      </button>
    </div>
  );
}

function SearchSourceBadge({
  source,
}: {
  source: CatalogSearchSourceDto | undefined;
}) {
  if (!source) return null;

  if (source === "cache_fallback") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TriangleAlert className="size-3.5" />
        Wildberries сейчас недоступен — показал ближайшее из сохранённого
      </div>
    );
  }

  const isCache = source === "cache";

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {isCache ? (
        <PackageSearch className="size-3.5" />
      ) : (
        <Globe className="size-3.5" />
      )}
      {isCache ? "Нашёл" : "Нашёл на Wildberries"}
    </div>
  );
}

function WildberriesSuggestionItems({
  suggestions,
  onAddToCapsule,
}: {
  suggestions: NonNullable<ChatMessage["wildberriesSuggestions"]>;
  onAddToCapsule: (clothesIds: string[]) => void;
}) {
  const items = suggestions.slice(0, MAX_SUGGESTIONS);
  const saveMutation = useSaveWildberriesItemMutation();

  return (
    <div className="flex flex-col gap-2">
      <SearchSourceBadge source={items[0]?.source} />
      {items.map((item) => {
        const isSaving =
          saveMutation.isPending && saveMutation.variables === item;

        return (
          <div
            key={item.url}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-card)]",
              "bg-background border border-border p-3"
            )}
          >
            <div className="relative size-16 rounded-[var(--radius-card)] overflow-hidden bg-muted shrink-0">
              <Image
                src={item.photo}
                alt={item.brand ?? item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {item.brand ?? item.name}
              </p>
              {item.price != null && (
                <p className="text-xs text-muted-foreground">
                  {item.price.toLocaleString("ru-RU")} ₽
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Открыть на Wildberries"
                className={cn(
                  "rounded-[var(--radius-card)] bg-secondary text-muted-foreground",
                  "p-2 cursor-pointer inline-flex"
                )}
              >
                <ExternalLink className="size-4" />
              </a>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => saveMutation.mutate(item)}
                className={cn(
                  "rounded-[var(--radius-card)] bg-primary text-primary-foreground",
                  "text-xs font-semibold px-3 py-2 cursor-pointer disabled:opacity-50"
                )}
              >
                {isSaving ? "Сохраняю…" : "Сохранить"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  try {
                    const created = await saveMutation.mutateAsync(item);
                    onAddToCapsule([created.id]);
                  } catch {
                    // onError у мутации уже показал тост об ошибке
                  }
                }}
                className={cn(
                  "rounded-[var(--radius-card)] bg-secondary text-xs font-medium",
                  "px-3 py-2 cursor-pointer disabled:opacity-50"
                )}
              >
                Создать капсулу
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CapsuleConceptCards({
  concepts,
  onSelect,
}: {
  concepts: NonNullable<ChatMessage["capsuleConcepts"]>;
  onSelect: (description: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {concepts.map((concept, index) => (
        <button
          key={`${concept.title}-${index}`}
          type="button"
          onClick={() => onSelect(concept.description)}
          className={cn(
            "text-left rounded-[var(--radius-card)] bg-background border border-border p-3",
            "hover:border-primary cursor-pointer transition-colors"
          )}
        >
          <p className="text-sm font-medium">{concept.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {concept.description}
          </p>
        </button>
      ))}
    </div>
  );
}

function CapsuleProposalCard({
  proposal,
}: {
  proposal: NonNullable<ChatMessage["capsuleProposal"]>;
}) {
  const { confirm, isConfirming } = useConfirmCapsuleProposal();

  return (
    <div className="flex flex-col gap-2">
      {proposal.items.map((item) => (
        <div
          key={item.url}
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-card)]",
            "bg-background border border-border p-3"
          )}
        >
          <div className="relative size-16 rounded-[var(--radius-card)] overflow-hidden bg-muted shrink-0">
            <Image
              src={item.photo}
              alt={item.brand ?? item.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {item.brand ?? item.name}
            </p>
            {item.price != null && (
              <p className="text-xs text-muted-foreground">
                {item.price.toLocaleString("ru-RU")} ₽
              </p>
            )}
          </div>
        </div>
      ))}
      {proposal.unmatchedDescriptions?.length ? (
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <TriangleAlert className="size-3.5 shrink-0 mt-0.5" />
          Не нашёл: {proposal.unmatchedDescriptions.join(", ")}
        </div>
      ) : null}
      <button
        type="button"
        disabled={isConfirming}
        onClick={() => confirm(proposal)}
        className={cn(
          "self-start rounded-[var(--radius-card)] bg-primary text-primary-foreground",
          "text-xs font-semibold px-3 py-2 cursor-pointer disabled:opacity-50"
        )}
      >
        {isConfirming ? "Собираю капсулу…" : "Собрать капсулу"}
      </button>
    </div>
  );
}

function AssistantMessageBubble({
  message,
  onAddToCapsule,
  onSelectConcept,
}: {
  message: ChatMessage;
  onAddToCapsule: (clothesIds: string[]) => void;
  onSelectConcept: (description: string) => void;
}) {
  const text = cleanMessageText(message.text);
  const hasSuggestions = Boolean(message.suggestions?.length);
  const hasWildberriesSuggestions = Boolean(
    message.wildberriesSuggestions?.length
  );
  const hasCapsuleConcepts = Boolean(message.capsuleConcepts?.length);
  const hasCapsuleProposal = Boolean(message.capsuleProposal);
  const activity = message.toolActivity ?? [];
  const isWaiting = message.isStreaming && !text && activity.length === 0;

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 text-sm leading-relaxed",
        "flex flex-col gap-3 bg-card border border-border"
      )}
    >
      {isWaiting && <ThinkingDots />}
      {text && <div>{text}</div>}
      {activity.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {activity.map((item, index) => (
            <ToolActivityIndicator key={`${item.tool}-${index}`} activity={item} />
          ))}
        </div>
      )}
      {hasSuggestions && (
        <SuggestionItems
          suggestions={message.suggestions!}
          onAddToCapsule={onAddToCapsule}
        />
      )}
      {hasWildberriesSuggestions && (
        <WildberriesSuggestionItems
          suggestions={message.wildberriesSuggestions!}
          onAddToCapsule={onAddToCapsule}
        />
      )}
      {hasCapsuleConcepts && (
        <CapsuleConceptCards
          concepts={message.capsuleConcepts!}
          onSelect={onSelectConcept}
        />
      )}
      {hasCapsuleProposal && (
        <CapsuleProposalCard proposal={message.capsuleProposal!} />
      )}
    </div>
  );
}

export function MessageThread({
  messages,
  onAddToCapsule,
  onSelectConcept,
}: {
  messages: ChatMessage[];
  onAddToCapsule: (clothesIds: string[]) => void;
  onSelectConcept: (description: string) => void;
}) {
  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom({
    resize: "smooth",
    initial: "instant",
  });
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (messages.length <= prevCount) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "user") {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
      <div ref={contentRef} className="flex flex-col gap-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "items-start gap-2"
            )}
          >
            {message.role === "assistant" ? (
              <>
                <AssistantAvatar className="size-8 mt-0.5" />
                <AssistantMessageBubble
                  message={message}
                  onAddToCapsule={onAddToCapsule}
                  onSelectConcept={onSelectConcept}
                />
              </>
            ) : (
              <div
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 text-sm",
                  "leading-relaxed bg-brand-accent-soft"
                )}
              >
                {cleanMessageText(message.text)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

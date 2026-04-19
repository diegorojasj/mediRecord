import { Accordion } from "radix-ui"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type ExpandableCardListProps<T> = {
    items: T[]
    getKey: (item: T) => string
    renderRow: (item: T) => ReactNode
    renderDetail: (item: T) => ReactNode
    className?: string
}

export function ExpandableCardList<T>({
    items,
    getKey,
    renderRow,
    renderDetail,
    className,
}: ExpandableCardListProps<T>) {
    return (
        <Accordion.Root type="single" collapsible className={cn("w-full space-y-1", className)}>
            {items.map((item) => {
                const key = getKey(item)
                return (
                    <Accordion.Item
                        key={key}
                        value={key}
                        className="overflow-hidden rounded-md border border-border bg-card shadow-xs"
                    >
                        <Accordion.Header className="flex">
                            <Accordion.Trigger className="group flex w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <span className="min-w-0 flex-1">
                                    {renderRow(item)}
                                </span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.2s_ease-out] data-[state=open]:animate-[accordion-down_0.2s_ease-out]">
                            <div className="border-t border-dashed border-border px-3 pb-3 pt-2">
                                {renderDetail(item)}
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                )
            })}
        </Accordion.Root>
    )
}

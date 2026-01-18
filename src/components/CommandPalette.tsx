"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { titles } from "@/data/titles";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sorted = useMemo(
    () => titles.slice().sort((a, b) => a.recommendedOrder - b.recommendedOrder),
    []
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search titles… (type “Thor”) " />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Titles">
          {sorted.map((t) => (
            <CommandItem
              key={t.id}
              value={t.name}
              onSelect={() => {
                setOpen(false);
                router.push(`/title/${t.id}`);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span>{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.type.toUpperCase()}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

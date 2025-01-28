"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { type Category, type Tag } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

interface CategoryTagSelectProps {
  selectedCategoryId?: string;
  selectedTagIds?: string[];
  onCategoryChange: (categoryId: string | undefined) => void;
  onTagsChange: (tagIds: string[]) => void;
}

export function CategoryTagSelect({
  selectedCategoryId,
  selectedTagIds = [],
  onCategoryChange,
  onTagsChange,
}: CategoryTagSelectProps) {
  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  const selectedCategory = categories?.find(
    (category) => category.id === selectedCategoryId,
  );

  const selectedTags = tags?.filter((tag) => selectedTagIds.includes(tag.id)) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !selectedCategory && "text-muted-foreground",
              )}
            >
              {selectedCategory?.name ?? "Select category"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {categories?.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onCategoryChange(
                        category.id === selectedCategoryId
                          ? undefined
                          : category.id,
                      );
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategoryId === category.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Tags</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                selectedTags.length === 0 && "text-muted-foreground",
              )}
            >
              {selectedTags.length > 0
                ? `${selectedTags.length} selected`
                : "Select tags"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tag found.</CommandEmpty>
              <CommandGroup>
                {tags?.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      onTagsChange(
                        selectedTagIds.includes(tag.id)
                          ? selectedTagIds.filter((id) => id !== tag.id)
                          : [...selectedTagIds, tag.id],
                      );
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTagIds.includes(tag.id)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  onTagsChange(selectedTagIds.filter((id) => id !== tag.id))
                }
              >
                {tag.name}
                <span className="ml-1 text-muted-foreground">×</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
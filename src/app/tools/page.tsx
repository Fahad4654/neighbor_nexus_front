'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tools, Tool } from '@/lib/data';
import { ToolCard } from '@/components/cards/ToolCard';
import PageHeader from '@/components/PageHeader';
import { Search } from 'lucide-react';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(tools.map((t) => t.category)))];

  return (
    <div className="space-y-4">
      <PageHeader title="Browse Tools" />
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools or neighbors..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool: Tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-20 text-center">
            <h3 className="text-lg font-semibold text-foreground">No Tools Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

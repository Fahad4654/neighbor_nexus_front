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
import { skills, Skill } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import { Search } from 'lucide-react';
import { SkillCard } from '@/components/cards/SkillCard';

export default function SkillsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || skill.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(skills.map((s) => s.category)))];

  return (
    <div className="space-y-4">
      <PageHeader title="Browse Skills" />
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search skills or neighbors..."
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

      {filteredSkills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSkills.map((skill: Skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-20 text-center">
            <h3 className="text-lg font-semibold text-foreground">No Skills Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

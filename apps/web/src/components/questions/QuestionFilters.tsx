'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface QuestionFiltersProps {
  filters: {
    type?: string;
    difficulty?: string;
    category?: string;
    company?: string;
    search?: string;
  };
  onFilterChange: (filters: any) => void;
  categories?: string[];
  companies?: string[];
}

export function QuestionFilters({
  filters,
  onFilterChange,
  categories = [],
  companies = [],
}: QuestionFiltersProps) {
  const updateFilter = (key: string, value: string | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    filters.type || filters.difficulty || filters.category || filters.company || filters.search;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="case-study">Case Study</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty}
          onValueChange={(v) => updateFilter('difficulty', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(v) => updateFilter('category', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.company}
          onValueChange={(v) => updateFilter('company', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

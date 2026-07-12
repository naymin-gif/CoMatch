"use client";

import { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/ui/searchbar";
import { createClient } from '@/utils/clients';
import { useRouter } from "next/navigation";

type SearchResult = {
    id: string;
    type: 'post' | 'space' | 'profile';
    title: string;
    subtitle?: string; 
};

interface GlobalSearchProps {
    isOpen: boolean;
}

export default function GlobalSearch({ isOpen }: GlobalSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleResultClick = (type: 'post' | 'space' | 'profile', id: string) => {
        setQuery("");         
        switch (type) {
            case 'space':
                router.push(`/spaces/${id}`);
                break;
            case 'post':
                router.push(`/posts/${id}`); 
                break;
            case 'profile':
                router.push(`/profile/${id}`);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            const supabase = createClient();
            const safeSearchTerm = `"%${query}%"`; 

            try {
                const [postsResponse, spacesResponse, profilesResponse] = await Promise.all([
                    supabase
                        .from('posts')
                        .select('id, title, description')
                        // Use safeSearchTerm here
                        .or(`title.ilike.${safeSearchTerm},description.ilike.${safeSearchTerm}`)
                        .limit(10),
                    supabase
                        .from('spaces')
                        .select('id, name, description')
                        // Use safeSearchTerm here
                        .or(`name.ilike.${safeSearchTerm},description.ilike.${safeSearchTerm}`)
                        .limit(10),
                    supabase
                        .from('profiles')
                        .select('id, name')
                        // Standard .ilike doesn't need the string-based double quotes, so we can stick to standard query here
                        .ilike('name', `%${query}%`)
                        .limit(10)
                ]);

                const combinedResults: SearchResult[] = [];

                // Format Posts
                if (postsResponse.data) {
                    postsResponse.data.forEach(post => {
                        combinedResults.push({
                            id: post.id,
                            type: 'post',
                            title: post.title,
                            subtitle: post.description?.substring(0, 50) + "...", // Truncate long descriptions
                        });
                    });
                }

                // Format Spaces
                if (spacesResponse.data) {
                    spacesResponse.data.forEach(space => {
                        combinedResults.push({
                            id: space.id,
                            type: 'space',
                            title: space.name,
                            subtitle: space.description?.substring(0, 50) + "...",
                        });
                    });
                }

                // Format Profiles
                if (profilesResponse.data) {
                    profilesResponse.data.forEach(profile => {
                        combinedResults.push({
                            id: profile.id,
                            type: 'profile',
                            title: profile.name,
                            subtitle: 'User Profile',
                        });
                    });
                }

                setResults(combinedResults.slice(0, 10));

            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300); 

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full">
            <SearchBar 
                ref={inputRef} 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
            />
            
            {/* Dropdown UI */}
                {query.trim() !== "" && (
                    <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                        {isSearching ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
                        ) : results.length > 0 ? (
                            <ul className="max-h-[400px] overflow-y-auto">
                                {results.map((result) => (
                                    <li 
                                        key={`${result.type}-${result.id}`}
                                        onMouseDown={(e) => e.preventDefault()} 
                                        onClick={() => handleResultClick(result.type, result.id)}
                                        className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0 transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">
                                                {result.title}
                                            </span>
                                            {result.subtitle && (
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {result.type.toUpperCase()} • {result.subtitle}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">No results found for "{query}"</div>
                        )}
                    </div>
                )}
        </div>
    );
}
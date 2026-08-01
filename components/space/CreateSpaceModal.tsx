'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/button';
import { IoRemoveCircle } from 'react-icons/io5';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/clients';

export interface CreateSpaceData {
  name: string;
  image: string;
  description: string;
  externalLinks: string[];
}

interface SimilarSpace {
  id: string;
  name: string;
  description: string | null;
}

interface CreateSpaceModalProps {
  onCancel: () => void;
  onCreate: (spaceData: CreateSpaceData) => Promise<string>;
}

export default function CreateSpaceModal({
  onCancel,
  onCreate,
}: CreateSpaceModalProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [externalLinks, setExternalLinks] = useState<string[]>(['']);
  const [similarSpaces, setSimilarSpaces] = useState<SimilarSpace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const searchName = name.trim();

    if (searchName.length < 2) {
      setSimilarSpaces([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;

    const timeout = window.setTimeout(async () => {
      setIsSearching(true);

      const { data, error } = await supabase
        .from('spaces')
        .select('id, name, description')
        .ilike('name', `%${searchName}%`)
        .order('name', { ascending: true })
        .limit(5);

      if (cancelled) return;

      if (error) {
        console.error('Failed to search spaces:', error);
        setSimilarSpaces([]);
      } else {
        setSimilarSpaces(data ?? []);
      }

      setIsSearching(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [name, supabase]);

  const handleSimilarSpaceClick = (spaceId: string) => {
    onCancel();
    router.push(`/spaces/${spaceId}`);
  };

  // handle image change
  const handleImageChange = (file?: File | null) => {
    if (!file) {
      setImage('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  // handle link change
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...externalLinks];
    newLinks[index] = value;

    while (
      newLinks.length > 1 &&
      newLinks[newLinks.length - 1] === '' &&
      newLinks[newLinks.length - 2] === ''
    ) {
      newLinks.pop();
    }

    if (newLinks[newLinks.length - 1] !== '') {
      newLinks.push('');
    }

    setExternalLinks(newLinks);
  };

  // handle remove link
  const handleRemoveLink = (indexToRemove: number) => {
    const newLinks = externalLinks.filter(
      (_, index) => index !== indexToRemove
    );

    if (newLinks.length === 0 || newLinks[newLinks.length - 1] !== '') {
      newLinks.push('');
    }

    setExternalLinks(newLinks);
  };

  // handle submit
  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setIsCreating(true);

      await onCreate({
        name,
        image,
        description,
        externalLinks: externalLinks.filter(
          (link) => link.trim() !== ''
        ),
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-2xl bg-comatch-background p-6">
      <CardHeader className="border-b text-center justify-center">
        <CardTitle className="text-heading">Create Space</CardTitle>
        <CardDescription>
          Create a space and bring the right people together!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit}>
          <FieldGroup>
            {/* Name */}
            <Field className="relative">
              <FieldLabel>Name</FieldLabel>

              <Input
                placeholder="Give your space a name."
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
              />

              {name.trim().length >= 2 && (
                <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : similarSpaces.length > 0 ? (
                    <>
                      <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                        Existing spaces with similar names
                      </div>

                      <ul className="max-h-60 overflow-y-auto">
                        {similarSpaces.map((space) => (
                          <li key={space.id}>
                            <button
                              type="button"
                              onClick={() => handleSimilarSpaceClick(space.id)}
                              className="w-full cursor-pointer border-b border-border p-3 text-left transition-colors last:border-0 hover:bg-muted"
                            >
                              <span className="block text-sm font-medium text-foreground">
                                {space.name}
                              </span>

                              {space.description && (
                                <span className="block truncate text-xs text-muted-foreground">
                                  SPACE • {space.description}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No similar spaces found for &quot;{name.trim()}&quot;
                    </div>
                  )}
                </div>
              )}
            </Field>

            {/* Description  */}
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                placeholder="Describe your space."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>

            {/* Image */}
            <Field>
              <FieldLabel>Upload a picture.</FieldLabel>
              <ImageUpload size="xl" onImageChange={handleImageChange} />
            </Field>

            {/* External Links */}
            <Field>
              <FieldLabel>External Links</FieldLabel>
              {externalLinks.map((link, index) => (
                <div
                  key={`link-${index}`}
                  className="flex flex-row items-center gap-2 !w-xl"
                >
                  <Input
                    type="text"
                    name="externalLinks"
                    id={`link-${index}`}
                    placeholder={`Link ${index + 1}`}
                    value={link}
                    onChange={(event) =>
                      handleLinkChange(index, event.target.value)
                    }
                    className="flex-1"
                  />
                  {index !== externalLinks.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="text-comatch-danger hover:opacity-80 transition-opacity"
                      aria-label={`Remove link ${index + 1}`}
                    >
                      <IoRemoveCircle size={24} />
                    </button>
                  )}
                </div>
              ))}
            </Field>

            <div className="flex flex-row gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

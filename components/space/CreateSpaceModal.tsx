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
import { useState } from 'react';
import { IoRemoveCircle } from 'react-icons/io5';

export interface CreateSpaceData {
  name: string;
  image: string;
  description: string;
  externalLinks: string[];
}

interface CreateSpaceModalProps {
  onCancel: () => void;
  onCreate: (spaceData: CreateSpaceData) => void;
}

export default function CreateSpaceModal({
  onCancel,
  onCreate,
}: CreateSpaceModalProps) {
  const [name, setName] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [externalLinks, setExternalLinks] = useState<string[]>(['']);

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

  const handleRemoveLink = (indexToRemove: number) => {
    const newLinks = externalLinks.filter(
      (_, index) => index !== indexToRemove
    );

    if (newLinks.length === 0 || newLinks[newLinks.length - 1] !== '') {
      newLinks.push('');
    }

    setExternalLinks(newLinks);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      name,
      image,
      description,
      externalLinks: externalLinks.filter((link) => link.trim() !== ''),
    });
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
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                placeholder="Give your space a name."
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                placeholder="Describe your space."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Upload a picture.</FieldLabel>
              <ImageUpload size="xl" onImageChange={handleImageChange} />
            </Field>

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
              <Button type="submit">Create</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

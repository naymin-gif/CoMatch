'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/clients';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function CreateSpacePage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify space name uniqueness
      const { data: existingSpace, error: checkError } = await supabase
        .from('spaces')
        .select('id, name')
        .ilike('name', name.trim())
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingSpace) {
        setErrorMsg(
          `A space named "${name.trim()}" already exists. Please join the existing space.`
        );
        setIsLoading(false);
        return;
      }

      // 2. Upload Icon if present
      let iconUrl: string | null = null;
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `spaces/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, iconFile);

        if (uploadError) {
          console.error('Failed to upload space icon:', uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          iconUrl = publicUrlData.publicUrl;
        }
      }

      // 3. Create Space record
      const { data: newSpace, error: insertError } = await supabase
        .from('spaces')
        .insert({
          name: name.trim(),
          description: description.trim(),
          icon_url: iconUrl,
          external_link: externalLink.trim() || null,
          owner_id: userId,
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      // 4. Automatically add owner to space_members
      const { error: joinError } = await supabase.from('space_members').insert({
        space_id: newSpace.id,
        profile_id: userId,
      });

      if (joinError) {
        throw joinError;
      }

      // 5. Redirect on success
      if (newSpace) {
        router.push(`/spaces/${newSpace.id}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message || 'An unexpected error occurred while creating the space.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-28 pt-8">
      <div className="max-w-xl mx-auto px-4">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-mini text-gray-600 hover:text-comatch-primary font-primary font-semibold mb-6 transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Content Card */}
        <Card className="shadow-xl border border-gray-100 overflow-hidden p-6 sm:p-10">
          <CardHeader className="text-center mb-6 border-b pb-6 border-gray-100">
            <CardTitle className="text-heading-lg font-extrabold font-heading text-gray-900 tracking-tight">
              Create New Space
            </CardTitle>
            <CardDescription className="text-primary font-primary text-gray-500 mt-2">
              Create a central hub for your hackathon, class module, or side project.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error alerts */}
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-3 text-sm animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Icon Uploader */}
              <div className="flex flex-col items-center">
                <label className="block text-mini font-semibold font-primary text-gray-700 mb-3 text-center">
                  Space Icon (Optional)
                </label>

                <div className="relative group">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={iconPreview || undefined} alt={name || 'New Space'} />
                    <AvatarFallback>{name?.slice(0, 2).toUpperCase() || 'SP'}</AvatarFallback>
                  </Avatar>

                  <label className="absolute -bottom-2 -right-2 bg-comatch-primary hover:opacity-90 text-white p-2 rounded-full cursor-pointer shadow-md hover:scale-110 transition">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-mini font-primary text-gray-400 mt-3">
                  Upload a clean icon to represent your space.
                </p>
              </div>

              {/* Space Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="spaceName" className="text-sm font-semibold text-gray-700">Space Name</label>
                <Input
                  id="spaceName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Orbital 2026, HackRoll 2026"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Explain what this space is for, who it targets, and key objectives..."
                  required
                  className="resize-none"
                />
              </div>

              {/* External Link */}
              <div className="flex flex-col gap-2">
                <label htmlFor="externalLink" className="text-sm font-semibold text-gray-700">External Website / Resource Link</label>
                <Input
                  id="externalLink"
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://devpost.com/your-hackathon"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !userId}
                className="w-full py-3 flex items-center justify-center gap-2 mt-4 shadow-md"
              >
                {isLoading ? (
                  <span>Creating Space...</span>
                ) : (
                  <span>Create Now</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

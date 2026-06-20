'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/clients';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Import shared UI components
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';

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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
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
      const cleanedName = name.trim();
      const { data: existingSpace, error: checkError } = await supabase
        .from('spaces')
        .select('id, name')
        .eq('name', cleanedName)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Error checking name: ${checkError.message}`);
      }

      if (existingSpace) {
        setErrorMsg(`A space named "${cleanedName}" already exists. Please choose a unique name.`);
        setIsLoading(false);
        return;
      }

      // 2. Upload icon if selected (reusing avatars bucket to avoid new bucket dependency)
      let iconUrl = '';
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `spaces/space-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, iconFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        iconUrl = data.publicUrl;
      }

      // 3. Insert new space row
      const { data: newSpace, error: insertError } = await supabase
        .from('spaces')
        .insert({
          name: cleanedName,
          description: description.trim(),
          external_link: externalLink.trim() || null,
          icon_url: iconUrl || null,
          owner_id: userId,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // 4. Redirect on success
      if (newSpace) {
        router.push(`/spaces/${newSpace.id}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred while creating the space.');
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

        {/* Content Card (replaces custom div wrapper with Card UI component) */}
        <Card className="shadow-xl border border-gray-100 overflow-hidden sm:p-10">
          
          <div className="text-center mb-8 border-b pb-6 border-gray-100">
            <h1 className="text-heading-lg font-extrabold font-heading text-gray-900 tracking-tight">Create New Space</h1>
            <p className="text-primary font-primary text-gray-500 mt-2">Create a central hub for your hackathon, class module, or side project.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error alerts */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start gap-3 text-sm animate-in fade-in zoom-in-95">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Icon Uploader (replaces custom div preview with Avatar UI component) */}
            <div className="flex flex-col items-center">
              <label className="block text-mini font-semibold font-primary text-gray-700 mb-3 text-center">
                Space Icon (Optional)
              </label>
              
              <div className="relative group">
                <Avatar
                  src={iconPreview || undefined}
                  alt={name || "New Space"}
                  size="xl"
                  className="!rounded-2xl border-2 border-dashed border-gray-300 shadow-inner group-hover:border-comatch-primary transition duration-300"
                />
                
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
              <p className="text-mini font-primary text-gray-400 mt-3">Upload a clean icon to represent your space.</p>
            </div>

            {/* Space Name (replaces custom input with Input UI component) */}
            <Input
              id="spaceName"
              type="text"
              label="Space Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Orbital 2026, HackRoll 2026"
              required
            />

            {/* Description (replaces custom textarea with Textarea UI component) */}
            <Textarea
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Explain what this space is for, who it targets, and key objectives..."
              required
              className="resize-none"
            />

            {/* External Link (replaces custom input with Input UI component) */}
            <Input
              id="externalLink"
              type="url"
              label="External Website / Resource Link"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://devpost.com/your-hackathon"
            />

            {/* Submit Button (replaces custom button with Button UI component) */}
            <Button
              type="submit"
              disabled={isLoading || !userId}
              className="w-full py-3 flex items-center justify-center gap-2 mt-4 shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Space...</span>
                </>
              ) : (
                <span>Create Now</span>
              )}
            </Button>

          </form>
        </Card>

      </div>
    </main>
  );
}

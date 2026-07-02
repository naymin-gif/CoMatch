'use client';

import { useState } from 'react';
import { createClient } from '../../../utils/clients';
import toast from 'react-hot-toast';

// UI Components
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

interface EditProfileProps {
  initialData: any;
  onCancel: () => void;
  onSaveSuccess: (data: any) => void;
}

export default function EditProfileForm({
  initialData,
  onCancel,
  onSaveSuccess,
}: EditProfileProps) {
  const supabase = createClient();
  const [formData, setFormData] = useState(initialData);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  // States for dynamic skills & roles builder
  const [skillsList, setSkillsList] = useState<string[]>(
    initialData.skills
      ? initialData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
  );
  const [newSkill, setNewSkill] = useState('');

  const [rolesList, setRolesList] = useState<string[]>(
    initialData.roles
      ? initialData.roles.split(',').map((r: string) => r.trim()).filter(Boolean)
      : []
  );
  const [newRole, setNewRole] = useState('');

  const handleAddSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleAddRole = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = newRole.trim();
    if (trimmed && !rolesList.includes(trimmed)) {
      setRolesList([...rolesList, trimmed]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRolesList(rolesList.filter((r) => r !== roleToRemove));
  };

  const uploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'background'
  ) => {
    try {
      if (type === 'avatar') setUploadingAvatar(true);
      else setUploadingBackground(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.email}-${type}-${Math.random()}.${fileExt}`;
      const bucket = type === 'avatar' ? 'avatars' : 'backgrounds';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

      if (type === 'avatar') {
        setFormData({ ...formData, avatar_url: data.publicUrl });
      } else {
        setFormData({ ...formData, background_url: data.publicUrl });
      }
    } catch (error: any) {
      toast.error(`Error uploading ${type}: ` + error.message);
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingBackground(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const skillsString = skillsList.join(', ');
    const rolesString = rolesList.join(', ');

    const { error } = await supabase.from('profiles').upsert({
      id: formData.id,
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
      skills: skillsString,
      roles: rolesString,
      links: formData.links,
      avatar_url: formData.avatar_url,
      background_url: formData.background_url,
    });

    if (error) {
      console.error('Error saving profile changes:', error.message);
      toast.error('Could not save changes: ' + error.message);
      return;
    }

    const updatedProfile = {
      ...formData,
      skills: skillsString,
      roles: rolesString,
    };
    onSaveSuccess(updatedProfile);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSave} className="animate-in fade-in pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Cover Photo Edit */}
        <div className="relative h-64 sm:h-80 w-full bg-gray-200 group flex items-center justify-center overflow-hidden border-0 rounded-2xl">
          {formData.background_url && (
            <img
              src={formData.background_url}
              alt="Cover"
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-800 text-mini font-semibold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2">
              {uploadingBackground ? 'Uploading...' : 'Edit Cover Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e, 'background')}
                disabled={uploadingBackground}
                className="hidden"
              />
            </label>
            {formData.background_url && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, background_url: null })}
                className="bg-red-600 hover:bg-red-700 text-white text-mini font-semibold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                Remove Cover
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-gray-200 mb-8">
          <div className="relative -mt-14 w-40 h-40 rounded-full flex items-center justify-center text-blue-800 text-4xl font-bold border-4 border-white shadow-sm overflow-hidden group shrink-0 z-10">
            <Avatar
              src={formData.avatar_url}
              alt="Profile"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer text-white text-mini font-semibold py-1 px-3 rounded-full border border-white hover:bg-white/20 transition-colors">
                {uploadingAvatar ? '...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadImage(e, 'avatar')}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
              {formData.avatar_url && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar_url: null })}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold py-0.5 px-2 rounded-full border border-red-500/30 hover:border-red-500/50 bg-black/25 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row justify-between items-center sm:items-end w-full">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Profile Details
              </h1>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button variant="danger" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
            <Input
              label="Portfolio / Links"
              type="text"
              name="links"
              value={formData.links || ''}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-6">
            <Textarea
              label="Bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
            />
            {/* Dynamic Skills Builder */}
            <div className="space-y-2">
              <label className="text-mini font-medium text-gray-700 block">Skills</label>
              
              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skillsList.map((skill, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline"
                      className="flex items-center gap-1.5 pr-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-400 hover:text-red-500 font-bold leading-none cursor-pointer focus:outline-none transition-colors"
                        aria-label={`Remove skill ${skill}`}
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g. React)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4! py-2! shrink-0 flex items-center justify-center font-bold"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Dynamic Roles Builder */}
            <div className="space-y-2">
              <label className="text-mini font-medium text-gray-700 block">Preferred Roles</label>
              
              {rolesList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {rolesList.map((role, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline"
                      className="flex items-center gap-1.5 pr-2"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="text-gray-400 hover:text-red-500 font-bold leading-none cursor-pointer focus:outline-none transition-colors"
                        aria-label={`Remove role ${role}`}
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Add a role (e.g. Frontend)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddRole}
                  className="px-4! py-2! shrink-0 flex items-center justify-center font-bold"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

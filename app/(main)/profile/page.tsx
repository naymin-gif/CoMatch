'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/clients';



export default function ProfilePage() {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '', email: '', bio: '', skills: '', roles: '', links: '', joinDate: '', avatar_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get the logged-in user from the Auth system
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('No user logged in!');
        return; 
      }

      // 2. Look for their matching row in the public profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (data) {
        // THEY EXIST! Format their date and load their data.
        let prettyDate = '';
        if (data.join_date) {
          prettyDate = new Date(data.join_date).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });
        }
        setFormData({ ...data, joinDate: prettyDate });
        setIsOwner(true);
      } else {
        // BRAND NEW USER! They logged in, but have no profile row yet.
        setFormData((prev) => ({
          ...prev,
          id: user.id,
          email: user.email || '', 
          name: 'New Member', // A temporary name so the avatar circle works
        }));
        setIsOwner(true); // Unlock the Edit button!
      }

      if (error) {
        console.error('Database fetch error:', error.message);
      }
    };
    
    fetchProfile();
    }, []);
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.email}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData({ ...formData, avatar_url: data.publicUrl });
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: formData.id,
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        skills: formData.skills,
        roles: formData.roles,
        links: formData.links,
        avatar_url: formData.avatar_url,
      })
      
    if (error) {
      console.error('Error saving profile changes:', error.message);
      alert('Could not save changes: ' + error.message);
      return;
    }
    
    setIsEditing(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen pb-24">
      {/* Wide Cover Photo Banner */}
      <div className="h-72 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 w-full object-cover shadow-inner"></div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8 sm:p-10">
          
          {isEditing ? (
            <form onSubmit={handleSave} className="animate-in fade-in">
              <div className="flex justify-between items-center border-b pb-6 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsEditing(false); }} className="px-5 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition shadow-sm">Save Changes</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* EDIT MODE: Upload Image Button */}
                <div className="md:col-span-2 flex flex-col items-center mb-4">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-4xl font-bold border-4 border-white shadow-md mb-4 relative overflow-hidden">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      formData.name.charAt(0)
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-6 rounded-full border border-gray-300 transition-colors">
                    {uploading ? 'Uploading...' : '📷 Upload New Picture'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={uploadAvatar} 
                      disabled={uploading}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Form Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio / Links</label>
                    <input type="text" name="links" value={formData.links || ''} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
                    <input type="text" name="skills" value={formData.skills || ''} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Roles</label>
                    <input type="text" name="roles" value={formData.roles || ''} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in">
              
              {/* Left Column: Identity */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* VIEW MODE: Profile Picture */}
                <div className="w-36 h-36 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-5xl font-bold border-4 border-white shadow-md mb-6 relative overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.name.charAt(0)
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{formData.name}</h1>
                <p className="text-gray-500 font-medium mb-4">{formData.email}</p>
                
                {isOwner && (
                <button onClick={() => setIsEditing(true)} className="w-full lg:w-auto px-6 py-2 border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors mb-8">
                Edit Profile
                </button>
              )}

                <div className="w-full border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600">
                      <span className="text-xl">📅</span>
                      <span className="text-sm">Joined {formData.joinDate}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600">
                      <span className="text-xl">🔗</span>
                      <a href={`https://${formData.links}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                        {formData.links}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="lg:col-span-8 space-y-12 pt-4 lg:pt-12">
                <section>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">About Me</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{formData.bio}</p>
                </section>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2 text-base">
                      {formData.skills && formData.skills.split(',').map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-100 shadow-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Preferred Roles</h3>
                    <div className="flex flex-wrap gap-2 text-base">
                      {formData.roles && formData.roles.split(',').map((role, index) => (
                        <span key={index} className="px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-xl border border-purple-100 shadow-sm">
                          {role.trim()}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
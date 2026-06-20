'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/clients'; 
import EditProfileForm from './EditProfileForm';

export default function ProfilePage() {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '', 
    email: '', 
    bio: '', 
    skills: '', 
    roles: '', 
    links: '', 
    joinDate: '', 
    avatar_url: '',
    background_url: ''
  });
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('No user logged in!');
        return; 
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
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
        setFormData((prev) => ({
          ...prev,
          id: user.id,
          email: user.email || '', 
          name: 'New Member',
        }));
        setIsOwner(true); 
      }

      if (error) {
        console.error('Database fetch error:', error.message);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSaveSuccess = (updatedData: any) => {
    setFormData(updatedData);
    setIsEditing(false);
  };

  return (
    <div className="w-full bg-white min-h-screen">
      {isEditing ? (
        <EditProfileForm 
          initialData={formData} 
          onCancel={() => setIsEditing(false)} 
          onSaveSuccess={handleSaveSuccess} 
        />
      ) : (
        <div className="animate-in fade-in pb-12">
          
          {/* Cover Photo */}
          <div className="relative h-64 sm:h-80 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
             {formData.background_url ? (
               <img src={formData.background_url} alt="Cover" className="w-full h-full object-cover" />
             ) : (
               <div className="text-gray-400 font-medium">No cover photo</div>
             )}
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 pb-6 border-b border-gray-200">
              
              <div className="relative -mt-14 w-40 h-40 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-6xl font-bold border-4 border-white shadow-sm overflow-hidden shrink-0 z-10">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.name.charAt(0)
                )}
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row justify-between items-center sm:items-end w-full pt-2 sm:pt-0">
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{formData.name}</h1>
                  <p className="text-gray-600 font-medium mt-1">{formData.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1">📅 Joined {formData.joinDate}</span>
                    {formData.links && (
                      <span className="flex items-center gap-1">🔗 
                        <a href={formData.links?.startsWith('http') ? formData.links : `https://${formData.links}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          {formData.links.replace(/^https?:\/\//, '')}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
                
                {isOwner && (
                  <div className="mt-4 sm:mt-0 flex shrink-0">
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
                      <span>✏️</span> Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Layout */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: About */}
              <div className="md:col-span-1">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {formData.bio ? formData.bio : "This user hasn't added a bio yet."}
                    </p>
                 </div>
              </div>

              {/* Right Column: Skills & Roles */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Skills</h3>
                  {formData.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(',').map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No skills listed.</p>
                  )}
                </section>
                
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Preferred Roles</h3>
                  {formData.roles ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.roles.split(',').map((role, index) => (
                        <span key={index} className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-semibold rounded-full border border-purple-100">
                          {role.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No roles listed.</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
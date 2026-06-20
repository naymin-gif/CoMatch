'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/clients'; 
import EditProfileForm from './EditProfileForm';
import { FaCalendar, FaGithub } from 'react-icons/fa';

// UI Components
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
    <div className="w-full min-h-screen">
      {isEditing ? (
        <EditProfileForm 
          initialData={formData} 
          onCancel={() => setIsEditing(false)} 
          onSaveSuccess={handleSaveSuccess} 
        />
      ) : (
        <div className="animate-in fade-in pb-12">
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            
            {/* Cover Photo */}
            <div 
              className="relative h-64 sm:h-80 w-full bg-gray-100 flex items-center justify-center overflow-hidden"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
               {formData.background_url ? (
                 <img src={formData.background_url} alt="Cover" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-gray-400 font-medium">No cover photo</div>
               )}
            </div>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 pb-6 border-b border-gray-200">
              
              <div className="relative -mt-14 w-40 h-40 bg-comatch-light rounded-full flex items-center justify-center text-comatch-primary text-heading-lg font-bold border-4 shadow-sm overflow-hidden shrink-0 z-10">
                <Avatar 
                  src={formData.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row justify-between items-center sm:items-end w-full pt-2 sm:pt-0">
                <div className="text-center sm:text-left">
                  <h1 className="text-heading-lg font-heading font-bold tracking-tight">{formData.name}</h1>
                  {formData.bio && (
                    <p className="text-gray-600 mt-2 text-sm max-w-2xl leading-relaxed">
                      {formData.bio}
                    </p>
                  )}
                </div>
                
                {isOwner && (
                  <div className="mt-4 sm:mt-0 flex shrink-0">
                    <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Layout */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Contact & Info */}
              <div className="md:col-span-1">
                 <Card className="p-6 flex flex-col gap-5">
                    <div>
                      <span className="block text-mini font-bold text-gray-500 uppercase tracking-wider mb-1">Email</span>
                      <span className="text-primary text-gray-800 font-medium">{formData.email}</span>
                    </div>
                    
                    <div>
                      <span className="block text-mini font-bold text-gray-500 uppercase tracking-wider mb-1">Joined</span>
                      <span className="text-primary text-gray-800 font-medium flex items-center gap-2">
                        <FaCalendar className="text-gray-400" /> 
                        {formData.joinDate}
                      </span>
                    </div>
                    
                    {formData.links && (
                      <div>
                        <span className="block text-mini font-bold text-gray-500 uppercase tracking-wider mb-1">Links</span>
                        <a href={formData.links?.startsWith('http') ? formData.links : `https://${formData.links}`} target="_blank" rel="noopener noreferrer" className="text-primary text-comatch-primary hover:underline font-medium break-all flex items-center gap-2">
                          <FaGithub className="text-gray-700 text-primary" />
                          {formData.links.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                 </Card>
              </div>

              {/* Right Column: Skills & Roles */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-heading font-heading mb-4">Technical Skills</h3>
                  {formData.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(',').map((skill, index) => (
                        <Badge key={index} className="bg-comatch-light/30 text-comatch-primary border-comatch-light">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-primary italic">No skills listed.</p>
                  )}
                </section>
                
                <section>
                  <h3 className="text-heading font-heading mb-4">Preferred Roles</h3>
                  {formData.roles ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.roles.split(',').map((role, index) => (
                        <Badge key={index} className="bg-purple-50 text-purple-700 border-purple-100">
                          {role.trim()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-primary italic">No roles listed.</p>
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
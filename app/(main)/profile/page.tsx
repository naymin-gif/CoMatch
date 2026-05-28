'use client';

import { useState } from 'react';

const mockUser = {
  name: 'Win Htut',
  email: 'win@student.nus.edu.sg',
  bio: 'Year 1 CS student looking for dedicated teammates for hackathons and academic projects. I am deeply passionate about building scalable web applications and finding innovative solutions to complex problems.',
  skills: 'React, Next.js, Tailwind CSS, TypeScript, Supabase',
  roles: 'Frontend Developer, UI/UX Designer',
  links: 'github.com/winhtut',
  joinDate: 'May 2026',
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUser);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving new profile data:', formData);
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
              {/* Edit Mode Header */}
              <div className="flex justify-between items-center border-b pb-6 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setFormData(mockUser); setIsEditing(false); }} className="px-5 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition shadow-sm">Save Changes</button>
                </div>
              </div>

              {/* Edit Mode Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio / Links</label>
                    <input type="text" name="links" value={formData.links} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Roles</label>
                    <input type="text" name="roles" value={formData.roles} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in">
              
              {/* Left Column: Identity (Spans 4 columns) */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-36 h-36 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-5xl font-bold border-4 border-white shadow-md mb-6 bg-white relative">
                  {formData.name.charAt(0)}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{formData.name}</h1>
                <p className="text-gray-500 font-medium mb-4">{formData.email}</p>
                
                <button onClick={() => setIsEditing(true)} className="w-full lg:w-auto px-6 py-2 border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors mb-8">
                  Edit Profile
                </button>

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

              {/* Right Column: Content (Spans 8 columns) */}
              <div className="lg:col-span-8 space-y-12 pt-4 lg:pt-12">
                
                {/* Bio Section */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">About Me</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{formData.bio}</p>
                </section>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {/* Skills Section */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2 text-base">
                      {formData.skills.split(',').map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-100 shadow-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </section>
                  
                  {/* Roles Section */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Preferred Roles</h3>
                    <div className="flex flex-wrap gap-2 text-base">
                      {formData.roles.split(',').map((role, index) => (
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
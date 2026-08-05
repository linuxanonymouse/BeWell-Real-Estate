"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, UserCircle2, Upload } from "lucide-react";
import { getAuthHeader } from "../layout";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  image?: string;
}

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await fetch("http://localhost:3001/team", {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (error) {
      console.error("Failed to fetch team", error);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setName(member.name);
      setRole(member.role);
      setDepartment(member.department);
      setImage(member.image || "");
    } else {
      setEditingMember(null);
      setName("");
      setRole("");
      setDepartment("");
      setImage("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setImage(data.url);
      }
    } catch (error) {
      console.error("Failed to upload image", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, role, department, image };

    try {
      if (editingMember) {
        await fetch(`http://localhost:3001/team/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("http://localhost:3001/team", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
      }
      fetchTeam();
      closeModal();
    } catch (error) {
      console.error("Failed to save team member", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      await fetch(`http://localhost:3001/team/${id}`, { 
        method: "DELETE",
        headers: getAuthHeader()
      });
      fetchTeam();
    } catch (error) {
      console.error("Failed to delete team member", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-white tracking-wider uppercase">Team Members</h2>
          <p className="text-zinc-500 font-sans mt-2">Manage your executive and leadership team.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#c09b62] hover:bg-[#dfc499] text-black px-6 py-3 rounded-lg flex items-center gap-2 font-sans text-sm tracking-wider uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group relative flex flex-col">
            <div className="aspect-square bg-black/50 flex items-center justify-center relative">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover opacity-60" />
              ) : (
                <UserCircle2 className="w-24 h-24 text-zinc-800" />
              )}
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(member)} className="w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black transition-colors backdrop-blur-sm">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(member.id)} className="w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-black transition-colors backdrop-blur-sm">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider mb-1">{member.name}</h3>
              <p className="text-[#c09b62] text-xs font-sans uppercase tracking-widest mb-4">{member.role}</p>
              <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 uppercase tracking-widest">
                {member.department}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">
                {editingMember ? 'Edit Member' : 'New Member'}
              </h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Full Name</label>
                <input 
                  required value={name} onChange={e => setName(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Role</label>
                <input 
                  required value={role} onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Chief Executive Officer"
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Department</label>
                <input 
                  required value={department} onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Leadership"
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 className="w-8 h-8 text-zinc-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2 text-xs text-white transition-colors flex items-center justify-center gap-2 max-w-[200px]">
                      <Upload className="w-3 h-3" />
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-[10px] text-zinc-500 mt-2">JPG, PNG, WebP up to 5MB</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium disabled:opacity-50">
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

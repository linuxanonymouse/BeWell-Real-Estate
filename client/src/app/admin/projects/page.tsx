"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";

import { getAuthHeader } from "../layout";

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  value: string;
  image?: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Planning");
  const [value, setValue] = useState("");
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setName(project.name);
      setLocation(project.location);
      setStatus(project.status);
      setValue(project.value);
      setImage(project.image || "");
    } else {
      setEditingProject(null);
      setName("");
      setLocation("");
      setStatus("Planning");
      setValue("");
      setImage("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
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
    const payload = { name, location, status, value, image };

    try {
      if (editingProject) {
        await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
      }
      fetchProjects();
      closeModal();
    } catch (error) {
      console.error("Failed to save project", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { 
        method: "DELETE",
        headers: getAuthHeader()
      });
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-white tracking-wider uppercase">Projects CMS</h2>
          <p className="text-zinc-500 font-sans mt-2">Manage your real estate portfolio.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#c09b62] hover:bg-[#dfc499] text-black px-6 py-3 rounded-lg flex items-center gap-2 font-sans text-sm tracking-wider uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden w-full overflow-x-auto">
        <table className="w-full text-left font-sans text-sm whitespace-nowrap">
          <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-xs">
            <tr>
              <th className="p-6 font-medium">Name</th>
              <th className="p-6 font-medium">Location</th>
              <th className="p-6 font-medium">Status</th>
              <th className="p-6 font-medium">Value</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-6 text-white">{project.name}</td>
                <td className="p-6 text-zinc-300">{project.location}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs tracking-wider ${
                    project.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    project.status === 'Under Construction' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="p-6 text-[#c09b62]">{project.value}</td>
                <td className="p-6 flex justify-end gap-3">
                  <button onClick={() => openModal(project)} className="text-zinc-500 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white uppercase tracking-wider">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Project Name</label>
                <input 
                  required value={name} onChange={e => setName(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Location</label>
                <input 
                  required value={location} onChange={e => setLocation(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Status</label>
                <select 
                  value={status} onChange={e => setStatus(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors appearance-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Value (e.g. $450M)</label>
                <input 
                  required value={value} onChange={e => setValue(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#c09b62] outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">Project Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-zinc-700 text-xs">None</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2 text-xs text-white transition-colors flex items-center justify-center gap-2 max-w-[200px]">
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors uppercase tracking-wider text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="flex-1 py-3 bg-[#c09b62] rounded-lg text-black hover:bg-[#dfc499] transition-colors uppercase tracking-wider text-xs font-medium disabled:opacity-50">
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

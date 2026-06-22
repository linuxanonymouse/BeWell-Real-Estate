export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-800 p-6 flex flex-col">
        <h1 className="text-xl font-display tracking-widest uppercase text-primary-500 mb-12">BeWell Admin</h1>
        <nav className="flex flex-col gap-4">
          <a href="/admin" className="text-zinc-400 hover:text-white transition-colors">Dashboard</a>
          <a href="/admin/projects" className="text-zinc-400 hover:text-white transition-colors">Projects</a>
          <a href="/admin/team" className="text-zinc-400 hover:text-white transition-colors">Team Members</a>
          <a href="/admin/testimonials" className="text-zinc-400 hover:text-white transition-colors">Testimonials</a>
          <a href="/admin/settings" className="text-zinc-400 hover:text-white transition-colors mt-8">Settings</a>
        </nav>
        <div className="mt-auto">
          <button className="text-sm text-red-400 hover:text-red-300">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-light mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Total Projects</h3>
          <p className="text-4xl font-light text-primary-400">24</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Active Team</h3>
          <p className="text-4xl font-light text-primary-400">12</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Testimonials</h3>
          <p className="text-4xl font-light text-primary-400">8</p>
        </div>
      </div>

      <h3 className="text-xl font-light mb-6">Recent Activity</h3>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div>
              <p className="text-white">New Project Added: <span className="text-primary-400">Rosewood Heights</span></p>
              <p className="text-sm text-zinc-500">2 hours ago</p>
            </div>
            <button className="text-sm text-zinc-400 hover:text-white">View</button>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div>
              <p className="text-white">Team Member Updated: <span className="text-primary-400">Fahad Khan</span></p>
              <p className="text-sm text-zinc-500">5 hours ago</p>
            </div>
            <button className="text-sm text-zinc-400 hover:text-white">View</button>
          </div>
          <div className="flex justify-between items-center pb-4">
            <div>
              <p className="text-white">Testimonial Published: <span className="text-primary-400">MVP Developers</span></p>
              <p className="text-sm text-zinc-500">1 day ago</p>
            </div>
            <button className="text-sm text-zinc-400 hover:text-white">View</button>
          </div>
        </div>
      </div>
    </div>
  );
}

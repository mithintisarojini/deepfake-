import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_uploads: 0,
    real_count: 0,
    fake_count: 0,
    ai_generated_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/admin/stats", {
          withCredentials: true,
        });
        setStats(res.data);
      } catch (err) {
        // If admin route fails (not admin), try user uploads count
        try {
          const uploads = await axios.get("http://127.0.0.1:8000/api/uploads", {
            withCredentials: true,
          });
          setStats((s) => ({
            ...s,
            total_uploads: uploads.data.length,
          }));
        } catch (e) {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-6">
        Welcome{localStorage.getItem("user") ? `, ${JSON.parse(localStorage.getItem("user")).email}` : ""}
      </h1>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="p-6 border">
          <div className="text-sm uppercase mb-2">Total uploads</div>
          <div className="text-4xl font-bold">{stats.total_uploads}</div>
        </div>

        <div className="p-6 border">
          <div className="text-sm uppercase mb-2">Real</div>
          <div className="text-4xl font-bold text-teal-700">{stats.real_count}</div>
        </div>

        <div className="p-6 border">
          <div className="text-sm uppercase mb-2">Fake</div>
          <div className="text-4xl font-bold text-red-600">{stats.fake_count}</div>
        </div>

        <div className="p-6 border">
          <div className="text-sm uppercase mb-2">AI-generated</div>
          <div className="text-4xl font-bold text-orange-500">{stats.ai_generated_count}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 border">
          <h3 className="text-xl font-semibold mb-2">Upload New File</h3>
          <p className="text-gray-600">Analyze images, audio, or video files for deepfake detection</p>
          <div className="mt-4">
            <a href="/upload" className="px-4 py-2 bg-black text-white">Upload</a>
          </div>
        </div>

        <div className="p-6 border">
          <h3 className="text-xl font-semibold mb-2">View History</h3>
          <p className="text-gray-600">Access your complete upload history and analysis results</p>
          <div className="mt-4">
            <a href="/dashboard" className="px-4 py-2 border">Open History</a>
          </div>
        </div>
      </div>
    </div>
  );
}

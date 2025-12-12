import { useState } from "react";
import axios from "axios";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      alert("Please choose a file first");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Make sure you are logged in and the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload File</h1>

      <input
        type="file"
        onChange={(e) => {
          setFile(e.target.files[0]);
          setResult(null);
        }}
      />

      <button
        className="bg-black text-white p-2 mt-2"
        onClick={upload}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div className="mt-4 p-4 border">
          <p><strong>Result:</strong> {result.detection_result}</p>
          <p><strong>Confidence:</strong> {result.confidence_score}</p>
          <p><strong>File name:</strong> {result.file_name}</p>
        </div>
      )}
    </div>
  );
}

import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";

const History = () => {
  const { user, token, getGenerationHistory, getGeneratedImage, deleteGeneratedImage } = useContext(AppContext);
  const [images, setImages] = useState([]);
  const [imageSources, setImageSources] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) return;
    let active = true;
    getGenerationHistory()
      .then(async (items) => {
        if (!active) return;
        setImages(items);
        const entries = await Promise.all(items.map(async (item) => [item.id, await getGeneratedImage(item.id)]));
        if (active) setImageSources(Object.fromEntries(entries));
      })
      .catch((error) => toast.error(error.message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, user]);

  const removeImage = async (id) => {
    try {
      await deleteGeneratedImage(id);
      setImages((current) => current.filter((item) => item.id !== id));
      setImageSources((current) => { const next = { ...current }; delete next[id]; return next; });
      toast.success("Image deleted");
    } catch (error) { toast.error(error.message); }
  };

  if (!user) return <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center"><h1 className="text-3xl font-semibold">Your image history</h1><p>Log in to revisit your creations.</p><Link className="rounded-full bg-zinc-900 px-6 py-3 text-white" to="/result">Go to generator</Link></main>;

  return <main className="min-h-[75vh] py-12">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold text-zinc-900">Your creations</h1><p className="mt-2 text-zinc-600">Images you’ve generated, ready to revisit or download.</p></div><Link to="/result" className="rounded-full bg-zinc-900 px-6 py-3 text-sm text-white">Generate an image</Link></div>
    {loading ? <p className="py-16 text-center text-zinc-500">Loading your images…</p> : images.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center text-zinc-500">No images yet. Your generated images will appear here.</div> :
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{images.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {imageSources[item.id] ? <img src={imageSources[item.id]} alt={item.prompt} className="aspect-square w-full object-cover" /> : <div className="aspect-square animate-pulse bg-zinc-100" />}
        <div className="p-4"><p className="line-clamp-2 min-h-12 text-sm text-zinc-700">{item.prompt}</p><p className="mt-2 text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</p>
          <div className="mt-4 flex gap-2"><button onClick={() => navigate("/result", { state: { image: imageSources[item.id], prompt: item.prompt } })} disabled={!imageSources[item.id]} className="flex-1 rounded-full bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50">Revisit</button>
            {imageSources[item.id] && <a href={imageSources[item.id]} download={`imagify-${item.id}.png`} className="rounded-full border px-4 py-2 text-sm">Download</a>}
            <button onClick={() => removeImage(item.id)} aria-label="Delete image" className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-600">Delete</button></div>
        </div></article>)}</div>}
  </main>;
};

export default History;

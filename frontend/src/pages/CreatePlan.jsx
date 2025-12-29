import { useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function CreatePlan() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    datetime: "",
    location: "",
    max_spots: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Title is required";
    if (!form.datetime) newErrors.datetime = "Date & time are required";
    else {
      const dt = new Date(form.datetime);
      if (dt.getTime() < Date.now() + 5 * 60 * 1000) {
        newErrors.datetime = "Time must be at least 5 minutes in the future";
      }
    }
    if (!form.location) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        datetime: new Date(form.datetime),
        location: form.location,
        max_spots: form.max_spots ? Number(form.max_spots) : undefined,
      };

      const res = await api.post("/plans", payload);
      toast.success(res.data.msg || "Plan created successfully!");
      window.location.href = `/plans/${res.data.plan._id}`;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Plan</h2>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
          className="border p-2"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={onChange}
          className="border p-2"
        />

        <input
          name="datetime"
          type="datetime-local"
          value={form.datetime}
          onChange={onChange}
          className="border p-2"
        />
        {errors.datetime && (
          <p className="text-red-500 text-sm">{errors.datetime}</p>
        )}

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={onChange}
          className="border p-2"
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}

        <input
          name="max_spots"
          type="number"
          placeholder="Max spots (optional)"
          value={form.max_spots}
          onChange={onChange}
          className="border p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}

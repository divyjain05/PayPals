import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Save, Camera, ArrowLeft } from "lucide-react";

function Settings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        profilePhoto: "",
        currency: "INR",
        country: "India",
        timezone: "Asia/Kolkata"
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();

            setFormData({
                name: data.name || "",
                email: data.email || "",
                profilePhoto: data.profilePhoto || "",
                currency: data.currency || "INR",
                country: data.country || "India",
                timezone: data.timezone || "Asia/Kolkata"
            });
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            setSuccess("Profile updated successfully!");
            setSaving(false);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-neutral-dark">Loading...</div>;

    return (
        <div className="min-h-screen bg-neutral-light font-sans text-neutral-black pb-12">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
                            <ArrowLeft className="h-6 w-6 text-neutral-dark mr-2" />
                            <span className="text-xl font-bold text-neutral-black">Back to Dashboard</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-medium overflow-hidden">
                    <div className="p-8 border-b border-neutral-medium text-center">
                        <div className="relative inline-block mb-4">
                            <div className="h-24 w-24 bg-accent/20 rounded-full flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
                                {formData.profilePhoto ? (
                                    <img src={formData.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-neutral-medium cursor-pointer hover:bg-neutral-light">
                                <Camera className="h-4 w-4 text-neutral-dark" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-black">Profile Settings</h1>
                        <p className="text-neutral-dark mt-1">Manage your account preferences</p>
                    </div>

                    <div className="p-8">
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}
                        {success && <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-dark mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-dark mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-neutral-medium rounded-lg bg-neutral-light text-neutral-dark cursor-not-allowed"
                                    />
                                    <p className="text-xs text-neutral-dark mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-dark mb-1">Profile Photo URL</label>
                                    <input
                                        type="url"
                                        name="profilePhoto"
                                        value={formData.profilePhoto}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Default Currency</label>
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Country</label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                        >
                                            <option value="India">India</option>
                                            <option value="USA">USA</option>
                                            <option value="UK">UK</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Germany">Germany</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-dark mb-1">Timezone</label>
                                    <select
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                    >
                                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                        <option value="Europe/London">Europe/London (GMT)</option>
                                        <option value="Europe/Paris">Europe/Paris (CET)</option>
                                    </select>
                                    <p className="text-xs text-neutral-dark mt-1">Affects date grouping in charts</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-teal-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;

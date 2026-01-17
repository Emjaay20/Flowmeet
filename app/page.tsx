"use client"; // client component for useState and event handlers
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      role: (form.elements.namedItem("role") as HTMLInputElement).value,
      region: (form.elements.namedItem("region") as HTMLSelectElement).value,
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.qualified && data.bookingUrl) {
      //  AUTO-ROUTE TO MEETING
      window.location.href = data.bookingUrl;
    } else {
      setStatus("Thanks! Our team will reach out shortly.");
      form.reset();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">FlowMeet</h1>
      <p className="text-lg mb-8 text-center max-w-xl text-gray-600 leading-relaxed">
        Turn inbound leads into qualified meetings instantly.
      </p>

      <form className="flex flex-col gap-5 w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full border border-gray-200 p-3 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="w-full border border-gray-200 p-3 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            required
          />
          <input
            type="text"
            name="company"
            placeholder="Company"
            className="w-full border border-gray-200 p-3 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            required
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            className="w-full border border-gray-200 p-3 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            required
          />
          <select
            name="region"
            defaultValue=""
            className="w-full border border-gray-200 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
            required
          >
            <option value="" disabled>Select Region</option>
            <option value="EMEA">EMEA</option>
            <option value="NA">North America</option>
            <option value="APAC">APAC</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all transform active:scale-[0.98]"
        >
          Book a Meeting
        </button>
      </form>

      {status && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          {status}
        </div>
      )}
    </main>
  );
}

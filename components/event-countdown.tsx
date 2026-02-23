"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface Event {
    id: string;
    title: string;
    location: string | null;
    type: string | null;
    date: string;
    time?: string;
    description?: string;
}

export default function EventCountdown() {
    const [event, setEvent] = useState<Event | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        // Fetch upcoming event
        const fetchEvent = async () => {
            try {
                const res = await fetch("/api/events");
                // but for now we use the admin one or a public version if it exists.
                // Assuming we want the first upcoming event.
                if (!res.ok) {
                    return;
                }
                const text = await res.text();
                if (!text) return;
                const data = JSON.parse(text);
                if (Array.isArray(data) && data.length > 0) {
                    setEvent(data[0]);
                }
            } catch (err) {
                // Silently handle error
            }
        };

        fetchEvent();
    }, []);

    useEffect(() => {
        if (!event) return;

        const timer = setInterval(() => {
            const target = new Date(event.date);
            if (event.time) {
                const [hours, minutes] = event.time.split(":").map(Number);
                target.setHours(hours || 0, minutes || 0, 0, 0);
            }

            const now = new Date().getTime();
            const distance = target.getTime() - now;

            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [event]);

    if (!event || !timeLeft) return null;

    return (
        <div className="w-full flex flex-col items-center gap-8 py-6 animate-in fade-in transition-all">
            {/* Header: Date and Title */}
            <div className="flex flex-col items-center text-center gap-4">
                <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-primary/30 shadow-lg shadow-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-white text-sm font-black uppercase tracking-widest">
                        {new Date(event.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                        {event.time ? ` @ ${event.time}` : ''}
                    </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm max-w-2xl px-4">
                    {event.title}
                </h2>
            </div>

            {/* Sub-label */}
            <div className="flex flex-col items-center gap-2 -mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                    Countdown to takeoff
                </span>
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Countdown Blocks */}
            <div className="flex gap-4 sm:gap-6">
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                ].map((item, idx) => (
                    <div key={item.label} className="flex flex-col items-center gap-4 group">
                        <div className="w-20 h-24 sm:w-28 sm:h-32 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 border-b border-white/5" />
                            <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10 transition-transform duration-500 group-hover:translate-y-[-2px]">
                                {item.value.toString().padStart(2, "0")}
                            </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-primary/70 transition-colors">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

        </div>
    );
}

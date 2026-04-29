"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";

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
    // Default event: Aero Expo 2026 - May 30-31
    const defaultEvent: Event = {
        id: "default",
        title: "AERO EXPO – La technologie au cœur de l'aéronautique",
        location: "Escadron Hélicoptère Ivato, ex-bani",
        type: "expo",
        date: "2026-05-30",
        time: "09:00",
        description: "2ème édition du Salon Aéro Expo"
    };

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
                    setEvent(defaultEvent);
                    return;
                }
                const text = await res.text();
                if (!text) {
                    setEvent(defaultEvent);
                    return;
                }
                const data = JSON.parse(text);
                if (Array.isArray(data) && data.length > 0) {
                    setEvent(data[0]);
                } else {
                    setEvent(defaultEvent);
                }
            } catch (err) {
                // Use default event on error
                setEvent(defaultEvent);
            }
        };

        fetchEvent();
    }, []);

    useEffect(() => {
        if (!event) return;

        // Initialize timeLeft immediately
        const calculateTimeLeft = () => {
            const target = new Date(event.date);
            if (event.time) {
                const [hours, minutes] = event.time.split(":").map(Number);
                target.setHours(hours || 0, minutes || 0, 0, 0);
            }

            const now = new Date().getTime();
            const distance = target.getTime() - now;

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            } else {
                return {
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                };
            }
        };

        setTimeLeft(calculateTimeLeft());

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
        <div className="w-full flex flex-col items-center gap-6 py-4 animate-in fade-in transition-all">
            {/* Header: Date and Location side by side */}
            <div className="flex flex-col items-center text-center gap-5">
                <div className="flex flex-wrap justify-center items-center gap-3">
                    <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-primary/30 shadow-lg shadow-primary/10">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-white text-xs sm:text-sm font-black uppercase tracking-widest">
                            30 & 31 Mai 2026
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-primary/30 shadow-lg shadow-primary/10">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-white text-xs sm:text-sm font-black uppercase tracking-widest">
                            Escadron Hélicoptère Ivato
                        </span>
                    </div>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-sm whitespace-nowrap">
                    {event.title}
                </h2>
            </div>

            {/* Sub-label */}
            <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                    Countdown to takeoff
                </span>
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Countdown Blocks */}
            <div className="flex gap-3 sm:gap-4">
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                ].map((item, idx) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 group">
                        <div className="w-16 h-20 sm:w-24 sm:h-28 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 border-b border-white/5" />
                            <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10 transition-transform duration-500 group-hover:translate-y-[-2px]">
                                {item.value.toString().padStart(2, "0")}
                            </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-primary/70 transition-colors">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

        </div>
    );
}

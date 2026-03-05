"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Calendar,
    Ticket as TicketIcon,
    RefreshCw,
    Camera,
    History,
    Zap,
    ZapOff,
    SwitchCamera
} from "lucide-react";
import { toast } from "sonner";

interface ScanResult {
    success: boolean;
    message: string;
    type?: "digital" | "physical";
    ticketNumber?: string;
    holder?: string;
    event?: string;
    error?: string;
    usedAt?: string;
}

export default function AdminScanPage() {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [history, setHistory] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const lastScannedCode = useRef<string | null>(null);

    useEffect(() => {
        // Initialize the library instance
        html5QrCodeRef.current = new Html5Qrcode("reader");

        return () => {
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanning = async () => {
        if (!html5QrCodeRef.current) return;

        setCameraError(null);
        try {
            // Prefer the back camera (environment)
            const config = {
                fps: 15,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanFailure
            );

            setIsScanning(true);

            // Check for flashlight support
            const track = html5QrCodeRef.current.getRunningTrack();
            if (track) {
                const capabilities = track.getCapabilities() as any;
                setHasFlash(!!capabilities.torch);
            }

        } catch (err: any) {
            console.error("Failed to start scanner", err);
            setCameraError(err.message || "Erreur caméra");
            toast.error("Impossible d'accéder à la caméra");
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current?.isScanning) {
            await html5QrCodeRef.current.stop();
            setIsScanning(false);
            setFlashOn(false);
        }
    };

    const toggleFlash = async () => {
        if (!html5QrCodeRef.current?.isScanning || !hasFlash) return;

        try {
            const newState = !flashOn;
            await html5QrCodeRef.current.applyVideoConstraints({
                // @ts-ignore
                advanced: [{ torch: newState }]
            });
            setFlashOn(newState);
        } catch (err) {
            toast.error("Flash non supporté");
        }
    };

    const isProcessing = useRef(false);

    async function onScanSuccess(decodedText: string) {
        // Strict lock to prevent any concurrent processing
        if (isProcessing.current) return;
        isProcessing.current = true;

        // Stop camera IMMEDIATELY to prevent library from firing more events
        await stopScanning();

        // For digital tickets, content format:
        // PASS AVENIR — BILLET OFFICIEL
        // ...
        // CODE: <uuid>

        let qrToken = decodedText;
        if (decodedText.includes("CODE:")) {
            const lines = decodedText.split("\n");
            const codeLine = lines.find(l => l.toUpperCase().startsWith("CODE:"));
            if (codeLine) qrToken = codeLine.split(":")[1]?.trim() || decodedText;
        } else if (decodedText.includes("Code:")) {
            const lines = decodedText.split("\n");
            const codeLine = lines.find(l => l.startsWith("Code:"));
            if (codeLine) qrToken = codeLine.split(":")[1]?.trim() || decodedText;
        }

        setIsValidating(true);
        setScanResult(null); // Clear previous result UI

        // Brief haptic feedback if supported
        if ("vibrate" in navigator) navigator.vibrate(100);

        try {
            const res = await fetch("/api/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrCode: qrToken }),
            });

            const data = await res.json();
            const result: ScanResult = {
                success: res.ok,
                message: data.message || data.error || (res.ok ? "Billet validé" : "Erreur"),
                ...data
            };

            setScanResult(result);
            setHistory(prev => [result, ...prev].slice(0, 10));

            if (res.ok) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Erreur réseau");
        } finally {
            setIsValidating(false);
            isProcessing.current = false;
            // Note: We no longer auto-hide or restart. 
            // The user must click "Démarrer" manually for the next ticket.
        }
    }

    function onScanFailure() {
        // Minimal logging for better perf
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Scanner d'Accès</h1>
                    <p className="text-slate-500 font-medium">Contrôle des entrées en temps réel</p>
                </div>

                {!isScanning ? (
                    <button
                        onClick={startScanning}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                        <Camera className="w-5 h-5" />
                        Activer la Caméra
                    </button>
                ) : (
                    <button
                        onClick={stopScanning}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md"
                    >
                        <SwitchCamera className="w-5 h-5" />
                        Arrêter le Scanner
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Scanner Area */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-slate-950 rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-200">
                        {/* The Scanner Viewport */}
                        <div id="reader" className="w-full h-full object-cover"></div>

                        {/* Overlay when NOT scanning */}
                        {!isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm p-8 text-center">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-white/5">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-white text-xl font-bold mb-2">Caméra éteinte</h2>
                                <p className="text-white/60 mb-6 text-sm">Activez la caméra pour commencer la validation des billets</p>
                                <button
                                    onClick={startScanning}
                                    className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Démarrer
                                </button>
                                {cameraError && <p className="mt-4 text-rose-400 text-xs font-mono">{cameraError}</p>}
                            </div>
                        )}

                        {/* Scanner Frame Guide */}
                        {isScanning && !scanResult && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-dashed border-blue-400/50 rounded-3xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/30 animate-pulse"></div>
                                </div>
                            </div>
                        )}

                        {/* Flashlight button */}
                        {isScanning && hasFlash && (
                            <button
                                onClick={toggleFlash}
                                className={`absolute top-6 right-6 p-4 rounded-2xl transition-all shadow-lg ${flashOn ? 'bg-amber-400 text-slate-900 scale-110' : 'bg-slate-900/60 text-white hover:bg-slate-800'}`}
                            >
                                {flashOn ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6 text-white/40" />}
                            </button>
                        )}

                        {/* Result Overlay */}
                        {scanResult && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 animate-in fade-in zoom-in duration-300 ${scanResult.success ? "bg-emerald-600/95" : "bg-rose-600/95"
                                } text-white`}>
                                {scanResult.success ? (
                                    <div className="bg-white/20 p-6 rounded-full mb-6 ring-8 ring-white/10">
                                        <CheckCircle2 className="w-16 h-16 animate-out zoom-out spin-in-90 duration-500" />
                                    </div>
                                ) : (
                                    <div className="bg-white/20 p-6 rounded-full mb-6 ring-8 ring-white/10">
                                        <XCircle className="w-16 h-16 animate-pulse" />
                                    </div>
                                )}
                                <h2 className="text-4xl font-black mb-2 tracking-tight">
                                    {scanResult.success ? "VALIDE" : "REFUSÉ"}
                                </h2>
                                <p className="text-white font-bold text-lg max-w-sm">{scanResult.message}</p>

                                {scanResult.ticketNumber && (
                                    <div className="mt-8 px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl text-xs font-mono font-bold tracking-widest uppercase border border-white/20">
                                        {scanResult.ticketNumber}
                                    </div>
                                )}
                            </div>
                        )}

                        {isValidating && !scanResult && (
                            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-30">
                                <RefreshCw className="w-16 h-16 text-blue-400 animate-spin mb-4" />
                                <span className="text-white font-black tracking-widest text-xs uppercase opacity-60">Validation serveur...</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-100/50 p-6 rounded-3xl border border-slate-200 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-slate-600 leading-snug">
                            <strong>Validation instantanée :</strong> chaque scan est vérifié en temps réel. La vibration confirme la lecture.
                        </p>
                    </div>
                </div>

                {/* Tracking & Social Area */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-slate-900 font-black tracking-tight">
                                <History className="w-5 h-5 text-blue-600" />
                                HISTORIQUE
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-400 uppercase">10 derniers</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <TicketIcon className="w-12 h-12 mb-3" />
                                    <p className="text-xs font-bold uppercase tracking-widest">En attente de scan...</p>
                                </div>
                            ) : (
                                history.map((res, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border transition-all ${res.success ? "bg-emerald-50/20 border-emerald-100/50" : "bg-rose-50/20 border-rose-100/50"
                                        } flex items-center gap-4 animate-in slide-in-from-right-4 duration-300`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${res.success ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                            }`}>
                                            {res.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                                                {res.ticketNumber || "Lot inconnu"}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                                                {res.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {scanResult?.holder && (
                        <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
                            <h3 className="text-xs font-black mb-6 flex items-center gap-2 opacity-50 tracking-widest uppercase">
                                <User className="w-4 h-4" />
                                Détails du Participant
                            </h3>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-2xl font-black shadow-inner">
                                    {scanResult.holder.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl font-black truncate tracking-tight">{scanResult.holder}</p>
                                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs mt-1">
                                        <Calendar className="w-3 h-3" />
                                        <span className="truncate">{scanResult.event || "Événement spécial"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

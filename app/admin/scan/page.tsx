"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Calendar,
    MapPin,
    Ticket as TicketIcon,
    RefreshCw,
    Camera,
    History
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
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
      /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, []);

    async function onScanSuccess(decodedText: string) {
        // If it's a PASS AVENIR QR, it usually contains multiple lines
        // But our API expects the qrCode (UUID) which is in the last line(s)
        // Or it might be the whole string if it's a physical ticket

        let qrToken = decodedText;

        // Logic to extract UUID if it's the multi-line format
        if (decodedText.includes("CODE:")) {
            const lines = decodedText.split("\n");
            const codeLine = lines.find(l => l.startsWith("CODE:"));
            if (codeLine) {
                qrToken = codeLine.replace("CODE:", "").trim();
            }
        } else if (decodedText.includes("Code:")) {
            const lines = decodedText.split("\n");
            const codeLine = lines.find(l => l.startsWith("Code:"));
            if (codeLine) {
                qrToken = codeLine.replace("Code:", "").trim();
            }
        }

        if (isValidating) return;

        setIsValidating(true);
        // Pause scanner if possible or just ignore new scans

        try {
            const res = await fetch("/api/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrCode: qrToken }),
            });

            let data: any = {};
            try {
                data = await res.json();
            } catch (e) {
                data = { error: `Erreur serveur (${res.status})` };
            }

            const result: ScanResult = {
                success: res.ok,
                message: data.message || data.error || (res.ok ? "Billet validé" : "Erreur de validation"),
                ...data
            };

            setScanResult(result);
            setHistory(prev => [result, ...prev].slice(0, 10));

            if (res.ok) {
                toast.success(result.message);
                // Play success sound?
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Erreur lors de la validation");
        } finally {
            setIsValidating(false);
            // Resume scanner after 2 seconds
            setTimeout(() => setScanResult(null), 3000);
        }
    }

    function onScanFailure(error: any) {
        // console.warn(`Code scan error = ${error}`);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Scanner de Billets</h1>
                    <p className="text-slate-500">Validez les billets à l'entrée de l'événement</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <Camera className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Scanner Container */}
                <div className="md:col-span-3 space-y-4">
                    <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-square bg-slate-900 flex items-center justify-center">
                        <div id="reader" className="w-full h-full"></div>

                        {/* Overlay for validation result */}
                        {scanResult && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 z-10 ${scanResult.success ? "bg-emerald-600/90" : "bg-rose-600/90"
                                } text-white`}>
                                {scanResult.success ? (
                                    <CheckCircle2 className="w-20 h-20 mb-4 animate-bounce" />
                                ) : (
                                    <XCircle className="w-20 h-20 mb-4" />
                                )}
                                <h2 className="text-2xl font-bold mb-2">
                                    {scanResult.success ? "VALIDE" : "INVALIDE"}
                                </h2>
                                <p className="text-white/90 font-medium">{scanResult.message}</p>
                                {scanResult.ticketNumber && (
                                    <p className="mt-2 text-sm bg-white/20 px-3 py-1 rounded-full">{scanResult.ticketNumber}</p>
                                )}
                            </div>
                        )}

                        {isValidating && !scanResult && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
                                <RefreshCw className="w-12 h-12 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 leading-relaxed">
                            <p className="font-semibold">Conseil :</p>
                            Maintenez le billet stable et assurez-vous qu'il y a assez de lumière. Chaque billet est à <strong>usage unique</strong>.
                        </div>
                    </div>
                </div>

                {/* Info & History */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                            <History className="w-4 h-4" />
                            Historique récent
                        </div>

                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <History className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-xs text-slate-400">Aucun scan pour le moment</p>
                                </div>
                            ) : (
                                history.map((res, i) => (
                                    <div key={i} className={`p-3 rounded-2xl border ${res.success ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                                        } flex items-center gap-3 animate-in slide-in-from-right-2 duration-300`}>
                                        <div className={`p-1.5 rounded-lg ${res.success ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                            }`}>
                                            {res.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                {res.ticketNumber || "Billet inconnu"}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate">
                                                {res.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {scanResult?.holder && (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                Dernier Détenteur
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                                        {scanResult.holder.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{scanResult.holder}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{scanResult.event}</p>
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

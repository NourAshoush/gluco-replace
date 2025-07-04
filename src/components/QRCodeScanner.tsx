"use client";

import { BrowserQRCodeReader } from "@zxing/browser";
import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";

interface QRCodeScannerProps {
    onScanSuccess: (code: string) => void;
    onClose: () => void;
}

export default function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const codeReader = useRef<BrowserQRCodeReader | null>(null);

    useEffect(() => {
        const setupScanner = async () => {
            if (!videoRef.current) return;

            codeReader.current = new BrowserQRCodeReader();

            try {
                const controls = await codeReader.current.decodeFromVideoDevice(
                    undefined,
                    videoRef.current,
                    (result, error) => {
                        if (result) {
                            onScanSuccess(result.getText());
                            controls.stop();
                        }
                    }
                );
            } catch (err) {
                console.error("QR scan error:", err);
            }
        };

        setupScanner();

        return () => {
            codeReader.current?.decodeOnceFromVideoDevice();
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 relative" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-1 right-1 text-white text-3xl z-50 cursor-pointer transition-colors duration-200 hover:text-gray-300"
                aria-label="Close QR Scanner"
            >
                <MdClose />
            </button>
            <div className="flex items-center justify-center h-full">
                <div onClick={(e) => e.stopPropagation()} className="w-[360px] max-w-full">
                    <video ref={videoRef} className="rounded shadow w-full h-auto" />
                </div>
            </div>
        </div>
    );
}

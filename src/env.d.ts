// src/env.d.ts

export {};

declare global {
    interface Window {
        showToast: (message: string, isError?: boolean) => void;
    }
}
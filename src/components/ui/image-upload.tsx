"use client";

import { useState, useRef, useCallback } from "react";
import { normalizeImageUrl } from "@/lib/utils";

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}

/**
 * Image upload component with file picker and URL fallback.
 * Uploads to /api/upload (Vercel Blob) and returns the public URL.
 * Also accepts a manual URL as alternative input.
 */
export function ImageUpload({ label = "Изображение", value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Ошибка сети при загрузке файла");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleRemove() {
    onChange("");
    setError(null);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm text-ancient-aqua/70 font-medium">{label}</span>

      {/* Image preview */}
      {value && !uploading && (
        <div className="relative rounded-lg overflow-hidden border border-ancient-teal/20 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={normalizeImageUrl(value) ?? value}
            alt="Превью"
            className="w-full h-40 object-cover"
            onError={() => setError("Не удалось загрузить изображение по этому URL")}
          />
          <div className="absolute inset-0 bg-ancient-bg/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ancient-teal/20 border border-ancient-teal/30 text-ancient-teal hover:bg-ancient-teal/30 transition-colors"
            >
              Заменить
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      )}

      {/* Upload zone — shown when no image or uploading */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? "border-ancient-teal/60 bg-ancient-teal/10"
              : "border-ancient-teal/20 bg-ancient-surface/40 hover:border-ancient-teal/40 hover:bg-ancient-teal/5"
          }`}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4 gap-3">
            {uploading ? (
              <>
                <svg className="w-8 h-8 text-ancient-teal animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-ancient-teal">Загрузка...</span>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 text-ancient-teal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-ancient-teal hover:text-ancient-teal/80 font-medium underline underline-offset-2"
                  >
                    Выберите файл
                  </button>
                  <span className="text-sm text-ancient-aqua/40"> или перетащите сюда</span>
                </div>
                <span className="text-xs text-ancient-aqua/30">JPG, PNG, WEBP, GIF · до 5 МБ</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload button when image already set */}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-ancient-teal/60 hover:text-ancient-teal transition-colors underline underline-offset-2"
        >
          Загрузить другой файл
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* URL fallback input */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-ancient-teal/10" />
        <span className="text-xs text-ancient-aqua/30">или вставьте URL</span>
        <div className="h-px flex-1 bg-ancient-teal/10" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          setError(null);
          onChange(e.target.value);
        }}
        placeholder="https://example.com/image.png"
        disabled={uploading}
        className="w-full rounded-lg px-4 py-2.5 bg-[var(--glass-bg)] backdrop-blur-[12px] border border-[var(--glass-border)] text-[var(--text-base)] text-sm placeholder:text-ancient-aqua/30 transition-all duration-200 focus:outline-none focus:border-ancient-teal/50 input-focus-glow disabled:opacity-50"
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

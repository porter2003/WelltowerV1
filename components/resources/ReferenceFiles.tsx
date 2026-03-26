'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { recordReferenceFileUpload, deleteReferenceFile } from '@/app/(app)/resources/actions';
import type { ReferenceFile } from '@/lib/types';

type ReferenceFileWithUploader = ReferenceFile & {
  profiles: { first_name: string; last_name: string } | null;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReferenceFiles() {
  const [supabase] = useState(() => createClient());
  const [files, setFiles] = useState<ReferenceFileWithUploader[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFiles() {
    const { data } = await supabase
      .from('reference_files')
      .select('*, profiles(first_name, last_name)')
      .order('uploaded_at', { ascending: false });
    setFiles((data ?? []) as ReferenceFileWithUploader[]);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('reference-files')
      .upload(path, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    await recordReferenceFileUpload(file.name, path, file.size, file.type);
    await loadFiles();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleOpen(filePath: string, fileName: string) {
    const newTab = window.open('', '_blank');
    if (!newTab) return;

    const { data } = await supabase.storage
      .from('reference-files')
      .createSignedUrl(filePath, 3600);

    if (!data?.signedUrl) {
      newTab.close();
      return;
    }

    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    newTab.location.href = officeTypes.includes(ext)
      ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(data.signedUrl)}`
      : data.signedUrl;
  }

  async function handleDelete(fileId: string, filePath: string) {
    setDeletingId(fileId);
    setConfirmRemoveId(null);
    await deleteReferenceFile(fileId, filePath);
    await loadFiles();
    setDeletingId(null);
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-brand-100 flex items-center justify-between">
        <h2 className="font-semibold text-brand text-[11px] uppercase tracking-[0.5px]">Files</h2>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand/80 disabled:opacity-50 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm4.78 4.22a.75.75 0 0 0-1.06 0L5.97 7.97a.75.75 0 1 0 1.06 1.06l.72-.72v2.69a.75.75 0 0 0 1.5 0V8.31l.72.72a.75.75 0 1 0 1.06-1.06L8.78 6.22Z" clipRule="evenodd" />
            </svg>
            {uploading ? 'Uploading…' : 'Upload File'}
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <p className="text-sm text-text-muted py-4 text-center">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No reference files yet. Upload one to get started.</p>
        ) : (
          <ul className="divide-y divide-border">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-text-muted shrink-0">
                  <path fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 7.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm.75-3.25a.75.75 0 0 0 0 1.5H8A.75.75 0 0 0 8 6H5.75Z" clipRule="evenodd" />
                </svg>

                <button
                  onClick={() => handleOpen(f.file_path, f.file_name)}
                  className="text-sm font-medium text-brand hover:underline truncate max-w-[220px] sm:max-w-[400px] text-left"
                  title={f.file_name}
                >
                  {f.file_name}
                </button>

                <div className="flex items-center gap-3 ml-auto shrink-0">
                  {f.file_size !== null && (
                    <span className="text-xs text-text-muted hidden sm:inline">{formatBytes(f.file_size)}</span>
                  )}
                  {f.profiles && (
                    <span className="text-xs text-text-muted hidden sm:inline">
                      {f.profiles.first_name} {f.profiles.last_name}
                    </span>
                  )}
                  <span className="text-xs text-text-muted hidden sm:inline">
                    {new Date(f.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  {confirmRemoveId === f.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(f.id, f.file_path)}
                        disabled={deletingId === f.id}
                        className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === f.id ? 'Removing…' : 'Remove'}
                      </button>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="px-2 py-0.5 text-xs border border-border rounded text-text-muted hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemoveId(f.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

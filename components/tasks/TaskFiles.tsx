'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { recordFileUpload, deleteTaskFile } from '@/app/(app)/deals/actions';
import type { TaskFile } from '@/lib/types';

type Props = {
  taskId: string;
  isAdmin: boolean;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskFiles({ taskId, isAdmin }: Props) {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFiles() {
    const { data } = await supabase
      .from('task_files')
      .select('*')
      .eq('task_id', taskId)
      .order('uploaded_at', { ascending: false });
    setFiles((data ?? []) as TaskFile[]);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${taskId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('task-files')
      .upload(path, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    await recordFileUpload(taskId, file.name, path, file.size, file.type);
    await loadFiles();
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDownload(filePath: string, fileName: string) {
    const { data } = await supabase.storage
      .from('task-files')
      .createSignedUrl(filePath, 3600);

    if (data?.signedUrl) {
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  async function handleDelete(fileId: string, filePath: string) {
    setDeletingId(fileId);
    await deleteTaskFile(fileId, filePath);
    await loadFiles();
    setDeletingId(null);
  }

  return (
    <div className="mt-3 pl-8 border-t border-border pt-3">
      {loading ? (
        <p className="text-xs text-text-muted py-1">Loading files…</p>
      ) : files.length > 0 ? (
        <ul className="space-y-1.5 mb-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              {/* File icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-text-muted shrink-0">
                <path fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 7.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm.75-3.25a.75.75 0 0 0 0 1.5H8A.75.75 0 0 0 8 6H5.75Z" clipRule="evenodd" />
              </svg>

              {/* File name — download on click */}
              <button
                onClick={() => handleDownload(f.file_path, f.file_name)}
                className="text-sm text-brand hover:underline truncate max-w-[180px] sm:max-w-[300px] text-left"
                title={f.file_name}
              >
                {f.file_name}
              </button>

              {/* Size + date */}
              {f.file_size !== null && (
                <span className="text-xs text-text-muted shrink-0">{formatBytes(f.file_size)}</span>
              )}
              <span className="text-xs text-text-muted shrink-0">
                {new Date(f.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>

              {/* Delete (admin only) */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(f.id, f.file_path)}
                  disabled={deletingId === f.id}
                  className="ml-auto text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors shrink-0"
                  title="Remove file"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-text-muted py-1 mb-2">No files attached yet.</p>
      )}

      {/* Upload button */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 disabled:opacity-50 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm4.78 4.22a.75.75 0 0 0-1.06 0L5.97 7.97a.75.75 0 1 0 1.06 1.06l.72-.72v2.69a.75.75 0 0 0 1.5 0V8.31l.72.72a.75.75 0 1 0 1.06-1.06L8.78 6.22Z" clipRule="evenodd" />
        </svg>
        {uploading ? 'Uploading…' : 'Attach file'}
      </button>
    </div>
  );
}

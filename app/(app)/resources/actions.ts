'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function recordReferenceFileUpload(
  fileName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('reference_files').insert({
    file_name: fileName,
    file_path: filePath,
    file_size: fileSize,
    mime_type: mimeType,
    uploaded_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/resources');
}

export async function deleteReferenceFile(fileId: string, filePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabaseAdmin.storage.from('reference-files').remove([filePath]);

  const { error } = await supabase.from('reference_files').delete().eq('id', fileId);
  if (error) throw new Error(error.message);

  revalidatePath('/resources');
}

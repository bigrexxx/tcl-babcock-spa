import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // ~10 years

export async function listSiteImages() {
  const { data, error } = await supabase
    .from("site_images")
    .select("key,url,storage_path,updated_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function snapshotCurrent(key: string) {
  const { data: row } = await supabase
    .from("site_images")
    .select("url,storage_path")
    .eq("key", key)
    .maybeSingle();
  if (row?.url) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("site_image_versions").insert({
      key, url: row.url, storage_path: row.storage_path ?? null, created_by: user?.id,
    });
  }
}

export async function adminUploadSiteImage(payload: {
  key: string;
  filename: string;
  contentType: string;
  dataBase64: string;
}) {
  const ext = payload.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const safeKey = payload.key.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const path = `${safeKey}/${Date.now()}.${ext}`;
  const bytes = Uint8Array.from(atob(payload.dataBase64), (c) => c.charCodeAt(0));
  await snapshotCurrent(payload.key);
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: payload.contentType, upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data: signed, error: sErr } = await supabase.storage
    .from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (sErr || !signed) throw new Error(sErr?.message || "Failed to sign URL");
  const { data: { user } } = await supabase.auth.getUser();
  const { error: dbErr } = await supabase
    .from("site_images")
    .upsert({ key: payload.key, url: signed.signedUrl, storage_path: path, updated_by: user?.id });
  if (dbErr) throw new Error(dbErr.message);
  return { ok: true, url: signed.signedUrl, key: payload.key, path };
}

export async function adminSetSiteImageUrl(key: string, url: string) {
  await snapshotCurrent(key);
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("site_images")
    .upsert({ key, url, storage_path: null, updated_by: user?.id });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminDeleteSiteImage(key: string) {
  await snapshotCurrent(key);
  const { error } = await supabase.from("site_images").delete().eq("key", key);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminListImageVersions(key: string, limit = 20) {
  const { data: rows, error } = await supabase
    .from("site_image_versions")
    .select("id,url,storage_path,created_at")
    .eq("key", key)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return rows ?? [];
}

export async function adminRestoreImageVersion(key: string, versionId: string) {
  const { data: v, error: vErr } = await supabase
    .from("site_image_versions")
    .select("url,storage_path,key")
    .eq("id", versionId)
    .maybeSingle();
  if (vErr) throw new Error(vErr.message);
  if (!v || v.key !== key) throw new Error("Version not found");
  await snapshotCurrent(key);
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("site_images").upsert({
    key, url: v.url, storage_path: v.storage_path, updated_by: user?.id,
  });
  if (error) throw new Error(error.message);
  return { ok: true, url: v.url };
}

export async function adminUndoLastImageChange(key: string) {
  const { data: rows, error } = await supabase
    .from("site_image_versions")
    .select("id,url,storage_path,created_at")
    .eq("key", key)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const v = rows?.[0];
  if (!v) return { ok: false, reason: "No previous version to undo" } as const;
  const { data: { user } } = await supabase.auth.getUser();
  const { error: upErr } = await supabase.from("site_images").upsert({
    key, url: v.url, storage_path: v.storage_path, updated_by: user?.id,
  });
  if (upErr) throw new Error(upErr.message);
  await supabase.from("site_image_versions").delete().eq("id", v.id);
  return { ok: true, url: v.url } as const;
}

export async function adminUploadTeamPhoto(payload: {
  filename: string;
  contentType: string;
  dataBase64: string;
}) {
  const ext = payload.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `team/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Uint8Array.from(atob(payload.dataBase64), (c) => c.charCodeAt(0));
  const { error: upErr } = await supabase.storage
    .from(BUCKET).upload(path, bytes, { contentType: payload.contentType, upsert: false });
  if (upErr) throw new Error(upErr.message);
  const { data: signed, error: sErr } = await supabase.storage
    .from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (sErr || !signed) throw new Error(sErr?.message || "Failed to sign URL");
  return { url: signed.signedUrl, path };
}

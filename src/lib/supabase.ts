import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  metric: string;
  image_url: string | null;
  case_study_url: string | null;
  sort_order: number;
  created_at: string;
}

export type ProjectInput = Omit<Project, "id" | "created_at">;

// ── Auth ───────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

// ── Proyectos (lectura) ────────────────────────────────────────────────────

/** Trae todos los proyectos ordenados por `order` ASC */
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }
  return data ?? [];
}

// ── Proyectos (escritura) ──────────────────────────────────────────────────

export async function createProject(
  data: ProjectInput
): Promise<{ project: Project | null; error: string | null }> {
  const { data: project, error } = await supabase
    .from("projects")
    .insert(data)
    .select()
    .single();

  if (error) return { project: null, error: error.message };
  return { project, error: null };
}

export async function updateProject(
  id: string,
  data: Partial<ProjectInput>
): Promise<{ project: Project | null; error: string | null }> {
  const { data: project, error } = await supabase
    .from("projects")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { project: null, error: error.message };
  return { project, error: null };
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Error deleting project:", error.message);
    return false;
  }
  return true;
}

// ── Site Settings ─────────────────────────────────────────────────────────

export interface SiteLinks {
  cta_label: string;
  cta_href: string;
  behance_url: string;
  behance_label: string;
  linkedin_url: string;
  linkedin_label: string;
}

export interface StyleSettings {
  fontHeading: string;
  fontBody: string;
  colorBg: string;
  colorText: string;
  colorMuted: string;
  colorLight: string;
}

export type ExperienceEntry = { company: string; role: string };

export interface AboutData {
  title: string;
  description: string;
  image_url: string;
  experience: ExperienceEntry[];
}

export async function getSetting(key: "hero_images"): Promise<string[] | null>;
export async function getSetting(key: "about"): Promise<AboutData | null>;
export async function getSetting(key: "style"): Promise<StyleSettings | null>;
export async function getSetting(key: "brands"): Promise<string[] | null>;
export async function getSetting(key: "services"): Promise<string[] | null>;
export async function getSetting(key: "links"): Promise<SiteLinks | null>;
export async function getSetting(key: string): Promise<unknown> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return null;
  return data.value;
}

export async function setSetting(key: string, value: unknown): Promise<boolean> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value });
  if (error) {
    console.error("Error saving setting:", error.message);
    return false;
  }
  return true;
}

export async function uploadSettingImage(
  file: File,
  name: string
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `settings/${name}.${ext}`;
  const { error } = await supabase.storage
    .from("portfolio")
    .upload(path, file, { upsert: true });
  if (error) {
    console.error("Error uploading setting image:", error.message);
    return null;
  }
  const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
  return data.publicUrl;
}

// ── Mensajes de contacto ──────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export async function sendContactMessage(
  name: string,
  email: string,
  message: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });
  if (error) return { error: error.message };
  return { error: null };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  return !error;
}

// ── Storage ────────────────────────────────────────────────────────────────

/** Sube una imagen al bucket "projects" y devuelve la URL pública */
export async function uploadProjectImage(
  file: File,
  projectId: string
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${projectId}.${ext}`;

  const { error } = await supabase.storage
    .from("portfolio")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
  return data.publicUrl;
}

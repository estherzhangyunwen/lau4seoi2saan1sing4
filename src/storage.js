import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_DATA_FILE = path.join(process.cwd(), "data", "posts.json");

async function ensureDataFile(dataFilePath) {
  const directory = path.dirname(dataFilePath);
  await mkdir(directory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await writeFile(dataFilePath, "[]", "utf8");
  }
}

export async function listPosts(dataFilePath = DEFAULT_DATA_FILE) {
  await ensureDataFile(dataFilePath);
  const raw = await readFile(dataFilePath, "utf8");
  return JSON.parse(raw);
}

export async function createPost(post, dataFilePath = DEFAULT_DATA_FILE) {
  const posts = await listPosts(dataFilePath);
  posts.unshift(post);
  await writeFile(dataFilePath, JSON.stringify(posts, null, 2), "utf8");
  return post;
}

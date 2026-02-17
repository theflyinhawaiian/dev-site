import mysql, { RowDataPacket, Connection } from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';

function getSecret(path: string | undefined, fallback: string): string {
  if (path && existsSync(path)) {
    return readFileSync(path, 'utf8').trim();
  }
  return fallback;
}

export const dbConfig = {
  host: process.env.MYSQL_HOST?.split(':')[0] || 'mysql',
  port: parseInt(process.env.MYSQL_HOST?.split(':')[1] || '3306'),
  user: process.env.MYSQL_USER || 'devsite_user',
  password: getSecret(process.env.MYSQL_PASSWORD_FILE, ''),
  database: process.env.MYSQL_DATABASE || 'devsite_db',
  connectTimeout: 10000,
};

interface ProjectRaw extends RowDataPacket {
  project_id: number;
  name: string;
  description: string;
  project_link1: string;
  project_link1_title: string;
  project_link2: string;
  project_link2_title: string;
  hosted_link: string;
  hosted_title: string;
}

interface Association extends RowDataPacket {
  projectName: string;
  tagName: string;
  tagSlug: string;
  postfix: string;
}

interface ProjectLink {
  title: string;
  link: string;
}

interface Tag {
  slug: string;
  name: string;
  postfix: string;
}

export interface Project {
  name: string;
  description: string;
  projectLinks: ProjectLink[];
  tags: Tag[];
}

export type Result<T> =
| { success: true; data: T }
| { success: false }

interface JobRaw extends RowDataPacket {
  job_id: number;
  company_name: string;
  title: string;
  description: string;
  logo_filename: string;
}

interface JobAssociation extends RowDataPacket {
  companyName: string;
  tagName: string;
  tagSlug: string;
  tagPostfix: string;
}

export interface Job {
  companyName: string;
  title: string;
  description: string;
  logoFilename: string;
  tags: Tag[];
}

export async function getConnection(): Promise<Connection> {
  return mysql.createConnection(dbConfig);
}

export async function getProjects(): Promise<Result<Project[]>> {
  let connection;
  try {
    connection = await getConnection();

    const projectTags : Association[] = (await connection.query<Association[]>(
      `SELECT projects.name AS projectName, tags.name AS tagName, tags.slug as tagSlug, tags.postfix as tagPostfix 
       FROM projects 
       INNER JOIN project_tags ON projects.project_id = project_tags.project_id 
       INNER JOIN tags ON tags.tag_id = project_tags.tag_id;`))[0];

    const mapping : Record <string, Tag[]>= {};
    for(var pt of projectTags){
      const tag = { name: pt.tagName, slug: pt.tagSlug, postfix: pt.tagPostfix };
      if(!mapping[pt.projectName]){
        mapping[pt.projectName] = [tag]
      }else{
        mapping[pt.projectName].push(tag);
      }
    }

    const projects : Project[] = (await connection.query<ProjectRaw[]>("SELECT * FROM projects;"))[0].map(x => ({
      name: x.name,
      description: x.description,
      projectLinks: [{ title: x.project_link1_title, link: x.project_link1 }, { title: x.project_link2_title, link: x.project_link2 }, { title: x.hosted_title, link: x.hosted_link }],
      tags: mapping[x.name]
    }));

    return {
      success: true,
      data: projects
    }
  } catch (error) {
    const err = error as Error;
    return {
      success: false
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function getJobs(): Promise<Result<Job[]>> {
  let connection;
  try {
    connection = await getConnection();

    const jobTags : JobAssociation[] = (await connection.query<JobAssociation[]>(
      `SELECT jobs.company_name AS companyName, tags.name AS tagName, tags.slug as tagSlug, tags.postfix as tagPostfix
       FROM jobs
       INNER JOIN job_tags ON jobs.job_id = job_tags.job_id
       INNER JOIN tags ON tags.tag_id = job_tags.tag_id;`))[0];

    const mapping : Record<string, Tag[]> = {};
    for(var jt of jobTags){
      const tag = { name: jt.tagName, slug: jt.tagSlug, postfix: jt.tagPostfix };
      if(!mapping[jt.companyName]){
        mapping[jt.companyName] = [tag]
      }else{
        mapping[jt.companyName].push(tag);
      }
    }

    const jobs : Job[] = (await connection.query<JobRaw[]>("SELECT * FROM jobs;"))[0].map(x => ({
      companyName: x.company_name,
      title: x.title,
      description: x.description,
      logoFilename: x.logo_filename,
      tags: mapping[x.company_name] || []
    }));

    return {
      success: true,
      data: jobs
    }
  } catch (error) {
    return {
      success: false
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function getJob(id: number): Promise<Result<Job>> {
  let connection;
  try {
    connection = await getConnection();

    const jobs = (await connection.query<JobRaw[]>(
      "SELECT * FROM jobs WHERE job_id = ?;", [id]))[0];

    if (jobs.length === 0) {
      return { success: false };
    }

    const x = jobs[0];

    const jobTags: JobAssociation[] = (await connection.query<JobAssociation[]>(
      `SELECT tags.name AS tagName, tags.slug AS tagSlug, tags.postfix AS tagPostfix
       FROM job_tags
       INNER JOIN tags ON tags.tag_id = job_tags.tag_id
       WHERE job_tags.job_id = ?;`, [x.job_id]))[0];

    return {
      success: true,
      data: {
        companyName: x.company_name,
        title: x.title,
        description: x.description,
        logoFilename: x.logo_filename,
        tags: jobTags.map(t => ({ name: t.tagName, slug: t.tagSlug, postfix: t.tagPostfix }))
      }
    };
  } catch (error) {
    return { success: false };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
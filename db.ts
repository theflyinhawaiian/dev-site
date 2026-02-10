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
  name: string;
  description: string;
  projectLink1: string;
  projectLink1Title: string;
  projectLink2: string;
  projectLink2Title: string;
  hostedLink: string;
  hostedLinkTitle: string;
}

interface Association extends RowDataPacket {
  projectName: string;
  tagName: string;
}

interface ProjectLink {
  title: string;
  link: string;
}

interface Tag {
  slug: string;
  name: string;
}

export interface Project {
  name: string;
  description: string;
  projectLinks: ProjectLink[];
  hostedLink?: ProjectLink;
  tags: Tag[];
}

export type Result<T> =
| { success: true; data: T }
| { success: false }

interface JobRaw extends RowDataPacket {
  company_name: string;
  title: string;
  description: string;
  logo_filename: string;
}

interface JobAssociation extends RowDataPacket {
  companyName: string;
  tagName: string;
  tagSlug: string;
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
      `SELECT projects.name AS projectName, tags.name AS tagName, tags.slug as tagSlug 
       FROM projects 
       INNER JOIN project_tags ON projects.project_id = project_tags.project_id 
       INNER JOIN tags ON tags.tag_id = project_tags.tag_id;`))[0];

    const mapping : Record <string, Tag[]>= {};
    for(var pt of projectTags){
      const tag = { name: pt.tagName, slug: pt.tagSlug };
      if(!mapping[pt.projectName]){
        mapping[pt.projectName] = [tag]
      }else{
        mapping[pt.projectName].push(tag);
      }
    }

    const projects : Project[] = (await connection.query<ProjectRaw[]>("SELECT * FROM projects;"))[0].map(x => ({
      name: x.name,
      description: x.description,
      projectLinks: [{ title: x.projectLink1Title, link: x.projectLink1 }, { title: x.projectLink2Title, link: x.projectLink2 }],
      hostedLink: { title: x.hostedLinkTitle, link: x.hostedLink },
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
      `SELECT jobs.company_name AS companyName, tags.name AS tagName, tags.slug as tagSlug
       FROM jobs
       INNER JOIN job_tags ON jobs.job_id = job_tags.job_id
       INNER JOIN tags ON tags.tag_id = job_tags.tag_id;`))[0];

    const mapping : Record<string, Tag[]> = {};
    for(var jt of jobTags){
      const tag = { name: jt.tagName, slug: jt.tagSlug };
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
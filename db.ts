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
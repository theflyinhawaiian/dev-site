export interface Project {
  name: string;
  description: string;
  projectLinks: ProjectLink[];
  hostedLink?: ProjectLink;
  tags: Tag[];
}

interface ProjectLink {
  title: string;
  link: string;
}

export interface Tag {
  slug: string;
  name: string;
}

export interface Job {
  companyName: string;
  title: string;
  description: string;
  logoFilename: string;
  tags: Tag[];
}


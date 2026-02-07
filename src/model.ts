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

interface Tag {
  slug: string;
  name: string;
}


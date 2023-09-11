enum SkillType {
  Backend = "Backend",
  Frontend = "Frontend",
  ProgrammingLanguages = "Programming languages",
  Database = "Database",
  Mobile = "Mobile",
  Cloud = "Cloud",
  DevOps = "DevOps",
  Research = "Research",
  ProjectManagement = "Project management",
  Operations = "Operations",
  Communications = "Communications",
  Business = "Business",
}

interface Skill {
  id: string;
  name: string;
  group: SkillType;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  skills: Skill[];
  description: string;
  from: string;
  to?: string;
}

const AspNetMvc4: Skill = {
  id: "asp-net-mvc-4",
  name: "ASP.NET MVC 4",
  group: SkillType.Backend,
};

const Postgres: Skill = {
  id: "postgres",
  name: "PostgreSQL",
  group: SkillType.Database,
};

const CSharp: Skill = {
  id: "c-sharp",
  name: "C#",
  group: SkillType.ProgrammingLanguages,
};

const ArangoDB: Skill = {
  id: "arango-db",
  name: "ArangoDB",
  group: SkillType.Database,
};

const NodeJS: Skill = {
  id: "node-js",
  name: "NodeJS",
  group: SkillType.Backend,
};

export const experience: ExperienceEntry[] = [
  {
    company: "U-centrix",
    role: "Software developer",
    skills: [Postgres, NodeJS, ArangoDB],
    description:
      "<p>I started working as a backend engineer, before expanding into frontend development, mobile app development, cloud, and DevOps. I also did a lot of technical research to improve the products of the company and to pass the knowledge to my coworkers. Eventually, I became a tech lead and a project manager on 4 different projects, related to tourism, the gaming industry, and logistics. I helped improve project management, operations, and communications while learning about the business side of the software world. The largest team that I led was comprised of 7 people.</p>",
    from: "October 2017",
    to: "October 2021",
  },
  {
    company: "FERI Maribor",
    role: "ASP.NET developer",
    skills: [AspNetMvc4, CSharp],
    description:
      "<p>I have developed a web application using .NET for importing, creating and tracking records, articles and books.</p>",
    from: "June 2017",
    to: "October 2017",
  },
];

export interface SkillGroup {
  type: SkillType;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = experience.reduce<SkillGroup[]>(
  (acc, curr) => {
    curr.skills.forEach((skill) => {
      const group = acc.find((group) => group.type === skill.group);

      if (group) {
        group.skills.push(skill);
      } else {
        acc.push({ type: skill.group, skills: [skill] });
      }
    });

    return acc;
  },
  [],
);

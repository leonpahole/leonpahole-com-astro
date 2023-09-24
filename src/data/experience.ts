enum SkillType {
  Backend = "Backend",
  Frontend = "Frontend",
  ProgrammingLanguages = "Programming languages",
  Database = "Database",
  Mobile = "Mobile",
  Cloud = "Cloud",
  DevOps = "DevOps",
  Architecture = "Architecture",
  Research = "Research",
  ManagementAndLeadership = "Management and leadership",
  SoftSkills = "Soft skills",
  Business = "Business",
}

interface Skill {
  id: string;
  name: string;
  group: SkillType;
}

export interface CompanyEntry {
  name: string;
  from: string;
  to?: string;
  roles: CompanyRole[];
}

export interface CompanyRole {
  name: string;
  skills: Skill[];
  summary: string;
  bulletPoints: string[];
  from: string;
  to?: string;
}

/* databases */

const Postgres: Skill = {
  id: "postgres",
  name: "PostgreSQL",
  group: SkillType.Database,
};

const ArangoDB: Skill = {
  id: "arango-db",
  name: "ArangoDB",
  group: SkillType.Database,
};

/* programming languages */

const CSharp: Skill = {
  id: "c-sharp",
  name: "C#",
  group: SkillType.ProgrammingLanguages,
};

const HTML: Skill = {
  id: "html",
  name: "HTML",
  group: SkillType.ProgrammingLanguages,
};

const CSS: Skill = {
  id: "css",
  name: "CSS",
  group: SkillType.ProgrammingLanguages,
};

const JavaScript: Skill = {
  id: "javascript",
  name: "JavaScript",
  group: SkillType.ProgrammingLanguages,
};

const TypeScript: Skill = {
  id: "typescript",
  name: "TypeScript",
  group: SkillType.ProgrammingLanguages,
};

const Java: Skill = {
  id: "java",
  name: "Java",
  group: SkillType.ProgrammingLanguages,
};

const Kotlin: Skill = {
  id: "kotlin",
  name: "Kotlin",
  group: SkillType.ProgrammingLanguages,
};

const Bash: Skill = {
  id: "bash",
  name: "Bash",
  group: SkillType.ProgrammingLanguages,
};

/* backend frameworks */

const AspNetMvc4: Skill = {
  id: "asp-net-mvc-4",
  name: "ASP.NET MVC 4",
  group: SkillType.Backend,
};

const NodeJS: Skill = {
  id: "node-js",
  name: "NodeJS",
  group: SkillType.Backend,
};

const NetCore: Skill = {
  id: "net-core",
  name: ".NET Core",
  group: SkillType.Backend,
};

const SpringBoot: Skill = {
  id: "spring-boot",
  name: "Spring Boot",
  group: SkillType.Backend,
};

/* frontend frameworks */

const React: Skill = {
  id: "react",
  name: "React",
  group: SkillType.Frontend,
};

const ReactNative: Skill = {
  id: "react-native",
  name: "React Native",
  group: SkillType.Mobile,
};

const Angular: Skill = {
  id: "angular",
  name: "Angular",
  group: SkillType.Frontend,
};

const Svelte: Skill = {
  id: "svelte",
  name: "Svelte",
  group: SkillType.Frontend,
};

const Xamarin: Skill = {
  id: "xamarin",
  name: "Xamarin",
  group: SkillType.Mobile,
};

const NextJS: Skill = {
  id: "next-js",
  name: "NextJS",
  group: SkillType.Frontend,
};

/* cloud */

const AWS: Skill = {
  id: "aws",
  name: "AWS",
  group: SkillType.Cloud,
};

const Azure: Skill = {
  id: "azure",
  name: "Azure",
  group: SkillType.Cloud,
};

/* devops */

const Docker: Skill = {
  id: "docker",
  name: "Docker",
  group: SkillType.DevOps,
};

const Traefik: Skill = {
  id: "traefik",
  name: "Traefik",
  group: SkillType.DevOps,
};

const Ansible: Skill = {
  id: "ansible",
  name: "Ansible",
  group: SkillType.DevOps,
};

const Terraform: Skill = {
  id: "terraform",
  name: "Terraform",
  group: SkillType.DevOps,
};

/* architecture */

const BackendArchitecture: Skill = {
  id: "backend-architecture",
  name: "Backend architecture",
  group: SkillType.Architecture,
};

const FrontendArchitecture: Skill = {
  id: "frontend-architecture",
  name: "Frontend architecture",
  group: SkillType.Architecture,
};

const WritingProposalDocuments: Skill = {
  id: "writing-proposal-documents",
  name: "Writing proposal documents",
  group: SkillType.Architecture,
};

const Estimations: Skill = {
  id: "estimations",
  name: "Estimations",
  group: SkillType.Architecture,
};

/* soft skills */

const Mentoring: Skill = {
  id: "mentoring",
  name: "Mentoring",
  group: SkillType.SoftSkills,
};

const ClientCommunication: Skill = {
  id: "client-communication",
  name: "Client communication",
  group: SkillType.SoftSkills,
};

const ProductDemos: Skill = {
  id: "product-demos",
  name: "Product demos",
  group: SkillType.SoftSkills,
};

const ProductOwnership: Skill = {
  id: "product-ownerhsip",
  name: "Product ownership",
  group: SkillType.SoftSkills,
};

const TechnicalInterviewing: Skill = {
  id: "technical-interviewing",
  name: "Technical interviewing",
  group: SkillType.SoftSkills,
};

const PublicSpeaking: Skill = {
  id: "public-speaking",
  name: "Public speaking",
  group: SkillType.SoftSkills,
};

/* management */

const ProjectManagement: Skill = {
  id: "mentoring",
  name: "Mentoring",
  group: SkillType.ManagementAndLeadership,
};

const TeamLeadership: Skill = {
  id: "team-leadership",
  name: "Team leadership",
  group: SkillType.ManagementAndLeadership,
};

export const experience: CompanyEntry[] = [
  {
    name: "Povio inc.",
    from: "October 2021",
    to: undefined,
    roles: [
      {
        name: "Junior devops engineer and architect",
        skills: [
          BackendArchitecture,
          FrontendArchitecture,
          AWS,
          Estimations,
          WritingProposalDocuments,
        ],
        summary:
          "I am helping improve cloud deployment processes, and architecting solutions for new projects.",
        bulletPoints: [
          "Helping improve cloud deployment processes.",
          "Jumping into projects of various tech stacks that need assistance, and helping them get back on track.",
          "Writing estimations and proposal documents for new projects.",
        ],
        from: "April 2023",
        to: "September 2023",
      },
      {
        name: "Frontend academy lead",
        skills: [Mentoring, PublicSpeaking],
        summary:
          "Designed a curriculum for a frontend academy, performed lectures, and mentored students on a comprehensive internship.",
        bulletPoints: [
          "Communicated with the recruitment team to promote the academy, and to execute it in a quality way.",
          "Promoted the academy in a public speaking event, which granted us more applicants.",
          "Perofmed lectures, which focused not only on technical skills, but also on soft skills.",
          "Reviewed homeworks, provided feedback for students on 1:1 meetings, and helped them improve.",
          "Chose the best students for the internship.",
          "Together with my team, we designed the internship to mimic a real-life project.",
          "Chose the best students to join the company.",
        ],
        from: "April 2023",
        to: "September 2023",
      },
      {
        name: "Frontend developer",
        skills: [React, NextJS, Svelte, TypeScript, TeamLeadership],
        summary:
          "Frontend wasn't my strong suit before joining Povio, but I was able to quickly learn and adapt to the new technologies, and deliver value to the team.",
        bulletPoints: [
          "Worked on 5 projects in 3 different technologies.",
          "Set up a project from scratch, and led a small frontend team.",
          "I learned Svelte in 3 hours, and was able to deliver the value to the client on day one.",
          "Currently working on an external project, where I communicate with the client directly. I save them time by using written communication, and by understanding the requirements without the need for a meeting.",
        ],
        from: "October 2021",
      },
    ],
  },
  {
    name: "U-centrix",
    from: "October 2017",
    to: undefined,
    roles: [
      {
        name: "[Confidential project] mobile app developer",
        skills: [ReactNative, FrontendArchitecture],
        summary:
          "I took ownership of delivering a mobile app in React native for a large project.",
        bulletPoints: [
          "I set up the app from scratch, and am working alone on it, while communicating with over 7 other team members.",
          "I have saved time of several team members by understanding the requirements without the need for a meeting.",
          "Despite being fully remote, the team trusts me with the delivery, because I diligently and independently communicate in written text.",
          "The app is functional on both iOS and Android.",
          "My full-stack background allows me to brainstorm solutions with my team members on the backend.",
        ],
        from: "February 2023",
      },
      {
        name: "Technical mentor, advisor, and architect",
        skills: [FrontendArchitecture, BackendArchitecture, Mentoring],
        summary:
          "I provide guidance on finding solutions to technical and non-technical problems, and do hands-on assistance whenever needed.",
        bulletPoints: [
          "1:1 mentoring, pair programming and debugging, while passing on my knowledge.",
          "Jumping into project code and helping solve the most urgent bugs and pressing issues to put the project back on track.",
          "Architecting solutions at the start of the project, which helps the team start the project.",
          "Providing feedback and improvements suggestions for team allocation and company structure, which optimizes efficiency and saves money.",
        ],
        from: "October 2021",
      },
      {
        name: "[Confidential project] Backend developer",
        skills: [
          WritingProposalDocuments,
          BackendArchitecture,
          NetCore,
          Angular,
        ],
        summary:
          "I helped kickstart a microservice backend project for a large enterprise.",
        bulletPoints: [
          "Architected the backend solution from scratch and wrote a detailed proposal doc, which helped the client gain trust in our company, and provided the team with a specification to lean on.",
          "Broke down tasks, which allowed the client full visibility into the project.",
          "Implemented the backend solution in .NET., adapting my code to the company's coding standards and template.",
          "Onboarded new team members after I delivered the initial solution.",
          "Implemented a quick prototype of the frontend in Angular.",
        ],
        from: "December 2023",
        to: "April 2023",
      },
      {
        name: "Project manager and team lead",
        skills: [
          ProjectManagement,
          TeamLeadership,
          FrontendArchitecture,
          BackendArchitecture,
          ClientCommunication,
        ],
        summary:
          "I stepped up during a time that my team needed it the most. This was without question the greatest learning experience of my life so far.",
        bulletPoints: [
          "Initially I made a lot of mistakes, but with the help of my kind teammates, I reflected, learned and improved.",
          "I eventually gained the trust of my team, and we started working together as a well-oiled machine.",
          "I expanded to manage other projects, and eventually led 4 of them, with the largest one having 7 team members.",
          "I also served as a tech lead for all of the projects, architecting solutions, helping my team members, and writing code.",
          "Participated in meetings with clients, where I learned how to communicate with them, and how to manage their expectations.",
          "Learned about business side of engineering, and the cost vs. benefit of certain decisions.",
          "After nearly burning out, I decided to step down from the role, as the company was out of hard times, and I focused on my health, productivity and slowly transitioning back to a more technical role.",
        ],
        from: "November 2020",
        to: "June 2021",
      },
      {
        name: "[Omniopti] Full-stack web developer",
        skills: [
          NetCore,
          Angular,
          ReactNative,
          ClientCommunication,
          BackendArchitecture,
          ProductDemos,
          ProductOwnership,
          Docker,
          Xamarin,
        ],
        summary:
          "I took ownership of a logistics product, communicating with the end users, collecting their feedback, and launching the product into production. In the following years, I then launched 2 more products, participated in multiple product demos, and became a product owner.",
        bulletPoints: [
          "Architected solutions for all products, and wrote the code for them.",
          "Collected feedback from end users, and implemented it into the products.",
          "Participated in product demos, where I learned how to communicate with end users and show the value that the product brings.",
          "Wrote user instructions and answered product related questions.",
          "Adviced the company on how to streamline the deployment process, which saved the team multiple hours on each deployment.",
        ],
        from: "August 2020",
        to: "April 2023",
      },
      {
        name: "Devops and cloud engineer",
        skills: [Docker, Ansible, Traefik, Terraform, AWS, Azure, Bash],
        summary:
          "What initially started as research eventually turned into me optimizing and streamlining deployment processes of the entire company, saving all the developers countless hours on deployments. I also optimized cloud infrastructure to save money.",
        bulletPoints: [
          "Researched and implemented a new deployment process, which saved the team multiple hours on each deployment.",
          "Researched and implemented a new cloud infrastructure, which saved the company money.",
          "Came up with my own solutions for devops problems, which better suited the company's needs.",
          "Deployed a live-video solution that hosted over 1000 concurrent users.",
        ],
        from: "March 2018",
        to: "September 2021",
      },
      {
        name: "Full stack web developer",
        skills: [
          NodeJS,
          SpringBoot,
          Angular,
          Java,
          Kotlin,
          ArangoDB,
          Postgres,
          BackendArchitecture,
          FrontendArchitecture,
          TechnicalInterviewing,
        ],
        summary:
          "During the time I was employed full-time, I served as a full-stack web developer for multiple projects, which spanned various domains and technology stacks.",
        bulletPoints: [
          "Architected solutions for all projects, and wrote the code for them.",
          "Onboarded on a complex project and eventually took ownership of it.",
        ],
        from: "March 2018",
        to: "September 2021",
      },
    ],
  },
  {
    name: "FERI Maribor",
    from: "June 2017",
    to: "October 2017",
    roles: [
      {
        name: "ASP.NET developer",
        skills: [AspNetMvc4, CSharp, JavaScript, CSS, HTML],
        summary:
          "Wrote a full-stack web application using ASP.NET, JS, CSS and HTML for tracking records, articles and books.",
        bulletPoints: [
          "I worked in a team of three.",
          "I took ownership of developing a full-stack web application, which allowed other team members to focus on their respective tasks.",
          "I saved our client's time by coming up with the design of the application.",
        ],
        from: "June 2017",
        to: "October 2017",
      },
    ],
  },
];

export interface SkillGroup {
  type: SkillType;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = experience
  .reduce<SkillGroup[]>((acc, curr) => {
    curr.roles.forEach((exp) => {
      exp.skills.forEach((skill) => {
        const group = acc.find((group) => group.type === skill.group);

        if (group) {
          if (!group.skills.find((s) => s.id === skill.id)) {
            group.skills.push(skill);
          }
        } else {
          acc.push({ type: skill.group, skills: [skill] });
        }
      });
    });

    return acc;
  }, [])
  .sort((a, b) => b.skills.length - a.skills.length);

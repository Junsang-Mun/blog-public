<script>
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Card from "$lib/components/Card.svelte";

    const experience = [
        {
            role: "Doctor",
            organization: "Rhodos Island",
            period: "Dec 1096 - Present",
            description: [
                "Scaled tactical response teams in volatile environments under extreme uncertainty.",
                "Managed diverse talent across species and backgrounds to deliver mission-critical outcomes.",
                "Built innovative frameworks for infection control and operator development in a post-crisis world.",
            ],
            logo: "https://noonnucc-production.sfo2.cdn.digitaloceanspaces.com/202408/1723403392827382.jpeg",
        },
    ];

    const projects = [
        {
            name: "Operation [Silent Aegis]",
            description:
                "Coordinated a cross-departmental tactical mission to contain a Catastrophe outbreak near the ruins of Chernobog. Balanced medical logistics, combat deployment, and civilian evacuation under extreme Originium exposure risks.",
            techStack:
                "Tactical Planning, Infection Control, Operator Deployment, Crisis Simulation",
            link: "https://intranet.rhodes-island.org/ops/silent-aegis",
        },
    ];

    const skills = {
        languages: ["JavaScript", "C", "C++"],
        frameworks: ["SvelteKit", "Node.js"],
        tools: ["Git", "Docker/Podman", "Linux"],
        softSkills: ["Teamwork", "Problem-solving", "Communication"],
    };

    const education = [
        {
            school: "Rhodes Island Medical & Tactical Institute",
            program: "Infection Crisis Management & Tactical Operations",
            degree: "Doctor (Tactical & Clinical Certification)",
            dates: "1094 - Present",
            description:
                "Trained under Amiya's direct supervision. Specialized in Originium pathology, operator coordination, and emergency field medicine.",
        },
    ];

    const certifications = [
        {
            name: "Certified House Keeping Agent",
            issuingBody: "Myself",
            date: "2020",
            link: "https://http.cat/503",
        },
    ];

    const talks = [
        {
            title: "My Awesome Talk",
            event: "RhodoCon 1094",
            date: "Dec 1094",
            link: "https://www.youtube.com/",
        },
    ];

    const volunteering = [
        {
            role: "External Affairs Liaison",
            organization: "Rhodes Island x Ubuntu Coalition",
            dates: "1096 - Present",
            description: [
                "Coordinated collaborative operations and technology exchange with non-Rhodes Island communities.",
                "Led outreach efforts including open-source tech forums, inter-organizational meetups, and UbuCon-style summits.",
            ],
        },
    ];
</script>

<svelte:head>
    <title>example.com</title>
    <meta property="og:title" content="example.com" />
    <meta property="og:description" content="About me" />
    <meta property="og:image" content={`/images/og_default.png`} />
    <meta property="og:url" content={`https://example.com/`} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="example.com" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="example.com" />
    <meta name="twitter:description" content="About me" />
    <meta name="twitter:image" content={`/images/og_default.png`} />
</svelte:head>

<div class="flex flex-col h-screen bg-zinc-900">
    <Header title="example.com" />
    <main class="flex-1 overflow-y-auto container mx-auto p-4">
        <section class="mb-6">
            <h1 class="text-3xl font-bold mb-2 text-zinc-100">
                Hi, I'm Doctor
            </h1>
            <p class="text-zinc-100">
                Doctor at Rhodes Island, building strategies, saving lives, and
                debugging Originium-induced disasters.
            </p>
            <div class="flex space-x-4 mt-4">
                <a href="mailto:iam@example.com" class="text-cyan-500">Email</a>
                <a href="https://github.com/your-account" class="text-cyan-500"
                    >GitHub</a
                >
                <a
                    href="https://www.linkedin.com/in/your-account"
                    class="text-cyan-500">LinkedIn</a
                >
                <a href="/resume.pdf" class="text-cyan-500">Resume PDF</a>
            </div>
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">About Me</h2>
            <p class="text-zinc-100">
                Hello, I am your doctor at Rhodos Island.
                <br />
                Just your average masked Doctor, juggling combat tactics, clinical
                ethics, and coffee shortages at Rhodes Island.
            </p>
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">Experience</h2>
            {#each experience as job}
                <div class="mb-4">
                    {#if job.logo}
                        <img
                            src={job.logo}
                            alt={job.organization}
                            class="w-12 h-12 mb-2"
                        />
                    {/if}
                    <h3 class="text-xl font-bold text-zinc-100">{job.role}</h3>
                    <p class="text-zinc-100">
                        {job.organization} | {job.period}
                    </p>
                    {#if Array.isArray(job.description)}
                        <ul class="list-disc pl-5 text-zinc-100">
                            {#each job.description as point}
                                <li>{point}</li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="text-zinc-100">{job.description}</p>
                    {/if}
                </div>
            {/each}
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">
                Community & Volunteering
            </h2>
            {#each volunteering as vol}
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-zinc-100">{vol.role}</h3>
                    <p class="text-zinc-100">
                        {vol.organization} | {vol.dates}
                    </p>
                    {#if Array.isArray(vol.description)}
                        <ul class="list-disc pl-5 text-zinc-100">
                            {#each vol.description as point}
                                <li>{point}</li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="text-zinc-100">{vol.description}</p>
                    {/if}
                </div>
            {/each}
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">Education</h2>
            {#each education as edu}
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-zinc-100">
                        {edu.school}
                    </h3>
                    <p class="text-zinc-100">
                        {edu.program} | {edu.degree} | {edu.dates}
                    </p>
                    <p class="text-zinc-100">{edu.description}</p>
                </div>
            {/each}
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">Projects</h2>
            {#each projects as project}
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-zinc-100">
                        {project.name}
                    </h3>
                    <p class="text-zinc-100">{project.description}</p>
                    <p class="text-zinc-100">Tech Stack: {project.techStack}</p>
                    <a href={project.link} class="text-cyan-500">View Project</a
                    >
                </div>
            {/each}
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">Skills</h2>
            <div class="mb-4">
                <h3 class="text-xl font-bold text-zinc-100">Languages</h3>
                <p class="text-zinc-100">{skills.languages.join(", ")}</p>
            </div>
            <div class="mb-4">
                <h3 class="text-xl font-bold text-zinc-100">Frameworks</h3>
                <p class="text-zinc-100">{skills.frameworks.join(", ")}</p>
            </div>
            <div class="mb-4">
                <h3 class="text-xl font-bold text-zinc-100">Tools</h3>
                <p class="text-zinc-100">{skills.tools.join(", ")}</p>
            </div>
            <div class="mb-4">
                <h3 class="text-xl font-bold text-zinc-100">Soft Skills</h3>
                <p class="text-zinc-100">{skills.softSkills.join(", ")}</p>
            </div>
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">
                Certifications / Achievements
            </h2>
            {#each certifications as cert}
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-zinc-100">{cert.name}</h3>
                    <p class="text-zinc-100">
                        {cert.issuingBody} | {cert.date}
                    </p>
                    <a href={cert.link} class="text-cyan-500"
                        >View Certification</a
                    >
                </div>
            {/each}
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4 text-zinc-100">
                Talks / Presentations
            </h2>
            {#each talks as talk}
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-zinc-100">
                        {talk.title}
                    </h3>
                    <p class="text-zinc-100">{talk.event} | {talk.date}</p>
                    <a href={talk.link} class="text-cyan-500"
                        >View Presentation</a
                    >
                </div>
            {/each}
        </section>
    </main>
    <Footer />
</div>

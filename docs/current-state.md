# Current State — Repository Inspection

> Generated at the start of Phase 1.
> Inspection date: 2026-09-05.

---

## 1. Repository

| Item | Result |
|------|--------|
| Workspace | `d:\project-common\GTVT\e-commerce` |
| Git repository | **No**. There is no `.git` directory. |
| Branch | N/A |
| Existing source code | **None**. The workspace only contained Phase instruction documents. |
| Existing application modules | None |

Existing files before Phase 1:

- `docs/00-OVERVIEW.md` — AI agent foundation instruction
- `docs/01-PHASES.md` — 4-phase implementation plan

Conclusion: this is a **greenfield project**. Phase 1 creates the documentation baseline and the project skeleton. No existing application code was deleted or overwritten.

---

## 2. Environment

| Tool | Status | Notes |
|------|--------|-------|
| Java (default PATH) | Java 8 (`1.8.0_501` / JDK `1.8.0_221`) | **Not sufficient.** Overview requires Java 21 LTS. |
| Additional JDKs found | JDK 11 (`C:\Program Files\Java\jdk-11.0.5`), JDK 17 (IntelliJ: Temurin 17, Microsoft 17, JBR 17) | Spring Boot 3.x needs Java 17+. Project target remains **Java 21**. |
| Maven | 3.9.9 | Available at `D:\setup\apache-maven-3.9.9` |
| Node.js | v24.11.0 | Sufficient for Vite + React |
| npm | 11.6.1 | Available |
| Docker | 29.1.2 | Available |
| Docker Compose | v2.40.3-desktop.1 | Available |
| PostgreSQL | 17 installed (`postgresql-x64-17`), port 5432 | Project uses `postgres` / `123456` on localhost |
| RabbitMQ | Not installed locally | Will run in Docker |

---

## 3. Project Structure Before Phase 1

```
e-commerce/
└── docs/
    ├── 00-OVERVIEW.md
    └── 01-PHASES.md
```

No backend services, frontend, Docker Compose, Postman collection, or `.env.example` existed.

---

## 4. Phase 1 Action

Because the repository is empty:

1. Create the full documentation set required by Phase 1.
2. Create the project skeleton (services + frontend + infrastructure).
3. Do **not** implement business features (those belong to Phase 2+).
4. Build whatever can be built and report the result.

---

## 5. Risks Identified During Inspection

| Risk | Impact | Mitigation |
|------|--------|------------|
| Default JDK is Java 8 | Spring Boot 3 / Java 21 modules will not compile with the default `JAVA_HOME` | Target Java 21 in POMs; install/use JDK 21 for Maven builds; document `JAVA_HOME` |
| Local PostgreSQL password may not match config | Cannot create logical DBs until credentials work | Use `scripts/init-postgres.ps1` |
| No git repository | No version history / branch | Out of Phase 1 scope unless the user initializes git |
| Java 21 was not preinstalled | Skeleton build may fail until JDK 21 is available | Attempt to install Microsoft OpenJDK 21; fall back to documenting the blocker |

---

## 6. Decision

Proceed with Phase 1 as a **greenfield foundation**:

- Business analysis and design first.
- Then project skeleton.
- No Phase 2 business logic.

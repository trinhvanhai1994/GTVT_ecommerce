package gtvt.haitv.ecommerce.ops.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import gtvt.haitv.ecommerce.ops.catalog.ServiceCatalog;
import gtvt.haitv.ecommerce.ops.config.OpsProperties;
import gtvt.haitv.ecommerce.ops.docker.ProcessRunner;
import gtvt.haitv.ecommerce.ops.web.dto.JobDto;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final OpsProperties properties;
    private final ServiceCatalog catalog;
    private final ProcessRunner runner;
    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final ConcurrentHashMap<String, JobDto> jobs = new ConcurrentHashMap<>();
    private final BlockingQueue<String> queue = new LinkedBlockingQueue<>();
    private final AtomicBoolean running = new AtomicBoolean(true);
    private Thread worker;

    public JobService(OpsProperties properties, ServiceCatalog catalog, ProcessRunner runner) {
        this.properties = properties;
        this.catalog = catalog;
        this.runner = runner;
    }

    @PostConstruct
    void start() throws Exception {
        Path dir = jobsDir();
        Files.createDirectories(dir);
        worker = new Thread(this::loop, "ops-job-worker");
        worker.setDaemon(true);
        worker.start();
    }

    @PreDestroy
    void stop() {
        running.set(false);
        if (worker != null) {
            worker.interrupt();
        }
    }

    public JobDto enqueueServiceAction(String serviceId, String action) {
        catalog.find(serviceId).orElseThrow(() -> new IllegalArgumentException("Unknown service: " + serviceId));
        String act = action == null ? "" : action.trim().toUpperCase();
        return enqueue(switch (act) {
            case "RESTART" -> List.of("restart", "--service", serviceId);
            case "REBUILD" -> List.of("rebuild", "--service", serviceId);
            case "MAVEN_REBUILD" -> List.of("maven-rebuild", "--service", serviceId);
            default -> throw new IllegalArgumentException("Unsupported action: " + action);
        }, act + " " + serviceId);
    }

    public JobDto enqueueStackAction(String action) {
        String act = action == null ? "" : action.trim().toUpperCase();
        return enqueue(switch (act) {
            case "FULL" -> List.of("full");
            case "RESTART_ONLY" -> List.of("full", "--restart-only");
            case "SKIP_MAVEN" -> List.of("full", "--skip-maven");
            default -> throw new IllegalArgumentException("Unsupported stack action: " + action);
        }, "STACK " + act);
    }

    public List<JobDto> list() {
        return jobs.values().stream()
                .sorted(Comparator.comparing(JobDto::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50)
                .toList();
    }

    public JobDto get(String id) {
        JobDto j = jobs.get(id);
        if (j == null) {
            throw new IllegalArgumentException("Job not found: " + id);
        }
        return j;
    }

    private JobDto enqueue(List<String> scriptArgs, String title) {
        JobDto job = new JobDto();
        job.setId(UUID.randomUUID().toString().substring(0, 8));
        job.setTitle(title);
        job.setStatus("QUEUED");
        job.setCreatedAt(Instant.now());
        job.setCommand(String.join(" ", scriptArgs));
        job.setLog("");
        jobs.put(job.getId(), job);
        persist(job);
        queue.offer(job.getId());
        return job;
    }

    private void loop() {
        while (running.get()) {
            try {
                String id = queue.take();
                JobDto job = jobs.get(id);
                if (job == null) {
                    continue;
                }
                execute(job);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                log.warn("Job worker error: {}", e.getMessage());
            }
        }
    }

    private void execute(JobDto job) {
        job.setStatus("RUNNING");
        job.setStartedAt(Instant.now());
        persist(job);
        Path root = Path.of(properties.getRepoRoot()).toAbsolutePath().normalize();
        Path script = root.resolve(properties.getDeployScript()).normalize();
        List<String> cmd = new ArrayList<>();
        cmd.add("bash");
        cmd.add(script.toString());
        for (String part : job.getCommand().split(" ")) {
            if (!part.isBlank()) {
                cmd.add(part);
            }
        }
        StringBuilder live = new StringBuilder();
        live.append("$ ").append(String.join(" ", cmd)).append('\n');
        job.setLog(live.toString());
        persist(job);

        long timeout = job.getCommand().startsWith("full") ? 3600 : 1800;
        ProcessRunner.Result result = runner.runStreaming(root, cmd, timeout, live);
        job.setLog(live.toString());
        job.setFinishedAt(Instant.now());
        job.setExitCode(result.exitCode());
        if (result.exitCode() == 2) {
            job.setStatus("LOCKED");
        } else if (result.ok()) {
            job.setStatus("SUCCESS");
        } else {
            job.setStatus("FAILED");
        }
        persist(job);
    }

    private void persist(JobDto job) {
        try {
            Path file = jobsDir().resolve(job.getId() + ".json");
            mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), job);
        } catch (Exception e) {
            log.debug("Persist job failed: {}", e.getMessage());
        }
    }

    private Path jobsDir() {
        Path root = Path.of(properties.getRepoRoot()).toAbsolutePath().normalize();
        Path dir = Path.of(properties.getJobsDir());
        if (!dir.isAbsolute()) {
            dir = root.resolve(dir);
        }
        return dir.normalize();
    }
}

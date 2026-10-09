package gtvt.haitv.ecommerce.ops.service;

import gtvt.haitv.ecommerce.ops.catalog.ServiceCatalog;
import gtvt.haitv.ecommerce.ops.catalog.ServiceDef;
import gtvt.haitv.ecommerce.ops.config.OpsProperties;
import gtvt.haitv.ecommerce.ops.docker.ProcessRunner;
import gtvt.haitv.ecommerce.ops.web.dto.ServiceStatusDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class StatusService {

    private final ServiceCatalog catalog;
    private final OpsProperties properties;
    private final ProcessRunner runner;
    private final RestClient http = RestClient.create();

    public StatusService(ServiceCatalog catalog, OpsProperties properties, ProcessRunner runner) {
        this.catalog = catalog;
        this.properties = properties;
        this.runner = runner;
    }

    public List<ServiceStatusDto> list() {
        List<ServiceStatusDto> out = new ArrayList<>();
        for (ServiceDef def : catalog.all()) {
            out.add(statusOf(def));
        }
        return out;
    }

    public ServiceStatusDto one(String id) {
        ServiceDef def = catalog.find(id).orElseThrow(() -> new IllegalArgumentException("Unknown service: " + id));
        return statusOf(def);
    }

    private ServiceStatusDto statusOf(ServiceDef def) {
        ServiceStatusDto dto = new ServiceStatusDto();
        dto.setId(def.getId());
        dto.setDisplayName(def.getDisplayName());
        dto.setGroup(def.getGroup());
        dto.setComposeService(def.getComposeService());
        dto.setContainerName(def.getContainerName());
        dto.setPort(def.getPort());
        dto.setMavenModule(def.getMavenModule());

        ContainerInfo info = inspectContainer(def.getContainerName());
        dto.setContainerState(info.state());
        dto.setRunning(info.running());

        String health = probeHealth(def, info.running());
        dto.setHealth(health);
        dto.setStatus(deriveStatus(info, health));
        return dto;
    }

    private String deriveStatus(ContainerInfo info, String health) {
        if (!info.running()) {
            if ("not_found".equals(info.state())) {
                return "DOWN";
            }
            return "STOPPED";
        }
        if ("UP".equalsIgnoreCase(health) || "healthy".equalsIgnoreCase(health)) {
            return "UP";
        }
        if ("STARTING".equalsIgnoreCase(health) || "starting".equalsIgnoreCase(info.state())) {
            return "STARTING";
        }
        if (health != null && !health.isBlank() && !"UNKNOWN".equals(health)) {
            return health.toUpperCase(Locale.ROOT);
        }
        return "UP";
    }

    private String probeHealth(ServiceDef def, boolean running) {
        if (!running) {
            return "DOWN";
        }
        if ("docker".equalsIgnoreCase(def.getHealth())) {
            return dockerHealth(def.getContainerName());
        }
        String url = properties.isDockerNetwork()
                ? firstNonBlank(def.getHealthUrl(), def.getHealthUrlHost())
                : firstNonBlank(def.getHealthUrlHost(), def.getHealthUrl());
        if (url == null) {
            return "UNKNOWN";
        }
        try {
            var res = http.get().uri(url).retrieve().toEntity(String.class);
            if (res.getStatusCode().is2xxSuccessful()) {
                String body = res.getBody() == null ? "" : res.getBody();
                if (body.contains("\"status\":\"UP\"") || body.contains("\"status\": \"UP\"")) {
                    return "UP";
                }
                if (body.isBlank() || res.getStatusCode().value() == 200) {
                    return "UP";
                }
                return "DEGRADED";
            }
            return "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }

    private String dockerHealth(String container) {
        ProcessRunner.Result r = runner.run(repo(), runner.docker(
                "inspect", "-f", "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}", container), 10);
        if (!r.ok()) {
            return "UNKNOWN";
        }
        String v = r.stdout().trim();
        if ("healthy".equals(v) || "running".equals(v)) {
            return "UP";
        }
        if ("starting".equals(v)) {
            return "STARTING";
        }
        if ("unhealthy".equals(v)) {
            return "DOWN";
        }
        return v.isEmpty() ? "UNKNOWN" : v.toUpperCase(Locale.ROOT);
    }

    private ContainerInfo inspectContainer(String name) {
        ProcessRunner.Result r = runner.run(repo(), runner.docker(
                "inspect", "-f", "{{.State.Status}}|{{.State.Running}}", name), 10);
        if (!r.ok()) {
            return new ContainerInfo("not_found", false);
        }
        String[] parts = r.stdout().trim().split("\\|");
        String state = parts.length > 0 ? parts[0] : "unknown";
        boolean running = parts.length > 1 && "true".equalsIgnoreCase(parts[1]);
        return new ContainerInfo(state, running);
    }

    private Path repo() {
        return Path.of(properties.getRepoRoot()).toAbsolutePath().normalize();
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }

    private record ContainerInfo(String state, boolean running) {
    }
}

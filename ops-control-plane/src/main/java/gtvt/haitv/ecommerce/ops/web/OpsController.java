package gtvt.haitv.ecommerce.ops.web;

import gtvt.haitv.ecommerce.ops.service.JobService;
import gtvt.haitv.ecommerce.ops.service.LogService;
import gtvt.haitv.ecommerce.ops.service.StatusService;
import gtvt.haitv.ecommerce.ops.web.dto.ActionRequest;
import gtvt.haitv.ecommerce.ops.web.dto.ApiEnvelope;
import gtvt.haitv.ecommerce.ops.web.dto.JobDto;
import gtvt.haitv.ecommerce.ops.web.dto.ServiceStatusDto;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/api/ops")
public class OpsController {

    private final StatusService statusService;
    private final LogService logService;
    private final JobService jobService;

    public OpsController(StatusService statusService, LogService logService, JobService jobService) {
        this.statusService = statusService;
        this.logService = logService;
        this.jobService = jobService;
    }

    @GetMapping("/services")
    public ApiEnvelope<List<ServiceStatusDto>> services() {
        return ApiEnvelope.ok(statusService.list());
    }

    @GetMapping("/services/{id}")
    public ApiEnvelope<ServiceStatusDto> service(@PathVariable String id) {
        return ApiEnvelope.ok(statusService.one(id));
    }

    @GetMapping("/services/{id}/logs")
    public ApiEnvelope<Map<String, String>> logs(
            @PathVariable String id,
            @RequestParam(defaultValue = "200") int tail,
            @RequestParam(required = false) String filter) {
        return ApiEnvelope.ok(Map.of("text", logService.tail(id, tail, filter)));
    }

    @GetMapping(value = "/services/{id}/logs/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs(
            @PathVariable String id,
            @RequestParam(defaultValue = "200") int tail,
            @RequestParam(required = false) String filter) {
        SseEmitter emitter = new SseEmitter(0L);
        AtomicBoolean open = new AtomicBoolean(true);
        ScheduledExecutorService exec = Executors.newSingleThreadScheduledExecutor();
        emitter.onCompletion(() -> {
            open.set(false);
            exec.shutdownNow();
        });
        emitter.onTimeout(() -> {
            open.set(false);
            exec.shutdownNow();
        });
        exec.scheduleAtFixedRate(() -> {
            if (!open.get()) {
                return;
            }
            try {
                String text = logService.tail(id, tail, filter);
                emitter.send(SseEmitter.event().name("log").data(text));
            } catch (IOException e) {
                open.set(false);
                emitter.completeWithError(e);
                exec.shutdownNow();
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event().name("error").data("ERROR: " + e.getMessage()));
                } catch (IOException ignored) {
                    open.set(false);
                    exec.shutdownNow();
                }
            }
        }, 0, 2, TimeUnit.SECONDS);
        return emitter;
    }

    @PostMapping("/services/{id}/actions")
    public ApiEnvelope<JobDto> serviceAction(@PathVariable String id, @Valid @RequestBody ActionRequest request) {
        return ApiEnvelope.ok(jobService.enqueueServiceAction(id, request.getAction()));
    }

    @PostMapping("/stack/actions")
    public ApiEnvelope<JobDto> stackAction(@Valid @RequestBody ActionRequest request) {
        return ApiEnvelope.ok(jobService.enqueueStackAction(request.getAction()));
    }

    @GetMapping("/jobs")
    public ApiEnvelope<List<JobDto>> jobs() {
        return ApiEnvelope.ok(jobService.list());
    }

    @GetMapping("/jobs/{id}")
    public ApiEnvelope<JobDto> job(@PathVariable String id) {
        return ApiEnvelope.ok(jobService.get(id));
    }

    @GetMapping("/overview")
    public ApiEnvelope<Map<String, Object>> overview() {
        List<ServiceStatusDto> all = statusService.list();
        long up = all.stream().filter(s -> "UP".equals(s.getStatus())).count();
        long down = all.stream().filter(s -> "DOWN".equals(s.getStatus()) || "STOPPED".equals(s.getStatus())).count();
        return ApiEnvelope.ok(Map.of(
                "total", all.size(),
                "up", up,
                "down", down,
                "starting", all.stream().filter(s -> "STARTING".equals(s.getStatus())).count(),
                "services", all,
                "recentJobs", jobService.list().stream().limit(5).toList()
        ));
    }
}

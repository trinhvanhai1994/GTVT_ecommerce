package gtvt.haitv.ecommerce.ops.web.dto;

import java.time.Instant;

public class JobDto {
    private String id;
    private String title;
    private String status;
    private String command;
    private String log;
    private Integer exitCode;
    private Instant createdAt;
    private Instant startedAt;
    private Instant finishedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getLog() { return log; }
    public void setLog(String log) { this.log = log; }
    public Integer getExitCode() { return exitCode; }
    public void setExitCode(Integer exitCode) { this.exitCode = exitCode; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getFinishedAt() { return finishedAt; }
    public void setFinishedAt(Instant finishedAt) { this.finishedAt = finishedAt; }
}

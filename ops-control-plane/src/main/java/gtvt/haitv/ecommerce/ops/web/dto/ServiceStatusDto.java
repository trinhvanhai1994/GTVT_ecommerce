package gtvt.haitv.ecommerce.ops.web.dto;

public class ServiceStatusDto {
    private String id;
    private String displayName;
    private String group;
    private String composeService;
    private String containerName;
    private Integer port;
    private String mavenModule;
    private String status;
    private String health;
    private String containerState;
    private boolean running;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getGroup() { return group; }
    public void setGroup(String group) { this.group = group; }
    public String getComposeService() { return composeService; }
    public void setComposeService(String composeService) { this.composeService = composeService; }
    public String getContainerName() { return containerName; }
    public void setContainerName(String containerName) { this.containerName = containerName; }
    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }
    public String getMavenModule() { return mavenModule; }
    public void setMavenModule(String mavenModule) { this.mavenModule = mavenModule; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getHealth() { return health; }
    public void setHealth(String health) { this.health = health; }
    public String getContainerState() { return containerState; }
    public void setContainerState(String containerState) { this.containerState = containerState; }
    public boolean isRunning() { return running; }
    public void setRunning(boolean running) { this.running = running; }
}

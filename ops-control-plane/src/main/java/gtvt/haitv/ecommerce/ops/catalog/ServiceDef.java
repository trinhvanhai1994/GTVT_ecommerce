package gtvt.haitv.ecommerce.ops.catalog;

public class ServiceDef {

    private String id;
    private String displayName;
    private String group;
    private String composeService;
    private String containerName;
    private String mavenModule;
    private Integer port;
    private String health;
    private String healthUrl;
    private String healthUrlHost;
    private String logs;
    private String logfileUrl;
    private String logfileUrlHost;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getComposeService() {
        return composeService;
    }

    public void setComposeService(String composeService) {
        this.composeService = composeService;
    }

    public String getContainerName() {
        return containerName;
    }

    public void setContainerName(String containerName) {
        this.containerName = containerName;
    }

    public String getMavenModule() {
        return mavenModule;
    }

    public void setMavenModule(String mavenModule) {
        this.mavenModule = mavenModule;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getHealth() {
        return health;
    }

    public void setHealth(String health) {
        this.health = health;
    }

    public String getHealthUrl() {
        return healthUrl;
    }

    public void setHealthUrl(String healthUrl) {
        this.healthUrl = healthUrl;
    }

    public String getHealthUrlHost() {
        return healthUrlHost;
    }

    public void setHealthUrlHost(String healthUrlHost) {
        this.healthUrlHost = healthUrlHost;
    }

    public String getLogs() {
        return logs;
    }

    public void setLogs(String logs) {
        this.logs = logs;
    }

    public String getLogfileUrl() {
        return logfileUrl;
    }

    public void setLogfileUrl(String logfileUrl) {
        this.logfileUrl = logfileUrl;
    }

    public String getLogfileUrlHost() {
        return logfileUrlHost;
    }

    public void setLogfileUrlHost(String logfileUrlHost) {
        this.logfileUrlHost = logfileUrlHost;
    }
}

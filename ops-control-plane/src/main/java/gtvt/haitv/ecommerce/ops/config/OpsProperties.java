package gtvt.haitv.ecommerce.ops.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ops")
public class OpsProperties {

    private String repoRoot = ".";
    private String deployScript = "scripts/ops-deploy.sh";
    private String jobsDir = "data/jobs";
    private String corsOrigins = "http://localhost:5199";
    private String catalogPath = "classpath:ops-catalog.yml";
    /** When true (inside Docker), use docker-network health/logfile URLs. */
    private boolean dockerNetwork = false;

    public String getRepoRoot() {
        return repoRoot;
    }

    public void setRepoRoot(String repoRoot) {
        this.repoRoot = repoRoot;
    }

    public String getDeployScript() {
        return deployScript;
    }

    public void setDeployScript(String deployScript) {
        this.deployScript = deployScript;
    }

    public String getJobsDir() {
        return jobsDir;
    }

    public void setJobsDir(String jobsDir) {
        this.jobsDir = jobsDir;
    }

    public String getCorsOrigins() {
        return corsOrigins;
    }

    public void setCorsOrigins(String corsOrigins) {
        this.corsOrigins = corsOrigins;
    }

    public String getCatalogPath() {
        return catalogPath;
    }

    public void setCatalogPath(String catalogPath) {
        this.catalogPath = catalogPath;
    }

    public boolean isDockerNetwork() {
        return dockerNetwork;
    }

    public void setDockerNetwork(boolean dockerNetwork) {
        this.dockerNetwork = dockerNetwork;
    }
}

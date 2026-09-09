package gtvt.haitv.ecommerce.admin;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.LinkedHashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "flow")
public class FlowLogProperties {

    /** name -> base URL (Docker DNS or localhost). */
    private Map<String, String> services = new LinkedHashMap<>();

    public Map<String, String> getServices() {
        return services;
    }

    public void setServices(Map<String, String> services) {
        this.services = services;
    }
}

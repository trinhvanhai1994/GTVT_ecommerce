package gtvt.haitv.ecommerce.ops.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import gtvt.haitv.ecommerce.ops.config.OpsProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class ServiceCatalog {

    private final OpsProperties properties;
    private final Map<String, ServiceDef> byId = new LinkedHashMap<>();

    public ServiceCatalog(OpsProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void load() throws Exception {
        Resource resource = new DefaultResourceLoader().getResource(properties.getCatalogPath());
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        try (InputStream in = resource.getInputStream()) {
            CatalogRoot root = mapper.readValue(in, CatalogRoot.class);
            byId.clear();
            for (ServiceDef s : root.getServices()) {
                byId.put(s.getId(), s);
            }
        }
    }

    public List<ServiceDef> all() {
        return List.copyOf(byId.values());
    }

    public Optional<ServiceDef> find(String id) {
        return Optional.ofNullable(byId.get(id));
    }
}

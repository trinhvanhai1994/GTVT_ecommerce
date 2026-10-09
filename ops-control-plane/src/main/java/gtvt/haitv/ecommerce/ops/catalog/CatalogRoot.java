package gtvt.haitv.ecommerce.ops.catalog;

import java.util.ArrayList;
import java.util.List;

public class CatalogRoot {

    private List<ServiceDef> services = new ArrayList<>();

    public List<ServiceDef> getServices() {
        return services;
    }

    public void setServices(List<ServiceDef> services) {
        this.services = services;
    }
}

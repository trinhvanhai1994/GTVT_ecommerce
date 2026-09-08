package gtvt.haitv.ecommerce.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ServiceInfoController {

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Success",
                "data", Map.of(
                        "service", "INVENTORY-SERVICE",
                        "phase", "2-backend"
                )
        ));
    }
}

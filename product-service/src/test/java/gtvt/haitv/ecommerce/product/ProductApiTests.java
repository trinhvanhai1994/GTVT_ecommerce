package gtvt.haitv.ecommerce.product;

import gtvt.haitv.ecommerce.common.security.JwtService;
import gtvt.haitv.ecommerce.product.dto.CategoryRequest;
import gtvt.haitv.ecommerce.product.dto.ProductRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductApiTests {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtService jwtService;

    private String adminToken() {
        return "Bearer " + jwtService.generateToken(1L, "admin@example.com", "ADMIN");
    }

    @Test
    void crudSearchAndNotFound() throws Exception {
        CategoryRequest cat = new CategoryRequest();
        cat.setName("Gadgets");
        String catJson = mockMvc.perform(post("/api/products/categories").header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(cat)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long catId = objectMapper.readTree(catJson).path("data").path("id").asLong();

        ProductRequest pr = new ProductRequest();
        pr.setName("Gadget One");
        pr.setDescription("desc");
        pr.setPrice(new BigDecimal("10.00"));
        pr.setCategoryId(catId);
        pr.setBrand("Acme");
        pr.setStatus("ACTIVE");
        String created = mockMvc.perform(post("/api/products").header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(pr)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).path("data").path("id").asLong();

        mockMvc.perform(get("/api/products/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Gadget One"));

        pr.setName("Gadget Two");
        mockMvc.perform(put("/api/products/" + id).header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(pr)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Gadget Two"));

        mockMvc.perform(get("/api/products").param("keyword", "Gadget"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Gadget Two"));

        mockMvc.perform(delete("/api/products/" + id).header("Authorization", adminToken()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/products/" + id)).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    void customerCannotCreate() throws Exception {
        String token = "Bearer " + jwtService.generateToken(2L, "c@example.com", "CUSTOMER");
        ProductRequest pr = new ProductRequest();
        pr.setName("X");
        pr.setPrice(new BigDecimal("1.00"));
        pr.setCategoryId(1L);
        mockMvc.perform(post("/api/products").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(pr)))
                .andExpect(status().isForbidden());
    }
}

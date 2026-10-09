package gtvt.haitv.ecommerce.ops.web.dto;

import jakarta.validation.constraints.NotBlank;

public class ActionRequest {

    @NotBlank
    private String action;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}

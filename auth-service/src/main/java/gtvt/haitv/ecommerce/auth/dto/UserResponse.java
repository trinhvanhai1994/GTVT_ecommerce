package gtvt.haitv.ecommerce.auth.dto;

import gtvt.haitv.ecommerce.auth.domain.User;

public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String status;

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.id = user.getId();
        r.email = user.getEmail();
        r.fullName = user.getFullName();
        r.role = user.getRole();
        r.status = user.getStatus();
        return r;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}

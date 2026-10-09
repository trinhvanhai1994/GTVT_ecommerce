package gtvt.haitv.ecommerce.auth.dto;

import gtvt.haitv.ecommerce.auth.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
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
}

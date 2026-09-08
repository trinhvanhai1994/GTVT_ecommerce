package gtvt.haitv.ecommerce.auth.service;

import gtvt.haitv.ecommerce.auth.domain.User;
import gtvt.haitv.ecommerce.auth.dto.LoginRequest;
import gtvt.haitv.ecommerce.auth.dto.LoginResponse;
import gtvt.haitv.ecommerce.auth.dto.RegisterRequest;
import gtvt.haitv.ecommerce.auth.dto.UserResponse;
import gtvt.haitv.ecommerce.auth.repository.UserRepository;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.common.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        FlowLog f = FlowLog.start("register");
        try {
            f.step("check email");
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email already exists");
            }
            User user = new User();
            user.setEmail(request.getEmail().trim().toLowerCase());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setRole("CUSTOMER");
            user.setStatus("ACTIVE");
            User saved = userRepository.save(user);
            f.end("userId=" + saved.getId());
            return UserResponse.from(saved);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        FlowLog f = FlowLog.start("login");
        try {
            f.step("load user");
            User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid credentials"));
            f.step("verify");
            if (!"ACTIVE".equals(user.getStatus()) || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid credentials");
            }
            String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
            f.end("userId=" + user.getId());
            return new LoginResponse(token, UserResponse.from(user));
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse profile(Long userId) {
        FlowLog f = FlowLog.start("profile");
        try {
            UserResponse r = UserResponse.from(getUser(userId));
            f.end("userId=" + userId);
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<UserResponse> listUsers() {
        FlowLog f = FlowLog.start("listUsers");
        var list = userRepository.findAll().stream().map(UserResponse::from).toList();
        f.end("n=" + list.size());
        return list;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserResponse(Long id) {
        FlowLog f = FlowLog.start("getUser");
        try {
            UserResponse r = UserResponse.from(getUser(id));
            f.end("userId=" + id);
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public UserResponse updateStatus(Long id, String status) {
        FlowLog f = FlowLog.start("updateStatus");
        try {
            User user = getUser(id);
            f.step("set " + status);
            user.setStatus(status);
            f.end("userId=" + id);
            return UserResponse.from(user);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
    }
}

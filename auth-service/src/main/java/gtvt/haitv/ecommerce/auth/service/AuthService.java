package gtvt.haitv.ecommerce.auth.service;

import gtvt.haitv.ecommerce.auth.entity.User;
import gtvt.haitv.ecommerce.auth.dto.ForgotPasswordRequest;
import gtvt.haitv.ecommerce.auth.dto.LoginRequest;
import gtvt.haitv.ecommerce.auth.dto.LoginResponse;
import gtvt.haitv.ecommerce.auth.dto.RegisterRequest;
import gtvt.haitv.ecommerce.auth.dto.ResetPasswordRequest;
import gtvt.haitv.ecommerce.auth.dto.UserResponse;
import gtvt.haitv.ecommerce.auth.repository.UserRepository;
import gtvt.haitv.ecommerce.common.constant.AppConstant;
import gtvt.haitv.ecommerce.common.constant.ErrorConstant;
import gtvt.haitv.ecommerce.common.constant.MessageConstant;
import gtvt.haitv.ecommerce.common.constant.NumberConstant;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.common.mail.EmailService;
import gtvt.haitv.ecommerce.common.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        FlowLog f = FlowLog.start("register");
        try {
            f.step("check email");
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new ApiException(HttpStatus.CONFLICT, ErrorConstant.EMAIL_ALREADY_EXISTS, MessageConstant.EMAIL_ALREADY_EXISTS);
            }
            User user = new User();
            user.setEmail(request.getEmail().trim().toLowerCase());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setRole(AppConstant.ROLE_CUSTOMER);
            user.setStatus(AppConstant.STATUS_ACTIVE);
            User saved = userRepository.save(user);
            emailService.send(
                    saved.getEmail(),
                    MessageConstant.EMAIL_WELCOME_SUBJECT,
                    "Xin chào " + saved.getFullName() + ",\n\n"
                            + "Tài khoản của bạn đã được tạo thành công với email " + saved.getEmail() + ".\n"
                            + "Bạn có thể đăng nhập tại: " + emailService.storeUrl() + "/login\n\n"
                            + "Trân trọng,\nNava");
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
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, ErrorConstant.INVALID_CREDENTIALS, MessageConstant.INVALID_CREDENTIALS));
            f.step("verify");
            if (!AppConstant.STATUS_ACTIVE.equals(user.getStatus()) || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorConstant.INVALID_CREDENTIALS, MessageConstant.INVALID_CREDENTIALS);
            }
            String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
            f.end("userId=" + user.getId());
            return new LoginResponse(token, UserResponse.from(user));
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        FlowLog f = FlowLog.start("forgotPassword");
        try {
            userRepository.findByEmailIgnoreCase(request.getEmail().trim()).ifPresent(user -> {
                String rawToken = UUID.randomUUID().toString().replace("-", "")
                        + UUID.randomUUID().toString().replace("-", "");
                user.setPasswordResetToken(sha256(rawToken));
                user.setPasswordResetExpires(Instant.now().plus(NumberConstant.RESET_TOKEN_TTL_MINUTES, ChronoUnit.MINUTES));
                String link = emailService.storeUrl() + "/reset-password?token=" + rawToken;
                emailService.send(
                        user.getEmail(),
                        MessageConstant.EMAIL_RESET_SUBJECT,
                        "Xin chào " + user.getFullName() + ",\n\n"
                                + "Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.\n"
                                + "Mở liên kết sau trong vòng " + NumberConstant.RESET_TOKEN_TTL_MINUTES + " phút:\n" + link + "\n\n"
                                + "Nếu bạn không yêu cầu, hãy bỏ qua email này.\n\n"
                                + "Trân trọng,\nNava");
                f.step("token issued userId=" + user.getId());
            });
            f.end("ok");
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        FlowLog f = FlowLog.start("resetPassword");
        try {
            String hash = sha256(request.getToken().trim());
            User user = userRepository.findByPasswordResetToken(hash)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.INVALID_RESET_TOKEN, MessageConstant.INVALID_RESET_TOKEN));
            if (user.getPasswordResetExpires() == null || user.getPasswordResetExpires().isBefore(Instant.now())) {
                user.setPasswordResetToken(null);
                user.setPasswordResetExpires(null);
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.INVALID_RESET_TOKEN, MessageConstant.INVALID_RESET_TOKEN);
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            user.setPasswordResetToken(null);
            user.setPasswordResetExpires(null);
            f.end("userId=" + user.getId());
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
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.USER_NOT_FOUND, MessageConstant.USER_NOT_FOUND));
    }

    private static String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}

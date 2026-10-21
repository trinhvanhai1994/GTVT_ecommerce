package gtvt.haitv.ecommerce.auth.config;

import gtvt.haitv.ecommerce.auth.entity.User;
import gtvt.haitv.ecommerce.auth.repository.UserRepository;
import gtvt.haitv.ecommerce.common.constant.AppConstant;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
public class AuthDataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmailIgnoreCase("admin@example.com").ifPresentOrElse(admin -> {
                if (AppConstant.ROLE_ADMIN.equals(admin.getRole())) {
                    admin.setRole(AppConstant.ROLE_PLATFORM_ADMIN);
                    userRepository.save(admin);
                }
            }, () -> {
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPasswordHash(passwordEncoder.encode("Password123"));
                admin.setFullName("Platform Admin");
                admin.setRole(AppConstant.ROLE_PLATFORM_ADMIN);
                admin.setStatus(AppConstant.STATUS_ACTIVE);
                userRepository.save(admin);
            });

            ensure(userRepository, passwordEncoder, "customer@example.com", "Demo Customer", AppConstant.ROLE_CUSTOMER);

            // 10 sellers for 10 demo shops
            for (int i = 1; i <= 10; i++) {
                ensure(userRepository, passwordEncoder,
                        "seller" + i + "@example.com",
                        "Seller " + i,
                        AppConstant.ROLE_SELLER);
            }
            // keep legacy aliases
            ensure(userRepository, passwordEncoder, "seller@example.com", "Demo Seller", AppConstant.ROLE_SELLER);
            ensure(userRepository, passwordEncoder, "seller2@example.com", "Audio Seller", AppConstant.ROLE_SELLER);
        };
    }

    private void ensure(UserRepository repo, PasswordEncoder encoder, String email, String name, String role) {
        if (!repo.existsByEmailIgnoreCase(email)) {
            User u = new User();
            u.setEmail(email);
            u.setPasswordHash(encoder.encode("Password123"));
            u.setFullName(name);
            u.setRole(role);
            u.setStatus(AppConstant.STATUS_ACTIVE);
            repo.save(u);
        }
    }
}

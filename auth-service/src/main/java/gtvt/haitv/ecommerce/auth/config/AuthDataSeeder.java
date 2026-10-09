package gtvt.haitv.ecommerce.auth.config;

import gtvt.haitv.ecommerce.auth.entity.User;
import gtvt.haitv.ecommerce.auth.repository.UserRepository;
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
            if (!userRepository.existsByEmailIgnoreCase("admin@example.com")) {
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPasswordHash(passwordEncoder.encode("Password123"));
                admin.setFullName("System Admin");
                admin.setRole("ADMIN");
                admin.setStatus("ACTIVE");
                userRepository.save(admin);
            }
            if (!userRepository.existsByEmailIgnoreCase("customer@example.com")) {
                User customer = new User();
                customer.setEmail("customer@example.com");
                customer.setPasswordHash(passwordEncoder.encode("Password123"));
                customer.setFullName("Demo Customer");
                customer.setRole("CUSTOMER");
                customer.setStatus("ACTIVE");
                userRepository.save(customer);
            }
            if (!userRepository.existsByEmailIgnoreCase("customer2@example.com")) {
                User customer2 = new User();
                customer2.setEmail("customer2@example.com");
                customer2.setPasswordHash(passwordEncoder.encode("Password123"));
                customer2.setFullName("Second Customer");
                customer2.setRole("CUSTOMER");
                customer2.setStatus("ACTIVE");
                userRepository.save(customer2);
            }
        };
    }
}

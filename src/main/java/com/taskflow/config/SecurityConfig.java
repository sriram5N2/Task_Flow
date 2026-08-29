package com.taskflow.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration.
 * - Stateless sessions (JWT-based)
 * - CORS for React dev server (localhost:5173)
 * - Role-based route restrictions:
 *     ADMIN: project CRUD, task create/edit/delete, user list
 *     USER:  read data, update task status via PATCH (Kanban drag)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS configuration — allows React dev server (Vite on port 5173)
     * and the production setup (same-origin) to call the API.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:8080"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // ── Public routes ──
                .requestMatchers("/api/auth/**").permitAll()

                // ── Serve React build + static assets ──
                .requestMatchers("/", "/index.html", "/assets/**",
                                 "/favicon.ico", "/*.js", "/*.css").permitAll()

                // ── ADMIN-only: project write operations ──
                .requestMatchers(HttpMethod.POST, "/api/projects/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/projects/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/projects/**").hasRole("ADMIN")

                // ── Any authenticated user can access comments ──
                .requestMatchers("/api/tasks/*/comments/**").authenticated()

                // ── ADMIN-only: task create, full edit, delete ──
                .requestMatchers(HttpMethod.POST, "/api/tasks/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tasks/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasRole("ADMIN")

                // ── Any authenticated user can PATCH task status (Kanban drag) ──
                .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status").authenticated()

                // ── Any authenticated user can view the user list (for filters/assignments) ──
                .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()

                // ── All other API endpoints require authentication ──
                .anyRequest().authenticated()
            )

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

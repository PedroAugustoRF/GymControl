package com.spring.gymcontrol.config;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String ADM = "ADM";

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler((request, response, accessDenied) ->
                                response.setStatus(HttpStatus.FORBIDDEN.value())))
                .authorizeHttpRequests(authorize -> authorize
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/favicon.ico",
                                "/vite.svg",
                                "/robots.txt",
                                "/manifest.webmanifest",
                                "/assets/**",
                                "/images/**",
                                "/icons/**",
                                "/fonts/**",
                                "/css/**",
                                "/js/**",
                                "/static/**",
                                "/**/*.css",
                                "/**/*.js",
                                "/**/*.png",
                                "/**/*.jpg",
                                "/**/*.jpeg",
                                "/**/*.svg",
                                "/**/*.webp",
                                "/**/*.ico",
                                "/**/*.woff",
                                "/**/*.woff2",
                                "/**/*.ttf"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/login",
                                "/auth/register"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/maquinas/**",
                                "/exercicios/**"
                        ).authenticated()

                        .requestMatchers(
                                "/maquinas/**",
                                "/exercicios/**"
                        ).hasAuthority(ADM)

                        .requestMatchers("/treinos/**").authenticated()

                        .requestMatchers("/users/me").authenticated()

                        .requestMatchers("/users/**").hasAuthority(ADM)

                        .anyRequest().authenticated())
                .addFilterBefore(
                        securityFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
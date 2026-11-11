package com.spring.gymcontrol.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.spring.gymcontrol.enums.Role;
import com.spring.gymcontrol.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class TokenConfig {

    @Value("${jwt.key}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generatedToken(User user) {

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withClaim("userId", user.getId())
                .withClaim("role", user.getRole().name())
                .withSubject(user.getEmail())
                .withExpiresAt(Instant.now().plusMillis(expiration))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {

        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decode = JWT.require(algorithm)
                    .build().verify(token);

            String role = decode.getClaim("role").asString();

            if (role == null) {
                return Optional.empty();
            }

            return Optional.of(JWTUserData.builder()
                    .userId(decode.getClaim("userId").asLong())
                    .email(decode.getSubject())
                    .role(Role.valueOf(role))
                    .build());
        } catch (JWTVerificationException jwtve) {
            return Optional.empty();
        }
    }
}
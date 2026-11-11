package com.spring.gymcontrol.repository;

import com.spring.gymcontrol.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    java.util.List<User> findAllByRole(com.spring.gymcontrol.enums.Role role);
}
package com.spring.gymcontrol.service;

import com.spring.gymcontrol.dto.register.RegisterUserRequest;
import com.spring.gymcontrol.dto.register.RegisterUserResponse;
import com.spring.gymcontrol.dto.user.UserRequest;
import com.spring.gymcontrol.dto.user.UserResponse;
import com.spring.gymcontrol.enums.Role;
import com.spring.gymcontrol.model.User;
import com.spring.gymcontrol.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public RegisterUserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }
        if (userRepository.existsByCpf(request.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        User user = userRepository.save(User.builder()
                .nome(request.nome())
                .email(request.email())
                .cpf(request.cpf())
                .contato(request.contato())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build());

        return new RegisterUserResponse(user.getNome(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findById(Long id) {
        return userRepository.findById(id)
                .map(this::toResponse);
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }
        if (!user.getCpf().equals(request.cpf()) && userRepository.existsByCpf(request.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        user.setNome(request.nome());
        user.setEmail(request.email());
        user.setCpf(request.cpf());
        user.setContato(request.contato());

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        user.setRole(role);

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .nome(user.getNome())
                .email(user.getEmail())
                .cpf(user.getCpf())
                .contato(user.getContato())
                .role(user.getRole())
                .build();
    }
}
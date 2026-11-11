package com.spring.gymcontrol.controller;

import com.spring.gymcontrol.config.JWTUserData;
import com.spring.gymcontrol.dto.treino.TreinoRequest;
import com.spring.gymcontrol.dto.treino.TreinoResponse;
import com.spring.gymcontrol.service.TreinoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/treinos")
public class TreinoController {

    private final TreinoService treinoService;

    @PostMapping
    public ResponseEntity<TreinoResponse> create(@Valid @RequestBody TreinoRequest request, @AuthenticationPrincipal JWTUserData principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(treinoService.save(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<TreinoResponse>> findAll(@AuthenticationPrincipal JWTUserData principal) {
        return ResponseEntity.ok(treinoService.findAll(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TreinoResponse> findById(@PathVariable Long id, @AuthenticationPrincipal JWTUserData principal) {
        return treinoService.findById(id, principal).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TreinoResponse> update(@PathVariable Long id, @Valid @RequestBody TreinoRequest request, @AuthenticationPrincipal JWTUserData principal) {
        return ResponseEntity.ok(treinoService.update(id, request, principal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal JWTUserData principal) {
        treinoService.deleteById(id, principal);
        return ResponseEntity.noContent().build();
    }
}

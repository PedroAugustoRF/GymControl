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
    public ResponseEntity<TreinoResponse> create(@Valid @RequestBody TreinoRequest request,
                                                 @AuthenticationPrincipal JWTUserData principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(treinoService.save(request, principal.userId()));
    }

    @GetMapping
    public ResponseEntity<List<TreinoResponse>> findAll() {
        return ResponseEntity.ok(treinoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TreinoResponse> findById(@PathVariable Long id) {
        return treinoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TreinoResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody TreinoRequest request) {
        return ResponseEntity.ok(treinoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        treinoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
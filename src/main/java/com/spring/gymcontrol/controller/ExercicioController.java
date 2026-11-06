package com.spring.gymcontrol.controller;

import com.spring.gymcontrol.dto.exercicio.ExercicioRequest;
import com.spring.gymcontrol.dto.exercicio.ExercicioResponse;
import com.spring.gymcontrol.service.ExercicioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/exercicios")
public class ExercicioController {

    private final ExercicioService exercicioService;

    @PostMapping
    public ResponseEntity<ExercicioResponse> create(@Valid @RequestBody ExercicioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exercicioService.save(request));
    }

    @GetMapping
    public ResponseEntity<List<ExercicioResponse>> findAll() {
        return ResponseEntity.ok(exercicioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExercicioResponse> findById(@PathVariable Long id) {
        return exercicioService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExercicioResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody ExercicioRequest request) {
        return ResponseEntity.ok(exercicioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exercicioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
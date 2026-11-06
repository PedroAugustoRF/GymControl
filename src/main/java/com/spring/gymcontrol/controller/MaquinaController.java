package com.spring.gymcontrol.controller;

import com.spring.gymcontrol.dto.maquina.MaquinaRequest;
import com.spring.gymcontrol.dto.maquina.MaquinaResponse;
import com.spring.gymcontrol.service.MaquinaService;
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
@RequestMapping("/maquinas")
public class MaquinaController {

    private final MaquinaService maquinaService;

    @PostMapping
    public ResponseEntity<MaquinaResponse> create(@Valid @RequestBody MaquinaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maquinaService.save(request));
    }

    @GetMapping
    public ResponseEntity<List<MaquinaResponse>> findAll() {
        return ResponseEntity.ok(maquinaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaquinaResponse> findById(@PathVariable Long id) {
        return maquinaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaquinaResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody MaquinaRequest request) {
        return ResponseEntity.ok(maquinaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maquinaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
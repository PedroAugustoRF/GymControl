package com.spring.gymcontrol.controller;

import com.spring.gymcontrol.dto.itemtreino.ItemTreinoRequest;
import com.spring.gymcontrol.dto.itemtreino.ItemTreinoResponse;
import com.spring.gymcontrol.service.ItemTreinoService;
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
@RequestMapping("/treinos")
public class ItemTreinoController {

    private final ItemTreinoService itemTreinoService;

    @PostMapping("/{treinoId}/itens")
    public ResponseEntity<ItemTreinoResponse> create(@PathVariable Long treinoId,
                                                     @Valid @RequestBody ItemTreinoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemTreinoService.save(treinoId, request));
    }

    @GetMapping("/itens")
    public ResponseEntity<List<ItemTreinoResponse>> findAll() {
        return ResponseEntity.ok(itemTreinoService.findAll());
    }

    @GetMapping("/itens/{id}")
    public ResponseEntity<ItemTreinoResponse> findById(@PathVariable Long id) {
        return itemTreinoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/itens/{id}")
    public ResponseEntity<ItemTreinoResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody ItemTreinoRequest request) {
        return ResponseEntity.ok(itemTreinoService.update(id, request));
    }

    @DeleteMapping("/itens/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemTreinoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
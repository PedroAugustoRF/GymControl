package com.spring.gymcontrol.service;

import com.spring.gymcontrol.dto.itemtreino.ItemTreinoRequest;
import com.spring.gymcontrol.dto.itemtreino.ItemTreinoResponse;
import com.spring.gymcontrol.model.Exercicio;
import com.spring.gymcontrol.model.ItemTreino;
import com.spring.gymcontrol.model.Treino;
import com.spring.gymcontrol.repository.ExercicioRepository;
import com.spring.gymcontrol.repository.ItemTreinoRepository;
import com.spring.gymcontrol.repository.TreinoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItemTreinoService {

    private final ItemTreinoRepository itemTreinoRepository;
    private final TreinoRepository treinoRepository;
    private final ExercicioRepository exercicioRepository;

    @Transactional
    public ItemTreinoResponse save(Long treinoId, ItemTreinoRequest request) {
        Treino treino = treinoRepository.findById(treinoId)
                .orElseThrow(() -> new EntityNotFoundException("Treino não encontrado"));

        ItemTreino item = itemTreinoRepository.save(toEntity(request, treino));

        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public List<ItemTreinoResponse> findAll() {
        return itemTreinoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ItemTreinoResponse> findById(Long id) {
        return itemTreinoRepository.findById(id)
                .map(this::toResponse);
    }

    @Transactional
    public ItemTreinoResponse update(Long id, ItemTreinoRequest request) {
        ItemTreino item = itemTreinoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item de treino não encontrado"));

        item.setExercicio(buscarExercicio(request.exercicioId()));
        item.setSeries(request.series());
        item.setRepeticoes(request.repeticoes());
        item.setCarga(request.carga());
        item.setOrdem(request.ordem());

        return toResponse(itemTreinoRepository.save(item));
    }

    @Transactional
    public void deleteById(Long id) {
        itemTreinoRepository.deleteById(id);
    }

    public ItemTreino toEntity(ItemTreinoRequest request, Treino treino) {
        return ItemTreino.builder()
                .treino(treino)
                .exercicio(buscarExercicio(request.exercicioId()))
                .series(request.series())
                .repeticoes(request.repeticoes())
                .carga(request.carga())
                .ordem(request.ordem())
                .build();
    }

    public ItemTreinoResponse toResponse(ItemTreino item) {
        Exercicio exercicio = item.getExercicio();

        return ItemTreinoResponse.builder()
                .id(item.getId())
                .ordem(item.getOrdem())
                .exercicio(exercicio.getNome())
                .maquina(exercicio.getMaquina() != null ? exercicio.getMaquina().getNome() : null)
                .series(item.getSeries())
                .repeticoes(item.getRepeticoes())
                .carga(item.getCarga())
                .build();
    }

    private Exercicio buscarExercicio(Long exercicioId) {
        return exercicioRepository.findById(exercicioId)
                .orElseThrow(() -> new EntityNotFoundException("Exercício não encontrado"));
    }
}
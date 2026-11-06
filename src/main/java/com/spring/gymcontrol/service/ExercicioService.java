package com.spring.gymcontrol.service;

import com.spring.gymcontrol.dto.exercicio.ExercicioRequest;
import com.spring.gymcontrol.dto.exercicio.ExercicioResponse;
import com.spring.gymcontrol.model.Exercicio;
import com.spring.gymcontrol.model.Maquina;
import com.spring.gymcontrol.repository.ExercicioRepository;
import com.spring.gymcontrol.repository.MaquinaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExercicioService {

    private final ExercicioRepository exercicioRepository;
    private final MaquinaRepository maquinaRepository;

    @Transactional
    public ExercicioResponse save(ExercicioRequest request) {
        Exercicio exercicio = exercicioRepository.save(Exercicio.builder()
                .nome(request.nome())
                .agrupamento(request.agrupamento())
                .maquina(buscarMaquina(request.maquinaId()))
                .build());

        return toResponse(exercicio);
    }

    @Transactional(readOnly = true)
    public List<ExercicioResponse> findAll() {
        return exercicioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ExercicioResponse> findById(Long id) {
        return exercicioRepository.findById(id)
                .map(this::toResponse);
    }

    @Transactional
    public ExercicioResponse update(Long id, ExercicioRequest request) {
        Exercicio exercicio = exercicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Exercício não encontrado"));

        exercicio.setNome(request.nome());
        exercicio.setAgrupamento(request.agrupamento());
        exercicio.setMaquina(buscarMaquina(request.maquinaId()));

        return toResponse(exercicioRepository.save(exercicio));
    }

    @Transactional
    public void deleteById(Long id) {
        exercicioRepository.deleteById(id);
    }

    private Maquina buscarMaquina(Long maquinaId) {
        if (maquinaId == null) {
            return null;
        }
        return maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new EntityNotFoundException("Máquina não encontrada"));
    }

    private ExercicioResponse toResponse(Exercicio exercicio) {
        return ExercicioResponse.builder()
                .id(exercicio.getId())
                .nome(exercicio.getNome())
                .agrupamento(exercicio.getAgrupamento())
                .maquina(exercicio.getMaquina() != null ? exercicio.getMaquina().getNome() : null)
                .build();
    }
}
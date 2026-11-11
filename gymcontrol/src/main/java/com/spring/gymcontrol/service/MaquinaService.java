package com.spring.gymcontrol.service;

import com.spring.gymcontrol.dto.maquina.MaquinaRequest;
import com.spring.gymcontrol.dto.maquina.MaquinaResponse;
import com.spring.gymcontrol.model.Maquina;
import com.spring.gymcontrol.repository.MaquinaRepository;
import com.spring.gymcontrol.repository.ExercicioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaquinaService {

    private final MaquinaRepository maquinaRepository;
    private final ExercicioRepository exercicioRepository;

    @Transactional
    public MaquinaResponse save(MaquinaRequest request) {
        Maquina maquina = maquinaRepository.save(Maquina.builder()
                .nome(request.nome())
                .fabricante(request.fabricante())
                .build());

        return toResponse(maquina);
    }

    @Transactional(readOnly = true)
    public List<MaquinaResponse> findAll() {
        return maquinaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<MaquinaResponse> findById(Long id) {
        return maquinaRepository.findById(id)
                .map(this::toResponse);
    }

    @Transactional
    public MaquinaResponse update(Long id, MaquinaRequest request) {
        Maquina maquina = maquinaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Máquina não encontrada"));

        maquina.setNome(request.nome());
        maquina.setFabricante(request.fabricante());

        return toResponse(maquinaRepository.save(maquina));
    }

    @Transactional
    public void deleteById(Long id) {
        maquinaRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Máquina não encontrada"));
        exercicioRepository.findAllByMaquinaId(id).forEach(exercicio -> exercicio.setMaquina(null));
        maquinaRepository.deleteById(id);
    }

    private MaquinaResponse toResponse(Maquina maquina) {
        return MaquinaResponse.builder()
                .id(maquina.getId())
                .nome(maquina.getNome())
                .fabricante(maquina.getFabricante())
                .build();
    }
}